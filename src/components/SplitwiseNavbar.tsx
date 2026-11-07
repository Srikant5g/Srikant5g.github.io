import React from 'react';
import type { Member } from '../types';
import type { SyncStatus } from '../utils/cloudSync';
import { Users, Share2, Sparkles, RotateCcw, RefreshCw } from 'lucide-react';

interface SplitwiseNavbarProps {
  members: Member[];
  currentUserId: string;
  onSelectCurrentUser: (id: string) => void;
  onOpenMembers: () => void;
  onOpenShare: () => void;
  onResetData: () => void;
  onLoadSample: () => void;
  syncStatus?: SyncStatus;
  onManualSync?: () => void;
  onOpenWelcome: () => void;
}

export const SplitwiseNavbar: React.FC<SplitwiseNavbarProps> = ({
  members,
  currentUserId,
  onSelectCurrentUser,
  onOpenMembers,
  onOpenShare,
  onResetData,
  onLoadSample,
  syncStatus = 'synced',
  onManualSync,
  onOpenWelcome,
}) => {
  return (
    <nav className="bg-[#5bc5a7] text-white shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-13 sm:h-14 flex items-center justify-between">
        {/* Left: GoaTab Logo & Title */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center p-1.5 shadow-inner shrink-0 border border-white/30">
            <svg
              viewBox="0 0 32 32"
              fill="none"
              className="w-full h-full text-white"
            >
              <circle cx="16" cy="11" r="5" fill="#fde047" opacity="0.95" />
              <path
                d="M16 12C16 17 11 20 6 20M16 12C16 17 21 20 26 20M16 12C14 15 10 17 7 16M16 12C18 15 22 17 25 16M16 12V26"
                stroke="#ffffff"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <path
                d="M8 26C12 24 20 24 24 26"
                stroke="#67e8f9"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-black text-lg sm:text-xl tracking-tight text-white font-sans">
              Goa<span className="text-amber-300">Tab</span>
            </span>
            <span className="hidden sm:inline-block text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full text-white">
              🚗 Road Trip 2026
            </span>
          </div>

          {/* Real-time Cloud Sync Pill */}
          <button
            onClick={onManualSync}
            className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/15 hover:bg-white/25 transition text-[10px] font-medium border border-white/20 text-white ml-1"
            title="Real-time Cloud Sync active across Mac, Mobile & All Tabs (Click to refresh)"
          >
            {syncStatus === 'syncing' ? (
              <RefreshCw className="w-2.5 h-2.5 animate-spin text-amber-200" />
            ) : syncStatus === 'error' ? (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            ) : (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 shadow-[0_0_6px_rgba(110,231,183,0.9)] animate-pulse" />
            )}
            <span className="hidden xs:inline">
              {syncStatus === 'syncing' ? 'Syncing...' : 'Live Sync'}
            </span>
          </button>
        </div>

        {/* Right: User Switcher & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Active User Switcher */}
          <div className="flex items-center bg-black/15 hover:bg-black/25 px-2 py-1 rounded-lg text-xs font-semibold border border-white/20 transition">
            <label htmlFor="navbar-active-user-select" className="sr-only">
              Switch active friend
            </label>
            <select
              id="navbar-active-user-select"
              name="activeUser"
              value={currentUserId}
              onChange={(e) => onSelectCurrentUser(e.target.value)}
              aria-label="Switch active friend"
              className="bg-transparent text-white font-bold cursor-pointer focus:outline-none text-xs"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id} className="text-slate-900 bg-white">
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Friends (7) Button */}
          <button
            onClick={onOpenMembers}
            className="p-1.5 sm:px-2 sm:py-1 rounded-lg bg-white/15 hover:bg-white/25 transition text-xs font-semibold flex items-center gap-1"
            title="Manage Friends"
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Friends ({members.length})</span>
          </button>

          {/* Welcome / Trip Guide Button */}
          <button
            onClick={onOpenWelcome}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-white/20 hover:bg-white/30 transition text-xs font-bold flex items-center gap-1 border border-white/25 shadow-2xs active:scale-95"
            title="Open Goa Road Trip Welcome Guide & Thumbnail"
          >
            <span>🌴</span>
            <span className="hidden sm:inline">Welcome</span>
          </button>

          {/* WhatsApp Share Button */}
          <button
            onClick={onOpenShare}
            className="p-1.5 sm:px-2.5 sm:py-1 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-white transition text-xs font-bold flex items-center gap-1 shadow-xs"
            title="Share to WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          {/* Sample Data & Reset (Desktop only) */}
          <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-white/25 text-[11px]">
            <button
              onClick={onLoadSample}
              className="hover:underline flex items-center gap-1 opacity-90 hover:opacity-100"
              title="Reload sample bills for Road Trip"
            >
              <Sparkles className="w-3 h-3" />
              Sample
            </button>
            <span>•</span>
            <button
              onClick={onResetData}
              className="hover:underline opacity-90 hover:opacity-100 flex items-center gap-1"
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
