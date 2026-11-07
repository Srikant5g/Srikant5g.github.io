import React, { useState } from 'react';
import type { Member, MemberBalance } from '../types';
import { formatCurrency } from '../utils/settlement';
import { copyToClipboard } from '../utils/clipboard';
import { ArrowDownLeft, ArrowUpRight, CheckCircle2, Copy, Check } from 'lucide-react';

interface MobileFriendsViewProps {
  members: Member[];
  balances: MemberBalance[];
  currentUserId: string;
  selectedFriendId: string | null;
  onSelectFriend: (id: string | null) => void;
  onOpenMembers: () => void;
}

export const MobileFriendsView: React.FC<MobileFriendsViewProps> = ({
  members,
  balances,
  currentUserId,
  selectedFriendId,
  onSelectFriend,
  onOpenMembers,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const balanceMap = new Map<string, number>();
  balances.forEach((b) => balanceMap.set(b.memberId, b.netBalance));

  const handleCopyUpi = async (e: React.MouseEvent, memberId: string, upi: string) => {
    e.stopPropagation();
    await copyToClipboard(upi);
    setCopiedId(memberId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-4 pb-32 md:pb-4 w-full">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-base font-bold text-slate-800 m-0">Road Trip Friends ({members.length})</h2>
          <p className="text-xs text-slate-400 mt-0.5">Tap any friend to see shared expenses</p>
        </div>
        <button
          onClick={onOpenMembers}
          className="px-3 py-1.5 rounded-lg bg-[#5bc5a7] hover:bg-[#48b396] text-white text-xs font-bold flex items-center gap-1 shadow-2xs"
          title="Configure UPI IDs for 1-click payments"
        >
          <span>UPI IDs</span>
        </button>
      </div>

      <div className="space-y-2">
        {members.map((member) => {
          const isMe = member.id === currentUserId;
          const isSelected = selectedFriendId === member.id;
          const net = balanceMap.get(member.id) || 0;
          const isCreditor = net > 0.01;
          const isDebtor = net < -0.01;

          return (
            <div
              key={member.id}
              onClick={() => onSelectFriend(isSelected ? null : member.id)}
              className={`p-3 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                isSelected
                  ? 'border-[#5bc5a7] bg-[#5bc5a7]/10 ring-1 ring-[#5bc5a7]'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-full ${member.avatarColor} text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-xs`}
                >
                  {member.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-slate-800 text-sm truncate">
                    {member.name}{isMe && <span className="text-slate-400 font-normal ml-1"> (you)</span>}
                  </h4>
                  {member.upiId && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <p className="text-[11px] text-slate-400 font-mono truncate">
                        {member.upiId}
                      </p>
                      <button
                        type="button"
                        onClick={(e) => handleCopyUpi(e, member.id, member.upiId!)}
                        className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 transition flex items-center gap-0.5 shrink-0"
                        title="Copy UPI ID"
                      >
                        {copiedId === member.id ? (
                          <>
                            <Check className="w-2.5 h-2.5 text-emerald-600 stroke-[3]" />
                            <span className="text-emerald-700">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-2.5 h-2.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0">
                {isCreditor && (
                  <span className="inline-flex items-center gap-0.5 text-xs font-bold text-[#0d9488] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    <ArrowDownLeft className="w-3 h-3" />
                    +{formatCurrency(net)}
                  </span>
                )}
                {isDebtor && (
                  <span className="inline-flex items-center gap-0.5 text-xs font-bold text-[#e05320] bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                    <ArrowUpRight className="w-3 h-3" />
                    -{formatCurrency(Math.abs(net))}
                  </span>
                )}
                {!isCreditor && !isDebtor && (
                  <span className="inline-flex items-center gap-0.5 text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" />
                    Settled
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

