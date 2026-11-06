import React, { useState } from 'react';
import type { DebtTransaction, Member } from '../types';
import { formatCurrency } from '../utils/settlement';
import { X, Check, QrCode, ArrowRight, Wallet, HandCoins } from 'lucide-react';

interface SettleUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  settlements: DebtTransaction[];
  members: Member[];
  currentUserId: string;
  onRecordPayment: (fromId: string, toId: string, amount: number, note?: string) => void;
}

export const SettleUpModal: React.FC<SettleUpModalProps> = ({
  isOpen,
  onClose,
  settlements,
  members,
  currentUserId,
  onRecordPayment,
}) => {
  const [tab, setTab] = useState<'settle' | 'deposit'>('settle');
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);

  // Deposit mode state
  const [depositFromId, setDepositFromId] = useState<string>(
    currentUserId || members[0]?.id || ''
  );
  const [depositToId, setDepositToId] = useState<string>(() => {
    const other = members.find((m) => m.id !== (currentUserId || members[0]?.id));
    return other ? other.id : members[1]?.id || members[0]?.id || '';
  });
  const [depositAmount, setDepositAmount] = useState<string>('10000');
  const [depositNote, setDepositNote] = useState<string>('Trip Kitty / Advance Pool Deposit');
  const [depositError, setDepositError] = useState<string | null>(null);

  if (!isOpen) return null;

  const activeTx =
    settlements.find((s) => s.id === selectedTxId) || settlements[0] || null;

  const handleSettleDebt = () => {
    if (!activeTx) return;
    onRecordPayment(activeTx.fromId, activeTx.toId, activeTx.amount);
    onClose();
  };

  const handleRecordDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    setDepositError(null);

    const amt = parseFloat(depositAmount);
    if (isNaN(amt) || amt <= 0) {
      setDepositError('Please enter a valid deposit amount greater than 0');
      return;
    }

    if (depositFromId === depositToId) {
      setDepositError('Payer and recipient cannot be the same person');
      return;
    }

    onRecordPayment(
      depositFromId,
      depositToId,
      amt,
      depositNote.trim() || 'Trip Kitty / Advance Pool Deposit'
    );
    onClose();
  };

  const recipientMember = members.find((m) => m.id === depositToId);
  const fromMember = members.find((m) => m.id === depositFromId);
  const numDepositAmt = parseFloat(depositAmount) || 0;

  const depositUpiUrl = recipientMember?.upiId && numDepositAmt > 0
    ? `upi://pay?pa=${encodeURIComponent(recipientMember.upiId)}&pn=${encodeURIComponent(
        recipientMember.name
      )}&am=${numDepositAmt}&cu=INR&tn=${encodeURIComponent(depositNote)}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden my-auto flex flex-col text-slate-800">
        {/* Header */}
        <div className="px-6 py-4 bg-[#5bc5a7] text-white flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-black text-white m-0">Settle Up & Advance Pool</h2>
            <p className="text-xs text-white/90 mt-0.5">
              Clear debts or deposit advance money into the trip fund
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close settle modal"
            className="p-1.5 rounded-lg text-white hover:bg-white/20 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50/75 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => setTab('settle')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              tab === 'settle'
                ? 'bg-white text-slate-800 shadow-xs border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <HandCoins className="w-4 h-4 text-[#5bc5a7]" />
            <span>Settle Debts ({settlements.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('deposit')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              tab === 'deposit'
                ? 'bg-white text-slate-800 shadow-xs border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Wallet className="w-4 h-4 text-[#ff652f]" />
            <span>Advance Trip Fund</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {tab === 'settle' ? (
            /* Tab 1: Settle Debts */
            settlements.length === 0 ? (
              <div className="text-center py-6">
                <div className="text-3xl mb-2">🎉</div>
                <h3 className="font-bold text-slate-700 text-sm">Everyone is even!</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  No debts remaining. To deposit pooled money in advance to the hotel/trip manager, switch to <strong>Advance Trip Fund</strong> above.
                </p>
                <button
                  type="button"
                  onClick={() => setTab('deposit')}
                  className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-[#5bc5a7] text-white hover:bg-[#48b396] transition"
                >
                  Deposit Advance to Trip Fund
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Choose a transfer to settle:
                </label>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {settlements.map((tx) => {
                    const isSelected = activeTx?.id === tx.id;
                    const upiUrl = tx.toUpiId
                      ? `upi://pay?pa=${encodeURIComponent(tx.toUpiId)}&pn=${encodeURIComponent(
                          tx.toName
                        )}&am=${tx.amount}&cu=INR&tn=GoaTripSettlement`
                      : null;

                    return (
                      <div
                        key={tx.id}
                        onClick={() => setSelectedTxId(tx.id)}
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

                {activeTx && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                    <span>
                      Paying <strong>{activeTx.toName}</strong> {formatCurrency(activeTx.amount)} will mark this debt as settled in your trip history.
                    </span>
                  </div>
                )}
              </div>
            )
          ) : (
            /* Tab 2: Advance Trip Fund / Pool Deposit */
            <form onSubmit={handleRecordDeposit} className="space-y-3.5">
              {depositError && (
                <div className="p-2.5 rounded-lg bg-rose-50 text-rose-600 text-xs font-semibold">
                  ⚠️ {depositError}
                </div>
              )}

              {/* Explainer card */}
              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-900 leading-relaxed">
                <span className="font-black block text-amber-950 mb-0.5">💡 How Advance Pooling Works:</span>
                Depositing ₹10,000 to the trip manager credits your tab. When the manager pays for the hotel or diesel, your share automatically deducts from your deposit!
              </div>

              {/* From Member */}
              <div>
                <label htmlFor="deposit-from-select" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Depositor (Who sent the money?)
                </label>
                <select
                  id="deposit-from-select"
                  name="depositFrom"
                  value={depositFromId}
                  onChange={(e) => setDepositFromId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#5bc5a7]"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} {m.id === currentUserId ? '(You)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* To Member (Treasurer) */}
              <div>
                <label htmlFor="deposit-to-select" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Recipient / Fund Manager (Who holds the cash?)
                </label>
                <select
                  id="deposit-to-select"
                  name="depositTo"
                  value={depositToId}
                  onChange={(e) => setDepositToId(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-[#5bc5a7]"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} {m.id === currentUserId ? '(You)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label htmlFor="deposit-amount-input" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Deposit Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                  <input
                    id="deposit-amount-input"
                    name="depositAmount"
                    type="number"
                    step="any"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="10000"
                    required
                    className="w-full bg-white border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-sm font-black text-slate-800 focus:outline-none focus:border-[#5bc5a7]"
                  />
                </div>

                {/* Quick preset chips */}
                <div className="flex items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Quick:</span>
                  {[2000, 5000, 10000, 15000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDepositAmount(amt.toString())}
                      className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 hover:bg-[#5bc5a7]/15 hover:text-[#28816a] text-slate-700 transition"
                    >
                      ₹{amt.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div>
                <label htmlFor="deposit-note-input" className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Note / Reference
                </label>
                <input
                  id="deposit-note-input"
                  name="depositNote"
                  type="text"
                  value={depositNote}
                  onChange={(e) => setDepositNote(e.target.value)}
                  placeholder="e.g. Hotel advance / trip pool"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#5bc5a7]"
                />
              </div>

              {/* Summary / UPI Preview */}
              {fromMember && recipientMember && numDepositAmt > 0 && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Transfer Summary</span>
                    <strong className="text-slate-800">{fromMember.name}</strong> ➡️ <strong className="text-slate-800">{recipientMember.name}</strong>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-sm text-[#28816a] block">
                      {formatCurrency(numDepositAmt)}
                    </span>
                    {depositUpiUrl && (
                      <a
                        href={depositUpiUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-[#5bc5a7] hover:underline"
                      >
                        <QrCode className="w-3 h-3" />
                        Pay via UPI
                      </a>
                    )}
                  </div>
                </div>
              )}
            </form>
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

          {tab === 'settle' ? (
            settlements.length > 0 && (
              <button
                type="button"
                onClick={handleSettleDebt}
                className="px-5 py-2 rounded-md text-xs font-bold bg-[#5bc5a7] hover:bg-[#48b396] text-white transition flex items-center gap-1.5 shadow-xs"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Record as Paid</span>
              </button>
            )
          ) : (
            <button
              type="button"
              onClick={handleRecordDeposit}
              className="px-5 py-2 rounded-md text-xs font-bold bg-[#ff652f] hover:bg-[#e55320] text-white transition flex items-center gap-1.5 shadow-xs"
            >
              <Wallet className="w-4 h-4 stroke-[2.5]" />
              <span>Record Deposit</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
