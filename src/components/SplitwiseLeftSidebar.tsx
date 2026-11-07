import React from 'react';
import type { Member, MemberBalance } from '../types';
import { formatCurrency } from '../utils/settlement';
import { LayoutDashboard, Receipt, Activity, Tag } from 'lucide-react';

interface SplitwiseLeftSidebarProps {
  members: Member[];
  balances: MemberBalance[];
  currentUserId: string;
  selectedFriendId: string | null;
  onSelectFriend: (id: string | null) => void;
  activeView: 'dashboard' | 'all' | 'recent';
  onChangeView: (v: 'dashboard' | 'all' | 'recent') => void;
  onOpenMembers: () => void;
}

export const SplitwiseLeftSidebar: React.FC<SplitwiseLeftSidebarProps> = ({
  members,
  balances,
  currentUserId,
  selectedFriendId,
  onSelectFriend,
  activeView,
  onChangeView,
  onOpenMembers,
}) => {
  const balanceMap = new Map<string, number>();
  balances.forEach((b) => balanceMap.set(b.memberId, b.netBalance));

  return (
    <aside className="hidden md:block md:w-56 shrink-0 space-y-6 text-sm text-[#192B3D]">
      {/* Primary Links */}
      <div className="space-y-1">
        <button
          onClick={() => {
            onSelectFriend(null);
            onChangeView('dashboard');
          }}
          className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-medium transition text-left ${
            activeView === 'dashboard' && selectedFriendId === null
              ? 'bg-[#145B4A] text-white font-bold shadow-xs'
              : 'hover:bg-white text-[#718096] hover:text-[#192B3D]'
          }`}
        >
          <LayoutDashboard className={`w-4 h-4 ${activeView === 'dashboard' && selectedFriendId === null ? 'text-[#78C5A7]' : 'text-[#718096]'}`} />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => {
            onSelectFriend(null);
            onChangeView('recent');
          }}
          className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-medium transition text-left ${
            activeView === 'recent'
              ? 'bg-[#145B4A] text-white font-bold shadow-xs'
              : 'hover:bg-white text-[#718096] hover:text-[#192B3D]'
          }`}
        >
          <Activity className={`w-4 h-4 ${activeView === 'recent' ? 'text-[#78C5A7]' : 'text-[#FF784F]'}`} />
          <span>Recent Activity</span>
        </button>

        <button
          onClick={() => {
            onSelectFriend(null);
            onChangeView('all');
          }}
          className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl font-medium transition text-left ${
            activeView === 'all' && selectedFriendId === null
              ? 'bg-[#145B4A] text-white font-bold shadow-xs'
              : 'hover:bg-white text-[#718096] hover:text-[#192B3D]'
          }`}
        >
          <Receipt className={`w-4 h-4 ${activeView === 'all' && selectedFriendId === null ? 'text-[#78C5A7]' : 'text-[#718096]'}`} />
          <span>All Expenses</span>
        </button>
      </div>

      {/* GROUPS Section */}
      <div>
        <div className="flex items-center justify-between px-3 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-[#718096]">
          <span>Active Trip</span>
          <span className="text-[10px] text-[#145B4A] bg-[#78C5A7]/20 px-2 py-0.5 rounded-full font-bold">1 active</span>
        </div>

        <button
          onClick={() => {
            onSelectFriend(null);
            onChangeView('all');
          }}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl font-semibold text-[#192B3D] bg-white border border-[#E4EAF0] shadow-2xs hover:border-[#78C5A7] transition text-left"
        >
          <Tag className="w-3.5 h-3.5 text-[#145B4A]" />
          <span className="truncate">TripTally Group</span>
        </button>
      </div>

      {/* FRIENDS Section (The 7 Friends) */}
      <div>
        <div className="flex items-center justify-between px-3 mb-1.5 text-[11px] font-bold uppercase tracking-wider text-[#718096]">
          <span>Friends ({members.length})</span>
          <button
            onClick={onOpenMembers}
            className="text-[#145B4A] hover:underline font-bold text-xs"
            title="Configure UPI IDs"
          >
            UPI IDs
          </button>
        </div>

        <div className="space-y-1">
          {members.map((member) => {
            const isMe = member.id === currentUserId;
            const isSelected = selectedFriendId === member.id;
            const net = balanceMap.get(member.id) || 0;

            return (
              <button
                key={member.id}
                onClick={() =>
                  onSelectFriend(isSelected ? null : member.id)
                }
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition text-left text-xs ${
                  isSelected
                    ? 'bg-[#78C5A7]/20 text-[#145B4A] font-bold border border-[#78C5A7]/40'
                    : 'hover:bg-white text-[#718096] hover:text-[#192B3D]'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-full ${member.avatarColor} text-white font-bold flex items-center justify-center text-[10px] shrink-0 shadow-xs`}
                  >
                    {member.name.charAt(0)}
                  </div>
                  <span className="truncate">
                    {member.name}{isMe && <span className="text-[#718096] font-normal ml-1"> (you)</span>}
                  </span>
                </div>

                <div className="shrink-0 pl-1 text-[11px] font-semibold text-right">
                  {net > 0.01 && (
                    <span className="text-[#145B4A] font-bold">
                      +{formatCurrency(net)}
                    </span>
                  )}
                  {net < -0.01 && (
                    <span className="text-[#FF784F] font-bold">
                      -{formatCurrency(Math.abs(net))}
                    </span>
                  )}
                  {Math.abs(net) <= 0.01 && (
                    <span className="text-[#718096]">settled</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};
