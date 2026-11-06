import React from 'react';
import type { Member } from '../types';
import { Users, Share2, Sparkles, RotateCcw } from 'lucide-react';

interface SplitwiseNavbarProps {
  members: Member[];
  currentUserId: string;
  onSelectCurrentUser: (id: string) => void;
  onOpenMembers: () => void;
  onOpenShare: () => void;
  onResetData: () => void;
  onLoadSample: () => void;
}

export const SplitwiseNavbar: React.FC<SplitwiseNavbarProps> = ({
  members,
  currentUserId,
  onSelectCurrentUser,
  onOpenMembers,
  onOpenShare,
  onResetData,
  onLoadSample,
}) => {
  return (
    <nav className="bg-[#5bc5a7] text-white shadow-md sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 h-13 sm:h-14 flex items-center justify-between">
        {/* Left: Splitwise Logo & Title */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/20 flex items-center justify-center p-1 shadow-inner shrink-0">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-full h-full text-white"
            >
              <polygon points="12 2 2 22 22 22" />
              <line x1="12" y1="2" x2="12" y2="22" />
            </svg>
          </div>
          <span className="font-black text-lg sm:text-xl tracking-tight text-white lowercase">
            splitwise
          </span>
          <span className="hidden sm:inline-block text-[11px] font-semibold bg-white/20 px-2 py-0.5 rounded-full text-white ml-1">
            🚗 Goa Road Trip
          </span>
        </div>

        {/* Right: User Switcher & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Active User Switcher */}
          <div className="flex items-center bg-black/15 hover:bg-black/25 px-2 py-1 rounded-lg text-xs font-semibold border border-white/20 transition">
            <select
              value={currentUserId}
              onChange={(e) => onSelectCurrentUser(e.target.value)}
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
              title="Reset all bills"
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
