import React from 'react';
import type { Member, MemberBalance } from '../types';
import { formatCurrency } from '../utils/settlement';
import { Share2, Sparkles, Fuel, Coffee, Utensils, Beer } from 'lucide-react';

interface SplitwiseRightSidebarProps {
  balances: MemberBalance[];
  totalSpend: number;
  members: Member[];
  onOpenAddExpense: () => void;
  onOpenShare: () => void;
  onLoadSample: () => void;
}

export const SplitwiseRightSidebar: React.FC<SplitwiseRightSidebarProps> = ({
  balances,
  totalSpend,
  members,
  onOpenAddExpense,
  onOpenShare,
  onLoadSample,
}) => {
  const avg = members.length > 0 ? totalSpend / members.length : 0;

  return (
    <aside className="w-full lg:w-64 shrink-0 space-y-5 text-xs text-slate-600">
      {/* Group Summary Box */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
        <h3 className="font-bold uppercase tracking-wider text-[11px] text-slate-400">
          Trip Total
        </h3>
        <div>
          <div className="text-2xl font-black text-slate-800">
            {formatCurrency(totalSpend)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Avg {formatCurrency(avg)} / friend
          </div>
        </div>

        {/* WhatsApp Export Button */}
        <button
          onClick={onOpenShare}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs transition shadow-xs"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share on WhatsApp</span>
        </button>
      </div>

      {/* Friends Balances Box */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold uppercase tracking-wider text-[11px] text-slate-400">
            Group Balances
          </h3>
          <span className="text-[10px] text-slate-400 font-medium">7 friends</span>
        </div>

        <div className="space-y-2">
          {balances.map((b) => {
            const isGets = b.netBalance > 0.01;
            const isOwes = b.netBalance < -0.01;

            return (
              <div
                key={b.memberId}
                className="flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-5 h-5 rounded-full ${b.avatarColor} text-white font-bold flex items-center justify-center text-[9px] shrink-0`}
                  >
                    {b.name.charAt(0)}
                  </div>
                  <span className="font-medium text-slate-700 truncate">
                    {b.name}
                  </span>
                </div>

                <div className="shrink-0 font-bold text-right">
                  {isGets && (
                    <span className="text-[#5bc5a7]">
                      gets +{formatCurrency(b.netBalance)}
                    </span>
                  )}
                  {isOwes && (
                    <span className="text-[#ff652f]">
                      owes {formatCurrency(Math.abs(b.netBalance))}
                    </span>
                  )}
                  {!isGets && !isOwes && (
                    <span className="text-slate-400 font-normal">settled</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Car Trip Shortcuts */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2.5">
        <h3 className="font-bold uppercase tracking-wider text-[11px] text-slate-400">
          Quick Road Trip Bills
        </h3>
        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
          <button
            onClick={onOpenAddExpense}
            className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 font-medium text-slate-700 flex items-center gap-1.5 transition text-left"
          >
            <Fuel className="w-3.5 h-3.5 text-amber-500" />
            <span className="truncate">Diesel / Petrol</span>
          </button>

          <button
            onClick={onOpenAddExpense}
            className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 font-medium text-slate-700 flex items-center gap-1.5 transition text-left"
          >
            <Coffee className="w-3.5 h-3.5 text-yellow-600" />
            <span className="truncate">Breakfast</span>
          </button>

          <button
            onClick={onOpenAddExpense}
            className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 font-medium text-slate-700 flex items-center gap-1.5 transition text-left"
          >
            <Utensils className="w-3.5 h-3.5 text-orange-500" />
            <span className="truncate">Lunch/Dinner</span>
          </button>

          <button
            onClick={onOpenAddExpense}
            className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 font-medium text-slate-700 flex items-center gap-1.5 transition text-left"
          >
            <Beer className="w-3.5 h-3.5 text-purple-500" />
            <span className="truncate">Alcohol/Drinks</span>
          </button>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <button
            onClick={onLoadSample}
            className="hover:text-[#5bc5a7] underline transition flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-[#5bc5a7]" />
            Reload road trip bills
          </button>
        </div>
      </div>
    </aside>
  );
};

