import React, { useState } from 'react';
import type { DebtTransaction } from '../types';
import { formatCurrency } from '../utils/settlement';
import { ArrowRight, CheckCircle2, QrCode, Sparkles, Copy, Check } from 'lucide-react';

interface SettlementViewProps {
  settlements: DebtTransaction[];
}

export const SettlementView: React.FC<SettlementViewProps> = ({ settlements }) => {
  const [settledMap, setSettledMap] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleSettled = (id: string) => {
    setSettledMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyUpi = (tx: DebtTransaction) => {
    if (!tx.toUpiId) return;
    navigator.clipboard.writeText(tx.toUpiId);
    setCopiedId(tx.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const allDone =
    settlements.length > 0 &&
    settlements.every((tx) => settledMap[tx.id]);

  return (
    <div className="bg-slate-800/40 border border-slate-700/60 rounded-3xl p-4 sm:p-6 backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span>Smart Debt Settlements</span>
            </h3>
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
              Simplified
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Splitwise greedy algorithm minimizes transactions to settle everyone up.
          </p>
        </div>

        {settlements.length > 0 && (
          <div className="text-xs text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
            <span>{settlements.length} transfers needed</span>
          </div>
        )}
      </div>

      {settlements.length === 0 ? (
        <div className="text-center py-10 px-4 border border-slate-700/60 rounded-2xl bg-slate-900/40">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="text-base font-bold text-white">Everyone is even!</h4>
          <p className="text-xs text-slate-400 mt-1">
            No pending balances or debts. All 7 Goa trip members are settled up.
          </p>
        </div>
      ) : allDone ? (
        <div className="text-center py-10 px-4 border border-emerald-500/30 rounded-2xl bg-emerald-950/20">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <h4 className="text-lg font-bold text-emerald-300">
            🎉 All Transfers Completed!
          </h4>
          <p className="text-xs text-emerald-400/80 mt-1 max-w-sm mx-auto">
            All debts have been marked as paid. Have fun in Goa! 🏖️🍹
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {settlements.map((tx) => {
            const isDone = !!settledMap[tx.id];
            const upiPayUrl = tx.toUpiId
              ? `upi://pay?pa=${encodeURIComponent(
                  tx.toUpiId
                )}&pn=${encodeURIComponent(
                  tx.toName
                )}&am=${tx.amount}&cu=INR&tn=GoaTripSettlement`
              : null;

            return (
              <div
                key={tx.id}
                className={`rounded-2xl p-4 border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isDone
                    ? 'bg-slate-900/60 border-slate-800 opacity-60'
                    : 'bg-slate-800/80 border-slate-700/80 hover:border-slate-600 shadow-sm'
                }`}
              >
                {/* Flow: From -> To */}
                <div className="flex items-center gap-3 sm:gap-4 flex-1">
                  {/* Checkbox */}
                  <button
                    onClick={() => toggleSettled(tx.id)}
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center transition shrink-0 ${
                      isDone
                        ? 'bg-emerald-500 border-emerald-500 text-slate-950'
                        : 'border-slate-600 hover:border-slate-400 bg-slate-900'
                    }`}
                    title={isDone ? 'Mark as pending' : 'Mark as paid'}
                  >
                    {isDone && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>

                  <div className="flex items-center gap-2.5 flex-wrap min-w-0">
                    <span
                      className={`font-bold text-sm sm:text-base ${
                        isDone ? 'line-through text-slate-400' : 'text-rose-300'
                      }`}
                    >
                      {tx.fromName}
                    </span>

                    <span className="text-slate-500 flex items-center gap-1">
                      <span className="text-xs">pays</span>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                    </span>

                    <span
                      className={`font-bold text-sm sm:text-base ${
                        isDone ? 'line-through text-slate-400' : 'text-emerald-300'
                      }`}
                    >
                      {tx.toName}
                    </span>

                    {tx.toUpiId && (
                      <span className="text-[11px] bg-slate-900/80 text-slate-400 px-2 py-0.5 rounded-md border border-slate-700 font-mono">
                        {tx.toUpiId}
                      </span>
                    )}
                  </div>
                </div>

                {/* Amount & Direct UPI Action */}
                <div className="flex items-center justify-between md:justify-end gap-3 pt-2 md:pt-0 border-t md:border-t-0 border-slate-700/50">
                  <div className="text-left md:text-right">
                    <div
                      className={`text-lg sm:text-xl font-extrabold ${
                        isDone ? 'line-through text-slate-500' : 'text-white'
                      }`}
                    >
                      {formatCurrency(tx.amount)}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {tx.toUpiId && (
                      <>
                        <button
                          onClick={() => handleCopyUpi(tx)}
                          className="px-2.5 py-1.5 text-xs rounded-xl bg-slate-700/60 hover:bg-slate-700 text-slate-300 border border-slate-600/60 flex items-center gap-1 transition"
                          title="Copy UPI ID"
                        >
                          {copiedId === tx.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-300">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy UPI</span>
                            </>
                          )}
                        </button>

                        {upiPayUrl && (
                          <a
                            href={upiPayUrl}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 transition shadow-sm"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>Pay UPI</span>
                          </a>
                        )}
                      </>
                    )}
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
