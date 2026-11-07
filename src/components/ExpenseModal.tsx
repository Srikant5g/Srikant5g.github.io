import React, { useState, useEffect } from 'react';
import type { Expense, Member, Category, SplitMode } from '../types';
import { CATEGORY_ICONS } from '../utils/sampleData';
import { formatCurrency } from '../utils/settlement';
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
  { label: '💰 Advance Fund', title: 'Advance Trip Fund Deposit', category: 'Misc' as Category },
];

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  members,
  editingExpense,
  onDeleteExpense,
  currentUserId,
  tripName = 'Road Trip 2026',
}) => {
  const [title, setTitle] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [paidById, setPaidById] = useState(currentUserId || members[0]?.id || '');
  const [category, setCategory] = useState<Category>('Petrol & Diesel');
  const [splitMode, setSplitMode] = useState<SplitMode>('EQUAL');
  const [splitMemberIds, setSplitMemberIds] = useState<string[]>(members.map((m) => m.id));
  const [customSplits, setCustomSplits] = useState<Record<string, string>>({});
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (editingExpense) {
      setTitle(editingExpense.title);
      setAmountStr(editingExpense.amount.toString());
      setPaidById(editingExpense.paidById);
      setCategory(editingExpense.category);
      setSplitMode(editingExpense.splitMode);
      setSplitMemberIds(editingExpense.splitMemberIds);
      setDate(editingExpense.date);
      setNotes(editingExpense.notes || '');

      const initialCustom: Record<string, string> = {};
      if (editingExpense.customSplits) {
        Object.entries(editingExpense.customSplits).forEach(([k, v]) => {
          initialCustom[k] = v.toString();
        });
      }
      setCustomSplits(initialCustom);
    } else {
      setTitle('');
      setAmountStr('');
      setPaidById(currentUserId || members[0]?.id || '');
      setCategory('Petrol & Diesel');
      setSplitMode('EQUAL');
      setSplitMemberIds(members.map((m) => m.id));
      setCustomSplits({});
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
    setError(null);
  }, [isOpen, editingExpense, members, currentUserId]);

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

  const handleApplyPreset = (preset: { title: string; category: Category }) => {
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Please enter an expense title');
      return;
    }

    if (isNaN(totalAmount) || totalAmount <= 0) {
      setError('Please enter a valid amount greater than ₹0');
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
        notes: notes.trim() || undefined,
      },
      editingExpense?.id
    );

    onClose();
  };

  const equalShare =
    splitMemberIds.length > 0 ? totalAmount / splitMemberIds.length : 0;

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

            {/* 1. Large Amount Input (Fintech Inspired) */}
            <div className="bg-[#F7F8F5] border border-[#E4EAF0] rounded-2xl p-4 text-center focus-within:border-[#145B4A] focus-within:ring-2 focus-within:ring-[#145B4A]/10 transition">
              <span className="text-[11px] font-bold text-[#718096] uppercase tracking-wider block">
                Total Amount (INR)
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

              {/* Segmented Control */}
              <div className="grid grid-cols-2 p-1 bg-[#F7F8F5] border border-[#E4EAF0] rounded-xl text-xs font-bold">
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
                  onClick={() => setSplitMode('CUSTOM')}
                  className={`py-2 rounded-lg transition ${
                    splitMode === 'CUSTOM'
                      ? 'bg-white text-[#145B4A] shadow-xs'
                      : 'text-[#718096] hover:text-[#192B3D]'
                  }`}
                >
                  Exact Amount (Custom)
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
                title="Delete this expense"
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
              <span>{editingExpense ? 'Update Expense' : 'Save Expense'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
