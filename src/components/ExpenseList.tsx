import React, { useState } from 'react';
import type { Expense, Member, Category } from '../types';
import { formatCurrency } from '../utils/settlement';
import { CATEGORY_ICONS } from '../utils/sampleData';
import { Search, Plus, Trash2, Edit3, Calendar, Receipt } from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  members: Member[];
  onOpenAddExpense: () => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  selectedMemberFilter: string | null;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  members,
  onOpenAddExpense,
  onEditExpense,
  onDeleteExpense,
  selectedMemberFilter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const memberMap = new Map<string, Member>();
  members.forEach((m) => memberMap.set(m.id, m));

  // Filter expenses
  const filtered = expenses.filter((e) => {
    // Member filter
    if (selectedMemberFilter) {
      const isPayer = e.paidById === selectedMemberFilter;
      const isSplitter = e.splitMemberIds.includes(selectedMemberFilter);
      if (!isPayer && !isSplitter) return false;
    }

    // Category filter
    if (categoryFilter !== 'ALL' && e.category !== categoryFilter) {
      return false;
    }

    // Search filter
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchTitle = e.title.toLowerCase().includes(q);
      const matchNotes = e.notes ? e.notes.toLowerCase().includes(q) : false;
      const payerName = memberMap.get(e.paidById)?.name.toLowerCase() || '';
      const matchPayer = payerName.includes(q);
      if (!matchTitle && !matchNotes && !matchPayer) return false;
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
    'Misc',
  ];

  return (
    <div className="bg-slate-800/40 border border-slate-700/60 rounded-3xl p-4 sm:p-6 backdrop-blur-sm">
      {/* List Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Receipt className="w-5 h-5 text-teal-400" />
            <span>Trip Expenses ({filtered.length})</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {selectedMemberFilter ? (
              <span>
                Filtered by member:{' '}
                <strong className="text-teal-300">
                  {memberMap.get(selectedMemberFilter)?.name}
                </strong>
              </span>
            ) : (
              'All shared bills for the Goa trip'
            )}
          </p>
        </div>

        <button
          onClick={onOpenAddExpense}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 transition shadow-sm"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Expense</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="space-y-3 mb-6">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search expenses by title, note, or person..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition"
          />
        </div>

        {/* Category Pills (horizontal scrollable) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          {categories.map((cat) => {
            const isActive = categoryFilter === cat;
            const meta = cat !== 'ALL' ? CATEGORY_ICONS[cat] : null;

            return (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg border font-medium transition flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-teal-500/20 text-teal-300 border-teal-500/50 shadow-sm'
                    : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {meta && <span>{meta.icon}</span>}
                <span>{cat === 'ALL' ? 'All Categories' : cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Expenses Feed */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 px-4 border border-dashed border-slate-700/60 rounded-2xl">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-3">
            <Receipt className="w-6 h-6" />
          </div>
          <h4 className="text-base font-semibold text-slate-300">No expenses found</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {searchTerm || categoryFilter !== 'ALL' || selectedMemberFilter
              ? 'Try adjusting your search or category filters.'
              : 'Start by adding your first bill for hotel, drinks, food, or scooters!'}
          </p>
          <button
            onClick={onOpenAddExpense}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 transition"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add Bill</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((expense) => {
            const payer = memberMap.get(expense.paidById);
            const catMeta = CATEGORY_ICONS[expense.category] || CATEGORY_ICONS['Misc'];
            const splitCount = expense.splitMemberIds?.length || 0;
            const perPersonShare =
              splitCount > 0 ? expense.amount / splitCount : 0;

            return (
              <div
                key={expense.id}
                className="group bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 rounded-2xl p-4 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                {/* Left: Category Icon & Details */}
                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 border ${catMeta.color}`}
                  >
                    {catMeta.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-white text-sm sm:text-base truncate">
                        {expense.title}
                      </h4>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-700/60 text-slate-300 border border-slate-600/40 shrink-0">
                        {expense.category}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {expense.date}
                      </span>
                      <span>•</span>
                      <span>
                        Paid by{' '}
                        <strong className="text-teal-300 font-medium">
                          {payer?.name || 'Someone'}
                        </strong>
                      </span>
                      <span>•</span>
                      <span className="text-slate-300">
                        Split among{' '}
                        <span className="font-semibold text-slate-200">
                          {splitCount} people
                        </span>{' '}
                        ({formatCurrency(perPersonShare)}/each)
                      </span>
                    </div>

                    {expense.notes && (
                      <p className="text-xs text-slate-400/80 mt-1.5 italic bg-slate-900/40 px-2.5 py-1 rounded-lg inline-block border border-slate-800">
                        "{expense.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-3 sm:border-l sm:border-slate-700/40 sm:pl-4">
                  <div className="text-left sm:text-right">
                    <div className="text-lg sm:text-xl font-extrabold text-white">
                      {formatCurrency(expense.amount)}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Total Bill
                    </span>
                  </div>

                  <div className="flex items-center gap-1 opacity-90 sm:opacity-60 group-hover:opacity-100 transition">
                    <button
                      onClick={() => onEditExpense(expense)}
                      className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/60 transition"
                      title="Edit expense"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDeleteExpense(expense.id)}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="Delete expense"
                    >
                      <Trash2 className="w-4 h-4" />
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
