import React, { useState } from 'react';
import type { Expense, Member, DebtTransaction, Category } from '../types';
import { formatCurrency } from '../utils/settlement';
import { CATEGORY_ICONS } from '../utils/sampleData';
import { Plus, Check, ArrowRight, Trash2, Edit3, QrCode, Search, Sparkles } from 'lucide-react';

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
    const share = splitCount > 0 ? e.amount / splitCount : 0;

    if (isPayer) {
      if (isSplitter) {
        youAreOwedTotal += e.amount - share;
      } else {
        youAreOwedTotal += e.amount;
      }
    } else if (isSplitter) {
      youOweTotal += share;
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
    <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden w-full">
      {/* Top Header Bar */}
      <div className="bg-[#f8f9fa] border-b border-slate-200 px-4 py-3.5 sm:px-6 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-2xl font-black text-[#333333] m-0 flex items-center gap-2">
            <span>
              {selectedFriend
                ? `${selectedFriend.name} & You`
                : 'Dashboard'}
            </span>
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
            Goa Road Trip • {expenses.length} bills recorded
          </p>
        </div>

        {/* Action Buttons: Add an expense & Settle up */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={onOpenAddExpense}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#ff652f] hover:bg-[#e55320] text-white font-bold text-xs sm:text-sm shadow-xs transition active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add an expense</span>
          </button>

          <button
            onClick={onOpenSettleUp}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#5bc5a7] hover:bg-[#48b396] text-white font-bold text-xs sm:text-sm shadow-xs transition active:scale-95"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Settle up</span>
          </button>
        </div>
      </div>

      {/* The Classic Splitwise 3-Box Balance Banner */}
      <div className="grid grid-cols-3 border-b border-slate-200 text-center py-3 sm:py-4 bg-[#fbfbfb]">
        {/* Total Balance */}
        <div className="border-r border-slate-200 px-2 sm:px-4">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            total balance
          </span>
          <span
            className={`text-sm sm:text-xl font-black mt-0.5 block truncate ${
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
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            you owe
          </span>
          <span className="text-sm sm:text-xl font-black text-[#ff652f] mt-0.5 block truncate">
            {formatCurrency(youOweTotal)}
          </span>
        </div>

        {/* You Are Owed */}
        <div className="px-2 sm:px-4">
          <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            you are owed
          </span>
          <span className="text-sm sm:text-xl font-black text-[#5bc5a7] mt-0.5 block truncate">
            {formatCurrency(youAreOwedTotal)}
          </span>
        </div>
      </div>

      {/* Sub-Tabs: Expenses vs Debts vs Breakdown */}
      <div className="border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between bg-white text-xs font-bold text-slate-500 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-4 sm:gap-6 whitespace-nowrap">
          <button
            onClick={() => setTab('expenses')}
            className={`py-3 border-b-2 transition ${
              tab === 'expenses'
                ? 'border-[#5bc5a7] text-[#5bc5a7]'
                : 'border-transparent hover:text-slate-700'
            }`}
          >
            All Expenses ({filtered.length})
          </button>

          <button
            onClick={() => setTab('debts')}
            className={`py-3 border-b-2 transition ${
              tab === 'debts'
                ? 'border-[#5bc5a7] text-[#5bc5a7]'
                : 'border-transparent hover:text-slate-700'
            }`}
          >
            Who Owes Who ({settlements.length})
          </button>

          <button
            onClick={() => setTab('breakdown')}
            className={`py-3 border-b-2 transition ${
              tab === 'breakdown'
                ? 'border-[#5bc5a7] text-[#5bc5a7]'
                : 'border-transparent hover:text-slate-700'
            }`}
          >
            Category Spend
          </button>
        </div>
      </div>

      {/* TAB 1: Expenses Feed */}
      {tab === 'expenses' && (
        <div className="pb-24 md:pb-6">
          {/* Filters Bar */}
          <div className="p-3 bg-[#fafafa] border-b border-slate-100 flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search bills by title or payer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#5bc5a7]"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto scrollbar-none pb-0.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`whitespace-nowrap px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                    categoryFilter === cat
                      ? 'bg-[#5bc5a7] text-white shadow-2xs'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {cat === 'ALL' ? 'All' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Expenses List */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="text-4xl mb-2">🌴</div>
              <h3 className="font-bold text-slate-700 text-sm">No expenses found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                No bills match your current filter. Click "+ Add an expense" to add one!
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filtered.map((expense) => {
                const payer = memberMap.get(expense.paidById);
                const isPayer = expense.paidById === currentUserId;
                const isSplitter = expense.splitMemberIds.includes(currentUserId);
                const splitCount = expense.splitMemberIds.length;
                const sharePerPerson = splitCount > 0 ? expense.amount / splitCount : 0;
                const catMeta =
                  CATEGORY_ICONS[expense.category] || CATEGORY_ICONS['Misc'];

                // Format date for Splitwise badge
                const dateObj = new Date(expense.date);
                const month = dateObj
                  .toLocaleString('en-US', { month: 'short' })
                  .toUpperCase();
                const day = dateObj.getDate().toString().padStart(2, '0');

                // Personal lend / borrow
                let statusLabel = 'not involved';
                let statusAmount = 0;
                let isLent = false;

                if (isPayer) {
                  isLent = true;
                  statusLabel = 'you lent';
                  statusAmount = isSplitter ? expense.amount - sharePerPerson : expense.amount;
                } else if (isSplitter) {
                  statusLabel = 'you borrowed';
                  statusAmount = sharePerPerson;
                }

                return (
                  <div
                    key={expense.id}
                    className="p-3 sm:px-6 hover:bg-[#fafafa] transition flex flex-col gap-2 group"
                  >
                    {/* Top Row: Date + Icon + Title + Total Amount */}
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        {/* Splitwise Calendar Badge */}
                        <div className="w-9 text-center shrink-0 border border-slate-200 rounded-md bg-white overflow-hidden shadow-2xs">
                          <div className="bg-slate-100 text-[8px] font-bold text-slate-500 py-0.5 border-b border-slate-200 leading-tight">
                            {month}
                          </div>
                          <div className="text-xs font-black text-slate-800 py-0.5 leading-tight">
                            {day}
                          </div>
                        </div>

                        {/* Category Icon */}
                        <div className="text-lg shrink-0 mt-0.5">
                          {catMeta.icon}
                        </div>

                        {/* Title & Notes */}
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-slate-800 text-xs sm:text-sm leading-snug break-words">
                            {expense.title}
                          </h4>
                          <div className="text-[11px] text-slate-500 mt-0.5">
                            {isPayer ? 'You' : payer?.name} paid{' '}
                            <span className="font-semibold text-slate-700">
                              {formatCurrency(expense.amount)}
                            </span>
                            {' • '}
                            <span>Split with {splitCount}</span>
                          </div>
                          {expense.notes && (
                            <p className="text-[10px] sm:text-[11px] text-slate-400 italic mt-0.5">
                              "{expense.notes}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Right: Personal Share Amount */}
                      <div className="text-right shrink-0">
                        <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-400 block">
                          {statusLabel}
                        </span>
                        <span
                          className={`text-xs sm:text-sm font-extrabold block ${
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
                    </div>

                    {/* Bottom Row: Actions (Edit & Delete) */}
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100/70 text-slate-400 text-xs">
                      <button
                        onClick={() => onEditExpense(expense)}
                        className="px-2 py-1 hover:text-slate-700 hover:bg-slate-100 rounded flex items-center gap-1 transition"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span className="text-[10px]">Edit</span>
                      </button>
                      <span>•</span>
                      <button
                        onClick={() => onDeleteExpense(expense.id)}
                        className="px-2 py-1 hover:text-rose-600 hover:bg-rose-50 rounded flex items-center gap-1 transition"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span className="text-[10px]">Delete</span>
                      </button>
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
        <div className="p-4 sm:p-6 space-y-4 pb-24 md:pb-6">
          <div className="bg-[#f0f9f6] border border-[#5bc5a7]/30 rounded-xl p-3.5 text-xs text-[#28816a] flex items-center justify-between">
            <div>
              <strong className="block text-sm flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#5bc5a7]" />
                Splitwise Simplified Debts
              </strong>
              <span>
                Minimizes group transfers so everyone settles up quickly.
              </span>
            </div>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
            {settlements.length === 0 ? (
              <div className="text-center py-10 text-slate-500 text-xs">
                All friends are settled up!
              </div>
            ) : (
              settlements.map((tx, idx) => {
                const isYouPaying = tx.fromId === currentUserId;
                const isYouReceiving = tx.toId === currentUserId;

                return (
                  <div
                    key={tx.id || idx}
                    className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[11px] font-bold text-slate-600 shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm flex-wrap">
                        <strong className={isYouPaying ? 'text-[#ff652f]' : 'text-slate-800'}>
                          {tx.fromName} {isYouPaying && '(You)'}
                        </strong>
                        <span className="text-slate-400 flex items-center gap-1 text-xs">
                          owes <ArrowRight className="w-3 h-3 text-slate-400" />
                        </span>
                        <strong className={isYouReceiving ? 'text-[#5bc5a7]' : 'text-slate-800'}>
                          {tx.toName} {isYouReceiving && '(You)'}
                        </strong>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <span className="text-sm sm:text-base font-black text-slate-800">
                        {formatCurrency(tx.amount)}
                      </span>
                      {tx.toUpiId && (
                        <a
                          href={`upi://pay?pa=${tx.toUpiId}&pn=${encodeURIComponent(
                            tx.toName
                          )}&am=${tx.amount}&cu=INR&tn=GoaTripSettlement`}
                          className="px-2.5 py-1 text-xs font-bold rounded-md bg-[#5bc5a7] text-white hover:bg-[#48b396] transition flex items-center gap-1"
                        >
                          <QrCode className="w-3 h-3" />
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
        <div className="p-4 sm:p-6 space-y-4 pb-24 md:pb-6">
          <h3 className="font-bold text-slate-800 text-sm">Where your money went</h3>
          <div className="space-y-3">
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
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="flex items-center gap-1.5 text-slate-700">
                        <span>{meta.icon}</span>
                        <span>{cat}</span>
                      </span>
                      <span className="font-bold text-slate-800">
                        {formatCurrency(total)} ({pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
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
