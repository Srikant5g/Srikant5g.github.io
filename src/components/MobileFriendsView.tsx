import React from 'react';
import type { Member, MemberBalance } from '../types';
import { formatCurrency } from '../utils/settlement';
import { UserPlus, ArrowDownLeft, ArrowUpRight, CheckCircle2 } from 'lucide-react';

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
  const balanceMap = new Map<string, number>();
  balances.forEach((b) => balanceMap.set(b.memberId, b.netBalance));

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-4 pb-24 md:pb-4 w-full">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <h2 className="text-base font-bold text-slate-800 m-0">Goa Friends ({members.length})</h2>
          <p className="text-xs text-slate-400 mt-0.5">Tap any friend to see shared expenses</p>
        </div>
        <button
          onClick={onOpenMembers}
          className="px-3 py-1.5 rounded-lg bg-[#5bc5a7] text-white text-xs font-bold flex items-center gap-1 shadow-2xs"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Edit</span>
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
                    {member.name} {isMe && <span className="text-slate-400 font-normal">(you)</span>}
                  </h4>
                  {member.upiId && (
                    <p className="text-[11px] text-slate-400 font-mono truncate">
                      {member.upiId}
                    </p>
                  )}
                </div>
              </div>

              <div className="text-right shrink-0">
                {isCreditor && (
                  <span className="inline-flex items-center gap-0.5 text-xs font-bold text-[#5bc5a7] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                    <ArrowDownLeft className="w-3 h-3" />
                    +{formatCurrency(net)}
                  </span>
                )}
                {isDebtor && (
                  <span className="inline-flex items-center gap-0.5 text-xs font-bold text-[#ff652f] bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
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

