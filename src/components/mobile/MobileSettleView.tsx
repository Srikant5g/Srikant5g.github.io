import React, { useState } from 'react';
import type { DebtTransaction, Member } from '../../types';
import { formatCurrency } from '../../utils/settlement';
import { UpiPaymentActions } from '../UpiPaymentActions';
import { ArrowRight, Check, Sparkles } from 'lucide-react';

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

  const toggleCompleted = (id: string) => {
    setCompletedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-3.5 pb-32">
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

                {/* Row 2: Direct PhonePe & UPI Payment Actions */}
                {tx.toUpiId && !isDone && (
                  <div className="flex items-center justify-between pt-2.5 border-t border-[#E4EAF0] gap-2">
                    <span className="text-[11px] text-[#718096] truncate">
                      Pay to: <strong className="text-[#192B3D]">{tx.toName}</strong>
                    </span>

                    <UpiPaymentActions
                      params={{
                        upiId: tx.toUpiId,
                        name: tx.toName,
                        amount: tx.amount,
                        note: `TripTally Settlement to ${tx.toName}`,
                      }}
                    />
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
