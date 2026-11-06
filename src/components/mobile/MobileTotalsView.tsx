import React from 'react';
import type { Expense, Member } from '../../types';
import { formatCurrency } from '../../utils/settlement';
import { CATEGORY_ICONS } from '../../utils/sampleData';
import { Share2, Sparkles, RotateCcw, PieChart } from 'lucide-react';

interface MobileTotalsViewProps {
  expenses: Expense[];
  members: Member[];
  onOpenShare: () => void;
  onLoadSample: () => void;
  onResetData: () => void;
}

export const MobileTotalsView: React.FC<MobileTotalsViewProps> = ({
  expenses,
  members,
  onOpenShare,
  onLoadSample,
  onResetData,
}) => {
  const totalSpend = expenses.reduce((sum, e) => sum + e.amount, 0);
  const avg = members.length > 0 ? totalSpend / members.length : 0;

  // Category breakdown
  const categoryMap: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
  });

  const sortedCategories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-4 pb-32">
      {/* 1. Trip Hero Card */}
      <div className="bg-gradient-to-r from-teal-700 to-emerald-600 rounded-2xl p-4 text-white shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-teal-100 uppercase tracking-wider block">
              Total Road Trip Spend
            </span>
            <div className="text-3xl font-black mt-0.5">
              {formatCurrency(totalSpend)}
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] font-semibold text-teal-100 uppercase tracking-wider block">
              Avg / Friend
            </span>
            <div className="text-lg font-extrabold text-white mt-0.5">
              {formatCurrency(avg)}
            </div>
          </div>
        </div>

        {/* WhatsApp Button */}
        <button
          onClick={onOpenShare}
          className="w-full py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
        >
          <Share2 className="w-4 h-4" />
          <span>Share Summary to WhatsApp Group</span>
        </button>
      </div>

      {/* 2. Category Breakdown */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3.5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
          <PieChart className="w-4 h-4 text-[#5bc5a7]" />
          <h3 className="font-bold text-slate-800 text-sm m-0">Where Your Money Went</h3>
        </div>

        {sortedCategories.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">No bills recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {sortedCategories.map(([cat, amount]) => {
              const pct = totalSpend > 0 ? (amount / totalSpend) * 100 : 0;
              const meta = CATEGORY_ICONS[cat] || CATEGORY_ICONS['Misc'];

              return (
                <div key={cat} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-slate-700">
                      <span>{meta.icon}</span>
                      <span>{cat}</span>
                    </span>
                    <span className="font-bold text-slate-800">
                      {formatCurrency(amount)}{' '}
                      <span className="text-slate-400 font-normal">({pct.toFixed(0)}%)</span>
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
        )}
      </div>

      {/* 3. Trip Actions */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
          Trip Data Options
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onLoadSample}
            className="flex-1 py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#5bc5a7]" />
            <span>Reload Sample Bills</span>
          </button>
          <button
            onClick={onResetData}
            className="py-2 px-3 rounded-xl border border-rose-200 text-rose-600 font-semibold text-xs flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Trip</span>
          </button>
        </div>
      </div>
    </div>
  );
};
