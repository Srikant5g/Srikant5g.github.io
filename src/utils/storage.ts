import type { Member, Expense, TripSettings } from '../types';
import { DEFAULT_MEMBERS, DEFAULT_TRIP_SETTINGS, SAMPLE_GOA_EXPENSES } from './sampleData';

const STORAGE_KEYS = {
  MEMBERS: 'goa_splitwise_members_v1',
  EXPENSES: 'goa_splitwise_expenses_v1',
  SETTINGS: 'goa_splitwise_settings_v1',
};

export function loadTripSettings(): TripSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return raw ? JSON.parse(raw) : DEFAULT_TRIP_SETTINGS;
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

export function loadMembers(): Member[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load members', e);
  }
  return DEFAULT_MEMBERS;
}

export function saveMembers(members: Member[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
  } catch (e) {
    console.error('Failed to save members', e);
  }
}

export function loadExpenses(): Expense[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to load expenses', e);
  }
  return SAMPLE_GOA_EXPENSES;
}

export function saveExpenses(expenses: Expense[]) {
  try {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  } catch (e) {
    console.error('Failed to save expenses', e);
  }
}

export function clearTripData() {
  localStorage.removeItem(STORAGE_KEYS.MEMBERS);
  localStorage.removeItem(STORAGE_KEYS.EXPENSES);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
}
