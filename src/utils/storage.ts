import type { Member, Expense, TripSettings } from '../types';
import { DEFAULT_MEMBERS, DEFAULT_TRIP_SETTINGS } from './sampleData';

const STORAGE_KEYS = {
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
      tripName: (parsed.tripName || DEFAULT_TRIP_SETTINGS.tripName).replace(/Goa\s*/gi, '').trim() || 'Road Trip 2026',
      location: (parsed.location || DEFAULT_TRIP_SETTINGS.location).replace(/Goa\s*/gi, '').trim() || 'Road Trip (By Car) 🚗💨',
    };
  } catch {
    return DEFAULT_TRIP_SETTINGS;
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
 * Enforce the 7 non-editable member names while preserving any custom UPI IDs
 */
export function enforceFixedMembers(members?: Member[]): Member[] {
  return DEFAULT_MEMBERS.map((fixed) => {
    const existing = members?.find((m) => m.id === fixed.id);
    return {
      ...fixed,
      upiId: existing?.upiId || fixed.upiId,
    };
  });
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
