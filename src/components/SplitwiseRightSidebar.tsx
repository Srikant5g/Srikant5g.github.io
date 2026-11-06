import React from 'react';
import type { Member, MemberBalance, DebtTransaction } from '../types';
import { formatCurrency } from '../utils/settlement';
import { Share2, Sparkles, Fuel, Coffee, Utensils, Beer, CheckCircle2, ArrowRight } from 'lucide-react';

interface SplitwiseRightSidebarProps {
  balances: MemberBalance[];
  totalSpend: number;
  members: Member[];
  settlements?: DebtTransaction[];
  onOpenAddExpense: () => void;
  onOpenShare: () => void;
  onLoadSample: () => void;
}

export const SplitwiseRightSidebar: React.FC<SplitwiseRightSidebarProps> = ({
  totalSpend,
  members,
  settlements = [],
  onOpenAddExpense,
  onOpenShare,
  onLoadSample,
}) => {
  const avg = members.length > 0 ? totalSpend / members.length : 0;

  return (
    <aside className="hidden xl:block xl:w-72 shrink-0 space-y-4 text-xs text-slate-600">
      {/* 1. Trip Summary Box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold uppercase tracking-wider text-[11px] text-slate-400">
            Trip Total Spend
          </h3>
          <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
            {members.length} friends
          </span>
        </div>

        <div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">
            {formatCurrency(totalSpend)}
          </div>
          <div className="text-xs text-slate-500 font-medium mt-1">
            Avg <span className="font-bold text-slate-700">{formatCurrency(avg)}</span> per person
          </div>
        </div>

        {/* WhatsApp Export Button */}
        <button
          onClick={onOpenShare}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs transition shadow-xs active:scale-95"
        >
          <Share2 className="w-4 h-4 fill-white" />
          <span>Share on WhatsApp</span>
        </button>
      </div>

      {/* 2. Simplified Settlements Checklist */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold uppercase tracking-wider text-[11px] text-slate-400">
            Direct Settlements
          </h3>
          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
            {settlements.length} transfers
          </span>
        </div>

        {settlements.length === 0 ? (
          <div className="py-4 text-center space-y-1">
            <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto" />
            <p className="text-xs font-bold text-slate-700">All Settled Up!</p>
            <p className="text-[11px] text-slate-400">No pending debts among friends</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {settlements.slice(0, 5).map((tx) => (
              <div
                key={tx.id}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
              >
                <div className="min-w-0 pr-2">
                  <div className="font-semibold text-slate-800 flex items-center gap-1 truncate">
                    <span>{tx.fromName}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{tx.toName}</span>
                  </div>
                </div>
                <span className="font-black text-slate-900 shrink-0">
                  {formatCurrency(tx.amount)}
                </span>
              </div>
            ))}
            {settlements.length > 5 && (
              <p className="text-[10px] text-center text-slate-400 pt-1">
                + {settlements.length - 5} more settlements
              </p>
            )}
          </div>
        )}
      </div>

      {/* 3. Quick Car Trip Presets */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
        <h3 className="font-bold uppercase tracking-wider text-[11px] text-slate-400">
          Quick Road Trip Bills
        </h3>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <button
            onClick={onOpenAddExpense}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 font-semibold text-slate-700 flex items-center gap-2 transition active:scale-95 text-left"
          >
            <Fuel className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="truncate">Diesel Fill</span>
          </button>

          <button
            onClick={onOpenAddExpense}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 font-semibold text-slate-700 flex items-center gap-2 transition active:scale-95 text-left"
          >
            <Coffee className="w-4 h-4 text-yellow-600 shrink-0" />
            <span className="truncate">Breakfast</span>
          </button>

          <button
            onClick={onOpenAddExpense}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 font-semibold text-slate-700 flex items-center gap-2 transition active:scale-95 text-left"
          >
            <Utensils className="w-4 h-4 text-orange-500 shrink-0" />
            <span className="truncate">Highway Lunch</span>
          </button>

          <button
            onClick={onOpenAddExpense}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 font-semibold text-slate-700 flex items-center gap-2 transition active:scale-95 text-left"
          >
            <Beer className="w-4 h-4 text-purple-500 shrink-0" />
            <span className="truncate">Beers / Drinks</span>
          </button>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <button
            onClick={onLoadSample}
            className="hover:text-[#5bc5a7] font-semibold underline transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#5bc5a7]" />
            Reload road trip sample
          </button>
        </div>
      </div>
    </aside>
  );
};
