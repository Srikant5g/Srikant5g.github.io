import React, { useState } from 'react';
import type { Member, MemberBalance } from '../types';
import { formatCurrency } from '../utils/settlement';
import { copyToClipboard } from '../utils/clipboard';
import { ArrowDownLeft, ArrowUpRight, CheckCircle2, Copy, Check, QrCode, UserPlus, Edit2 } from 'lucide-react';

interface MobileFriendsViewProps {
  members: Member[];
  balances: MemberBalance[];
  currentUserId: string | null;
  selectedFriendId: string | null;
  onSelectFriend: (id: string | null) => void;
  onOpenMembers: () => void;
  onOpenAddFriend?: () => void;
  onEditFriend?: (member: Member) => void;
}

export const MobileFriendsView: React.FC<MobileFriendsViewProps> = ({
  members,
  balances,
  currentUserId,
  selectedFriendId,
  onSelectFriend,
  onOpenMembers,
  onOpenAddFriend,
  onEditFriend,
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
    <div className="bg-white border border-[#E4EAF0] rounded-3xl p-4 sm:p-5 shadow-xs space-y-4 pb-32 md:pb-4 w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#E4EAF0] pb-3 gap-2">
        <div className="min-w-0">
          <h2 className="text-base font-black text-[#192B3D] m-0">Trip Friends ({members.length})</h2>
          <p className="text-xs text-[#718096] mt-0.5 truncate">Tap any friend to filter shared expenses</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {onOpenAddFriend && (
            <button
              onClick={onOpenAddFriend}
              className="px-3 py-1.5 rounded-xl bg-[#78C5A7]/20 hover:bg-[#78C5A7]/30 text-[#145B4A] border border-[#78C5A7]/40 text-xs font-bold flex items-center gap-1 transition active:scale-95"
              title="Add a new friend"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Friend</span>
            </button>
          )}
          <button
            onClick={onOpenMembers}
            className="px-3 py-1.5 rounded-xl bg-[#145B4A] hover:bg-[#0f4437] text-white text-xs font-bold flex items-center gap-1 shadow-xs transition active:scale-95"
            title="Configure UPI IDs for 1-click payments"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>UPI IDs</span>
          </button>
        </div>
      </div>

      {/* Friends Cards */}
      <div className="space-y-2.5">
        {members.map((member) => {
          const isMe = Boolean(currentUserId && member.id === currentUserId);
          const isSelected = selectedFriendId === member.id;
          const net = balanceMap.get(member.id) || 0;
          const isCreditor = net > 0.01;
          const isDebtor = net < -0.01;

          return (
            <div
              key={member.id}
              onClick={() => onSelectFriend(isSelected ? null : member.id)}
              className={`p-3.5 rounded-2xl border transition flex items-center justify-between cursor-pointer ${
                isSelected
                  ? 'border-[#145B4A] bg-[#78C5A7]/15 ring-1 ring-[#145B4A]'
                  : 'border-[#E4EAF0] hover:bg-[#F7F8F5]'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-2xl ${member.avatarColor} text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-xs`}
                >
                  {member.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-[#192B3D] text-sm truncate">
                      {member.name}{isMe && <span className="text-[#718096] font-normal ml-1"> (you)</span>}
                    </h4>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditFriend?.(member);
                      }}
                      className="p-1 rounded-lg text-[#718096] hover:text-[#145B4A] hover:bg-[#78C5A7]/20 transition shrink-0"
                      title={`Edit ${member.name}'s UPI ID & details`}
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                  {member.upiId ? (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <p className="text-[11px] text-[#718096] font-mono truncate max-w-[130px] sm:max-w-[180px]">
                        {member.upiId}
                      </p>
                      <button
                        type="button"
                        onClick={(e) => handleCopyUpi(e, member.id, member.upiId!)}
                        className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-[#718096] hover:text-[#192B3D] bg-[#F7F8F5] border border-[#E4EAF0] hover:bg-slate-200 transition flex items-center gap-0.5 shrink-0"
                        title="Copy UPI ID"
                      >
                        {copiedId === member.id ? (
                          <>
                            <Check className="w-2.5 h-2.5 text-[#145B4A] stroke-[3]" />
                            <span className="text-[#145B4A] font-bold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-2.5 h-2.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditFriend?.(member);
                        }}
                        className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-[#145B4A] bg-[#78C5A7]/20 border border-[#78C5A7]/40 hover:bg-[#78C5A7]/30 transition flex items-center gap-0.5 shrink-0"
                        title="Edit UPI ID"
                      >
                        <Edit2 className="w-2.5 h-2.5" />
                        <span>Edit UPI</span>
                      </button>
                    </div>
                  ) : (
                    <div className="mt-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditFriend?.(member);
                        }}
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-[#145B4A] hover:underline bg-[#78C5A7]/15 border border-dashed border-[#78C5A7]/50 px-2 py-0.5 rounded-lg"
                      >
                        <Edit2 className="w-2.5 h-2.5" />
                        <span>+ Add UPI ID</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0">
                {isCreditor && (
                  <span className="inline-flex items-center gap-1 text-xs font-black text-[#145B4A] bg-[#78C5A7]/20 px-2.5 py-1 rounded-full border border-[#78C5A7]/40">
                    <ArrowDownLeft className="w-3 h-3 stroke-[2.5]" />
                    +{formatCurrency(net)}
                  </span>
                )}
                {isDebtor && (
                  <span className="inline-flex items-center gap-1 text-xs font-black text-[#FF784F] bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                    <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                    -{formatCurrency(Math.abs(net))}
                  </span>
                )}
                {!isCreditor && !isDebtor && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-[#718096] bg-[#F7F8F5] px-2.5 py-1 rounded-full border border-[#E4EAF0]">
                    <CheckCircle2 className="w-3 h-3 text-[#145B4A]" />
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
