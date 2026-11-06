import React, { useState, useEffect } from 'react';
import type { Expense, Member, Category, SplitMode } from '../types';
import { CATEGORY_ICONS } from '../utils/sampleData';
import { formatCurrency } from '../utils/settlement';
import { X, Check, Users, Sparkles } from 'lucide-react';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expense: Omit<Expense, 'id' | 'createdAt'>, editId?: string) => void;
  members: Member[];
  editingExpense?: Expense | null;
}

const PRESETS = [
  { title: '⛽ Petrol / Diesel Fill', category: 'Petrol & Diesel' as Category },
  { title: '🛣️ Highway Tolls / Fastag', category: 'Tolls & Fastag' as Category },
  { title: '🥞 Highway Breakfast', category: 'Breakfast' as Category },
  { title: '🍛 Highway / Dhabha Lunch', category: 'Lunch' as Category },
  { title: '🍽️ Beach Shack Dinner', category: 'Dinner' as Category },
  { title: '🥪 Evening Snacks & Chai', category: 'Snacks & Chai' as Category },
  { title: '🍻 Alcohol & Beers', category: 'Alcohol & Drinks' as Category },
  { title: '🏡 Villa / Hotel Stay', category: 'Stay & Hotel' as Category },
  { title: '🏖️ Beach Activities', category: 'Activities & Beach' as Category },
];

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  members,
  editingExpense,
}) => {
  const [title, setTitle] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [paidById, setPaidById] = useState(members[0]?.id || '');
  const [category, setCategory] = useState<Category>('Petrol & Diesel');
  const [splitMode, setSplitMode] = useState<SplitMode>('EQUAL');
  const [splitMemberIds, setSplitMemberIds] = useState<string[]>(
    members.map((m) => m.id)
  );
  const [customSplits, setCustomSplits] = useState<Record<string, string>>({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
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
      setPaidById(members[0]?.id || '');
      setCategory('Petrol & Diesel');
      setSplitMode('EQUAL');
      setSplitMemberIds(members.map((m) => m.id));
      setCustomSplits({});
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
    setError(null);
  }, [isOpen, editingExpense, members]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Please enter an expense title');
      return;
    }

    if (isNaN(totalAmount) || totalAmount <= 0) {
      setError('Please enter a valid amount greater than 0');
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

      if (Math.abs(sumCustom - totalAmount) > 0.5) {
        setError(
          `Custom splits sum to ${formatCurrency(sumCustom)}, but total bill is ${formatCurrency(totalAmount)}`
        );
        return;
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-800">
        {/* Splitwise Modal Header */}
        <div className="px-6 py-4 bg-[#5bc5a7] text-white flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-black text-white m-0">
              {editingExpense ? 'Edit Expense' : 'Add an Expense'}
            </h2>
            <p className="text-xs text-white/90 mt-0.5">
              🚗 Goa Road Trip • 7 Friends
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white hover:bg-white/20 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              ⚠️ {error}
            </div>
          )}

          {/* Quick Road Trip Presets */}
          {!editingExpense && (
            <div>
              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1 mb-1.5 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-[#5bc5a7]" />
                Road Trip Shortcuts
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                {PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyPreset(preset)}
                    className="whitespace-nowrap px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-medium transition"
                  >
                    {preset.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Description & Amount Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Description
              </label>
              <input
                type="text"
                placeholder="e.g. Highway Diesel Full Tank"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#5bc5a7] focus:ring-1 focus:ring-[#5bc5a7]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  required
                  className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-sm font-black text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#5bc5a7] focus:ring-1 focus:ring-[#5bc5a7]"
                />
              </div>
            </div>
          </div>

          {/* Paid By Who? */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Paid By
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {members.map((member) => {
                const isSelected = paidById === member.id;
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => setPaidById(member.id)}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-medium transition text-left ${
                      isSelected
                        ? 'bg-[#5bc5a7]/15 border-[#5bc5a7] text-[#2c836c] font-bold shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full ${member.avatarColor} text-white font-bold flex items-center justify-center text-[10px] shrink-0`}
                    >
                      {member.name.charAt(0)}
                    </div>
                    <span className="truncate">{member.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Category & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#5bc5a7]"
              >
                {Object.keys(CATEGORY_ICONS).map((cat) => (
                  <option key={cat} value={cat}>
                    {CATEGORY_ICONS[cat].icon} {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-[#5bc5a7]"
              />
            </div>
          </div>

          {/* Split Among Members */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#5bc5a7]" />
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Split With ({splitMemberIds.length} of {members.length})
                </label>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={selectAllMembers}
                  className="text-[#5bc5a7] font-bold hover:underline"
                >
                  Select All 7
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={() =>
                    setSplitMode(splitMode === 'EQUAL' ? 'CUSTOM' : 'EQUAL')
                  }
                  className="text-slate-500 hover:text-slate-800"
                >
                  {splitMode === 'EQUAL' ? 'Custom Amounts' : 'Equal Split'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {members.map((member) => {
                const isIncluded = splitMemberIds.includes(member.id);

                return (
                  <div
                    key={member.id}
                    className={`rounded-lg border p-2 transition flex flex-col justify-between ${
                      isIncluded
                        ? 'bg-[#5bc5a7]/10 border-[#5bc5a7] text-slate-800'
                        : 'bg-slate-50 border-slate-200 text-slate-400 opacity-60'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleMember(member.id)}
                      className="flex items-center justify-between text-left w-full"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`w-5 h-5 rounded-full ${member.avatarColor} text-white font-bold flex items-center justify-center text-[9px] shrink-0`}
                        >
                          {member.name.charAt(0)}
                        </div>
                        <span className="text-xs font-semibold truncate">
                          {member.name}
                        </span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] shrink-0 ${
                          isIncluded
                            ? 'bg-[#5bc5a7] border-[#5bc5a7] text-white font-bold'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isIncluded && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>

                    {splitMode === 'CUSTOM' && isIncluded && (
                      <div className="mt-1.5 pt-1 border-t border-slate-200">
                        <input
                          type="number"
                          placeholder="₹ Amount"
                          value={customSplits[member.id] || ''}
                          onChange={(e) =>
                            setCustomSplits({
                              ...customSplits,
                              [member.id]: e.target.value,
                            })
                          }
                          className="w-full bg-white border border-slate-300 rounded px-2 py-0.5 text-xs text-slate-800"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {splitMode === 'EQUAL' && totalAmount > 0 && splitMemberIds.length > 0 && (
              <div className="mt-2.5 p-2.5 rounded-lg bg-[#5bc5a7]/10 text-[#216d59] text-xs font-semibold flex items-center justify-between">
                <span>Equal share per friend:</span>
                <span className="font-black text-sm">
                  {formatCurrency(equalShare)} / person
                </span>
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Paid at Shell petrol pump on highway"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#5bc5a7]"
            />
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-2">
            <button
              type="submit"
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-bold bg-[#ff652f] hover:bg-[#e55320] text-white shadow-xs transition order-1 sm:order-2 active:scale-95"
            >
              {editingExpense ? 'Save Changes' : 'Save Bill'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 transition order-2 sm:order-1 text-center"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
