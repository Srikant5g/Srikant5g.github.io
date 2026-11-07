import React, { useState } from 'react';
import type { Member, Group } from '../types';
import { Users, Share2, RotateCcw, ChevronDown, Tag, Plus, Trash2 } from 'lucide-react';

interface SplitwiseNavbarProps {
  members: Member[];
  currentUserId: string | null;
  onSelectCurrentUser: (id: string) => void;
  onOpenMembers: () => void;
  onOpenShare: () => void;
  onResetData: () => void;
  onLoadSample?: () => void;
  onOpenUserSelect: () => void;
  tripName?: string;
  groups?: Group[];
  activeGroupId?: string;
  onSelectGroup?: (id: string) => void;
  onOpenAddGroup?: () => void;
  onDeleteGroup?: (groupId: string) => void;
}

export const SplitwiseNavbar: React.FC<SplitwiseNavbarProps> = ({
  members,
  currentUserId,
  onOpenMembers,
  onOpenShare,
  onResetData,
  onOpenUserSelect,
  tripName = 'Goa',
  groups,
  activeGroupId,
  onSelectGroup,
  onOpenAddGroup,
  onDeleteGroup,
}) => {
  const [isGroupMenuOpen, setIsGroupMenuOpen] = useState(false);
  const currentUser = members.find((m) => m.id === currentUserId);

  return (
    <nav className="bg-[#145B4A] text-white sticky top-0 z-40 border-b border-[#0f4639] shadow-sm w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2 w-full">
        {/* Left: TripTally Logo & Tagline */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#78C5A7] flex items-center justify-center p-1.5 shadow-sm shrink-0">
            {/* TripTally Tally Vector */}
            <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
              <rect x="6" y="8" width="3" height="16" rx="1.5" fill="#145B4A" />
              <rect x="13" y="8" width="3" height="16" rx="1.5" fill="#145B4A" />
              <rect x="20" y="8" width="3" height="16" rx="1.5" fill="#145B4A" />
              <path d="M5 22L24 10" stroke="#FFFFFF" strokeWidth="2.8" strokeLinecap="round" />
              <circle cx="26" cy="8" r="2.5" fill="#FF784F" />
            </svg>
          </div>

          <div className="flex items-baseline gap-2 min-w-0">
            <span className="font-black text-lg sm:text-xl tracking-tight text-white font-sans shrink-0">
              Trip<span className="text-[#78C5A7]">Tally</span>
            </span>
            <span className="hidden lg:inline-block text-[11px] font-medium text-emerald-200/80 truncate">
              Every trip. Every expense. Sorted.
            </span>
            {groups && groups.length > 0 ? (
              <div className="relative inline-block">
                <button
                  type="button"
                  onClick={() => setIsGroupMenuOpen(!isGroupMenuOpen)}
                  className="flex items-center gap-1.5 text-[10px] font-bold bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded-full text-white/90 border border-white/10 transition active:scale-95"
                  title="Switch trip or create a new group"
                >
                  <Tag className="w-2.5 h-2.5 text-[#78C5A7]" />
                  <span className="truncate max-w-[80px] sm:max-w-[120px]">{tripName}</span>
                  <ChevronDown className="w-2.5 h-2.5 text-[#78C5A7]" />
                </button>
                {isGroupMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsGroupMenuOpen(false)} />
                    <div className="absolute left-0 mt-1.5 w-56 bg-white rounded-2xl shadow-xl border border-[#E4EAF0] p-1.5 z-50 text-[#192B3D] animate-in fade-in duration-100">
                      <div className="px-2.5 py-1 text-[10px] font-bold text-[#718096] uppercase tracking-wider">
                        Switch Trip / Group
                      </div>
                      <div className="space-y-0.5 max-h-48 overflow-y-auto">
                        {groups.map((g) => (
                          <div
                            key={g.id}
                            className={`group/navgrp w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-semibold text-left transition ${
                              g.id === activeGroupId
                                ? 'bg-[#145B4A] text-white font-bold'
                                : 'hover:bg-[#F7F8F5] text-[#192B3D]'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                onSelectGroup?.(g.id);
                                setIsGroupMenuOpen(false);
                              }}
                              className="flex items-center gap-2 truncate flex-1 text-left"
                            >
                              <span className="truncate">{g.name}</span>
                              {g.id === activeGroupId && <span className="w-1.5 h-1.5 rounded-full bg-[#78C5A7] shrink-0" />}
                            </button>

                            {onDeleteGroup && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setIsGroupMenuOpen(false);
                                  onDeleteGroup(g.id);
                                }}
                                className={`p-1 rounded-md transition opacity-40 hover:opacity-100 ${
                                  g.id === activeGroupId
                                    ? 'text-white/80 hover:text-rose-200 hover:bg-white/10'
                                    : 'text-[#718096] hover:text-rose-600 hover:bg-rose-50'
                                }`}
                                title={`Delete group "${g.name}" (Requires PIN)`}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      {onOpenAddGroup && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsGroupMenuOpen(false);
                            onOpenAddGroup();
                          }}
                          className="w-full mt-1 pt-1.5 border-t border-[#E4EAF0] flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-[#145B4A] hover:bg-[#78C5A7]/15 transition"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>+ Create New Group</span>
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <span className="hidden md:inline-block text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full text-white/90 border border-white/10 truncate">
                {tripName}
              </span>
            )}
          </div>
        </div>

        {/* Right: Active Profile Pill & Desktop Actions (Zero overflow on mobile!) */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Active Profile Button (Clicking opens clean UserSelectModal) */}
          <button
            type="button"
            onClick={onOpenUserSelect}
            className="flex items-center gap-1.5 bg-black/20 hover:bg-black/30 pl-1.5 pr-2 py-1 rounded-xl text-xs font-semibold border border-white/15 transition active:scale-95 shrink-0 max-w-[150px] sm:max-w-none"
            title="Tap to switch active profile"
          >
            <div className="w-5 h-5 rounded-full bg-[#78C5A7] text-[#145B4A] font-black text-[10px] flex items-center justify-center shrink-0">
              {currentUser ? currentUser.name.charAt(0) : '?'}
            </div>
            <span className="font-bold text-white text-xs truncate">
              {currentUser ? currentUser.name : 'Select Profile'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#78C5A7] shrink-0" />
          </button>

          {/* Friends (7) Button (Visible on tablet & desktop, managed in bottom nav on mobile) */}
          <button
            type="button"
            onClick={onOpenMembers}
            className="hidden sm:flex p-1.5 sm:px-2.5 sm:py-1 rounded-xl bg-white/10 hover:bg-white/20 transition text-xs font-semibold items-center gap-1.5 border border-white/10 shrink-0"
            title="Manage Trip Friends"
          >
            <Users className="w-3.5 h-3.5 text-[#78C5A7]" />
            <span>Friends ({members.length})</span>
          </button>

          {/* WhatsApp Share Button (Visible on tablet & desktop, in hero/totals on mobile) */}
          <button
            type="button"
            onClick={onOpenShare}
            className="hidden sm:flex p-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white transition text-xs font-bold items-center gap-1.5 shadow-sm active:scale-95 shrink-0"
            title="Share Trip Summary to WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5 fill-white" />
            <span>Share</span>
          </button>

          {/* Reset Action (Desktop only) */}
          <div className="hidden xl:flex items-center pl-2 border-l border-white/20 text-[11px] shrink-0">
            <button
              type="button"
              onClick={onResetData}
              className="hover:underline opacity-80 hover:opacity-100 flex items-center gap-1 text-rose-200 hover:text-white"
              title="Reset all bills (Requires Security PIN)"
            >
              <RotateCcw className="w-3 h-3" />
              Reset
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
