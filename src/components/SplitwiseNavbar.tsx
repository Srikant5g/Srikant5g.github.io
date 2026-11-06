import React from 'react';
import type { Member, TripSettings } from '../types';
import { Users, Share2, Sparkles, RotateCcw } from 'lucide-react';

interface SplitwiseNavbarProps {
  settings: TripSettings;
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
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Left: Splitwise Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 cursor-pointer select-none">
            {/* Splitwise iconic logo shape */}
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center p-1.5 shadow-inner">
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
            <span className="font-black text-xl tracking-tight text-white font-sans lowercase">
              splitwise
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-white/25">
            <span className="text-xs font-semibold bg-white/20 px-2.5 py-1 rounded-full text-white flex items-center gap-1.5">
              <span>🚗</span>
              <span>Goa Road Trip ({members.length})</span>
            </span>
          </div>
        </div>

        {/* Right: User Switcher & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active User Switcher (Iconic Splitwise view) */}
          <div className="flex items-center gap-1.5 bg-black/10 hover:bg-black/15 px-2.5 py-1 rounded-lg text-xs font-medium border border-white/20 transition">
            <span className="text-white/80 hidden md:inline">Viewing as:</span>
            <select
              value={currentUserId}
              onChange={(e) => onSelectCurrentUser(e.target.value)}
              className="bg-transparent text-white font-bold cursor-pointer focus:outline-none"
            >
              {members.map((m) => (
                <option key={m.id} value={m.id} className="text-slate-900 bg-white">
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Members (7) */}
          <button
            onClick={onOpenMembers}
            className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition"
            title="Manage 7 Friends & UPI IDs"
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Friends ({members.length})</span>
          </button>

          {/* WhatsApp Share */}
          <button
            onClick={onOpenShare}
            className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-sm"
            title="Export summary to WhatsApp"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>

          {/* More options dropdown or quick sample */}
          <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-white/25 text-[11px]">
            <button
              onClick={onLoadSample}
              className="hover:underline flex items-center gap-1 opacity-90 hover:opacity-100"
              title="Reload sample bills for Road Trip"
            >
              <Sparkles className="w-3 h-3" />
              Sample Bills
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
