import type { Member, Expense, TripSettings } from '../types';

export const DEFAULT_TRIP_SETTINGS: TripSettings = {
  tripName: 'Road Trip 2026',
  location: 'Road Trip (By Car) 🚗💨',
  currency: '₹',
};

export const AVATAR_COLORS = [
  'bg-emerald-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-indigo-500',
  'bg-purple-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-sky-500',
  'bg-orange-500',
];

export const DEFAULT_MEMBERS: Member[] = [
  { id: 'm1', name: 'Srikanth G', avatarColor: 'bg-teal-500', upiId: 'srikanth@upi' },
  { id: 'm2', name: 'Sajjad Hussain', avatarColor: 'bg-emerald-500', upiId: 'sajjad@okhdfc' },
  { id: 'm3', name: 'Raghavendra G', avatarColor: 'bg-indigo-500', upiId: 'raghavendra@paytm' },
  { id: 'm4', name: 'Mohan Reddy P', avatarColor: 'bg-purple-500', upiId: 'mohan@ybl' },
  { id: 'm5', name: 'Md Rabbani', avatarColor: 'bg-amber-500', upiId: 'rabbani@okaxis' },
  { id: 'm6', name: 'Harsha N', avatarColor: 'bg-rose-500', upiId: 'harsha@ibl' },
  { id: 'm7', name: 'Arun U', avatarColor: 'bg-cyan-500', upiId: 'arun@upi' },
];

export const SAMPLE_ROADTRIP_EXPENSES: Expense[] = [
  {
    id: 'e1',
    title: 'Car Diesel Full Tank (Start of Road Trip)',
    amount: 5800,
    date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    paidById: 'm1', // Srikanth G paid
    category: 'Petrol & Diesel',
    splitMode: 'EQUAL',
    splitMemberIds: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7'],
    notes: 'Fuel tank filled before hitting the highway',
    createdAt: Date.now() - 2 * 86400000,
  },
  {
    id: 'e2',
    title: 'Highway Fastag & Toll Plazas',
    amount: 1450,
    date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    paidById: 'm1', // Srikanth G paid
    category: 'Tolls & Fastag',
    splitMode: 'EQUAL',
    splitMemberIds: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7'],
    notes: 'Total highway tolls recharged via Fastag',
    createdAt: Date.now() - 2 * 86400000 + 7200000,
  },
  {
    id: 'e3',
    title: 'Highway Breakfast & Masala Chai',
    amount: 1260,
    date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    paidById: 'm2', // Sajjad Hussain paid
    category: 'Breakfast',
    splitMode: 'EQUAL',
    splitMemberIds: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7'],
    notes: 'Idlis, dosas & tea stop for all 7',
    createdAt: Date.now() - 2 * 86400000 + 10800000,
  },
  {
    id: 'e4',
    title: 'Highway Dhaba Lunch',
    amount: 3850,
    date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    paidById: 'm3', // Raghavendra G paid
    category: 'Lunch',
    splitMode: 'EQUAL',
    splitMemberIds: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7'],
    notes: 'Paneer, Butter Chicken, rotis and lassi',
    createdAt: Date.now() - 2 * 86400000 + 21600000,
  },
  {
    id: 'e5',
    title: 'Ghats Evening Snacks & Chai',
    amount: 700,
    date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    paidById: 'm4', // Mohan Reddy P paid
    category: 'Snacks & Chai',
    splitMode: 'EQUAL',
    splitMemberIds: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7'],
    notes: 'Pakoras, chips and tea break at scenic ghats',
    createdAt: Date.now() - 2 * 86400000 + 32400000,
  },
  {
    id: 'e6',
    title: 'Private Villa Stay with Pool (Advance)',
    amount: 24500,
    date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
    paidById: 'm5', // Md Rabbani paid
    category: 'Stay & Hotel',
    splitMode: 'EQUAL',
    splitMemberIds: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7'],
    notes: '3BHK pool villa for the road trip stay',
    createdAt: Date.now() - 1 * 86400000,
  },
  {
    id: 'e7',
    title: 'Alcohol, Beers & Mixer Stock for Villa',
    amount: 6300,
    date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
    paidById: 'm3', // Raghavendra G paid
    category: 'Alcohol & Drinks',
    splitMode: 'EQUAL',
    // Split among 5 who drink
    splitMemberIds: ['m1', 'm2', 'm3', 'm4', 'm5'],
    notes: 'Kingfisher beers, rum and chakhna (split only among 5 drinkers)',
    createdAt: Date.now() - 1 * 86400000 + 14400000,
  },
  {
    id: 'e8',
    title: 'Beach Shack Dinner & Fresh Seafood',
    amount: 7700,
    date: new Date().toISOString().split('T')[0],
    paidById: 'm6', // Harsha N paid
    category: 'Dinner',
    splitMode: 'EQUAL',
    splitMemberIds: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6', 'm7'],
    notes: 'Fresh fish curry rice, calamari, cocktails and desserts',
    createdAt: Date.now() - 7200000,
  },
];

// Alias for backward compatibility
export const SAMPLE_GOA_EXPENSES = SAMPLE_ROADTRIP_EXPENSES;

export const CATEGORY_ICONS: Record<
  string,
  { label: string; icon: string; color: string; hex: string }
> = {
  'Petrol & Diesel': {
    label: 'Petrol & Diesel',
    icon: '⛽',
    color: 'bg-amber-50 text-amber-700 border-amber-200',
    hex: '#F59E0B',
  },
  'Tolls & Fastag': {
    label: 'Tolls & Fastag',
    icon: '🛣️',
    color: 'bg-blue-50 text-blue-700 border-blue-200',
    hex: '#3B82F6',
  },
  Breakfast: {
    label: 'Breakfast',
    icon: '🥞',
    color: 'bg-yellow-50 text-yellow-800 border-yellow-200',
    hex: '#EAB308',
  },
  Lunch: {
    label: 'Lunch',
    icon: '🍛',
    color: 'bg-orange-50 text-orange-700 border-orange-200',
    hex: '#F97316',
  },
  Dinner: {
    label: 'Dinner',
    icon: '🍽️',
    color: 'bg-rose-50 text-rose-700 border-rose-200',
    hex: '#F43F5E',
  },
  'Snacks & Chai': {
    label: 'Snacks & Chai',
    icon: '🥪',
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    hex: '#78C5A7',
  },
  'Alcohol & Drinks': {
    label: 'Alcohol & Drinks',
    icon: '🍻',
    color: 'bg-purple-50 text-purple-700 border-purple-200',
    hex: '#A855F7',
  },
  'Stay & Hotel': {
    label: 'Stay & Hotel',
    icon: '🏡',
    color: 'bg-teal-50 text-teal-800 border-teal-200',
    hex: '#145B4A',
  },
  'Activities & Beach': {
    label: 'Activities & Beach',
    icon: '🏖️',
    color: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    hex: '#06B6D4',
  },
  Misc: {
    label: 'Misc',
    icon: '💳',
    color: 'bg-slate-50 text-slate-700 border-slate-200',
    hex: '#718096',
  },
};
