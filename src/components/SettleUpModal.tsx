import React, { useState } from 'react';
import type { DebtTransaction } from '../types';
import { formatCurrency } from '../utils/settlement';
import { X, Check, QrCode, ArrowRight } from 'lucide-react';

interface SettleUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  settlements: DebtTransaction[];
  onRecordPayment: (fromId: string, toId: string, amount: number) => void;
}

export const SettleUpModal: React.FC<SettleUpModalProps> = ({
  isOpen,
  onClose,
  settlements,
  onRecordPayment,
}) => {
  const [selectedTx, setSelectedTx] = useState<DebtTransaction | null>(
    settlements[0] || null
  );

  if (!isOpen) return null;

  const handleSettle = () => {
    if (!selectedTx) return;
    onRecordPayment(selectedTx.fromId, selectedTx.toId, selectedTx.amount);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden my-auto flex flex-col text-slate-800">
        {/* Header */}
        <div className="px-6 py-4 bg-[#5bc5a7] text-white flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-black text-white m-0">Settle Up</h2>
            <p className="text-xs text-white/90 mt-0.5">
              Record a payment or pay directly via UPI
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white hover:bg-white/20 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {settlements.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-3xl mb-2">🎉</div>
              <h3 className="font-bold text-slate-700 text-sm">Everyone is even!</h3>
              <p className="text-xs text-slate-400 mt-1">
                No debts remaining across all 7 Goa friends.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                Choose a transfer to settle:
              </label>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {settlements.map((tx) => {
                  const isSelected = selectedTx?.id === tx.id;
                  const upiUrl = tx.toUpiId
                    ? `upi://pay?pa=${tx.toUpiId}&pn=${encodeURIComponent(
                        tx.toName
                      )}&am=${tx.amount}&cu=INR&tn=GoaTripSettlement`
                    : null;

                  return (
                    <div
                      key={tx.id}
                      onClick={() => setSelectedTx(tx)}
                      className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                        isSelected
                          ? 'border-[#5bc5a7] bg-[#5bc5a7]/10 ring-1 ring-[#5bc5a7]'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs">
                        <strong className="text-slate-800">{tx.fromName}</strong>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                        <strong className="text-slate-800">{tx.toName}</strong>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-slate-800">
                          {formatCurrency(tx.amount)}
                        </span>
                        {upiUrl && (
                          <a
                            href={upiUrl}
                            onClick={(e) => e.stopPropagation()}
                            className="px-2 py-0.5 rounded bg-[#5bc5a7] text-white text-[10px] font-bold flex items-center gap-0.5"
                          >
                            <QrCode className="w-2.5 h-2.5" />
                            UPI
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedTx && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                  <span>
                    Paying <strong>{selectedTx.toName}</strong> {formatCurrency(selectedTx.amount)} will mark this debt as settled in your trip history.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 flex items-center justify-end gap-2 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
          >
            Cancel
          </button>
          {settlements.length > 0 && (
            <button
              type="button"
              onClick={handleSettle}
              className="px-5 py-2 rounded-md text-xs font-bold bg-[#5bc5a7] hover:bg-[#48b396] text-white transition flex items-center gap-1.5 shadow-xs"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Record as Paid</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
