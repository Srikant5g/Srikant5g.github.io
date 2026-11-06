import React from 'react';
import { Palmtree, Users, Share2, Plus, Sparkles } from 'lucide-react';
import type { TripSettings, Member } from '../types';

interface HeaderProps {
  settings: TripSettings;
  members: Member[];
  onOpenAddExpense: () => void;
  onOpenMembers: () => void;
  onOpenShare: () => void;
  onResetData: () => void;
  onLoadSample: () => void;
  totalExpensesCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  members,
  onOpenAddExpense,
  onOpenMembers,
  onOpenShare,
  onResetData,
  onLoadSample,
  totalExpensesCount,
}) => {
  return (
    <header className="relative overflow-hidden bg-gradient-to-r from-teal-900/80 via-slate-900 to-emerald-950 border-b border-teal-500/20 shadow-xl backdrop-blur-md">
      {/* Decorative beach background glow */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Title & Branding */}
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 shadow-lg shadow-teal-500/25 shrink-0">
              <Palmtree className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white m-0">
                  {settings.tripName}
                </h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  {members.length} Friends
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5 flex items-center gap-2">
                <span>{settings.location}</span>
                <span>•</span>
                <span>{totalExpensesCount} bills recorded</span>
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenMembers}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 transition shadow-sm hover:shadow"
              title="Manage members and UPI IDs"
            >
              <Users className="w-4 h-4 text-teal-400" />
              <span>Members ({members.length})</span>
            </button>

            <button
              onClick={onOpenShare}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition shadow-sm hover:shadow"
              title="Share report to WhatsApp"
            >
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={onOpenAddExpense}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 shadow-md shadow-teal-500/20 transition-all transform active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Add Bill</span>
            </button>
          </div>
        </div>

        {/* Quick controls row for sample data & reset */}
        <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Auto debt settlement active</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onLoadSample}
              className="hover:text-teal-300 underline underline-offset-2 transition flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-teal-400" />
              Load Road Trip Bills
            </button>
            <span>•</span>
            <button
              onClick={onResetData}
              className="hover:text-rose-400 transition"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
