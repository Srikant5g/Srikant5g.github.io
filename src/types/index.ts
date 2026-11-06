export type Category = 
  | 'Petrol & Diesel'
  | 'Tolls & Fastag'
  | 'Breakfast'
  | 'Lunch'
  | 'Dinner'
  | 'Snacks & Chai'
  | 'Alcohol & Drinks'
  | 'Stay & Hotel'
  | 'Activities & Beach'
  | 'Misc';

export interface Member {
  id: string;
  name: string;
  avatarColor: string;
  upiId?: string;
}

export type SplitMode = 'EQUAL' | 'CUSTOM' | 'PERCENTAGE';

export interface SplitShare {
  memberId: string;
  amount: number;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;
  paidById: string;
  category: Category;
  splitMode: SplitMode;
  splitMemberIds: string[]; // members involved in this bill
  customSplits?: Record<string, number>; // memberId -> exact amount if custom
  notes?: string;
  createdAt: number;
}

export interface MemberBalance {
  memberId: string;
  name: string;
  avatarColor: string;
  upiId?: string;
  totalPaid: number;
  totalShare: number;
  netBalance: number; // positive = gets back, negative = owes
}

export interface DebtTransaction {
  id: string;
  fromId: string;
  fromName: string;
  toId: string;
  toName: string;
  toUpiId?: string;
  amount: number;
  settled?: boolean;
}

export interface TripSettings {
  tripName: string;
  location: string;
  currency: string;
}
