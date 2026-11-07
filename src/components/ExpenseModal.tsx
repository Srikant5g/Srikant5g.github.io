import React, { useState, useEffect, useRef } from 'react';
import type { Expense, Member, Category, SplitMode } from '../types';
import { CATEGORY_ICONS } from '../utils/sampleData';
import { formatCurrency, isAdvanceOrTransfer } from '../utils/settlement';
import { X, Check, Sparkles, Trash2 } from 'lucide-react';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Omit<Expense, 'id' | 'createdAt'>, editId?: string) => void;
  members: Member[];
  editingExpense?: Expense | null;
  onDeleteExpense?: (id: string) => void;
  currentUserId?: string | null;
  tripName?: string;
}

const PRESETS = [
  { label: '⛽ Petrol / Diesel', title: 'Car Fuel / Diesel Fill', category: 'Petrol & Diesel' as Category },
  { label: '🛣️ Highway Tolls', title: 'Highway Fastag & Tolls', category: 'Tolls & Fastag' as Category },
  { label: '🥞 Breakfast', title: 'Highway Breakfast & Chai', category: 'Breakfast' as Category },
  { label: '🍛 Dhaba Lunch', title: 'Highway Dhaba Lunch', category: 'Lunch' as Category },
  { label: '🍽️ Shack Dinner', title: 'Beach Shack Dinner', category: 'Dinner' as Category },
  { label: '🏡 Villa / Hotel', title: 'Private Villa & Hotel Stay', category: 'Stay & Hotel' as Category },
  { label: '🍻 Drinks & Beers', title: 'Alcohol, Beers & Mixers', category: 'Alcohol & Drinks' as Category },
  { label: '🥪 Snacks & Chai', title: 'Evening Snacks & Tea', category: 'Snacks & Chai' as Category },
  { label: '💰 Advance to Friend', title: 'Advance for Hotel / Trip Fund', category: 'Misc' as Category },
];

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  members,
  editingExpense,
  onDeleteExpense,
  currentUserId,
  tripName = 'Goa',
}) => {
  const [entryType, setEntryType] = useState<'EXPENSE' | 'ADVANCE'>('EXPENSE');
  const [advanceRecipientId, setAdvanceRecipientId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [paidById, setPaidById] = useState(currentUserId || members[0]?.id || '');
  const [category, setCategory] = useState<Category>('Petrol & Diesel');
  const [splitMode, setSplitMode] = useState<SplitMode>('EQUAL');
  const [splitMemberIds, setSplitMemberIds] = useState<string[]>(members.map((m) => m.id));
  const [customSplits, setCustomSplits] = useState<Record<string, string>>({});
  const [shares, setShares] = useState<Record<string, number>>({});
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  const prevIsOpenRef = useRef(false);
  const prevEditingIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    // Only initialize when modal opens (false -> true) or editing target changes
    const justOpened = isOpen && !prevIsOpenRef.current;
    const editingTargetChanged = isOpen && editingExpense?.id !== prevEditingIdRef.current;

    prevIsOpenRef.current = isOpen;
    prevEditingIdRef.current = editingExpense?.id;

    if (!justOpened && !editingTargetChanged) {
      return;
    }

    if (editingExpense) {
      const isAdv = isAdvanceOrTransfer(editingExpense);
      setEntryType(isAdv ? 'ADVANCE' : 'EXPENSE');
      if (isAdv && editingExpense.splitMemberIds && editingExpense.splitMemberIds.length > 0) {
        setAdvanceRecipientId(editingExpense.splitMemberIds[0]);
      } else {
        const other = members.find((m) => m.id !== editingExpense.paidById);
        setAdvanceRecipientId(other ? other.id : members[0]?.id || '');
      }

      setTitle(editingExpense.title);
      setAmountStr(editingExpense.amount.toString());
      setPaidById(editingExpense.paidById);
      setCategory(editingExpense.category);
      setSplitMode(editingExpense.splitMode || 'EQUAL');
      setSplitMemberIds(editingExpense.splitMemberIds || members.map((m) => m.id));
      setDate(editingExpense.date);
      setNotes(editingExpense.notes || '');

      const initialCustom: Record<string, string> = {};
      if (editingExpense.customSplits) {
        Object.entries(editingExpense.customSplits).forEach(([k, v]) => {
          initialCustom[k] = v.toString();
        });
      }
      setCustomSplits(initialCustom);

      if (editingExpense.shares) {
        setShares(editingExpense.shares);
      } else {
        const initShares: Record<string, number> = {};
        members.forEach((m) => (initShares[m.id] = 1));
        setShares(initShares);
      }
    } else {
      setEntryType('EXPENSE');
      const other = members.find((m) => m.id !== (currentUserId || members[0]?.id));
      setAdvanceRecipientId(other ? other.id : (members[1]?.id || members[0]?.id || ''));
      setTitle('');
      setAmountStr('');
      setPaidById(currentUserId || members[0]?.id || '');
      setCategory('Petrol & Diesel');
      setSplitMode('EQUAL');
      setSplitMemberIds(members.map((m) => m.id));
      setCustomSplits({});
      const initShares: Record<string, number> = {};
      members.forEach((m) => (initShares[m.id] = 1));
      setShares(initShares);
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
    setError(null);
  }, [isOpen, editingExpense]);

  if (!isOpen) return null;

  const totalAmount = parseFloat(amountStr) || 0;

  const toggleMember = (id: string) => {
    if (splitMemberIds.includes(id)) {
      if (splitMemberIds.length === 1) {
        setError('At least one member must be selected to split the bill');
        return;
      }
      setSplitMemberIds(splitMemberIds.filter((mId) => mId !== id));
    } else {
      setSplitMemberIds([...splitMemberIds, id]);
    }
    setError(null);
  };

  const selectAllMembers = () => {
    setSplitMemberIds(members.map((m) => m.id));
    setError(null);
  };

  const handleApplyPreset = (preset: { label: string; title: string; category: Category }) => {
    if (preset.label.includes('Advance')) {
      setEntryType('ADVANCE');
      setTitle('Hotel / Trip Advance');
      setCategory('Misc');
      return;
    }
    setTitle(preset.title);
    setCategory(preset.category);
  };

  const handleCustomSplitChange = (memberId: string, val: string) => {
    setCustomSplits((prev) => ({
      ...prev,
      [memberId]: val,
    }));
    setError(null);
  };

  const handleShareChange = (memberId: string, delta: number) => {
    setShares((prev) => {
      const current = prev[memberId] ?? 1;
      const next = Math.max(1, Math.min(10, current + delta));
      return { ...prev, [memberId]: next };
    });
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isNaN(totalAmount) || totalAmount <= 0) {
      setError('Please enter a valid amount greater than ₹0');
      return;
    }

    if (entryType === 'ADVANCE') {
      if (!advanceRecipientId) {
        setError('Please select who received this advance money');
        return;
      }
      if (advanceRecipientId === paidById) {
        setError('Sender and recipient cannot be the same person');
        return;
      }

      const recipient = members.find((m) => m.id === advanceRecipientId);
      const payer = members.find((m) => m.id === paidById);
      const advTitle = title.trim() || `Advance to ${recipient?.name || 'Friend'}`;

      onSave(
        {
          title: advTitle,
          amount: totalAmount,
          date,
          paidById,
          category: 'Misc',
          splitMode: 'EQUAL',
          splitMemberIds: [advanceRecipientId],
          type: 'PAYMENT',
          notes: notes.trim() || `Advance money sent by ${payer?.name || 'Friend'} to ${recipient?.name || 'Friend'} for trip expenses`,
        },
        editingExpense?.id
      );

      onClose();
      return;
    }

    if (!title.trim()) {
      setError('Please enter an expense title');
      return;
    }

    if (splitMemberIds.length === 0) {
      setError('Please select at least one person to split with');
      return;
    }

    let parsedCustomSplits: Record<string, number> | undefined = undefined;

    if (splitMode === 'CUSTOM') {
      parsedCustomSplits = {};
      let sumCustom = 0;
      for (const mId of splitMemberIds) {
        const val = parseFloat(customSplits[mId] || '0');
        parsedCustomSplits[mId] = val;
        sumCustom += val;
      }

      if (Math.abs(sumCustom - totalAmount) > 0.05) {
        setError(
          `Custom splits sum to ${formatCurrency(sumCustom)}, but total bill is ${formatCurrency(totalAmount)}`
        );
        return;
      }

      // Absorb any sub-5 paise rounding difference to the last member
      const diff = Number((totalAmount - sumCustom).toFixed(2));
      if (diff !== 0 && splitMemberIds.length > 0) {
        const lastId = splitMemberIds[splitMemberIds.length - 1];
        parsedCustomSplits[lastId] = Number(((parsedCustomSplits[lastId] || 0) + diff).toFixed(2));
      }
    }

    onSave(
      {
        title: title.trim(),
        amount: totalAmount,
        date,
        paidById,
        category,
        splitMode,
        splitMemberIds,
        customSplits: parsedCustomSplits,
        shares: splitMode === 'SHARES' ? shares : undefined,
        type: 'EXPENSE',
        notes: notes.trim() || undefined,
      },
      editingExpense?.id
    );

    onClose();
  };

  const equalShare =
    splitMemberIds.length > 0 ? totalAmount / splitMemberIds.length : 0;

  const totalShares = splitMemberIds.reduce((sum, id) => sum + (shares[id] ?? 1), 0);

  // Compute sum of custom splits for running counter
  const customSum = splitMemberIds.reduce(
    (sum, mId) => sum + (parseFloat(customSplits[mId] || '0') || 0),
    0
  );
  const remaining = totalAmount - customSum;

  const categories: Category[] = [
    'Petrol & Diesel',
    'Tolls & Fastag',
    'Breakfast',
    'Lunch',
    'Dinner',
    'Snacks & Chai',
    'Alcohol & Drinks',
    'Stay & Hotel',
    'Activities & Beach',
    'Misc',
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-3xl sm:rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden max-h-[94vh] flex flex-col text-[#192B3D] border border-[#E4EAF0] animate-in slide-in-from-bottom sm:zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-5 py-4 bg-[#145B4A] text-white flex items-center justify-between sticky top-0 z-10 shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-black tracking-tight text-white m-0">
              {editingExpense ? 'Edit Expense' : 'Add an Expense'}
            </h2>
            <p className="text-xs text-[#78C5A7] font-medium mt-0.5">
              {tripName} • {members.length} Friends
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
          <div className="p-5 space-y-4 overflow-y-auto flex-1">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {/* Mode Selector Tabs: 🛒 Group Expense vs 💸 Advance to Friend */}
            <div className="grid grid-cols-2 p-1 bg-[#F7F8F5] rounded-2xl border border-[#E4EAF0]">
              <button
                type="button"
                onClick={() => setEntryType('EXPENSE')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  entryType === 'EXPENSE'
                    ? 'bg-[#145B4A] text-white shadow-xs'
                    : 'text-[#718096] hover:text-[#192B3D]'
                }`}
              >
                <span>🛒 Group Expense</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEntryType('ADVANCE');
                  if (!title.trim() || title === 'Car Fuel / Diesel Fill') {
                    setTitle('Hotel / Trip Advance');
                  }
                  setCategory('Misc');
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  entryType === 'ADVANCE'
                    ? 'bg-[#145B4A] text-white shadow-xs'
                    : 'text-[#718096] hover:text-[#192B3D]'
                }`}
              >
                <span>💸 Advance to Friend</span>
              </button>
            </div>

            {/* Advance Explainer Note */}
            {entryType === 'ADVANCE' && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200/80 rounded-2xl text-xs space-y-1">
                <div className="font-bold text-[#145B4A] flex items-center gap-1.5">
                  <span>💡 Advance / Money Transfer</span>
                </div>
                <p className="text-[#145B4A]/90 text-[11px] leading-relaxed">
                  Money sent to a friend (e.g. paying Raghavendra ₹10,000 so he can book the hotel) balances out what you owe and is <strong>excluded from Total Trip Spend</strong> to prevent double-counting.
                </p>
              </div>
            )}

            {/* 1. Large Amount Input (Fintech Inspired) */}
            <div className="bg-[#F7F8F5] border border-[#E4EAF0] rounded-2xl p-4 text-center focus-within:border-[#145B4A] focus-within:ring-2 focus-within:ring-[#145B4A]/10 transition">
              <span className="text-[11px] font-bold text-[#718096] uppercase tracking-wider block">
                {entryType === 'ADVANCE' ? 'Advance Amount Sent (INR)' : 'Total Amount (INR)'}
              </span>
              <div className="flex items-center justify-center gap-1 mt-1">
                <span className="text-2xl sm:text-3xl font-black text-[#145B4A]">₹</span>
                <input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="0.00"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  autoFocus={!editingExpense}
                  required
                  aria-label="Expense amount in Rupees"
                  className="w-48 text-3xl sm:text-4xl font-black text-[#192B3D] text-center bg-transparent focus:outline-none placeholder-slate-300"
                />
              </div>
            </div>

            {entryType === 'ADVANCE' ? (
              /* ADVANCE / TRANSFER FLOW */
              <div className="space-y-4">
                {/* Purpose / Description */}
                <div>
                  <label className="text-[11px] font-bold text-[#718096] uppercase tracking-wider block mb-1">
                    Advance Purpose / Note *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Hotel advance to Raghavendra, Villa deposit..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full bg-white border border-[#E4EAF0] rounded-xl px-3.5 py-2.5 text-sm text-[#192B3D] placeholder-[#718096] focus:outline-none focus:border-[#145B4A] focus:ring-1 focus:ring-[#145B4A] transition"
                  />
                </div>

                {/* Who Sent the Money */}
                <div>
                  <label className="text-[11px] font-bold text-[#718096] uppercase tracking-wider block mb-1.5">
                    Who Sent / Paid the Money?
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {members.map((m) => {
                      const isSelected = paidById === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setPaidById(m.id);
                            if (advanceRecipientId === m.id) {
                              const other = members.find((otherM) => otherM.id !== m.id);
                              if (other) setAdvanceRecipientId(other.id);
                            }
                          }}
                          className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-semibold transition text-left ${
                            isSelected
                              ? 'border-[#145B4A] bg-[#145B4A]/5 text-[#145B4A] ring-1 ring-[#145B4A]'
                              : 'border-[#E4EAF0] bg-white text-[#718096] hover:bg-slate-50'
                          }`}
                        >
                          <div
                            className={`w-6 h-6 rounded-full ${m.avatarColor} text-white font-bold text-[10px] flex items-center justify-center shrink-0`}
                          >
                            {m.name.charAt(0)}
                          </div>
                          <span className="truncate">{m.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Who Received the Money */}
                <div>
                  <label className="text-[11px] font-bold text-[#718096] uppercase tracking-wider block mb-1.5">
                    Who Received the Money? (Booking Person)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {members
                      .filter((m) => m.id !== paidById)
                      .map((m) => {
                        const isSelected = advanceRecipientId === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setAdvanceRecipientId(m.id)}
                            className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-semibold transition text-left ${
                              isSelected
                                ? 'border-[#145B4A] bg-[#78C5A7]/20 text-[#145B4A] ring-1 ring-[#145B4A] font-bold'
                                : 'border-[#E4EAF0] bg-white text-[#718096] hover:bg-slate-50'
                            }`}
                          >
                            <div
                              className={`w-6 h-6 rounded-full ${m.avatarColor} text-white font-bold text-[10px] flex items-center justify-center shrink-0`}
                            >
                              {m.name.charAt(0)}
                            </div>
                            <span className="truncate">{m.name}</span>
                          </button>
                        );
                      })}
                  </div>
                </div>

                {/* Date Picker */}
                <div>
                  <label className="text-[11px] font-bold text-[#718096] uppercase tracking-wider block mb-1">
                    Date of Transfer
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white border border-[#E4EAF0] rounded-xl px-3.5 py-2 text-xs font-semibold text-[#192B3D] focus:outline-none focus:border-[#145B4A]"
                  />
                </div>
              </div>
            ) : (
              <>
                {/* 2. Quick Presets (Horizontal Chips) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-[#718096] uppercase tracking-wider">
                      Quick Road Trip Shortcuts
                    </span>
                <span className="text-[10px] text-[#718096] flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#78C5A7]" /> 1-tap fill
                </span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handleApplyPreset(p)}
                    className="whitespace-nowrap px-3 py-1.5 rounded-xl bg-[#F7F8F5] hover:bg-[#E4EAF0] border border-[#E4EAF0] text-xs font-semibold text-[#192B3D] transition active:scale-95 shrink-0"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Description & Category */}
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-[#718096] uppercase tracking-wider block mb-1">
                  Expense Description *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. Car Diesel Full Tank, Highway Lunch..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full bg-white border border-[#E4EAF0] rounded-xl px-3.5 py-2.5 text-sm text-[#192B3D] placeholder-[#718096] focus:outline-none focus:border-[#145B4A] focus:ring-1 focus:ring-[#145B4A] transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Category Picker */}
                <div>
                  <label className="text-[11px] font-bold text-[#718096] uppercase tracking-wider block mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    className="w-full bg-white border border-[#E4EAF0] rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[#192B3D] focus:outline-none focus:border-[#145B4A]"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {CATEGORY_ICONS[cat]?.icon} {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Picker */}
                <div>
                  <label className="text-[11px] font-bold text-[#718096] uppercase tracking-wider block mb-1">
                    Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-white border border-[#E4EAF0] rounded-xl px-3.5 py-2 text-xs font-semibold text-[#192B3D] focus:outline-none focus:border-[#145B4A]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Payer Selection (Avatar Picker) */}
            <div>
              <label className="text-[11px] font-bold text-[#718096] uppercase tracking-wider block mb-1.5">
                Paid By Who?
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {members.map((m) => {
                  const isSelected = paidById === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaidById(m.id)}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-xs font-semibold transition text-left ${
                        isSelected
                          ? 'border-[#145B4A] bg-[#145B4A]/5 text-[#145B4A] ring-1 ring-[#145B4A]'
                          : 'border-[#E4EAF0] bg-white text-[#718096] hover:bg-slate-50'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full ${m.avatarColor} text-white font-bold text-[10px] flex items-center justify-center shrink-0`}
                      >
                        {m.name.charAt(0)}
                      </div>
                      <span className="truncate">{m.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Split Mode: Segmented Buttons */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-[#718096] uppercase tracking-wider">
                  Split Mode
                </label>
                {splitMode === 'EQUAL' && splitMemberIds.length > 0 && (
                  <span className="text-[11px] font-bold text-[#145B4A]">
                    {formatCurrency(equalShare)} / person ({splitMemberIds.length} friends)
                  </span>
                )}
                {splitMode === 'SHARES' && splitMemberIds.length > 0 && (
                  <span className="text-[11px] font-bold text-[#145B4A]">
                    Total: {totalShares} shares ({formatCurrency(totalShares > 0 ? totalAmount / totalShares : 0)}/share)
                  </span>
                )}
                {splitMode === 'CUSTOM' && (
                  <span
                    className={`text-[11px] font-bold ${
                      Math.abs(remaining) < 0.5 ? 'text-[#145B4A]' : 'text-[#FF784F]'
                    }`}
                  >
                    Assigned: {formatCurrency(customSum)} / {formatCurrency(totalAmount)}
                  </span>
                )}
              </div>

              {/* Segmented Control (3 Options) */}
              <div className="grid grid-cols-3 p-1 bg-[#F7F8F5] border border-[#E4EAF0] rounded-xl text-xs font-bold gap-1">
                <button
                  type="button"
                  onClick={() => setSplitMode('EQUAL')}
                  className={`py-2 rounded-lg transition ${
                    splitMode === 'EQUAL'
                      ? 'bg-white text-[#145B4A] shadow-xs'
                      : 'text-[#718096] hover:text-[#192B3D]'
                  }`}
                >
                  = Equally
                </button>
                <button
                  type="button"
                  onClick={() => setSplitMode('SHARES')}
                  className={`py-2 rounded-lg transition ${
                    splitMode === 'SHARES'
                      ? 'bg-white text-[#145B4A] shadow-xs'
                      : 'text-[#718096] hover:text-[#192B3D]'
                  }`}
                >
                  By Shares
                </button>
                <button
                  type="button"
                  onClick={() => setSplitMode('CUSTOM')}
                  className={`py-2 rounded-lg transition ${
                    splitMode === 'CUSTOM'
                      ? 'bg-white text-[#145B4A] shadow-xs'
                      : 'text-[#718096] hover:text-[#192B3D]'
                  }`}
                >
                  Exact (₹)
                </button>
              </div>
            </div>

            {/* 6. Participant Selection */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-[#718096] uppercase tracking-wider">
                  Select Friends Involved ({splitMemberIds.length} / {members.length})
                </span>
                <button
                  type="button"
                  onClick={selectAllMembers}
                  className="text-xs font-bold text-[#145B4A] hover:underline"
                >
                  Select All
                </button>
              </div>

              <div className="divide-y divide-[#E4EAF0] border border-[#E4EAF0] rounded-2xl bg-white overflow-hidden max-h-56 overflow-y-auto">
                {members.map((m) => {
                  const isChecked = splitMemberIds.includes(m.id);
                  const customVal = customSplits[m.id] || '';
                  const memberShareCount = shares[m.id] ?? 1;
                  const memberShareAmt =
                    totalShares > 0 ? (totalAmount * memberShareCount) / totalShares : 0;

                  return (
                    <div
                      key={m.id}
                      onClick={() => toggleMember(m.id)}
                      className={`p-3 flex items-center justify-between gap-2.5 transition cursor-pointer ${
                        isChecked ? 'bg-white' : 'bg-slate-50/50 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleMember(m.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-4 h-4 rounded text-[#145B4A] focus:ring-[#145B4A] accent-[#145B4A]"
                        />
                        <div
                          className={`w-6 h-6 rounded-full ${m.avatarColor} text-white font-bold text-[10px] flex items-center justify-center shrink-0`}
                        >
                          {m.name.charAt(0)}
                        </div>
                        <span className="text-xs font-semibold text-[#192B3D] truncate">
                          {m.name}
                        </span>
                      </div>

                      {splitMode === 'EQUAL' && isChecked && (
                        <span className="text-xs font-bold text-[#145B4A] shrink-0">
                          {formatCurrency(equalShare)}
                        </span>
                      )}

                      {splitMode === 'SHARES' && isChecked && (
                        <div
                          className="flex items-center gap-2 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="text-xs font-bold text-[#145B4A]">
                            {formatCurrency(memberShareAmt)}
                          </span>
                          <div className="flex items-center border border-[#E4EAF0] rounded-lg bg-[#F7F8F5] overflow-hidden">
                            <button
                              type="button"
                              onClick={() => handleShareChange(m.id, -1)}
                              className="px-2 py-0.5 text-xs font-bold text-[#718096] hover:bg-[#E4EAF0] transition"
                            >
                              -
                            </button>
                            <span className="px-1.5 py-0.5 text-xs font-black text-[#192B3D] min-w-[22px] text-center">
                              {memberShareCount}x
                            </span>
                            <button
                              type="button"
                              onClick={() => handleShareChange(m.id, 1)}
                              className="px-2 py-0.5 text-xs font-bold text-[#718096] hover:bg-[#E4EAF0] transition"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )}

                      {splitMode === 'CUSTOM' && (
                        <div
                          className="flex items-center gap-1 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="text-xs text-[#718096]">₹</span>
                          <input
                            type="number"
                            step="any"
                            min="0"
                            placeholder="0"
                            value={customVal}
                            onChange={(e) => handleCustomSplitChange(m.id, e.target.value)}
                            disabled={!isChecked}
                            className="w-20 bg-[#F7F8F5] border border-[#E4EAF0] rounded-lg px-2 py-1 text-xs font-bold text-[#192B3D] text-right focus:outline-none focus:border-[#145B4A]"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

            {/* 7. Optional Notes */}
            <div>
              <label className="text-[11px] font-bold text-[#718096] uppercase tracking-wider block mb-1">
                Notes / Reference (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Paid via GPay, Split between 5 drinkers, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-white border border-[#E4EAF0] rounded-xl px-3.5 py-2 text-xs text-[#192B3D] placeholder-[#718096] focus:outline-none focus:border-[#145B4A]"
              />
            </div>
          </div>

          {/* Sticky Bottom Actions Bar */}
          <div className="p-4 bg-[#F7F8F5] border-t border-[#E4EAF0] flex items-center justify-between gap-3 shrink-0 pb-safe">
            {editingExpense && onDeleteExpense ? (
              <button
                type="button"
                onClick={() => {
                  onDeleteExpense(editingExpense.id);
                  onClose();
                }}
                className="px-3.5 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs flex items-center gap-1.5 transition active:scale-95"
                title="Delete this entry"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-[#E4EAF0] text-[#718096] hover:bg-slate-100 font-bold text-xs transition"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              className="flex-1 py-3 px-5 rounded-xl bg-[#145B4A] hover:bg-[#0f4639] text-white font-bold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 active:scale-95 transition"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>
                {editingExpense
                  ? entryType === 'ADVANCE'
                    ? 'Update Advance Transfer'
                    : 'Update Expense'
                  : entryType === 'ADVANCE'
                  ? 'Save Advance Transfer'
                  : 'Save Expense'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
