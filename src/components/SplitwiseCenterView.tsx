import React, { useState } from 'react';
import type { Expense, Member, DebtTransaction, Category } from '../types';
import { formatCurrency, formatExpenseDate, calculateTotalTripSpend, getActualExpenses } from '../utils/settlement';
import { CATEGORY_ICONS } from '../utils/sampleData';
import { UpiPaymentActions } from './UpiPaymentActions';
import { Plus, Check, ArrowRight, Trash2, Edit3, Search, Sparkles, X, PieChart } from 'lucide-react';

interface SplitwiseCenterViewProps {
  expenses: Expense[];
  members: Member[];
  currentUserId: string | null;
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
    const isPayer = Boolean(currentUserId && e.paidById === currentUserId);
    const isSplitter = Boolean(currentUserId && e.splitMemberIds.includes(currentUserId));
    const splitCount = e.splitMemberIds.length;
    const userShare =
      currentUserId && e.splitMode === 'CUSTOM' && e.customSplits
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
      const matchPayer = e.paidById === selectedFriendId || (currentUserId ? e.paidById === currentUserId : false);
      const matchSplitter =
        e.splitMemberIds.includes(selectedFriendId) ||
        (currentUserId ? e.splitMemberIds.includes(currentUserId) : false);
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

  // Category Spend calculation for Tab 3 & Donut (Excluding pure settlement payments)
  const actualExpenses = getActualExpenses(expenses);
  const grandTotalSpend = calculateTotalTripSpend(expenses);
  const categorySpendMap: Record<string, number> = {};
  actualExpenses.forEach((e) => {
    categorySpendMap[e.category] = (categorySpendMap[e.category] || 0) + e.amount;
  });

  // Colors for Donut segments
  const DONUT_COLORS = [
    '#145B4A', // Forest Green
    '#78C5A7', // Mint Green
    '#FF784F', // Coral
    '#3B82F6', // Blue
    '#F59E0B', // Amber
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#10B981', // Emerald
  ];

  const sortedCategories = Object.entries(categorySpendMap)
    .filter(([_, amt]) => amt > 0)
    .sort((a, b) => b[1] - a[1]);

  // Compute SVG Donut Chart strokes
  let cumulativePercent = 0;
  const donutSegments = sortedCategories.map(([cat, amt], index) => {
    const percent = grandTotalSpend > 0 ? (amt / grandTotalSpend) * 100 : 0;
    const strokeDasharray = `${percent} ${100 - percent}`;
    const strokeDashoffset = -cumulativePercent;
    cumulativePercent += percent;
    return {
      cat,
      amt,
      percent,
      color: DONUT_COLORS[index % DONUT_COLORS.length],
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className="flex-1 min-w-0 bg-white border border-[#E4EAF0] rounded-3xl shadow-xs overflow-hidden w-full">
      {/* Top Header Bar */}
      <div className="bg-[#F7F8F5] border-b border-[#E4EAF0] px-4 py-4 sm:px-6 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-black text-[#192B3D] m-0 flex items-center gap-2 truncate">
            <span>
              {selectedFriend
                ? `${selectedFriend.name} & You`
                : 'Expenses Dashboard'}
            </span>
          </h1>
          <p className="text-xs text-[#718096] font-medium mt-0.5">
            TripTally • <span className="font-bold text-[#192B3D]">{expenses.length} bills</span> recorded
          </p>
        </div>

        {/* Action Buttons: Add an expense & Settle up */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
          <button
            onClick={onOpenAddExpense}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#145B4A] hover:bg-[#0f4437] text-white font-bold text-xs sm:text-sm shadow-xs transition active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add an expense</span>
          </button>

          <button
            onClick={onOpenSettleUp}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#78C5A7]/20 hover:bg-[#78C5A7]/30 text-[#145B4A] font-bold text-xs sm:text-sm border border-[#78C5A7]/40 transition active:scale-95 shrink-0"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Settle up</span>
          </button>
        </div>
      </div>

      {/* The 3-Box Balance Banner */}
      <div className="grid grid-cols-3 border-b border-[#E4EAF0] text-center py-4 bg-white">
        {/* Total Balance */}
        <div className="border-r border-[#E4EAF0] px-2 sm:px-4">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#718096] block">
            total balance
          </span>
          <span
            className={`text-base sm:text-2xl font-black mt-1 block truncate ${
              netBalance > 0.01
                ? 'text-[#145B4A]'
                : netBalance < -0.01
                ? 'text-[#FF784F]'
                : 'text-[#718096]'
            }`}
          >
            {netBalance > 0.01 && '+'}
            {formatCurrency(netBalance)}
          </span>
        </div>

        {/* You Owe */}
        <div className="border-r border-[#E4EAF0] px-2 sm:px-4">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#718096] block">
            you owe
          </span>
          <span className="text-base sm:text-2xl font-black text-[#FF784F] mt-1 block truncate">
            {formatCurrency(youOweTotal)}
          </span>
        </div>

        {/* You Are Owed */}
        <div className="px-2 sm:px-4">
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#718096] block">
            you are owed
          </span>
          <span className="text-base sm:text-2xl font-black text-[#145B4A] mt-1 block truncate">
            {formatCurrency(youAreOwedTotal)}
          </span>
        </div>
      </div>

      {/* Sub-Tabs: Expenses vs Debts vs Breakdown */}
      <div className="border-b border-[#E4EAF0] px-4 sm:px-6 bg-[#F7F8F5] overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-6 sm:gap-8 whitespace-nowrap min-w-max text-xs sm:text-sm font-bold text-[#718096]">
          <button
            onClick={() => setTab('expenses')}
            className={`py-3.5 border-b-2 transition flex items-center gap-2 ${
              tab === 'expenses'
                ? 'border-[#145B4A] text-[#145B4A]'
                : 'border-transparent hover:text-[#192B3D]'
            }`}
          >
            <span>All Expenses</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                tab === 'expenses' ? 'bg-[#78C5A7]/25 text-[#145B4A]' : 'bg-[#E4EAF0] text-[#718096]'
              }`}
            >
              {filtered.length}
            </span>
          </button>

          <button
            onClick={() => setTab('debts')}
            className={`py-3.5 border-b-2 transition flex items-center gap-2 ${
              tab === 'debts'
                ? 'border-[#145B4A] text-[#145B4A]'
                : 'border-transparent hover:text-[#192B3D]'
            }`}
          >
            <span>Who Owes Who</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                tab === 'debts' ? 'bg-[#78C5A7]/25 text-[#145B4A]' : 'bg-[#E4EAF0] text-[#718096]'
              }`}
            >
              {settlements.length}
            </span>
          </button>

          <button
            onClick={() => setTab('breakdown')}
            className={`py-3.5 border-b-2 transition flex items-center gap-2 ${
              tab === 'breakdown'
                ? 'border-[#145B4A] text-[#145B4A]'
                : 'border-transparent hover:text-[#192B3D]'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>Category Spend</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Expenses Feed */}
      {tab === 'expenses' && (
        <div className="pb-20 md:pb-6">
          {/* Filters Bar: Search & Category Pills */}
          <div className="p-3.5 sm:p-4 bg-white border-b border-[#E4EAF0] space-y-2.5">
            {/* Search Input */}
            <div className="relative w-full">
              <label htmlFor="desktop-search-bills" className="sr-only">
                Search bills by title, category, or friend
              </label>
              <Search className="w-4 h-4 text-[#718096] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="desktop-search-bills"
                name="search"
                type="text"
                placeholder="Search bills by title, category, or friend..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search bills by title, category, or friend"
                className="w-full bg-[#F7F8F5] border border-[#E4EAF0] rounded-xl pl-10 pr-9 py-2 text-xs sm:text-sm text-[#192B3D] placeholder-[#718096] focus:outline-none focus:border-[#145B4A] focus:bg-white focus:ring-2 focus:ring-[#78C5A7]/20 transition"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#718096] hover:text-[#192B3D] p-0.5"
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
                      ? 'bg-[#145B4A] text-white shadow-xs'
                      : 'bg-[#F7F8F5] border border-[#E4EAF0] text-[#718096] hover:text-[#192B3D] hover:bg-white'
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
            <div className="py-10 px-4 text-center max-w-lg mx-auto space-y-4">
              <div className="rounded-3xl overflow-hidden border border-[#E4EAF0] shadow-sm bg-[#145B4A] relative">
                <img
                  src="/og-thumbnail.svg"
                  alt="Welcome to TripTally"
                  className="w-full h-44 object-cover object-center"
                />
              </div>

              <div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#78C5A7]/20 text-[#145B4A] border border-[#78C5A7]/40 text-[11px] font-black uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" />
                  TripTally
                </span>
                <h3 className="font-black text-[#192B3D] text-lg mt-2">
                  No expenses found
                </h3>
                <p className="text-xs text-[#718096] mt-1 max-w-md mx-auto leading-relaxed">
                  Start logging your trip fuel, meals, hotel, tolls, and activities for your group!
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                <button
                  onClick={onOpenAddExpense}
                  className="px-5 py-2.5 rounded-xl bg-[#145B4A] hover:bg-[#0f4437] text-white font-bold text-xs sm:text-sm shadow-xs transition active:scale-95"
                >
                  + Add Expense
                </button>
                {onLoadSample && (
                  <button
                    onClick={onLoadSample}
                    className="px-4 py-2.5 rounded-xl bg-[#78C5A7]/20 hover:bg-[#78C5A7]/30 text-[#145B4A] border border-[#78C5A7]/40 font-bold text-xs sm:text-sm shadow-xs transition flex items-center gap-1.5 active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Load Sample Bills</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-[#E4EAF0]">
              {filtered.map((expense) => {
                const payer = memberMap.get(expense.paidById);
                const isPayer = Boolean(currentUserId && expense.paidById === currentUserId);
                const isSplitter = Boolean(currentUserId && expense.splitMemberIds.includes(currentUserId));
                const splitCount = expense.splitMemberIds.length;
                const userShare =
                  currentUserId && expense.splitMode === 'CUSTOM' && expense.customSplits
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
                    className="p-3.5 sm:px-6 hover:bg-[#F7F8F5]/80 transition flex items-center justify-between gap-3 group cursor-pointer"
                  >
                    {/* Left: Date + Icon + Title + Info */}
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      {/* Date Badge */}
                      <div className="w-10 text-center shrink-0 border border-[#E4EAF0] rounded-xl bg-white overflow-hidden shadow-2xs">
                        <div className="bg-[#F7F8F5] text-[8px] font-bold text-[#718096] py-0.5 border-b border-[#E4EAF0] leading-tight uppercase">
                          {month}
                        </div>
                        <div className="text-xs font-black text-[#192B3D] py-0.5 leading-tight">
                          {day}
                        </div>
                      </div>

                      {/* Category Icon Badge */}
                      <div className="w-10 h-10 rounded-2xl bg-[#F7F8F5] border border-[#E4EAF0] flex items-center justify-center text-xl shrink-0 group-hover:scale-105 transition">
                        {catMeta.icon}
                      </div>

                      {/* Title & Detail */}
                      <div className="min-w-0 flex-1">
                        <h4 className="font-bold text-[#192B3D] text-xs sm:text-sm leading-snug truncate">
                          {expense.title}
                        </h4>
                        <div className="text-[11px] text-[#718096] mt-0.5 truncate">
                          <span className="font-semibold text-[#192B3D]">
                            {isPayer ? 'You' : payer?.name}
                          </span>{' '}
                          paid{' '}
                          <span className="font-bold text-[#192B3D]">
                            {formatCurrency(expense.amount)}
                          </span>
                          {' • '}
                          <span>Split with {splitCount}</span>
                        </div>
                        {expense.notes && (
                          <p className="text-[11px] text-[#718096]/80 italic mt-0.5 truncate">
                            "{expense.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Right: Personal Share Amount + Action Buttons */}
                    <div className="flex items-center gap-3 sm:gap-4 shrink-0">
                      <div className="text-right">
                        <span className="text-[9px] sm:text-[10px] uppercase font-bold text-[#718096] block tracking-wider">
                          {statusLabel}
                        </span>
                        <span
                          className={`text-xs sm:text-base font-black block ${
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

                      {/* Actions: Edit & PIN-Protected Delete */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditExpense(expense);
                          }}
                          className="p-1.5 sm:px-2.5 sm:py-1 hover:text-[#192B3D] hover:bg-[#E4EAF0] rounded-xl text-[#718096] transition flex items-center gap-1"
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
                          className="p-1.5 sm:px-2.5 sm:py-1 hover:text-[#FF784F] hover:bg-rose-50 rounded-xl text-[#718096] transition flex items-center gap-1"
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
          <div className="bg-[#78C5A7]/10 border border-[#78C5A7]/30 rounded-2xl p-4 text-xs text-[#145B4A] flex items-center justify-between">
            <div>
              <strong className="block text-sm font-black flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#145B4A]" />
                TripTally Debt Simplification
              </strong>
              <span className="text-[#718096] mt-0.5 block">
                Calculates direct transfers so everyone settles with the minimum number of UPI payments.
              </span>
            </div>
          </div>

          <div className="divide-y divide-[#E4EAF0] border border-[#E4EAF0] rounded-3xl overflow-hidden bg-white shadow-xs">
            {settlements.length === 0 ? (
              <div className="text-center py-12 text-[#718096] text-xs space-y-1">
                <p className="font-bold text-[#192B3D] text-sm">All Friends Settled Up! 🎉</p>
                <p className="text-[#718096]">No debts or payments pending.</p>
              </div>
            ) : (
              settlements.map((tx, idx) => {
                const isYouPaying = tx.fromId === currentUserId;
                const isYouReceiving = tx.toId === currentUserId;

                return (
                  <div
                    key={tx.id || idx}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#F7F8F5]/80 transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#F7F8F5] border border-[#E4EAF0] flex items-center justify-center text-xs font-black text-[#192B3D] shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex items-center gap-2 text-xs sm:text-sm flex-wrap font-medium">
                        <strong className={isYouPaying ? 'text-[#FF784F]' : 'text-[#192B3D]'}>
                          {tx.fromName} {isYouPaying && '(You)'}
                        </strong>
                        <span className="text-[#718096] flex items-center gap-1 text-xs">
                          owes <ArrowRight className="w-3.5 h-3.5 text-[#718096]" />
                        </span>
                        <strong className={isYouReceiving ? 'text-[#145B4A]' : 'text-[#192B3D]'}>
                          {tx.toName} {isYouReceiving && '(You)'}
                        </strong>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E4EAF0]">
                      <span className="text-base sm:text-lg font-black text-[#192B3D]">
                        {formatCurrency(tx.amount)}
                      </span>

                      {tx.toUpiId && (
                        <UpiPaymentActions
                          params={{
                            upiId: tx.toUpiId,
                            name: tx.toName,
                            amount: tx.amount,
                            note: `TripTally Settlement to ${tx.toName}`,
                          }}
                          size="sm"
                        />
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Category Spend Breakdown & SVG Donut Chart */}
      {tab === 'breakdown' && (
        <div className="p-4 sm:p-6 space-y-6 pb-20 md:pb-6">
          <div className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-3xl bg-[#F7F8F5] border border-[#E4EAF0]">
            {/* SVG Donut Chart */}
            <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                <circle
                  cx="18"
                  cy="18"
                  r="15.91549430918954"
                  fill="none"
                  stroke="#E4EAF0"
                  strokeWidth="3.2"
                />
                {donutSegments.map((seg) => (
                  <circle
                    key={seg.cat}
                    cx="18"
                    cy="18"
                    r="15.91549430918954"
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="3.2"
                    strokeDasharray={seg.strokeDasharray}
                    strokeDashoffset={seg.strokeDashoffset}
                    className="transition-all duration-500"
                  />
                ))}
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] font-bold text-[#718096] uppercase tracking-wider">
                  Total
                </span>
                <span className="text-sm font-black text-[#192B3D]">
                  {formatCurrency(grandTotalSpend)}
                </span>
              </div>
            </div>

            {/* Spending Overview */}
            <div className="flex-1 space-y-2 text-center md:text-left">
              <span className="px-2.5 py-1 rounded-full bg-[#78C5A7]/20 text-[#145B4A] text-xs font-bold uppercase tracking-wider">
                Financial Insights
              </span>
              <h3 className="text-lg font-black text-[#192B3D] mt-1">
                Category Spending Distribution
              </h3>
              <p className="text-xs text-[#718096] leading-relaxed">
                Visual proportion of where trip funds were allocated across {sortedCategories.length} categories.
              </p>
            </div>
          </div>

          {/* List of Category Breakdown Rows */}
          <div className="space-y-3">
            {sortedCategories.map(([cat, total], idx) => {
              const pct = grandTotalSpend > 0 ? (total / grandTotalSpend) * 100 : 0;
              const meta = CATEGORY_ICONS[cat] || { icon: '📝' };
              const color = DONUT_COLORS[idx % DONUT_COLORS.length];

              return (
                <div key={cat} className="space-y-1.5 p-3.5 rounded-2xl bg-white border border-[#E4EAF0] shadow-2xs">
                  <div className="flex items-center justify-between text-xs font-medium">
                    <span className="flex items-center gap-2.5 text-[#192B3D] font-bold">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-base">{meta.icon}</span>
                      <span>{cat}</span>
                    </span>
                    <span className="font-black text-[#192B3D] text-sm">
                      {formatCurrency(total)}{' '}
                      <span className="text-[#718096] font-normal text-xs">({pct.toFixed(0)}%)</span>
                    </span>
                  </div>
                  <div className="w-full bg-[#F7F8F5] h-2.5 rounded-full overflow-hidden border border-[#E4EAF0]">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%`, backgroundColor: color }}
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
