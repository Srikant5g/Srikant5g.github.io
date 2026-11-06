import type { Expense, Member } from '../types';

const NTFY_TOPIC = 'goatab_sync_goa2026_srikant5g';
const NTFY_BASE_URL = `https://ntfy.sh/${NTFY_TOPIC}`;

export interface CloudPayload {
  expenses: Expense[];
  members?: Member[];
  updatedAt: number;
  isCleared?: boolean;
}

export type SyncStatus = 'synced' | 'syncing' | 'error' | 'offline';

// BroadcastChannel for instant 0ms cross-tab sync on the same device
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel('goatab_realtime_sync');
  }
} catch (e) {
  console.warn('BroadcastChannel not supported', e);
}

/**
 * Broadcast local change to all other tabs on the same device
 */
export function broadcastToTabs(payload: CloudPayload) {
  try {
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'GOATAB_SYNC_DATA', payload });
    }
  } catch (e) {
    console.warn('Failed to broadcast to tabs', e);
  }
}

/**
 * Subscribe to cross-tab updates
 */
export function subscribeToTabs(onMessage: (payload: CloudPayload) => void): () => void {
  if (!broadcastChannel) {
    return () => {};
  }

  const handler = (event: MessageEvent) => {
    if (event.data && event.data.type === 'GOATAB_SYNC_DATA' && event.data.payload) {
      onMessage(event.data.payload);
    }
  };

  broadcastChannel.addEventListener('message', handler);
  return () => {
    broadcastChannel?.removeEventListener('message', handler);
  };
}

/**
 * Push state to the cloud API and notify all remote devices
 */
export async function pushToCloud(
  expenses: Expense[],
  members: Member[],
  updatedAt: number,
  isCleared: boolean = false
): Promise<boolean> {
  const payload: CloudPayload = {
    expenses,
    members,
    updatedAt,
    isCleared,
  };

  // 1. Broadcast to other open tabs on this browser immediately (0ms)
  broadcastToTabs(payload);

  // 2. Push full payload to high-speed cloud sync hub
  try {
    const res = await fetch(NTFY_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        Title: 'GoaTab Sync',
        Priority: 'low',
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.warn('Cloud sync push returned status', res.status);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Failed to push state to cloud:', err);
    return false;
  }
}

/**
 * Pull latest state from cloud
 */
export async function pullFromCloud(): Promise<CloudPayload | null> {
  try {
    const res = await fetch(`${NTFY_BASE_URL}/json?poll=1&since=latest`, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!res.ok) {
      return null;
    }

    const text = await res.text();
    if (!text.trim()) return null;

    // ntfy /json?poll=1 may return line-delimited JSON messages. We take the last message.
    const lines = text.trim().split('\n');
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const item = JSON.parse(lines[i]);
        if (item && item.message) {
          const parsed = JSON.parse(item.message);
          if (parsed && typeof parsed.updatedAt === 'number') {
            return parsed as CloudPayload;
          }
        }
      } catch {
        continue;
      }
    }

    return null;
  } catch (err) {
    console.warn('Failed to pull state from cloud:', err);
    return null;
  }
}

/**
 * Listen for real-time cloud events via Server-Sent Events (SSE)
 */
export function listenToCloudEvents(onRemotePayload: (payload: CloudPayload) => void): () => void {
  let eventSource: EventSource | null = null;

  try {
    if (typeof window !== 'undefined' && 'EventSource' in window) {
      eventSource = new EventSource(`${NTFY_BASE_URL}/sse`);
      eventSource.onmessage = (event) => {
        try {
          if (!event.data) return;
          const parsed = JSON.parse(event.data);
          if (parsed && parsed.message) {
            const payload = JSON.parse(parsed.message);
            if (payload && typeof payload.updatedAt === 'number') {
              onRemotePayload(payload as CloudPayload);
            }
          }
        } catch (e) {
          console.warn('Error parsing cloud SSE message', e);
        }
      };
      eventSource.onerror = () => {
        // Automatically reconnects
      };
    }
  } catch (err) {
    console.warn('EventSource initialization error:', err);
  }

  return () => {
    if (eventSource) {
      eventSource.close();
    }
  };
}
