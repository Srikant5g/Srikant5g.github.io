import React, { useState } from 'react';
import type { DebtTransaction, Member } from '../types';
import { formatCurrency } from '../utils/settlement';
import { copyToClipboard } from '../utils/clipboard';
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
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Deposit mode state
  const [depositFromId, setDepositFromId] = useState<string>(
    currentUserId || members[0]?.id || ''
  );
  const [depositToId, setDepositToId] = useState<string>(() => {
    const other = members.find((m) => m.id !== (currentUserId || members[0]?.id));
    return other ? other.id : members[1]?.id || members[0]?.id || '';
  });
  const [depositAmount, setDepositAmount] = useState<string>('10000');
  const [depositNote, setDepositNote] = useState<string>('Advance Fund Deposit / Pool Kitty');
  const [depositError, setDepositError] = useState<string | null>(null);

  if (!isOpen) return null;

  const activeTx =
    settlements.find((s) => s.id === selectedTxId) || settlements[0] || null;

  const handleSettleDebt = () => {
    if (!activeTx) return;
    onRecordPayment(activeTx.fromId, activeTx.toId, activeTx.amount);
    onClose();
  };

  const handleCopyUpi = async (e: React.MouseEvent, txId: string, upi: string) => {
    e.stopPropagation();
    await copyToClipboard(upi);
    setCopiedId(txId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRecordDeposit = (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
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
      depositNote.trim() || 'Advance Fund Deposit / Pool Kitty'
    );
    onClose();
  };

  const recipientMember = members.find((m) => m.id === depositToId);
  const numDepositAmt = parseFloat(depositAmount) || 0;

  const depositUpiUrl = recipientMember?.upiId && numDepositAmt > 0
    ? `upi://pay?pa=${encodeURIComponent(recipientMember.upiId)}&pn=${encodeURIComponent(
        recipientMember.name
      )}&am=${numDepositAmt}&cu=INR&tn=${encodeURIComponent(depositNote)}`
    : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white border border-[#E4EAF0] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden my-auto flex flex-col text-[#192B3D]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#145B4A] text-white flex items-center justify-between sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-black text-white m-0">Settle Up & Advance Pool</h2>
            <p className="text-xs text-[#78C5A7] mt-0.5">
              Clear debts or deposit advance money into the trip fund
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close settle modal"
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-[#E4EAF0] bg-[#F7F8F5] p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => setTab('settle')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              tab === 'settle'
                ? 'bg-white text-[#192B3D] shadow-xs border border-[#E4EAF0]'
                : 'text-[#718096] hover:text-[#192B3D]'
            }`}
          >
            <HandCoins className="w-4 h-4 text-[#145B4A]" />
            <span>Settle Debts ({settlements.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('deposit')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              tab === 'deposit'
                ? 'bg-white text-[#192B3D] shadow-xs border border-[#E4EAF0]'
                : 'text-[#718096] hover:text-[#192B3D]'
            }`}
          >
            <Wallet className="w-4 h-4 text-[#FF784F]" />
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
                <h3 className="font-bold text-[#192B3D] text-sm">Everyone is all settled!</h3>
                <p className="text-xs text-[#718096] mt-1 max-w-xs mx-auto">
                  No debts remaining. To deposit pooled money in advance to the trip manager, switch to <strong>Advance Trip Fund</strong> above.
                </p>
                <button
                  type="button"
                  onClick={() => setTab('deposit')}
                  className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-[#145B4A] text-white hover:bg-[#0f4437] transition shadow-xs"
                >
                  Deposit Advance to Trip Fund
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#718096]">
                  Choose a transfer to settle:
                </label>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {settlements.map((tx) => {
                    const isSelected = activeTx?.id === tx.id;
                    const upiUrl = tx.toUpiId
                      ? `upi://pay?pa=${encodeURIComponent(tx.toUpiId)}&pn=${encodeURIComponent(
                          tx.toName
                        )}&am=${tx.amount}&cu=INR&tn=TripTallySettlement`
                      : null;

                    return (
                      <div
                        key={tx.id}
                        onClick={() => setSelectedTxId(tx.id)}
                        className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                          isSelected
                            ? 'border-[#145B4A] bg-[#78C5A7]/10 ring-1 ring-[#145B4A]'
                            : 'border-[#E4EAF0] hover:bg-[#F7F8F5]'
                        }`}
                      >
                        <div className="flex items-center gap-2 text-xs">
                          <strong className="text-[#192B3D]">{tx.fromName}</strong>
                          <ArrowRight className="w-3.5 h-3.5 text-[#718096]" />
                          <strong className="text-[#192B3D]">{tx.toName}</strong>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-[#192B3D]">
                            {formatCurrency(tx.amount)}
                          </span>
                          {tx.toUpiId && (
                            <button
                              type="button"
                              onClick={(e) => handleCopyUpi(e, tx.id, tx.toUpiId!)}
                              className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-[#718096] bg-slate-100 hover:bg-slate-200 transition"
                              title="Copy UPI ID"
                            >
                              {copiedId === tx.id ? 'Copied' : 'Copy'}
                            </button>
                          )}
                          {upiUrl && (
                            <a
                              href={upiUrl}
                              onClick={(e) => e.stopPropagation()}
                              className="px-2 py-0.5 rounded-lg bg-[#145B4A] text-white text-[10px] font-bold flex items-center gap-0.5"
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
                  <div className="mt-4 pt-3 border-t border-[#E4EAF0] space-y-3">
                    <div className="p-3 bg-[#F7F8F5] rounded-2xl text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-[#718096]">Selected Settlement:</span>
                        <span className="font-bold text-[#192B3D]">
                          {activeTx.fromName} ➡️ {activeTx.toName}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[#718096]">Amount:</span>
                        <span className="font-black text-[#145B4A] text-sm">
                          {formatCurrency(activeTx.amount)}
                        </span>
                      </div>
                      {activeTx.toUpiId && (
                        <div className="flex justify-between">
                          <span className="text-[#718096]">Recipient UPI:</span>
                          <span className="font-mono text-[#192B3D]">
                            {activeTx.toUpiId}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border border-[#E4EAF0] text-xs font-bold text-[#718096] hover:bg-[#F7F8F5] transition"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={handleSettleDebt}
                        className="flex-1 py-2.5 rounded-xl bg-[#145B4A] hover:bg-[#0f4437] text-white text-xs font-black transition flex items-center justify-center gap-1.5 shadow-xs"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Record as Paid</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          ) : (
            /* Tab 2: Advance Trip Fund / Kitty Pool */
            <form onSubmit={handleRecordDeposit} className="space-y-4">
              <div className="p-3 rounded-2xl bg-[#78C5A7]/10 border border-[#78C5A7]/30 text-xs text-[#145B4A] space-y-1">
                <strong className="block font-bold">Advance Pool / Trip Kitty:</strong>
                <p className="text-[11px] leading-relaxed">
                  Record advance money deposited to a trip organizer (e.g. ₹10,000 for hotel/fuel). This records that <em>{recipientMember?.name}</em> owes the payer back until expenses are logged!
                </p>
              </div>

              {depositError && (
                <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {depositError}
                </div>
              )}

              {/* Who deposited */}
              <div>
                <label className="block text-xs font-bold text-[#718096] mb-1">
                  Who is depositing money?
                </label>
                <select
                  value={depositFromId}
                  onChange={(e) => setDepositFromId(e.target.value)}
                  className="w-full text-xs font-bold px-3 py-2.5 rounded-xl border border-[#E4EAF0] bg-white text-[#192B3D] focus:outline-none focus:border-[#145B4A]"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} {m.id === currentUserId ? '(You)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Who received the fund */}
              <div>
                <label className="block text-xs font-bold text-[#718096] mb-1">
                  Who received the money (Fund Manager)?
                </label>
                <select
                  value={depositToId}
                  onChange={(e) => setDepositToId(e.target.value)}
                  className="w-full text-xs font-bold px-3 py-2.5 rounded-xl border border-[#E4EAF0] bg-white text-[#192B3D] focus:outline-none focus:border-[#145B4A]"
                >
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} {m.upiId ? `(${m.upiId})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-bold text-[#718096] mb-1">
                  Deposit Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-[#718096]">₹</span>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="10000"
                    className="w-full pl-8 pr-3 py-2.5 text-base font-black rounded-xl border border-[#E4EAF0] bg-white text-[#192B3D] focus:outline-none focus:border-[#145B4A]"
                  />
                </div>
              </div>

              {/* Note */}
              <div>
                <label className="block text-xs font-bold text-[#718096] mb-1">
                  Description / Note
                </label>
                <input
                  type="text"
                  value={depositNote}
                  onChange={(e) => setDepositNote(e.target.value)}
                  placeholder="Villa deposit / Food kitty fund"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E4EAF0] bg-white text-[#192B3D] focus:outline-none focus:border-[#145B4A]"
                />
              </div>

              {/* Pay via UPI shortcut if recipient has UPI ID */}
              {depositUpiUrl && (
                <div className="p-3 bg-[#F7F8F5] rounded-xl border border-[#E4EAF0] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[#718096] block text-[11px]">Pay directly via UPI:</span>
                    <strong className="text-[#192B3D]">{recipientMember?.upiId}</strong>
                  </div>
                  <a
                    href={depositUpiUrl}
                    className="px-3 py-1.5 rounded-lg bg-[#145B4A] hover:bg-[#0f4437] text-white text-xs font-bold flex items-center gap-1 shadow-xs transition"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Pay {formatCurrency(numDepositAmt)}</span>
                  </a>
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t border-[#E4EAF0]">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-[#E4EAF0] text-xs font-bold text-[#718096] hover:bg-[#F7F8F5] transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#145B4A] hover:bg-[#0f4437] text-white text-xs font-black transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Save Advance Deposit</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
