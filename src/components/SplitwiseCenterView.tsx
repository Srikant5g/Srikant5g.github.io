import React, { useState } from 'react';
import type { Expense, Member, DebtTransaction, Category } from '../types';
import { formatCurrency } from '../utils/settlement';
import { CATEGORY_ICONS } from '../utils/sampleData';
import { Plus, Check, ArrowRight, Trash2, Edit3, QrCode, Search } from 'lucide-react';

interface SplitwiseCenterViewProps {
  expenses: Expense[];
  members: Member[];
  currentUserId: string;
  selectedFriendId: string | null;
  settlements: DebtTransaction[];
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
  onOpenAddExpense,
  onOpenSettleUp,
  onEditExpense,
  onDeleteExpense,
}) => {
  const [activeTab, setActiveTab] = useState<'expenses' | 'debts' | 'breakdown'>('expenses');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const memberMap = new Map<string, Member>();
  members.forEach((m) => memberMap.set(m.id, m));

  const currentUser = memberMap.get(currentUserId);
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
      // You paid. Others owe you (total - your share)
      if (isSplitter) {
        youAreOwedTotal += e.amount - share;
      } else {
        // You paid for others entirely
        youAreOwedTotal += e.amount;
      }
    } else if (isSplitter) {
      // Someone else paid, you owe your share
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
    'Activities & Beach',
  ];

  return (
    <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* Top Header Bar */}
      <div className="bg-[#f8f9fa] border-b border-slate-200 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#333333] m-0 flex items-center gap-2">
            <span>
              {selectedFriend
                ? `${selectedFriend.name} & You`
                : 'Dashboard'}
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Goa Road Trip • {expenses.length} bills recorded
          </p>
        </div>

        {/* Action Buttons: Add an expense & Settle up */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddExpense}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#ff652f] hover:bg-[#e55320] text-white font-bold text-xs sm:text-sm shadow-sm transition active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add an expense</span>
          </button>

          <button
            onClick={onOpenSettleUp}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-[#5bc5a7] hover:bg-[#48b396] text-white font-bold text-xs sm:text-sm shadow-sm transition active:scale-95"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Settle up</span>
          </button>
        </div>
      </div>

      {/* The Classic Splitwise 3-Box Balance Banner */}
      <div className="grid grid-cols-3 border-b border-slate-200 text-center py-4 bg-[#fbfbfb]">
        {/* Total Balance */}
        <div className="border-r border-slate-200 px-2 sm:px-4">
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            total balance
          </span>
          <span
            className={`text-base sm:text-xl font-black mt-0.5 block ${
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
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            you owe
          </span>
          <span className="text-base sm:text-xl font-black text-[#ff652f] mt-0.5 block">
            {formatCurrency(youOweTotal)}
          </span>
        </div>

        {/* You Are Owed */}
        <div className="px-2 sm:px-4">
          <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 block">
            you are owed
          </span>
          <span className="text-base sm:text-xl font-black text-[#5bc5a7] mt-0.5 block">
            {formatCurrency(youAreOwedTotal)}
          </span>
        </div>
      </div>

      {/* Sub-Tabs: Expenses vs Debts vs Breakdown */}
      <div className="border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between bg-white text-xs font-bold text-slate-500">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('expenses')}
            className={`py-3 border-b-2 transition ${
              activeTab === 'expenses'
                ? 'border-[#5bc5a7] text-[#5bc5a7]'
                : 'border-transparent hover:text-slate-700'
            }`}
          >
            All Expenses ({filtered.length})
          </button>

          <button
            onClick={() => setActiveTab('debts')}
            className={`py-3 border-b-2 transition ${
              activeTab === 'debts'
                ? 'border-[#5bc5a7] text-[#5bc5a7]'
                : 'border-transparent hover:text-slate-700'
            }`}
          >
            Who Owes Who ({settlements.length})
          </button>

          <button
            onClick={() => setActiveTab('breakdown')}
            className={`py-3 border-b-2 transition ${
              activeTab === 'breakdown'
                ? 'border-[#5bc5a7] text-[#5bc5a7]'
                : 'border-transparent hover:text-slate-700'
            }`}
          >
            Category Spend
          </button>
        </div>

        {currentUser && (
          <span className="hidden sm:inline text-[11px] text-slate-400 font-normal">
            Perspective: <strong className="text-slate-600">{currentUser.name}</strong>
          </span>
        )}
      </div>

      {/* TAB 1: Expenses Feed */}
      {activeTab === 'expenses' && (
        <div>
          {/* Filters Bar */}
          <div className="p-3 bg-[#fafafa] border-b border-slate-100 flex flex-col sm:flex-row items-center gap-2">
            <div className="relative flex-1 w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search bills by title or payer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-md pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#5bc5a7]"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto scrollbar-none pb-0.5">
              {categories.slice(0, 5).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`whitespace-nowrap px-2.5 py-1 rounded text-[11px] font-semibold transition ${
                    categoryFilter === cat
                      ? 'bg-[#5bc5a7] text-white'
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

                // What does currentUser lend or borrow for this specific bill?
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
                    className="p-3 sm:px-6 hover:bg-[#fcfcfc] transition flex items-center justify-between gap-3 group"
                  >
                    {/* Left: Date + Icon + Title */}
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Splitwise Calendar Badge */}
                      <div className="w-10 text-center shrink-0 border border-slate-200 rounded-md bg-white overflow-hidden shadow-2xs">
                        <div className="bg-slate-100 text-[9px] font-bold text-slate-500 py-0.5 border-b border-slate-200">
                          {month}
                        </div>
                        <div className="text-xs font-black text-slate-800 py-0.5">
                          {day}
                        </div>
                      </div>

                      {/* Category Icon */}
                      <div className="text-xl shrink-0">
                        {catMeta.icon}
                      </div>

                      {/* Title & Who Paid */}
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-800 text-sm truncate">
                          {expense.title}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 flex-wrap">
                          <span>
                            {isPayer ? 'You' : payer?.name} paid {formatCurrency(expense.amount)}
                          </span>
                          <span>•</span>
                          <span>Split with {splitCount} friends</span>
                        </div>
                        {expense.notes && (
                          <div className="text-[11px] text-slate-400 italic mt-0.5">
                            "{expense.notes}"
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Personal share & Actions */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          {statusLabel}
                        </span>
                        <span
                          className={`text-sm sm:text-base font-extrabold ${
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

                      {/* Edit & Delete Buttons */}
                      <div className="flex items-center gap-1 opacity-40 group-hover:opacity-100 transition">
                        <button
                          onClick={() => onEditExpense(expense)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md"
                          title="Edit"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteExpense(expense.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-md"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* TAB 2: Simplified Debts (Splitwise settlement) */}
      {activeTab === 'debts' && (
        <div className="p-4 sm:p-6 space-y-4">
          <div className="bg-[#f0f9f6] border border-[#5bc5a7]/30 rounded-xl p-3.5 text-xs text-[#28816a] flex items-center justify-between">
            <div>
              <strong className="block text-sm">✨ Splitwise Debt Simplification</strong>
              <span>
                Calculated {settlements.length} transfers to settle all 7 road trip friends.
              </span>
            </div>
          </div>

          <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden bg-white">
            {settlements.map((tx, idx) => {
              const isYouPaying = tx.fromId === currentUserId;
              const isYouReceiving = tx.toId === currentUserId;

              return (
                <div
                  key={tx.id || idx}
                  className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                      {idx + 1}
                    </div>
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <strong className={isYouPaying ? 'text-[#ff652f]' : 'text-slate-800'}>
                        {tx.fromName} {isYouPaying && '(You)'}
                      </strong>
                      <span className="text-slate-400 flex items-center gap-1">
                        owes <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                      </span>
                      <strong className={isYouReceiving ? 'text-[#5bc5a7]' : 'text-slate-800'}>
                        {tx.toName} {isYouReceiving && '(You)'}
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm sm:text-base font-black text-slate-800">
                      {formatCurrency(tx.amount)}
                    </span>
                    {tx.toUpiId && (
                      <a
                        href={`upi://pay?pa=${tx.toUpiId}&pn=${encodeURIComponent(
                          tx.toName
                        )}&am=${tx.amount}&cu=INR&tn=GoaTripSettlement`}
                        className="px-2.5 py-1 text-xs font-bold rounded-md bg-[#5bc5a7] text-white hover:bg-[#48b396] transition flex items-center gap-1"
                        title={`Pay ${tx.toName} via UPI`}
                      >
                        <QrCode className="w-3 h-3" />
                        <span>Pay UPI</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: Category Spend Breakdown */}
      {activeTab === 'breakdown' && (
        <div className="p-4 sm:p-6 space-y-4">
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

