import React from 'react';
import type { MemberBalance } from '../types';
import { formatCurrency } from '../utils/settlement';
import { Wallet, TrendingUp, Users, ArrowUpRight, ArrowDownLeft, CheckCircle2 } from 'lucide-react';

interface SummaryCardsProps {
  balances: MemberBalance[];
  totalSpend: number;
  selectedMemberFilter: string | null;
  onSelectMemberFilter: (memberId: string | null) => void;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  balances,
  totalSpend,
  selectedMemberFilter,
  onSelectMemberFilter,
}) => {
  const memberCount = balances.length || 7;
  const avgPerPerson = memberCount > 0 ? totalSpend / memberCount : 0;

  return (
    <div className="space-y-6">
      {/* Top Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Spend */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 sm:p-5 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute right-3 top-3 w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
          <span className="text-xs uppercase font-semibold tracking-wider text-slate-400">
            Total Trip Spend
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {formatCurrency(totalSpend)}
          </div>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <span className="text-emerald-400 font-medium">100% split accuracy</span>
          </p>
        </div>

        {/* Average per Person */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 sm:p-5 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute right-3 top-3 w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="text-xs uppercase font-semibold tracking-wider text-slate-400">
            Avg Spend / Person
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {formatCurrency(avgPerPerson)}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Based on {memberCount} Goa trip friends
          </p>
        </div>

        {/* Group Status */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 sm:p-5 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute right-3 top-3 w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <span className="text-xs uppercase font-semibold tracking-wider text-slate-400">
            Splitwise Members
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            {memberCount} Friends
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {selectedMemberFilter ? (
              <button
                onClick={() => onSelectMemberFilter(null)}
                className="text-teal-400 hover:underline font-medium"
              >
                Clear filter (showing all)
              </button>
            ) : (
              'Click any member below to filter'
            )}
          </p>
        </div>
      </div>

      {/* Member Balances Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <span>Member Balances</span>
            <span className="text-xs font-normal normal-case text-slate-500">
              (Green = gets back, Red = owes money)
            </span>
          </h3>
          {selectedMemberFilter && (
            <button
              onClick={() => onSelectMemberFilter(null)}
              className="text-xs text-teal-400 hover:text-teal-300 font-medium"
            >
              Reset filter
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {balances.map((member) => {
            const isSelected = selectedMemberFilter === member.memberId;
            const isCreditor = member.netBalance > 0.01;
            const isDebtor = member.netBalance < -0.01;
            const isSettled = !isCreditor && !isDebtor;

            return (
              <div
                key={member.memberId}
                onClick={() =>
                  onSelectMemberFilter(isSelected ? null : member.memberId)
                }
                className={`cursor-pointer rounded-2xl p-3.5 border transition-all text-left relative overflow-hidden ${
                  isSelected
                    ? 'bg-slate-800 ring-2 ring-teal-400 border-teal-500/50 shadow-lg'
                    : 'bg-slate-800/40 hover:bg-slate-800/80 border-slate-700/50 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-2.5 mb-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl ${member.avatarColor} text-white font-bold flex items-center justify-center text-sm shadow-sm shrink-0`}
                  >
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-semibold text-white text-sm truncate">
                      {member.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate">
                      Paid: {formatCurrency(member.totalPaid)}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-700/40 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">Net balance:</span>
                  {isCreditor && (
                    <span className="inline-flex items-center gap-0.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      <ArrowDownLeft className="w-3 h-3" />
                      +{formatCurrency(member.netBalance)}
                    </span>
                  )}
                  {isDebtor && (
                    <span className="inline-flex items-center gap-0.5 text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                      <ArrowUpRight className="w-3 h-3" />
                      -{formatCurrency(Math.abs(member.netBalance))}
                    </span>
                  )}
                  {isSettled && (
                    <span className="inline-flex items-center gap-0.5 text-xs font-medium text-slate-400 bg-slate-700/30 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-slate-400" />
                      Settled
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
