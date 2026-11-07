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
    <aside className="hidden md:block md:w-56 shrink-0 space-y-6 text-sm text-[#333333]">
      {/* Primary Links */}
      <div className="space-y-0.5">
        <button
          onClick={() => {
            onSelectFriend(null);
            onChangeView('dashboard');
          }}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition text-left ${
            activeView === 'dashboard' && selectedFriendId === null
              ? 'bg-[#0d9488]/15 text-[#0f766e] font-bold border-l-4 border-[#0d9488]'
              : 'hover:bg-slate-200/70 text-slate-700'
          }`}
        >
          <LayoutDashboard className="w-4 h-4 text-[#0d9488]" />
          <span>Dashboard</span>
        </button>

        <button
          onClick={() => {
            onSelectFriend(null);
            onChangeView('recent');
          }}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition text-left ${
            activeView === 'recent'
              ? 'bg-[#0d9488]/15 text-[#0f766e] font-bold border-l-4 border-[#0d9488]'
              : 'hover:bg-slate-200/70 text-slate-700'
          }`}
        >
          <Activity className="w-4 h-4 text-[#e05320]" />
          <span>Recent Activity</span>
        </button>

        <button
          onClick={() => {
            onSelectFriend(null);
            onChangeView('all');
          }}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium transition text-left ${
            activeView === 'all' && selectedFriendId === null
              ? 'bg-[#0d9488]/15 text-[#0f766e] font-bold border-l-4 border-[#0d9488]'
              : 'hover:bg-slate-200/70 text-slate-700'
          }`}
        >
          <Receipt className="w-4 h-4 text-slate-500" />
          <span>All Expenses</span>
        </button>
      </div>

      {/* GROUPS Section */}
      <div>
        <div className="flex items-center justify-between px-3 mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <span>Groups</span>
          <span className="text-[10px] text-slate-400">1 active</span>
        </div>

        <button
          onClick={() => {
            onSelectFriend(null);
            onChangeView('all');
          }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-slate-800 bg-white border border-slate-200 shadow-sm text-left"
        >
          <Tag className="w-3.5 h-3.5 text-[#5bc5a7]" />
          <span className="truncate">🚗 Goa Road Trip</span>
        </button>
      </div>

      {/* FRIENDS Section (The 7 Friends) */}
      <div>
        <div className="flex items-center justify-between px-3 mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <span>Friends ({members.length})</span>
          <button
            onClick={onOpenMembers}
            className="text-[#0d9488] hover:underline font-bold text-xs"
            title="Configure UPI IDs"
          >
            UPI IDs
          </button>
        </div>

        <div className="space-y-0.5">
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
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition text-left text-xs ${
                  isSelected
                    ? 'bg-[#0d9488]/15 text-[#0f766e] font-bold border-l-4 border-[#0d9488]'
                    : 'hover:bg-slate-200/60 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-6 h-6 rounded-full ${member.avatarColor} text-white font-bold flex items-center justify-center text-[10px] shrink-0 shadow-xs`}
                  >
                    {member.name.charAt(0)}
                  </div>
                  <span className="truncate">
                    {member.name}{isMe && <span className="text-slate-400 font-normal ml-1"> (you)</span>}
                  </span>
                </div>

                <div className="shrink-0 pl-1 text-[11px] font-semibold text-right">
                  {net > 0.01 && (
                    <span className="text-[#0d9488]">
                      +{formatCurrency(net)}
                    </span>
                  )}
                  {net < -0.01 && (
                    <span className="text-[#e05320]">
                      -{formatCurrency(Math.abs(net))}
                    </span>
                  )}
                  {Math.abs(net) <= 0.01 && (
                    <span className="text-slate-400">settled</span>
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
