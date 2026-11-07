import React, { useState } from 'react';
import type { Expense, Member, Category } from '../../types';
import { formatCurrency, formatExpenseDate } from '../../utils/settlement';
import { CATEGORY_ICONS } from '../../utils/sampleData';
import { Search, Plus, Edit3, Trash2, X, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface MobileBillsViewProps {
  expenses: Expense[];
  members: Member[];
  currentUserId: string;
  selectedFriendId: string | null;
  onClearFriendFilter: () => void;
  onOpenAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onLoadSample: () => void;
  tripName?: string;
}

export const MobileBillsView: React.FC<MobileBillsViewProps> = ({
  expenses,
  members,
  currentUserId,
  selectedFriendId,
  onClearFriendFilter,
  onOpenAddExpense,
  onEditExpense,
  onDeleteExpense,
  onLoadSample,
  tripName = 'Road Trip 2026',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const memberMap = new Map<string, Member>();
  members.forEach((m) => memberMap.set(m.id, m));

  const currentUser = memberMap.get(currentUserId) || members[0];
  const selectedFriend = selectedFriendId ? memberMap.get(selectedFriendId) : null;

  // Calculate personal metrics
  let youOweTotal = 0;
  let youAreOwedTotal = 0;
  const totalSpend = expenses.reduce((sum, e) => sum + e.amount, 0);

  expenses.forEach((e) => {
    const isPayer = e.paidById === currentUserId;
    const isSplitter = e.splitMemberIds.includes(currentUserId);
    const splitCount = e.splitMemberIds.length;
    const userShare =
      e.splitMode === 'CUSTOM' && e.customSplits
        ? e.customSplits[currentUserId] || 0
        : isSplitter && splitCount > 0
        ? e.amount / splitCount
        : 0;

    if (isPayer) {
      youAreOwedTotal += e.amount - userShare;
    } else if (isSplitter) {
      youOweTotal += userShare;
    }
  });

  const netBalance = youAreOwedTotal - youOweTotal;

  // Filter bills
  const filtered = expenses.filter((e) => {
    if (selectedFriendId) {
      const matchPayer = e.paidById === selectedFriendId || e.paidById === currentUserId;
      const matchSplitter =
        e.splitMemberIds.includes(selectedFriendId) ||
        e.splitMemberIds.includes(currentUserId);
      if (!matchPayer && !matchSplitter) return false;
    }

    if (selectedCategory !== 'ALL' && e.category !== selectedCategory) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = e.title.toLowerCase().includes(q);
      const payerName = memberMap.get(e.paidById)?.name.toLowerCase() || '';
      if (!matchTitle && !payerName.includes(q)) return false;
    }

    return true;
  });

  const categories: (Category | 'ALL')[] = [
    'ALL',
    'Petrol & Diesel',
    'Tolls & Fastag',
    'Breakfast',
    'Lunch',
    'Dinner',
    'Snacks & Chai',
    'Alcohol & Drinks',
    'Stay & Hotel',
  ];

  return (
    <div className="space-y-4 pb-32">
      {/* 1. TripTally Mobile Hero Balance Card (Inspired by Modern Fintech) */}
      <div className="bg-[#145B4A] rounded-2xl p-5 text-white shadow-sm relative overflow-hidden border border-[#0f4639]">
        {/* Subtle background glow */}
        <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-[#78C5A7]/10 pointer-events-none blur-2xl" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#78C5A7] text-[#145B4A] text-xs font-black flex items-center justify-center">
              {currentUser?.name.charAt(0)}
            </div>
            <span className="text-xs font-semibold text-emerald-100">
              {currentUser?.name}’s Balance
            </span>
          </div>

          <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 px-2.5 py-0.5 rounded-full text-white/90 border border-white/10">
            {tripName}
          </span>
        </div>

        {/* Large Net Balance Number */}
        <div className="mt-3.5">
          <span className="text-[11px] font-medium text-emerald-200 uppercase tracking-wider block">
            Net Balance
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span
              className={`text-3xl font-black tracking-tight ${
                netBalance > 0.01
                  ? 'text-[#78C5A7]'
                  : netBalance < -0.01
                  ? 'text-[#FF784F]'
                  : 'text-white'
              }`}
            >
              {netBalance > 0.01 && '+'}
              {formatCurrency(netBalance)}
            </span>
            <span className="text-xs font-semibold text-emerald-100/90">
              {netBalance > 0.01
                ? 'you are owed'
                : netBalance < -0.01
                ? 'you owe'
                : 'all settled up'}
            </span>
          </div>
        </div>

        {/* Breakdown Row: Total Lent / Total Borrowed / Trip Total */}
        <div className="mt-4 pt-3.5 border-t border-white/15 grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#78C5A7]/20 flex items-center justify-center text-[#78C5A7]">
              <ArrowDownLeft className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[10px] text-emerald-200 block">Total Lent</span>
              <strong className="font-bold text-white text-xs">{formatCurrency(youAreOwedTotal)}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#FF784F]/20 flex items-center justify-center text-[#FF784F]">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[10px] text-emerald-200 block">Total Borrowed</span>
              <strong className="font-bold text-white text-xs">{formatCurrency(youOweTotal)}</strong>
            </div>
          </div>
        </div>

        {/* Quick Footer: Trip Total Spend & Prominent Add Action */}
        <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-emerald-100 text-[11px]">
            Trip Spend: <strong className="text-white">{formatCurrency(totalSpend)}</strong> ({expenses.length} bills)
          </span>

          <button
            onClick={onOpenAddExpense}
            className="px-3 py-1.5 rounded-xl bg-white text-[#145B4A] font-bold text-xs flex items-center gap-1 shadow-sm active:scale-95 transition"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3] text-[#145B4A]" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* 2. Active Friend Filter Banner (if filtering by a specific member) */}
      {selectedFriend && (
        <div className="bg-[#78C5A7]/15 border border-[#78C5A7]/30 rounded-xl px-3.5 py-2 flex items-center justify-between text-xs text-[#145B4A]">
          <div className="flex items-center gap-1.5">
            <span>Filtered by friend:</span>
            <strong className="font-bold text-[#192B3D]">{selectedFriend.name}</strong>
          </div>
          <button
            onClick={onClearFriendFilter}
            className="p-1 hover:bg-[#78C5A7]/25 rounded-lg text-[#145B4A] transition"
            title="Clear friend filter"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. Search Bar */}
      <div className="relative">
        <label htmlFor="mobile-search-bills" className="sr-only">
          Search bills by title, payer, or category
        </label>
        <Search className="w-4 h-4 text-[#718096] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          id="mobile-search-bills"
          name="search"
          type="text"
          placeholder="Search expenses, fuel, food, hotel..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search expenses by title, payer, or category"
          className="w-full bg-white border border-[#E4EAF0] rounded-xl pl-10 pr-9 py-2.5 text-xs text-[#192B3D] placeholder-[#718096] focus:outline-none focus:border-[#145B4A] focus:ring-1 focus:ring-[#145B4A] shadow-xs"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718096] hover:text-[#192B3D] p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 4. Category Filter Chips (Smooth horizontal scroll) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          const meta = cat !== 'ALL' ? CATEGORY_ICONS[cat] : null;

          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#145B4A] text-white shadow-xs'
                  : 'bg-white border border-[#E4EAF0] text-[#718096] hover:bg-slate-50'
              }`}
            >
              {meta && <span>{meta.icon}</span>}
              <span>{cat === 'ALL' ? 'All Expenses' : cat}</span>
            </button>
          );
        })}
      </div>

      {/* 5. Expenses List */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-[#E4EAF0] rounded-2xl p-8 text-center space-y-3 shadow-xs">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#78C5A7]/15 flex items-center justify-center text-2xl">
            📝
          </div>
          <h3 className="font-bold text-[#192B3D] text-sm">No expenses found</h3>
          <p className="text-xs text-[#718096] max-w-xs mx-auto">
            {searchTerm || selectedCategory !== 'ALL'
              ? 'Try adjusting your search terms or clearing the category filter.'
              : 'Start tracking bills for your trip or load the sample trip expenses.'}
          </p>
          <div className="flex flex-col gap-2 pt-2 max-w-xs mx-auto">
            <button
              onClick={onOpenAddExpense}
              className="w-full py-2.5 rounded-xl bg-[#145B4A] hover:bg-[#0f4639] text-white font-bold text-xs shadow-xs active:scale-95 transition"
            >
              + Add First Expense
            </button>
            {expenses.length === 0 && (
              <button
                onClick={onLoadSample}
                className="w-full py-2.5 rounded-xl bg-white border border-[#E4EAF0] text-[#192B3D] font-bold text-xs shadow-xs active:scale-95 transition"
              >
                Load Sample Expenses
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((expense) => {
            const payer = memberMap.get(expense.paidById);
            const isPayer = expense.paidById === currentUserId;
            const isSplitter = expense.splitMemberIds.includes(currentUserId);
            const splitCount = expense.splitMemberIds.length;
            const userShare =
              expense.splitMode === 'CUSTOM' && expense.customSplits
                ? expense.customSplits[currentUserId] || 0
                : isSplitter && splitCount > 0
                ? expense.amount / splitCount
                : 0;

            const { month, day } = formatExpenseDate(expense.date);

            // Personal lend/borrow
            let statusLabel = 'not involved';
            let statusAmount = 0;
            let isLent = false;

            if (isPayer) {
              isLent = true;
              statusLabel = 'you lent';
              statusAmount = expense.amount - userShare;
            } else if (isSplitter) {
              statusLabel = 'you borrowed';
              statusAmount = userShare;
            }

            return (
              <div
                key={expense.id}
                onClick={() => onEditExpense(expense)}
                className="bg-white border border-[#E4EAF0] rounded-2xl p-4 shadow-xs space-y-2.5 hover:border-[#78C5A7]/60 active:scale-[0.99] cursor-pointer transition"
              >
                {/* Row 1: Date + Category Icon + Title + Status Amount */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Modern Date Pill */}
                    <div className="w-10 text-center shrink-0 border border-[#E4EAF0] rounded-xl bg-[#F7F8F5] overflow-hidden shadow-2xs">
                      <div className="bg-[#E4EAF0]/60 text-[9px] font-bold text-[#718096] py-0.5 uppercase tracking-wider">
                        {month}
                      </div>
                      <div className="text-xs font-black text-[#192B3D] py-0.5">
                        {day}
                      </div>
                    </div>

                    {/* Category Icon Badge */}
                    <div className="w-10 h-10 rounded-xl bg-[#F7F8F5] border border-[#E4EAF0]/60 flex items-center justify-center text-lg shrink-0">
                      {CATEGORY_ICONS[expense.category]?.icon || '💳'}
                    </div>

                    {/* Title & Payer Details */}
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-[#192B3D] text-sm leading-snug break-words">
                        {expense.title}
                      </h4>
                      <p className="text-[11px] text-[#718096] mt-0.5">
                        <span className="font-semibold text-[#192B3D]">
                          {isPayer ? 'You' : payer?.name}
                        </span>{' '}
                        paid <strong className="text-[#192B3D]">{formatCurrency(expense.amount)}</strong>
                        {' • '}
                        <span>Split with {splitCount}</span>
                      </p>
                    </div>
                  </div>

                  {/* Personal Status Badge */}
                  <div className="text-right shrink-0">
                    <span className="text-[9px] uppercase font-bold text-[#718096] block tracking-wider">
                      {statusLabel}
                    </span>
                    <span
                      className={`text-sm font-black block mt-0.5 ${
                        isLent
                          ? 'text-[#145B4A]'
                          : statusLabel === 'you borrowed'
                          ? 'text-[#FF784F]'
                          : 'text-[#718096]'
                      }`}
                    >
                      {statusAmount > 0 ? formatCurrency(statusAmount) : '—'}
                    </span>
                  </div>
                </div>

                {/* Optional note */}
                {expense.notes && (
                  <p className="text-[11px] text-[#718096] italic bg-[#F7F8F5] px-3 py-1.5 rounded-lg border border-[#E4EAF0]/60">
                    "{expense.notes}"
                  </p>
                )}

                {/* Row 2: Category Pill & Edit / Delete */}
                <div className="flex items-center justify-between pt-2 border-t border-[#E4EAF0] text-xs text-[#718096]">
                  <span className="text-[10px] bg-[#F7F8F5] text-[#192B3D] px-2.5 py-0.5 rounded-full font-semibold border border-[#E4EAF0]">
                    {expense.category}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditExpense(expense);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold text-[#718096] hover:text-[#192B3D] hover:bg-[#F7F8F5] rounded-lg flex items-center gap-1 transition"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <span className="text-[#E4EAF0]">•</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteExpense(expense.id);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg flex items-center gap-1 transition"
                      title="Delete expense (Requires Security PIN)"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
