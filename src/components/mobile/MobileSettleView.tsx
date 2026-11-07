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
      <div className="bg-gradient-to-r from-emerald-700 to-teal-600 rounded-2xl p-4 text-white shadow-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-200" />
          <h2 className="text-base font-black text-white m-0">
            Simplified Debt Settlements
          </h2>
        </div>
        <p className="text-xs text-emerald-100 mt-1 leading-relaxed">
          The smart algorithm minimized group transfers to just {settlements.length} payments.
        </p>
      </div>

      {/* Settlements List */}
      {settlements.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-2">
          <div className="text-4xl">🎉</div>
          <h3 className="font-bold text-slate-800 text-sm">Everyone is all settled!</h3>
          <p className="text-xs text-slate-400">
            Nobody owes anything across all 7 friends. Time to chill! 🏖️🍹
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
                )}&am=${tx.amount}&cu=INR&tn=RoadTripSettlement`
              : null;

            return (
              <div
                key={tx.id || idx}
                className={`bg-white border rounded-2xl p-3.5 shadow-2xs transition space-y-2.5 ${
                  isDone
                    ? 'border-slate-200 bg-slate-50/80 opacity-60'
                    : 'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                {/* Row 1: Who owes whom + Amount */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleCompleted(tx.id)}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center transition shrink-0 ${
                        isDone
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : 'border-slate-300 bg-white hover:border-slate-400'
                      }`}
                      title={isDone ? 'Mark as pending' : 'Mark as completed'}
                    >
                      {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap text-xs sm:text-sm">
                        <span
                          className={`font-bold ${
                            isDone
                              ? 'line-through text-slate-400'
                              : isYouPaying
                              ? 'text-[#e05320]'
                              : 'text-slate-800'
                          }`}
                        >
                          {tx.fromName} {isYouPaying && '(You)'}
                        </span>

                        <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                          pays <ArrowRight className="w-3 h-3 text-slate-400" />
                        </span>

                        <span
                          className={`font-bold ${
                            isDone
                              ? 'line-through text-slate-400'
                              : isYouReceiving
                              ? 'text-[#0d9488]'
                              : 'text-slate-800'
                          }`}
                        >
                          {tx.toName} {isYouReceiving && '(You)'}
                        </span>
                      </div>

                      {tx.toUpiId && (
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          UPI: {tx.toUpiId}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right shrink-0">
                    <span
                      className={`text-base font-black ${
                        isDone ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      {formatCurrency(tx.amount)}
                    </span>
                  </div>
                </div>

                {/* Row 2: Direct Actions (Pay UPI, Copy UPI) */}
                {tx.toUpiId && !isDone && (
                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleCopy(tx)}
                      className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 bg-white text-xs font-semibold flex items-center gap-1"
                    >
                      {copiedId === tx.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-700">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy UPI</span>
                        </>
                      )}
                    </button>

                    {upiUrl && (
                      <a
                        href={upiUrl}
                        className="px-3.5 py-1.5 rounded-lg bg-[#5bc5a7] hover:bg-[#48b396] text-white text-xs font-bold flex items-center gap-1 shadow-xs transition"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Pay via UPI</span>
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
