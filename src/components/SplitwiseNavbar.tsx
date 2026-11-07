import React from 'react';
import type { Member } from '../types';
import type { SyncStatus } from '../utils/cloudSync';
import { Users, Share2, Sparkles, RotateCcw, RefreshCw, ChevronDown } from 'lucide-react';

interface SplitwiseNavbarProps {
  members: Member[];
  currentUserId: string | null;
  onSelectCurrentUser: (id: string) => void;
  onOpenMembers: () => void;
  onOpenShare: () => void;
  onResetData: () => void;
  onLoadSample: () => void;
  syncStatus?: SyncStatus;
  onManualSync?: () => void;
  onOpenUserSelect: () => void;
  tripName?: string;
}

export const SplitwiseNavbar: React.FC<SplitwiseNavbarProps> = ({
  members,
  currentUserId,
  onOpenMembers,
  onOpenShare,
  onResetData,
  onLoadSample,
  syncStatus = 'synced',
  onManualSync,
  onOpenUserSelect,
  tripName = 'Road Trip 2026',
}) => {
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
            <span className="hidden md:inline-block text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded-full text-white/90 border border-white/10 truncate">
              {tripName}
            </span>
          </div>

          {/* Real-time Cloud Sync Dot/Pill */}
          <button
            type="button"
            onClick={onManualSync}
            className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/10 hover:bg-white/20 transition text-[11px] font-medium border border-white/15 text-white shrink-0"
            title="Real-time Cloud Sync active (Click to refresh)"
          >
            {syncStatus === 'syncing' ? (
              <RefreshCw className="w-2.5 h-2.5 animate-spin text-amber-200" />
            ) : syncStatus === 'error' ? (
              <span className="w-2 h-2 rounded-full bg-rose-400" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-[#78C5A7] shadow-[0_0_8px_rgba(120,197,167,0.9)] animate-pulse" />
            )}
            <span className="hidden sm:inline">Live Sync</span>
          </button>
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

          {/* Sample Data & Reset (Desktop only) */}
          <div className="hidden xl:flex items-center gap-2 pl-2 border-l border-white/20 text-[11px] shrink-0">
            <button
              type="button"
              onClick={onLoadSample}
              className="hover:underline flex items-center gap-1 opacity-80 hover:opacity-100"
              title="Reload sample expenses"
            >
              <Sparkles className="w-3 h-3 text-[#78C5A7]" />
              Sample
            </button>
            <span className="text-white/40">•</span>
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
