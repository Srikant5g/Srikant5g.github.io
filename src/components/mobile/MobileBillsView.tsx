import React, { useState, useMemo } from 'react';
import type { Expense, Member, Category, Group } from '../../types';
import {
  formatCurrency,
  formatExpenseDate,
  formatGroupDate,
  calculateTotalTripSpend,
  getActualExpenses,
  isAdvanceOrTransfer,
  getUserExpenseShare,
} from '../../utils/settlement';
import { CATEGORY_ICONS } from '../../utils/sampleData';
import { Search, Plus, Edit3, Trash2, X, ArrowUpRight, ArrowDownLeft, Calendar, ChevronDown, Tag } from 'lucide-react';

interface MobileBillsViewProps {
  expenses: Expense[];
  members: Member[];
  currentUserId: string | null;
  selectedFriendId: string | null;
  onClearFriendFilter: () => void;
  onOpenAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onLoadSample?: () => void;
  tripName?: string;
  groups?: Group[];
  activeGroupId?: string;
  onSelectGroup?: (id: string) => void;
  onOpenAddGroup?: () => void;
  onDeleteGroup?: (groupId: string) => void;
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
  tripName = 'Goa',
  groups,
  activeGroupId,
  onSelectGroup,
  onOpenAddGroup,
  onDeleteGroup,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isGroupMenuOpen, setIsGroupMenuOpen] = useState(false);

  const memberMap = new Map<string, Member>();
  members.forEach((m) => memberMap.set(m.id, m));

  const currentUser = currentUserId ? memberMap.get(currentUserId) : null;
  const selectedFriend = selectedFriendId ? memberMap.get(selectedFriendId) : null;

  // Calculate personal metrics (excluding pure settlements from personal lent/borrowed)
  let youOweTotal = 0;
  let youAreOwedTotal = 0;
  const actualBills = getActualExpenses(expenses);
  const totalSpend = calculateTotalTripSpend(expenses);

  if (selectedFriendId && currentUserId) {
    // Bilateral balance with the selected friend
    expenses.forEach((e) => {
      const isAdvance = isAdvanceOrTransfer(e);
      // Case 1: You paid, friend was involved
      if (e.paidById === currentUserId && e.splitMemberIds.includes(selectedFriendId)) {
        const friendShare = isAdvance && e.splitMemberIds.length === 1 ? e.amount : getUserExpenseShare(e, selectedFriendId);
        youAreOwedTotal += friendShare;
      }
      // Case 2: Friend paid, you were involved
      if (e.paidById === selectedFriendId && e.splitMemberIds.includes(currentUserId)) {
        const myShare = isAdvance && e.splitMemberIds.length === 1 ? e.amount : getUserExpenseShare(e, currentUserId);
        youOweTotal += myShare;
      }
    });
  } else {
    // Overall balance across entire trip
    expenses.forEach((e) => {
      const isPayer = Boolean(currentUserId && e.paidById === currentUserId);
      const isSplitter = Boolean(currentUserId && e.splitMemberIds.includes(currentUserId));
      const userShare = currentUserId ? getUserExpenseShare(e, currentUserId) : 0;
      const isAdvance = isAdvanceOrTransfer(e);

      if (isAdvance) {
        if (isPayer) {
          youAreOwedTotal += e.amount;
        } else if (isSplitter) {
          youOweTotal += e.amount;
        }
      } else {
        if (isPayer) {
          youAreOwedTotal += e.amount - userShare;
        } else if (isSplitter) {
          youOweTotal += userShare;
        }
      }
    });
  }

  const netBalance = Number((youAreOwedTotal - youOweTotal).toFixed(2));

  // Filter bills
  const filtered = expenses.filter((e) => {
    if (selectedFriendId) {
      if (currentUserId) {
        const isBilateral =
          (e.paidById === currentUserId && e.splitMemberIds.includes(selectedFriendId)) ||
          (e.paidById === selectedFriendId && e.splitMemberIds.includes(currentUserId));
        if (!isBilateral) return false;
      } else {
        const match = e.paidById === selectedFriendId || e.splitMemberIds.includes(selectedFriendId);
        if (!match) return false;
      }
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

  // Group filtered bills by date (YYYY-MM-DD) sorted descending
  const groupedByDate = useMemo(() => {
    const groups: { date: string; displayDate: string; dayTotal: number; items: Expense[] }[] = [];
    const map = new Map<string, Expense[]>();

    filtered.forEach((e) => {
      const list = map.get(e.date) || [];
      list.push(e);
      map.set(e.date, list);
    });

    const sortedDates = Array.from(map.keys()).sort((a, b) => b.localeCompare(a));

    sortedDates.forEach((d) => {
      const items = map.get(d) || [];
      const dayTotal = items
        .filter((e) => !isAdvanceOrTransfer(e))
        .reduce((sum, e) => sum + e.amount, 0);

      groups.push({
        date: d,
        displayDate: formatGroupDate(d),
        dayTotal,
        items,
      });
    });

    return groups;
  }, [filtered]);

  return (
    <div className="space-y-4 pb-32">
      {/* 1. TripTally Mobile Hero Balance Card (Airbnb / Wise Clean White Fintech Style) */}
      <div className="bg-white rounded-3xl p-5 text-[#192B3D] shadow-xs border border-[#E4EAF0] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#145B4A] text-[#78C5A7] text-xs font-black flex items-center justify-center shadow-2xs">
              {currentUser ? currentUser.name.charAt(0) : '?'}
            </div>
            <span className="text-xs font-bold text-[#192B3D]">
              {currentUser ? `${currentUser.name}’s Balance` : 'Select Profile'}
            </span>
          </div>

          {groups && groups.length > 0 ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsGroupMenuOpen(!isGroupMenuOpen)}
                className="text-[10px] font-bold uppercase tracking-wider bg-[#F7F8F5] active:bg-[#E4EAF0] px-2.5 py-1 rounded-full text-[#145B4A] border border-[#E4EAF0] flex items-center gap-1 transition"
                title="Switch trip or create a new group"
              >
                <Tag className="w-2.5 h-2.5 text-[#78C5A7]" />
                <span className="truncate max-w-[100px]">{tripName}</span>
                <ChevronDown className="w-3 h-3 text-[#145B4A]" />
              </button>
              {isGroupMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsGroupMenuOpen(false)} />
                  <div className="absolute right-0 mt-1 w-56 bg-white rounded-2xl shadow-2xl border border-[#E4EAF0] p-2 z-50 text-[#192B3D] animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-2 py-1 text-[10px] font-bold text-[#718096] uppercase tracking-wider">
                      Trip / Group
                    </div>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {groups.map((g) => (
                        <div
                          key={g.id}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-left transition ${
                            g.id === activeGroupId
                              ? 'bg-[#145B4A] text-white'
                              : 'hover:bg-[#F7F8F5] text-[#192B3D]'
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              onSelectGroup?.(g.id);
                              setIsGroupMenuOpen(false);
                            }}
                            className="flex-1 text-left flex items-center gap-2 truncate"
                          >
                            <span className="truncate">{g.name}</span>
                            {g.id === activeGroupId && <span className="w-2 h-2 rounded-full bg-[#78C5A7] shrink-0" />}
                          </button>

                          {onDeleteGroup && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setIsGroupMenuOpen(false);
                                onDeleteGroup(g.id);
                              }}
                              className={`p-1 rounded-md transition ${
                                g.id === activeGroupId
                                  ? 'text-white/80 hover:text-rose-200 hover:bg-white/10'
                                  : 'text-[#718096] hover:text-rose-600 hover:bg-rose-50'
                              }`}
                              title={`Delete group "${g.name}" (Requires PIN)`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                    {onOpenAddGroup && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsGroupMenuOpen(false);
                          onOpenAddGroup();
                        }}
                        className="w-full mt-1.5 pt-1.5 border-t border-[#E4EAF0] flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-black text-[#145B4A] bg-[#78C5A7]/20 hover:bg-[#78C5A7]/30 transition"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ New Group</span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            <span className="text-[10px] font-bold uppercase tracking-wider bg-[#F7F8F5] px-2.5 py-0.5 rounded-full text-[#718096] border border-[#E4EAF0]">
              {tripName}
            </span>
          )}
        </div>

        {/* Large Net Balance Number */}
        <div>
          <span className="text-[11px] font-bold text-[#718096] uppercase tracking-wider block">
            Net Balance
          </span>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span
              className={`text-3xl sm:text-4xl font-black tracking-tight ${
                netBalance > 0.01
                  ? 'text-[#145B4A]'
                  : netBalance < -0.01
                  ? 'text-[#FF784F]'
                  : 'text-[#192B3D]'
              }`}
            >
              {netBalance > 0.01 && '+'}
              {formatCurrency(netBalance)}
            </span>
            <span
              className={`text-xs font-bold ${
                netBalance > 0.01
                  ? 'text-[#145B4A]'
                  : netBalance < -0.01
                  ? 'text-[#FF784F]'
                  : 'text-[#718096]'
              }`}
            >
              {netBalance > 0.01
                ? 'you are owed'
                : netBalance < -0.01
                ? 'you owe'
                : 'all settled up'}
            </span>
          </div>
        </div>

        {/* Breakdown Row: Total Lent & Total Borrowed Badges */}
        <div className="pt-3.5 border-t border-[#E4EAF0] grid grid-cols-2 gap-2.5 text-xs">
          <div className="bg-[#78C5A7]/10 border border-[#78C5A7]/30 rounded-2xl p-2.5 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-[#145B4A] text-white flex items-center justify-center shrink-0">
              <ArrowDownLeft className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-[#718096] font-semibold block truncate">Total Lent</span>
              <strong className="font-black text-[#145B4A] text-xs sm:text-sm block truncate">
                {formatCurrency(youAreOwedTotal)}
              </strong>
            </div>
          </div>

          <div className="bg-[#FF784F]/10 border border-[#FF784F]/30 rounded-2xl p-2.5 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-[#FF784F] text-white flex items-center justify-center shrink-0">
              <ArrowUpRight className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-[#718096] font-semibold block truncate">Total Borrowed</span>
              <strong className="font-black text-[#FF784F] text-xs sm:text-sm block truncate">
                {formatCurrency(youOweTotal)}
              </strong>
            </div>
          </div>
        </div>

        {/* Quick Footer: Trip Total Spend & Prominent Add Action */}
        <div className="pt-3 border-t border-[#E4EAF0] flex items-center justify-between text-xs">
          <span className="text-[#718096] text-[11px]">
            Trip Spend: <strong className="text-[#192B3D] font-bold">{formatCurrency(totalSpend)}</strong> ({actualBills.length} bills)
          </span>

          <button
            onClick={onOpenAddExpense}
            className="px-3.5 py-1.5 rounded-xl bg-[#145B4A] hover:bg-[#0f4639] text-white font-bold text-xs flex items-center gap-1.5 shadow-xs active:scale-95 transition"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3] text-white" />
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
              : 'Start logging your trip fuel, meals, hotel, tolls, and activities!'}
          </p>
          <div className="pt-2 max-w-xs mx-auto">
            <button
              onClick={onOpenAddExpense}
              className="w-full py-2.5 rounded-xl bg-[#145B4A] hover:bg-[#0f4639] text-white font-bold text-xs shadow-xs active:scale-95 transition"
            >
              + Add First Expense
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {groupedByDate.map((group) => (
            <div key={group.date} className="space-y-2">
              {/* Sticky Day Header */}
              <div className="sticky top-14 z-20 bg-[#F7F8F5]/95 backdrop-blur-xs py-1.5 px-2.5 flex items-center justify-between text-xs border-b border-[#E4EAF0] rounded-xl shadow-2xs">
                <div className="flex items-center gap-1.5 font-bold text-[#192B3D]">
                  <Calendar className="w-3.5 h-3.5 text-[#145B4A]" />
                  <span>{group.displayDate}</span>
                </div>
                {group.dayTotal > 0 && (
                  <span className="text-[11px] font-semibold text-[#718096]">
                    Day Total: <strong className="text-[#192B3D]">{formatCurrency(group.dayTotal)}</strong>
                  </span>
                )}
              </div>

              {/* Day's Expenses List */}
              <div className="space-y-2.5">
                {group.items.map((expense) => {
                  const isPayment = expense.type === 'PAYMENT';
                  const isAdvance = isAdvanceOrTransfer(expense);

                  // If this is a settlement or advance money transfer
                  if (isPayment || isAdvance) {
                    const fromMember = memberMap.get(expense.paidById);
                    const toMember = expense.splitMemberIds?.[0] ? memberMap.get(expense.splitMemberIds[0]) : undefined;
                    const isYouPaying = Boolean(currentUserId && expense.paidById === currentUserId);
                    const isYouReceiving = Boolean(currentUserId && expense.splitMemberIds?.[0] === currentUserId);

                    return (
                      <div
                        key={expense.id}
                        onClick={() => onEditExpense(expense)}
                        className="bg-white border border-[#78C5A7]/40 rounded-2xl p-3.5 shadow-2xs space-y-2 bg-gradient-to-r from-[#78C5A7]/10 to-white hover:border-[#145B4A] cursor-pointer transition"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-[#78C5A7]/25 text-[#145B4A] flex items-center justify-center font-bold text-sm shrink-0">
                              💸
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-xs text-[#192B3D] block truncate">
                                {expense.title}
                              </span>
                              <span className="text-[11px] text-[#718096] block truncate">
                                {isYouPaying ? 'You' : fromMember?.name} ➡️ {isYouReceiving ? 'You' : toMember?.name || 'Friend'}
                              </span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs font-black text-[#145B4A] block">
                              {formatCurrency(expense.amount)}
                            </span>
                            <div className="flex items-center justify-end gap-1 mt-0.5">
                              <span className="text-[9px] font-bold uppercase tracking-wider text-[#145B4A] bg-[#78C5A7]/25 px-1.5 py-0.5 rounded-full">
                                {isPayment && !isAdvance ? 'Settlement' : 'Advance'}
                              </span>
                            </div>
                            <span className="text-[9px] text-[#718096] italic block">(not in trip spend)</span>
                          </div>
                        </div>

                        {expense.notes && (
                          <p className="text-[10px] text-[#718096] italic bg-white/80 px-2.5 py-1 rounded-lg border border-[#E4EAF0]">
                            "{expense.notes}"
                          </p>
                        )}
                      </div>
                    );
                  }

                  // Normal consumption expense
                  const payer = memberMap.get(expense.paidById);
                  const isPayer = Boolean(currentUserId && expense.paidById === currentUserId);
                  const isSplitter = Boolean(currentUserId && expense.splitMemberIds.includes(currentUserId));
                  const splitCount = expense.splitMemberIds.length;
                  const userShare = currentUserId ? getUserExpenseShare(expense, currentUserId) : 0;

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
                              {expense.splitMode === 'SHARES' && (
                                <span className="ml-1 text-[10px] text-[#145B4A] font-semibold bg-[#78C5A7]/20 px-1.5 py-0.2 rounded">
                                  by shares
                                </span>
                              )}
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
