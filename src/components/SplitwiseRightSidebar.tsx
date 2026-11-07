import React, { useState } from 'react';
import type { Member, MemberBalance, DebtTransaction } from '../types';
import { formatCurrency } from '../utils/settlement';
import { copyToClipboard } from '../utils/clipboard';
import { Share2, Fuel, Coffee, Utensils, Beer, CheckCircle2, ArrowRight } from 'lucide-react';

interface SplitwiseRightSidebarProps {
  balances: MemberBalance[];
  totalSpend: number;
  members: Member[];
  settlements?: DebtTransaction[];
  onOpenAddExpense: () => void;
  onOpenShare: () => void;
  onLoadSample?: () => void;
}

export const SplitwiseRightSidebar: React.FC<SplitwiseRightSidebarProps> = ({
  totalSpend,
  members,
  settlements = [],
  onOpenAddExpense,
  onOpenShare,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const avg = members.length > 0 ? totalSpend / members.length : 0;

  const handleCopyUpi = async (e: React.MouseEvent, txId: string, upi: string) => {
    e.stopPropagation();
    await copyToClipboard(upi);
    setCopiedId(txId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <aside className="hidden xl:block xl:w-72 shrink-0 space-y-4 text-xs text-[#718096]">
      {/* 1. Trip Summary Box */}
      <div className="bg-white border border-[#E4EAF0] rounded-3xl p-5 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="font-bold uppercase tracking-wider text-[11px] text-[#718096]">
            Total Trip Spend
          </h3>
          <span className="text-[10px] bg-[#78C5A7]/20 text-[#145B4A] font-bold px-2 py-0.5 rounded-full">
            {members.length} friends
          </span>
        </div>

        <div>
          <div className="text-3xl font-black text-[#192B3D] tracking-tight">
            {formatCurrency(totalSpend)}
          </div>
          <div className="text-xs text-[#718096] font-medium mt-1">
            Avg <span className="font-bold text-[#192B3D]">{formatCurrency(avg)}</span> per person
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
      <div className="bg-white border border-[#E4EAF0] rounded-3xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold uppercase tracking-wider text-[11px] text-[#718096]">
            Direct Settlements
          </h3>
          <span className="text-[10px] text-[#145B4A] font-bold bg-[#78C5A7]/20 px-2 py-0.5 rounded-full">
            {settlements.length} transfers
          </span>
        </div>

        {settlements.length === 0 ? (
          <div className="py-4 text-center space-y-1">
            <CheckCircle2 className="w-7 h-7 text-[#145B4A] mx-auto" />
            <p className="text-xs font-bold text-[#192B3D]">All Settled Up!</p>
            <p className="text-[11px] text-[#718096]">No pending debts among friends</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {settlements.slice(0, 5).map((tx) => (
              <div
                key={tx.id}
                className="p-2.5 rounded-2xl bg-[#F7F8F5] border border-[#E4EAF0] flex items-center justify-between text-xs"
              >
                <div className="min-w-0 pr-2">
                  <div className="font-semibold text-[#192B3D] flex items-center gap-1 truncate">
                    <span>{tx.fromName}</span>
                    <ArrowRight className="w-3 h-3 text-[#718096] shrink-0" />
                    <span>{tx.toName}</span>
                  </div>
                  {tx.toUpiId && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[10px] text-[#718096] font-mono truncate">{tx.toUpiId}</span>
                      <button
                        type="button"
                        onClick={(e) => handleCopyUpi(e, tx.id, tx.toUpiId!)}
                        className="text-[9px] px-1 py-0.2 rounded bg-white border border-[#E4EAF0] text-[#718096] hover:text-[#192B3D]"
                      >
                        {copiedId === tx.id ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  )}
                </div>
                <span className="font-black text-[#192B3D] shrink-0">
                  {formatCurrency(tx.amount)}
                </span>
              </div>
            ))}
            {settlements.length > 5 && (
              <p className="text-[10px] text-center text-[#718096] pt-1">
                + {settlements.length - 5} more settlements
              </p>
            )}
          </div>
        )}
      </div>

      {/* 3. Quick Trip Presets */}
      <div className="bg-white border border-[#E4EAF0] rounded-3xl p-5 shadow-xs space-y-3">
        <h3 className="font-bold uppercase tracking-wider text-[11px] text-[#718096]">
          Quick Trip Shortcuts
        </h3>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <button
            onClick={onOpenAddExpense}
            className="p-2.5 rounded-xl bg-[#F7F8F5] hover:bg-white border border-[#E4EAF0] font-semibold text-[#192B3D] flex items-center gap-2 transition active:scale-95 text-left shadow-2xs hover:border-[#78C5A7]"
          >
            <Fuel className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="truncate">Diesel / Petrol</span>
          </button>

          <button
            onClick={onOpenAddExpense}
            className="p-2.5 rounded-xl bg-[#F7F8F5] hover:bg-white border border-[#E4EAF0] font-semibold text-[#192B3D] flex items-center gap-2 transition active:scale-95 text-left shadow-2xs hover:border-[#78C5A7]"
          >
            <Coffee className="w-4 h-4 text-yellow-600 shrink-0" />
            <span className="truncate">Breakfast</span>
          </button>

          <button
            onClick={onOpenAddExpense}
            className="p-2.5 rounded-xl bg-[#F7F8F5] hover:bg-white border border-[#E4EAF0] font-semibold text-[#192B3D] flex items-center gap-2 transition active:scale-95 text-left shadow-2xs hover:border-[#78C5A7]"
          >
            <Utensils className="w-4 h-4 text-[#FF784F] shrink-0" />
            <span className="truncate">Lunch / Food</span>
          </button>

          <button
            onClick={onOpenAddExpense}
            className="p-2.5 rounded-xl bg-[#F7F8F5] hover:bg-white border border-[#E4EAF0] font-semibold text-[#192B3D] flex items-center gap-2 transition active:scale-95 text-left shadow-2xs hover:border-[#78C5A7]"
          >
            <Beer className="w-4 h-4 text-purple-500 shrink-0" />
            <span className="truncate">Drinks & Stay</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
