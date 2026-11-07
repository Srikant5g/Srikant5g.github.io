import React, { useState } from 'react';
import type { DebtTransaction, Member } from '../../types';
import { formatCurrency } from '../../utils/settlement';
import { copyToClipboard } from '../../utils/clipboard';
import { UpiPaymentActions } from '../UpiPaymentActions';
import { ArrowRight, Check, Sparkles, Copy } from 'lucide-react';

interface MobileSettleViewProps {
  settlements: DebtTransaction[];
  currentUserId: string | null;
  members?: Member[];
  onEditFriend?: (member: Member) => void;
}

export const MobileSettleView: React.FC<MobileSettleViewProps> = ({
  settlements,
  currentUserId,
  members = [],
  onEditFriend,
}) => {
  const [completedMap, setCompletedMap] = useState<Record<string, boolean>>({});
  const [copiedUpiId, setCopiedUpiId] = useState<string | null>(null);

  const toggleCompleted = (id: string) => {
    setCompletedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyUpi = async (txId: string, upi: string) => {
    await copyToClipboard(upi);
    setCopiedUpiId(txId);
    setTimeout(() => setCopiedUpiId(null), 2000);
  };

  return (
    <div className="space-y-3.5 pb-36">
      {/* Top Banner (Clean White Fintech Style) */}
      <div className="bg-white border border-[#E4EAF0] rounded-3xl p-4 sm:p-5 text-[#192B3D] shadow-xs">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-[#78C5A7]/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#145B4A]" />
          </div>
          <h2 className="text-base font-black text-[#192B3D] m-0">
            Simplified Debt Settlements
          </h2>
        </div>
        <p className="text-xs text-[#718096] mt-1 leading-relaxed">
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
            const isYouPaying = Boolean(currentUserId && tx.fromId === currentUserId);
            const isYouReceiving = Boolean(currentUserId && tx.toId === currentUserId);

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

                      {tx.toUpiId ? (
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <p className="text-[11px] text-[#718096] font-mono">
                            UPI: {tx.toUpiId}
                          </p>
                          {onEditFriend && (() => {
                            const toMember = members.find((m) => m.id === tx.toId);
                            return toMember ? (
                              <button
                                type="button"
                                onClick={() => onEditFriend(toMember)}
                                className="text-[10px] font-semibold text-[#145B4A] hover:underline"
                              >
                                Edit
                              </button>
                            ) : null;
                          })()}
                        </div>
                      ) : (
                        onEditFriend && (() => {
                          const toMember = members.find((m) => m.id === tx.toId);
                          return toMember ? (
                            <button
                              type="button"
                              onClick={() => onEditFriend(toMember)}
                              className="text-[10px] font-bold text-[#145B4A] hover:underline bg-[#78C5A7]/15 px-1.5 py-0.5 rounded mt-0.5"
                            >
                              + Set UPI ID
                            </button>
                          ) : null;
                        })()
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

                {/* Row 2: Action Buttons (Context-Aware for Payer vs Recipient) */}
                {!isDone && (
                  <div className="pt-2.5 border-t border-[#E4EAF0]">
                    {isYouReceiving ? (
                      /* Context: YOU are receiving money from this friend */
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-semibold">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          <span className="truncate">Awaiting payment from {tx.fromName}</span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {tx.toUpiId && (
                            <button
                              type="button"
                              onClick={() => handleCopyUpi(tx.id, tx.toUpiId!)}
                              className="px-2.5 py-1 rounded-xl bg-[#F7F8F5] border border-[#E4EAF0] hover:bg-slate-200 text-[#192B3D] text-[11px] font-bold flex items-center gap-1 transition active:scale-95"
                              title="Copy your UPI ID to share in chat"
                            >
                              {copiedUpiId === tx.id ? (
                                <>
                                  <Check className="w-3 h-3 text-[#145B4A] stroke-[3]" />
                                  <span className="text-[#145B4A]">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3 h-3 text-[#718096]" />
                                  <span>Copy My UPI</span>
                                </>
                              )}
                            </button>
                          )}

                          <a
                            href={`https://wa.me/?text=${encodeURIComponent(
                              `Hi ${tx.fromName}, please settle your TripTally balance of ${formatCurrency(
                                tx.amount
                              )} with me via UPI: ${tx.toUpiId || ''}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1 rounded-xl bg-[#25D366] hover:bg-[#1fb855] text-white text-[11px] font-bold flex items-center gap-1 shadow-2xs transition active:scale-95"
                            title="Remind friend on WhatsApp"
                          >
                            <span>💬 Remind</span>
                          </a>
                        </div>
                      </div>
                    ) : isYouPaying ? (
                      /* Context: YOU owe money to this friend -> Direct 1-tap Pay */
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] text-[#718096] truncate">
                          Pay to: <strong className="text-[#192B3D]">{tx.toName}</strong>
                        </span>

                        {tx.toUpiId ? (
                          <UpiPaymentActions
                            params={{
                              upiId: tx.toUpiId,
                              name: tx.toName,
                              amount: tx.amount,
                              note: `TripTally Settlement to ${tx.toName}`,
                            }}
                          />
                        ) : (
                          <span className="text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 font-medium">
                            No UPI ID set for {tx.toName}
                          </span>
                        )}
                      </div>
                    ) : (
                      /* Context: Debt between two other friends */
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] text-[#718096] truncate">
                          Direct transfer between friends
                        </span>

                        {tx.toUpiId && (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleCopyUpi(tx.id, tx.toUpiId!)}
                              className="px-2 py-1 rounded-xl bg-[#F7F8F5] border border-[#E4EAF0] hover:bg-slate-200 text-[#192B3D] text-[10px] font-bold flex items-center gap-1 transition active:scale-95"
                              title={`Copy ${tx.toName}'s UPI ID`}
                            >
                              {copiedUpiId === tx.id ? (
                                <>
                                  <Check className="w-2.5 h-2.5 text-[#145B4A] stroke-[3]" />
                                  <span className="text-[#145B4A]">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-2.5 h-2.5 text-[#718096]" />
                                  <span>Copy UPI</span>
                                </>
                              )}
                            </button>

                            <UpiPaymentActions
                              params={{
                                upiId: tx.toUpiId,
                                name: tx.toName,
                                amount: tx.amount,
                                note: `TripTally Settlement from ${tx.fromName} to ${tx.toName}`,
                              }}
                              size="sm"
                            />
                          </div>
                        )}
                      </div>
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
