import React, { useState } from 'react';
import type { Expense, Member, Category } from '../../types';
import { formatCurrency, formatExpenseDate } from '../../utils/settlement';
import { CATEGORY_ICONS } from '../../utils/sampleData';
import { Search, Plus, Edit3, Trash2, X } from 'lucide-react';

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
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const memberMap = new Map<string, Member>();
  members.forEach((m) => memberMap.set(m.id, m));

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
    <div className="space-y-3.5 pb-32">
      {/* 1. Mobile Summary Hero Card */}
      <div className="bg-gradient-to-r from-teal-700 to-emerald-600 rounded-2xl p-4 text-white shadow-sm relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-teal-100 uppercase tracking-wider block">
              Your Net Balance
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl font-black">
                {netBalance > 0.01 && '+'}
                {formatCurrency(netBalance)}
              </span>
              <span className="text-xs text-teal-100 font-medium">
                {netBalance > 0.01 ? '(you get back 🟢)' : netBalance < -0.01 ? '(you owe 🔴)' : '(settled ⚪)'}
              </span>
            </div>
          </div>

          <button
            onClick={onOpenAddExpense}
            className="px-3 py-1.5 rounded-xl bg-white text-slate-900 font-bold text-xs flex items-center gap-1 shadow-sm active:scale-95 transition"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3] text-[#ff652f]" />
            <span>Add Bill</span>
          </button>
        </div>

        <div className="mt-3 pt-2.5 border-t border-white/20 flex items-center justify-between text-xs text-teal-100">
          <span>
            Trip Total: <strong className="text-white">{formatCurrency(totalSpend)}</strong>
          </span>
          <span>
            {expenses.length} bills recorded
          </span>
        </div>
      </div>

      {/* 2. Active Friend Filter Banner (if selected) */}
      {selectedFriend && (
        <div className="bg-teal-50 border border-teal-200 rounded-xl px-3 py-2 flex items-center justify-between text-xs text-teal-800">
          <div className="flex items-center gap-1.5">
            <span>Showing bills with:</span>
            <strong className="font-bold">{selectedFriend.name}</strong>
          </div>
          <button
            onClick={onClearFriendFilter}
            className="p-1 hover:bg-teal-100 rounded-lg text-teal-700 transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. Search Bar */}
      <div className="relative">
        <label htmlFor="mobile-search-bills" className="sr-only">
          Search bills, food, petrol...
        </label>
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          id="mobile-search-bills"
          name="search"
          type="text"
          placeholder="Search bills, food, petrol..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search bills, food, petrol..."
          className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#5bc5a7] shadow-2xs"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 4. Quick Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          const meta = cat !== 'ALL' ? CATEGORY_ICONS[cat] : null;

          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 flex items-center gap-1 ${
                isSelected
                  ? 'bg-[#5bc5a7] text-white shadow-2xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {meta && <span>{meta.icon}</span>}
              <span>{cat === 'ALL' ? 'All Bills' : cat}</span>
            </button>
          );
        })}
      </div>

      {/* 5. Bills List */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          {expenses.length === 0 && !searchTerm && selectedCategory === 'ALL' && !selectedFriendId ? (
            <div>
              <div className="bg-[#0a3c36] relative overflow-hidden">
                <img
                  src="/og-thumbnail.svg"
                  alt="Welcome to Road Trip 2026"
                  className="w-full h-36 object-cover object-center"
                />
              </div>
              <div className="p-5 text-center space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 inline-block">
                  🚗 Road Trip 2026
                </span>
                <h3 className="font-black text-slate-900 text-base">
                  Welcome to TripTab! 🚗💨
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Start logging fuel, Fastag tolls, snacks, drinks, and villa bills for the 7 friends!
                </p>
                <div className="flex flex-col gap-2 pt-1">
                  <button
                    onClick={onOpenAddExpense}
                    className="w-full py-2.5 rounded-xl bg-[#ff652f] hover:bg-[#e55320] text-white font-bold text-xs shadow-xs active:scale-95 transition"
                  >
                    + Add First Bill
                  </button>
                  <button
                    onClick={onLoadSample}
                    className="w-full py-2.5 rounded-xl bg-[#5bc5a7] hover:bg-[#48b396] text-white font-bold text-xs shadow-xs active:scale-95 transition flex items-center justify-center gap-1"
                  >
                    <span>Load Road Trip Bills</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center space-y-3">
              <div className="text-4xl">🌴🚗</div>
              <h3 className="font-bold text-slate-800 text-sm">No expenses found</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Try resetting your filters or search keywords.
              </p>
            </div>
          )}
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
            const catMeta =
              CATEGORY_ICONS[expense.category] || CATEGORY_ICONS['Misc'];

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
                className="bg-white border border-slate-200/90 rounded-2xl p-3.5 shadow-2xs space-y-2 hover:border-slate-300 active:scale-[0.99] cursor-pointer transition"
              >
                {/* Row 1: Date + Category + Title + Total Amount */}
                <div className="flex items-start justify-between gap-2.5">
                  <div className="flex items-start gap-2.5 min-w-0 flex-1">
                    {/* Date Badge */}
                    <div className="w-9 text-center shrink-0 border border-slate-200 rounded-lg bg-slate-50 overflow-hidden shadow-2xs">
                      <div className="bg-slate-200/80 text-[8px] font-bold text-slate-600 py-0.5 leading-tight">
                        {month}
                      </div>
                      <div className="text-xs font-black text-slate-800 py-0.5 leading-tight">
                        {day}
                      </div>
                    </div>

                    {/* Emoji Icon */}
                    <div className="text-lg shrink-0 mt-0.5">
                      {catMeta.icon}
                    </div>

                    {/* Title */}
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-slate-800 text-xs sm:text-sm leading-snug break-words">
                        {expense.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {isPayer ? 'You' : payer?.name} paid{' '}
                        <strong className="text-slate-700">
                          {formatCurrency(expense.amount)}
                        </strong>
                        {' • '}
                        <span>Split with {splitCount}</span>
                      </p>
                    </div>
                  </div>

                  {/* Personal Share Status */}
                  <div className="text-right shrink-0">
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">
                      {statusLabel}
                    </span>
                    <span
                      className={`text-xs sm:text-sm font-black block ${
                        isLent
                          ? 'text-[#0d9488]'
                          : statusLabel === 'you borrowed'
                          ? 'text-[#e05320]'
                          : 'text-slate-400'
                      }`}
                    >
                      {statusAmount > 0 ? formatCurrency(statusAmount) : '—'}
                    </span>
                  </div>
                </div>

                {/* Optional note */}
                {expense.notes && (
                  <p className="text-[11px] text-slate-400 italic bg-slate-50 px-2.5 py-1 rounded-lg">
                    "{expense.notes}"
                  </p>
                )}

                {/* Row 2: Footer Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                    {expense.category}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditExpense(expense);
                      }}
                      className="px-2 py-1 hover:text-slate-700 hover:bg-slate-100 rounded-md flex items-center gap-1 transition"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <span>•</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteExpense(expense.id);
                      }}
                      className="px-2 py-1 hover:text-rose-600 hover:bg-rose-50 rounded-md flex items-center gap-1 transition"
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
