import React, { useState } from 'react';
import type { DebtTransaction } from '../../types';
import { formatCurrency } from '../../utils/settlement';
import { copyToClipboard } from '../../utils/clipboard';
import { QrCode, ArrowRight, Check, Sparkles, Copy } from 'lucide-react';

interface MobileSettleViewProps {
  settlements: DebtTransaction[];
  currentUserId: string;
}

export const MobileSettleView: React.FC<MobileSettleViewProps> = ({
  settlements,
  currentUserId,
}) => {
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleCompleted = (id: string) => {
    setCompletedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = async (tx: DebtTransaction) => {
    if (!tx.toUpiId) return;
    await copyToClipboard(tx.toUpiId);
    setCopiedId(tx.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-3.5 pb-32">
      {/* Top Banner */}
      <div className="bg-[#145B4A] rounded-3xl p-4 sm:p-5 text-white shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#78C5A7]/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#78C5A7]" />
          </div>
          <h2 className="text-base font-black text-white m-0">
            Simplified Debt Settlements
          </h2>
        </div>
        <p className="text-xs text-[#78C5A7] mt-1.5 leading-relaxed">
          The smart settlement algorithm minimized group transfers to just {settlements.length} payments.
        </p>
      </div>

      {/* Settlements List */}
      {settlements.length === 0 ? (
        <div className="bg-white border border-[#E4EAF0] rounded-3xl p-8 text-center space-y-2 shadow-2xs">
          <div className="text-4xl">🎉</div>
          <h3 className="font-black text-[#192B3D] text-sm">Everyone is all settled!</h3>
          <p className="text-xs text-[#718096]">
            Nobody owes anything across all friends. Time to relax!
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {settlements.map((tx, idx) => {
            const isDone = !!completedMap[tx.id];
            const isYouPaying = tx.fromId === currentUserId;
            const isYouReceiving = tx.toId === currentUserId;

            const upiUrl = tx.toUpiId
              ? `upi://pay?pa=${encodeURIComponent(tx.toUpiId)}&pn=${encodeURIComponent(
                  tx.toName
                )}&am=${tx.amount}&cu=INR&tn=TripTallySettlement`
              : null;

            return (
              <div
                key={tx.id || idx}
                className={`bg-white border rounded-3xl p-4 shadow-2xs transition space-y-3 ${
                  isDone
                    ? 'border-[#E4EAF0] bg-[#F7F8F5]/80 opacity-60'
                    : 'border-[#E4EAF0] hover:border-[#78C5A7]'
                }`}
              >
                {/* Row 1: Who owes whom + Amount */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleCompleted(tx.id)}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center transition shrink-0 ${
                        isDone
                          ? 'bg-[#145B4A] border-[#145B4A] text-white'
                          : 'border-[#E4EAF0] bg-white hover:border-[#145B4A]'
                      }`}
                      title={isDone ? 'Mark as pending' : 'Mark as settled'}
                    >
                      {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap text-xs sm:text-sm">
                        <span
                          className={`font-bold ${
                            isDone
                              ? 'line-through text-[#718096]'
                              : isYouPaying
                              ? 'text-[#FF784F]'
                              : 'text-[#192B3D]'
                          }`}
                        >
                          {tx.fromName} {isYouPaying && '(You)'}
                        </span>

                        <span className="text-[#718096] flex items-center gap-1 text-[11px]">
                          pays <ArrowRight className="w-3 h-3 text-[#718096]" />
                        </span>

                        <span
                          className={`font-bold ${
                            isDone
                              ? 'line-through text-[#718096]'
                              : isYouReceiving
                              ? 'text-[#145B4A]'
                              : 'text-[#192B3D]'
                          }`}
                        >
                          {tx.toName} {isYouReceiving && '(You)'}
                        </span>
                      </div>

                      {tx.toUpiId && (
                        <p className="text-[11px] text-[#718096] font-mono mt-0.5">
                          UPI: {tx.toUpiId}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right shrink-0">
                    <span
                      className={`text-base font-black ${
                        isDone ? 'line-through text-[#718096]' : 'text-[#192B3D]'
                      }`}
                    >
                      {formatCurrency(tx.amount)}
                    </span>
                  </div>
                </div>

                {/* Row 2: Direct Actions (Pay UPI, Copy UPI) */}
                {tx.toUpiId && !isDone && (
                  <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-[#E4EAF0]">
                    <button
                      onClick={() => handleCopy(tx)}
                      className="px-3 py-1.5 rounded-xl border border-[#E4EAF0] text-[#718096] hover:text-[#192B3D] bg-white text-xs font-semibold flex items-center gap-1 transition active:scale-95"
                    >
                      {copiedId === tx.id ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-[#145B4A] stroke-[3]" />
                          <span className="text-[#145B4A] font-bold">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-[#718096]" />
                          <span>Copy UPI</span>
                        </>
                      )}
                    </button>

                    {upiUrl && (
                      <a
                        href={upiUrl}
                        className="px-4 py-1.5 rounded-xl bg-[#145B4A] hover:bg-[#0f4437] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition active:scale-95"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Pay UPI</span>
                      </a>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
