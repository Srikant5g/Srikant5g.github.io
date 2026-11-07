import React, { useState } from 'react';
import type { Expense, Member, DebtTransaction, Category } from '../types';
import { formatCurrency, formatExpenseDate } from '../utils/settlement';
import { CATEGORY_ICONS } from '../utils/sampleData';
import { Plus, Check, ArrowRight, Trash2, Edit3, QrCode, Search, Sparkles, X } from 'lucide-react';

interface SplitwiseCenterViewProps {
  expenses: Expense[];
  members: Member[];
  currentUserId: string;
  selectedFriendId: string | null;
  settlements: DebtTransaction[];
  activeSubTab?: 'expenses' | 'debts' | 'breakdown';
  onChangeSubTab?: (tab: 'expenses' | 'debts' | 'breakdown') => void;
  onOpenAddExpense: () => void;
  onOpenSettleUp: () => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onLoadSample?: () => void;
}

export const SplitwiseCenterView: React.FC<SplitwiseCenterViewProps> = ({
  expenses,
  members,
  currentUserId,
  selectedFriendId,
  settlements,
  activeSubTab = 'expenses',
  onChangeSubTab,
  onOpenAddExpense,
  onOpenSettleUp,
  onEditExpense,
  onDeleteExpense,
  onLoadSample,
}) => {
  const [internalTab, setInternalTab] = useState<'expenses' | 'debts' | 'breakdown'>('expenses');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const tab = onChangeSubTab ? activeSubTab : internalTab;
  const setTab = (t: 'expenses' | 'debts' | 'breakdown') => {
    if (onChangeSubTab) {
      onChangeSubTab(t);
    } else {
      setInternalTab(t);
    }
  };

  const memberMap = new Map<string, Member>();
  members.forEach((m) => memberMap.set(m.id, m));

  const selectedFriend = selectedFriendId ? memberMap.get(selectedFriendId) : null;

  // Calculate currentUser's personal "you owe" and "you are owed"
  let youOweTotal = 0;
  let youAreOwedTotal = 0;

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

  // Filter expenses
  const filtered = expenses.filter((e) => {
    if (selectedFriendId) {
      const matchPayer = e.paidById === selectedFriendId || e.paidById === currentUserId;
      const matchSplitter =
        e.splitMemberIds.includes(selectedFriendId) ||
        e.splitMemberIds.includes(currentUserId);
      if (!matchPayer && !matchSplitter) return false;
    }

    if (categoryFilter !== 'ALL' && e.category !== categoryFilter) return false;

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
    <div className="flex-1 min-w-0 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden w-full">
      {/* Top Header Bar with Wrap Protection */}
      <div className="bg-[#f8f9fa] border-b border-slate-200 px-4 py-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 m-0 flex items-center gap-2 truncate">
            <span>
              {selectedFriend
                ? `${selectedFriend.name} & You`
                : 'Dashboard'}
            </span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Goa Road Trip • <span className="font-bold text-slate-700">{expenses.length} bills</span> recorded
          </p>
        </div>

        {/* Action Buttons: Add an expense & Settle up (Never cut off!) */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
          <button
            onClick={onOpenAddExpense}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#ff652f] hover:bg-[#e55320] text-white font-bold text-xs sm:text-sm shadow-xs transition active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add an expense</span>
          </button>

          <button
            onClick={onOpenSettleUp}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#5bc5a7] hover:bg-[#48b396] text-white font-bold text-xs sm:text-sm shadow-xs transition active:scale-95 shrink-0"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Settle up</span>
          </button>
        </div>
      </div>

      {/* The Splitwise 3-Box Balance Banner */}
      <div className="grid grid-cols-3 border-b border-slate-200 text-center py-4 bg-[#fbfbfb]">
        {/* Total Balance */}
        <div className="border-r border-slate-200 px-2 sm:px-4">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 block">
            total balance
          </span>
          <span
            className={`text-base sm:text-2xl font-black mt-1 block truncate ${
              netBalance > 0.01
                ? 'text-[#5bc5a7]'
                : netBalance < -0.01
                ? 'text-[#ff652f]'
                : 'text-slate-500'
            }`}
          >
            {netBalance > 0.01 && '+'}
            {formatCurrency(netBalance)}
          </span>
        </div>

        {/* You Owe */}
        <div className="border-r border-slate-200 px-2 sm:px-4">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 block">
            you owe
          </span>
          <span className="text-base sm:text-2xl font-black text-[#ff652f] mt-1 block truncate">
            {formatCurrency(youOweTotal)}
          </span>
        </div>

        {/* You Are Owed */}
        <div className="px-2 sm:px-4">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-400 block">
            you are owed
          </span>
          <span className="text-base sm:text-2xl font-black text-[#5bc5a7] mt-1 block truncate">
            {formatCurrency(youAreOwedTotal)}
          </span>
        </div>
      </div>

      {/* Sub-Tabs: Expenses vs Debts vs Breakdown */}
      <div className="border-b border-slate-200 px-4 sm:px-6 bg-white overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-6 sm:gap-8 whitespace-nowrap min-w-max text-xs sm:text-sm font-bold text-slate-500">
          <button
            onClick={() => setTab('expenses')}
            className={`py-3.5 border-b-2 transition flex items-center gap-1.5 ${
              tab === 'expenses'
                ? 'border-[#5bc5a7] text-[#5bc5a7]'
                : 'border-transparent hover:text-slate-700'
            }`}
          >
            <span>All Expenses</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                tab === 'expenses' ? 'bg-[#5bc5a7]/15 text-[#216d59]' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {filtered.length}
            </span>
          </button>

          <button
            onClick={() => setTab('debts')}
            className={`py-3.5 border-b-2 transition flex items-center gap-1.5 ${
              tab === 'debts'
                ? 'border-[#5bc5a7] text-[#5bc5a7]'
                : 'border-transparent hover:text-slate-700'
            }`}
          >
            <span>Who Owes Who</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                tab === 'debts' ? 'bg-[#5bc5a7]/15 text-[#216d59]' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {settlements.length}
            </span>
          </button>

          <button
            onClick={() => setTab('breakdown')}
            className={`py-3.5 border-b-2 transition flex items-center gap-1.5 ${
              tab === 'breakdown'
                ? 'border-[#5bc5a7] text-[#5bc5a7]'
                : 'border-transparent hover:text-slate-700'
            }`}
          >
            <span>Category Spend</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Expenses Feed */}
      {tab === 'expenses' && (
        <div className="pb-20 md:pb-6">
          {/* Filters Bar: Search & Category Pills */}
          <div className="p-3.5 sm:p-4 bg-[#fafafa] border-b border-slate-100 space-y-2.5">
            {/* Search Input */}
            <div className="relative w-full">
              <label htmlFor="desktop-search-bills" className="sr-only">
                Search bills by title, category, or friend
              </label>
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="desktop-search-bills"
                name="search"
                type="text"
                placeholder="Search bills by title, category, or friend..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search bills by title, category, or friend"
                className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-9 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#5bc5a7] focus:ring-2 focus:ring-[#5bc5a7]/15 transition"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Pills (smooth scrollable) */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold transition active:scale-95 ${
                    categoryFilter === cat
                      ? 'bg-[#5bc5a7] text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat !== 'ALL' && <span className="mr-1">{CATEGORY_ICONS[cat]?.icon}</span>}
                  {cat === 'ALL' ? 'All' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Expenses List */}
          {filtered.length === 0 ? (
            <div className="py-8 px-4 text-center max-w-lg mx-auto space-y-4">
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900 relative">
                <img
                  src="/og-thumbnail.svg"
                  alt="Welcome to Goa Road Trip 2026"
                  className="w-full h-44 object-cover object-center"
                />
              </div>

              <div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold uppercase tracking-wider">
                  🚗 Goa Road Trip 2026
                </span>
                <h3 className="font-black text-slate-900 text-lg mt-1.5">
                  Welcome to GoaTab! 🏖️
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                  Start logging your highway fuel, Fastag tolls, snacks, drinks, and villa stay for our 7 friends!
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <button
                  onClick={onOpenAddExpense}
                  className="px-5 py-2.5 rounded-xl bg-[#ff652f] hover:bg-[#e55320] text-white font-bold text-xs sm:text-sm shadow-xs transition active:scale-95"
                >
                  + Add First Expense
                </button>
                {onLoadSample && (
                  <button
                    onClick={onLoadSample}
                    className="px-4 py-2.5 rounded-xl bg-[#5bc5a7] hover:bg-[#48b396] text-white font-bold text-xs sm:text-sm shadow-xs transition flex items-center gap-1.5 active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Load Sample Bills</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
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
                const catMeta = CATEGORY_ICONS[expense.category] || {
                  icon: '📝',
                  color: 'bg-slate-100 text-slate-700',
                };

                const { month, day } = formatExpenseDate(expense.date);

                // Personal lend / borrow
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
                    className="p-3.5 sm:px-6 hover:bg-slate-50/70 transition flex items-center justify-between gap-3 group cursor-pointer"
                  >
                    {/* Left: Date + Icon + Title + Info */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Splitwise Date Badge */}
                      <div className="w-10 text-center shrink-0 border border-slate-200 rounded-lg bg-white overflow-hidden shadow-2xs">
                        <div className="bg-slate-100 text-[8px] font-bold text-slate-500 py-0.5 border-b border-slate-200 leading-tight">
                          {month}
                        </div>
                        <div className="text-xs font-black text-slate-800 py-0.5 leading-tight">
                          {day}
                        </div>
                      </div>

                      {/* Category Icon Badge */}
                      <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl shrink-0">
                        {catMeta.icon}
                      </div>

                      {/* Title & Detail */}
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm leading-snug truncate">
                          {expense.title}
                        </h4>
                        <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                          <span className="font-semibold text-slate-700">
                            {isPayer ? 'You' : payer?.name}
                          </span>{' '}
                          paid{' '}
                          <span className="font-bold text-slate-800">
                            {formatCurrency(expense.amount)}
                          </span>
                          {' • '}
                          <span>Split with {splitCount}</span>
                        </div>
                        {expense.notes && (
                          <p className="text-[11px] text-slate-400 italic mt-0.5 truncate">
                            "{expense.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Personal Share Amount + Action Buttons */}
                    <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                      <div className="text-right">
                        <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                          {statusLabel}
                        </span>
                        <span
                          className={`text-xs sm:text-base font-black block ${
                            isLent
                              ? 'text-[#5bc5a7]'
                              : statusLabel === 'you borrowed'
                              ? 'text-[#ff652f]'
                              : 'text-slate-400'
                          }`}
                        >
                          {statusAmount > 0 ? formatCurrency(statusAmount) : '—'}
                        </span>
                      </div>

                      {/* Actions: Edit & PIN-Protected Delete */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditExpense(expense);
                          }}
                          className="p-1.5 sm:px-2 sm:py-1 hover:text-slate-800 hover:bg-slate-200/60 rounded-lg text-slate-400 transition flex items-center gap-1"
                          title="Edit Bill"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline text-xs font-semibold">Edit</span>
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteExpense(expense.id);
                          }}
                          className="p-1.5 sm:px-2 sm:py-1 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-slate-400 transition flex items-center gap-1"
                          title="Delete Bill (Requires Security PIN)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline text-xs font-semibold">Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Simplified Debts */}
      {tab === 'debts' && (
        <div className="p-4 sm:p-6 space-y-4 pb-20 md:pb-6">
          <div className="bg-[#f0f9f6] border border-[#5bc5a7]/30 rounded-2xl p-4 text-xs text-[#28816a] flex items-center justify-between">
            <div>
              <strong className="block text-sm font-black flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#5bc5a7]" />
                Smart Simplified Debts
              </strong>
              <span className="text-slate-600 mt-0.5 block">
                Calculates direct transfers so everyone settles with the minimum number of UPI payments.
              </span>
            </div>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
            {settlements.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs space-y-1">
                <p className="font-bold text-slate-700 text-sm">All Friends Settled Up! 🎉</p>
                <p className="text-slate-400">No debts or payments pending.</p>
              </div>
            ) : (
              settlements.map((tx, idx) => {
                const isYouPaying = tx.fromId === currentUserId;
                const isYouReceiving = tx.toId === currentUserId;

                return (
                  <div
                    key={tx.id || idx}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm flex-wrap font-medium">
                        <strong className={isYouPaying ? 'text-[#ff652f]' : 'text-slate-900'}>
                          {tx.fromName} {isYouPaying && '(You)'}
                        </strong>
                        <span className="text-slate-400 flex items-center gap-1 text-xs">
                          owes <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        </span>
                        <strong className={isYouReceiving ? 'text-[#5bc5a7]' : 'text-slate-900'}>
                          {tx.toName} {isYouReceiving && '(You)'}
                        </strong>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <span className="text-base sm:text-lg font-black text-slate-900">
                        {formatCurrency(tx.amount)}
                      </span>
                      {tx.toUpiId && (
                        <a
                          href={`upi://pay?pa=${tx.toUpiId}&pn=${encodeURIComponent(
                            tx.toName
                          )}&am=${tx.amount}&cu=INR&tn=GoaTripSettlement`}
                          className="px-3 py-1.5 text-xs font-bold rounded-xl bg-[#5bc5a7] hover:bg-[#48b396] text-white transition flex items-center gap-1.5 shadow-xs"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Pay UPI</span>
                        </a>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Category Spend Breakdown */}
      {tab === 'breakdown' && (
        <div className="p-4 sm:p-6 space-y-4 pb-20 md:pb-6">
          <h3 className="font-extrabold text-slate-900 text-sm">Where your trip money went</h3>
          <div className="space-y-3.5">
            {categories
              .filter((c) => c !== 'ALL')
              .map((cat) => {
                const total = expenses
                  .filter((e) => e.category === cat)
                  .reduce((sum, e) => sum + e.amount, 0);
                const grandTotal = expenses.reduce((s, e) => s + e.amount, 0);
                const pct = grandTotal > 0 ? (total / grandTotal) * 100 : 0;
                const meta = CATEGORY_ICONS[cat];

                if (total === 0) return null;

                return (
                  <div key={cat} className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="flex items-center gap-2 text-slate-800 font-bold">
                        <span className="text-base">{meta.icon}</span>
                        <span>{cat}</span>
                      </span>
                      <span className="font-black text-slate-900 text-sm">
                        {formatCurrency(total)}{' '}
                        <span className="text-slate-400 font-normal text-xs">({pct.toFixed(0)}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-[#5bc5a7] h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
};
