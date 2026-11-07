import type { Member, Expense, TripSettings, Group } from '../types';
import { DEFAULT_MEMBERS, DEFAULT_TRIP_SETTINGS, DEFAULT_GROUPS, DEFAULT_GROUP_ID } from './sampleData';

const STORAGE_KEYS = {
  GROUPS: 'triptally_groups_v1',
  ACTIVE_GROUP_ID: 'triptally_active_group_v1',
  MEMBERS: 'triptally_members_v1',
  EXPENSES: 'triptally_expenses_v1',
  SETTINGS: 'triptally_settings_v1',
  UPDATED_AT: 'triptally_updated_at_v1',
  IS_INITIALIZED: 'triptally_initialized_v1',
  FALLBACK_MEMBERS: 'triptab_members_v1',
  FALLBACK_EXPENSES: 'triptab_expenses_v1',
  FALLBACK_SETTINGS: 'triptab_settings_v1',
  FALLBACK_UPDATED_AT: 'triptab_updated_at_v1',
  FALLBACK_IS_INITIALIZED: 'triptab_initialized_v1',
  LEGACY_MEMBERS: 'goa_splitwise_members_v1',
  LEGACY_EXPENSES: 'goa_splitwise_expenses_v1',
  LEGACY_SETTINGS: 'goa_splitwise_settings_v1',
  LEGACY_UPDATED_AT: 'goa_splitwise_updated_at_v1',
  LEGACY_IS_INITIALIZED: 'goa_splitwise_initialized_v1',
};

export function loadGroups(): Group[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GROUPS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure default group, 'TripTally Group', or 'Road Trip 2026' is updated to 'Goa'
        return parsed.map((g) =>
          g.id === DEFAULT_GROUP_ID || g.name === 'Road Trip 2026' || g.name === 'TripTally Group'
            ? { ...g, name: 'Goa', location: g.location?.replace('Road Trip (By Car) 🚗💨', 'Goa 🏖️') || 'Goa 🏖️' }
            : g
        );
      }
    }
  } catch (e) {
    console.error('Failed to load groups', e);
  }
  return DEFAULT_GROUPS;
}

export function saveGroups(groups: Group[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.GROUPS, JSON.stringify(groups));
  } catch (e) {
    console.error('Failed to save groups', e);
  }
}

export function mergeGroups(localGroups: Group[], remoteGroups: Group[]): Group[] {
  const map = new Map<string, Group>();

  const normalizeGroup = (g: Group): Group =>
    g.id === DEFAULT_GROUP_ID || g.name === 'Road Trip 2026' || g.name === 'TripTally Group'
      ? { ...g, name: 'Goa', location: g.location?.replace('Road Trip (By Car) 🚗💨', 'Goa 🏖️') || 'Goa 🏖️' }
      : g;

  (localGroups || []).forEach((g) => {
    const norm = normalizeGroup(g);
    map.set(norm.id, norm);
  });

  (remoteGroups || []).forEach((g) => {
    const norm = normalizeGroup(g);
    if (map.has(norm.id)) {
      const existing = map.get(norm.id)!;
      const combinedMembers = Array.from(
        new Set([...(existing.memberIds || []), ...(norm.memberIds || [])])
      );
      map.set(norm.id, {
        ...existing,
        ...norm,
        memberIds: combinedMembers.length > 0 ? combinedMembers : existing.memberIds,
      });
    } else {
      map.set(norm.id, norm);
    }
  });

  const merged = Array.from(map.values());
  return merged.length > 0 ? merged : DEFAULT_GROUPS;
}

export function loadActiveGroupId(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_GROUP_ID) || DEFAULT_GROUP_ID;
  } catch {
    return DEFAULT_GROUP_ID;
  }
}

export function saveActiveGroupId(id: string) {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_GROUP_ID, id);
  } catch (e) {
    console.error('Failed to save active group id', e);
  }
}

export function loadTripSettings(): TripSettings {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEYS.SETTINGS) ||
      localStorage.getItem(STORAGE_KEYS.FALLBACK_SETTINGS) ||
      localStorage.getItem(STORAGE_KEYS.LEGACY_SETTINGS);
    if (!raw) return DEFAULT_TRIP_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_TRIP_SETTINGS,
      ...parsed,
      tripName:
        parsed.tripName === 'Road Trip 2026' || parsed.tripName === 'TripTally Group'
          ? 'Goa'
          : parsed.tripName || 'Goa',
      location:
        parsed.location === 'Road Trip (By Car) 🚗💨' ? 'Goa 🏖️' : parsed.location || 'Goa 🏖️',
    };
  } catch {
    return DEFAULT_TRIP_SETTINGS;
  }
}

const CURRENT_USER_KEY = 'triptally_current_user_id';

export function loadSavedUserId(): string | null {
  try {
    return localStorage.getItem(CURRENT_USER_KEY);
  } catch {
    return null;
  }
}

export function saveCurrentUserId(id: string) {
  try {
    localStorage.setItem(CURRENT_USER_KEY, id);
  } catch (e) {
    console.error('Failed to save current user id', e);
  }
}

export function saveTripSettings(settings: TripSettings) {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save trip settings', e);
  }
}

/**
 * Enforce the 7 default members while preserving any custom UPI IDs and user-added friends
 */
export function enforceFixedMembers(members?: Member[]): Member[] {
  if (!members || members.length === 0) return DEFAULT_MEMBERS;

  // Preserve the default 7 members with any updated UPI IDs, names, or avatar colors
  const defaultMapped = DEFAULT_MEMBERS.map((fixed) => {
    const existing = members.find((m) => m.id === fixed.id);
    return {
      ...fixed,
      name: existing?.name || fixed.name,
      avatarColor: existing?.avatarColor || fixed.avatarColor,
      upiId: existing?.upiId !== undefined ? existing.upiId : fixed.upiId,
    };
  });

  // Preserve any custom friends created by the user
  const customMembers = members.filter(
    (m) => !DEFAULT_MEMBERS.some((fixed) => fixed.id === m.id)
  );

  return [...defaultMapped, ...customMembers];
}

export function loadMembers(): Member[] {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEYS.MEMBERS) ||
      localStorage.getItem(STORAGE_KEYS.FALLBACK_MEMBERS) ||
      localStorage.getItem(STORAGE_KEYS.LEGACY_MEMBERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return enforceFixedMembers(parsed);
      }
    }
  } catch (e) {
    console.error('Failed to load members', e);
  }
  return DEFAULT_MEMBERS;
}

export function saveMembers(members: Member[]) {
  try {
    const enforced = enforceFixedMembers(members);
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(enforced));
  } catch (e) {
    console.error('Failed to save members', e);
  }
}

export function isTripInitialized(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.IS_INITIALIZED) === 'true';
  } catch {
    return false;
  }
}

export function setTripInitialized(val: boolean) {
  try {
    localStorage.setItem(STORAGE_KEYS.IS_INITIALIZED, val ? 'true' : 'false');
  } catch (e) {
    console.error('Failed to set trip initialized', e);
  }
}

export function getLastUpdatedAt(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.UPDATED_AT);
    return raw ? parseInt(raw, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

export function setLastUpdatedAt(ts: number) {
  try {
    localStorage.setItem(STORAGE_KEYS.UPDATED_AT, ts.toString());
  } catch (e) {
    console.error('Failed to set updated at', e);
  }
}

export function loadExpenses(): Expense[] {
  try {
    const raw =
      localStorage.getItem(STORAGE_KEYS.EXPENSES) ||
      localStorage.getItem(STORAGE_KEYS.FALLBACK_EXPENSES) ||
      localStorage.getItem(STORAGE_KEYS.LEGACY_EXPENSES);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
    // If explicitly initialized and empty, return empty array
    if (isTripInitialized()) {
      return [];
    }
  } catch (e) {
    console.error('Failed to load expenses', e);
  }
  // For fresh first-time sessions, load empty or sample
  return [];
}

export function saveExpenses(expenses: Expense[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    setTripInitialized(true);
  } catch (e) {
    console.error('Failed to save expenses', e);
  }
}

export function clearTripData() {
  try {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.UPDATED_AT, Date.now().toString());
    setTripInitialized(true);
  } catch (e) {
    console.error('Failed to clear trip data', e);
  }
}
