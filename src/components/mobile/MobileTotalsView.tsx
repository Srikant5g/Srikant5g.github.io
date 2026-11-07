import React from 'react';
import type { Expense, Member } from '../../types';
import { formatCurrency, formatExpenseDate, calculateTotalTripSpend, getActualExpenses } from '../../utils/settlement';
import { CATEGORY_ICONS } from '../../utils/sampleData';
import { Share2, PieChart, Lock, TrendingUp, Award, Calendar, Users } from 'lucide-react';

interface MobileTotalsViewProps {
  expenses: Expense[];
  members: Member[];
  onOpenShare: () => void;
  onLoadSample?: () => void;
  onResetData: () => void;
}

export const MobileTotalsView: React.FC<MobileTotalsViewProps> = ({
  expenses,
  members,
  onOpenShare,
  onResetData,
}) => {
  const actualExpenses = getActualExpenses(expenses);
  const totalSpend = calculateTotalTripSpend(expenses);
  const avg = members.length > 0 ? totalSpend / members.length : 0;

  // Category breakdown (pure consumption expenses only)
  const categoryMap: Record<string, number> = {};
  actualExpenses.forEach((e) => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
  });

  const sortedCategories = Object.entries(categoryMap)
    .filter(([_, amt]) => amt > 0)
    .sort((a, b) => b[1] - a[1]);

  // Color palette for Donut segments
  const DONUT_COLORS = [
    '#145B4A', // Forest Green
    '#78C5A7', // Mint Green
    '#FF784F', // Coral
    '#3B82F6', // Blue
    '#F59E0B', // Amber
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#10B981', // Emerald
  ];

  // SVG Donut Calculations
  let cumulativePercent = 0;
  const donutSegments = sortedCategories.map(([cat, amt], index) => {
    const percent = totalSpend > 0 ? (amt / totalSpend) * 100 : 0;
    const strokeDasharray = `${percent} ${100 - percent}`;
    const strokeDashoffset = -cumulativePercent;
    cumulativePercent += percent;
    return {
      cat,
      amt,
      percent,
      color: DONUT_COLORS[index % DONUT_COLORS.length],
      strokeDasharray,
      strokeDashoffset,
    };
  });

  // Highest Expense
  const highestExpense = actualExpenses.length > 0
    ? [...actualExpenses].sort((a, b) => b.amount - a.amount)[0]
    : null;

  // Daily Spending Trend (group by expense.date)
  const dailySpendMap: Record<string, number> = {};
  actualExpenses.forEach((e) => {
    dailySpendMap[e.date] = (dailySpendMap[e.date] || 0) + e.amount;
  });
  const dailySpendEntries = Object.entries(dailySpendMap).sort(
    (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime()
  );
  const maxDaySpend = Math.max(...Object.values(dailySpendMap), 1);

  // Individual payer contribution
  const payerMap: Record<string, number> = {};
  actualExpenses.forEach((e) => {
    payerMap[e.paidById] = (payerMap[e.paidById] || 0) + e.amount;
  });

  return (
    <div className="space-y-4 pb-32">
      {/* 1. Trip Hero Card with Donut Chart (Inspired by Reference Screenshot 4) */}
      <div className="bg-white border border-[#E4EAF0] rounded-3xl p-5 shadow-xs space-y-4">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-[#718096] uppercase tracking-wider block">
              Trip Overview
            </span>
            <h2 className="text-xl font-black text-[#192B3D] mt-0.5">
              Financial Insights
            </h2>
          </div>
          <button
            onClick={onOpenShare}
            className="p-2.5 rounded-2xl bg-[#78C5A7]/20 text-[#145B4A] hover:bg-[#78C5A7]/30 transition"
            title="Share summary"
          >
            <Share2 className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* Donut Chart & Center Stats */}
        <div className="flex flex-col items-center justify-center py-2">
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* SVG Donut */}
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <circle
                cx="18"
                cy="18"
                r="15.91549430918954"
                fill="none"
                stroke="#F7F8F5"
                strokeWidth="3.4"
              />
              {donutSegments.map((seg) => (
                <circle
                  key={seg.cat}
                  cx="18"
                  cy="18"
                  r="15.91549430918954"
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="3.4"
                  strokeDasharray={seg.strokeDasharray}
                  strokeDashoffset={seg.strokeDashoffset}
                  className="transition-all duration-500"
                />
              ))}
            </svg>

            {/* Inner Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096]">
                Total Spent
              </span>
              <span className="text-xl font-black text-[#192B3D] mt-0.5">
                {formatCurrency(totalSpend)}
              </span>
              <span className="text-[10px] font-semibold text-[#78C5A7] bg-[#145B4A] px-2 py-0.5 rounded-full mt-1">
                {actualExpenses.length} {actualExpenses.length === 1 ? 'bill' : 'bills'}
              </span>
            </div>
          </div>
        </div>

        {/* Metric summary badges */}
        <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-[#E4EAF0]">
          <div className="p-3 rounded-2xl bg-[#F7F8F5] border border-[#E4EAF0] text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096] block">
              Avg per friend
            </span>
            <span className="text-sm font-black text-[#192B3D] mt-0.5 block">
              {formatCurrency(avg)}
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-[#F7F8F5] border border-[#E4EAF0] text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#718096] block">
              Active Friends
            </span>
            <span className="text-sm font-black text-[#192B3D] mt-0.5 block">
              {members.length} members
            </span>
          </div>
        </div>

        {/* WhatsApp Button */}
        <button
          onClick={onOpenShare}
          className="w-full py-3 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition active:scale-95"
        >
          <Share2 className="w-4 h-4 fill-white" />
          <span>Share Summary to WhatsApp</span>
        </button>
      </div>

      {/* 2. Category-Wise Breakdown (List with percentage bars) */}
      <div className="bg-white border border-[#E4EAF0] rounded-3xl p-5 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between border-b border-[#E4EAF0] pb-3">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-[#145B4A]" />
            <h3 className="font-bold text-[#192B3D] text-sm m-0">Category Breakdown</h3>
          </div>
          <span className="text-[11px] font-bold text-[#718096]">
            {sortedCategories.length} categories
          </span>
        </div>

        {sortedCategories.length === 0 ? (
          <p className="text-xs text-[#718096] text-center py-4">No bills recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {sortedCategories.map(([cat, amount], idx) => {
              const pct = totalSpend > 0 ? (amount / totalSpend) * 100 : 0;
              const meta = CATEGORY_ICONS[cat] || { icon: '📝' };
              const color = DONUT_COLORS[idx % DONUT_COLORS.length];

              return (
                <div key={cat} className="space-y-1.5 p-3 rounded-2xl bg-[#F7F8F5] border border-[#E4EAF0]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-bold text-[#192B3D]">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-sm">{meta.icon}</span>
                      <span>{cat}</span>
                    </span>
                    <span className="font-black text-[#192B3D]">
                      {formatCurrency(amount)}{' '}
                      <span className="text-[#718096] font-normal">({pct.toFixed(0)}%)</span>
                    </span>
                  </div>

                  <div className="w-full bg-[#E4EAF0] h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Highest Expense Highlight Card */}
      {highestExpense && (
        <div className="bg-white border border-[#E4EAF0] rounded-3xl p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-[#192B3D] text-sm m-0">Highest Single Expense</h3>
            </div>
            <span className="text-[10px] font-bold text-[#145B4A] bg-[#78C5A7]/20 px-2 py-0.5 rounded-full">
              {highestExpense.category}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F7F8F5] border border-[#E4EAF0] flex items-center justify-between">
            <div>
              <h4 className="font-bold text-[#192B3D] text-sm">{highestExpense.title}</h4>
              <p className="text-[11px] text-[#718096] mt-0.5">
                Paid by {members.find((m) => m.id === highestExpense.paidById)?.name || 'Friend'} on {highestExpense.date}
              </p>
            </div>
            <span className="text-base font-black text-[#145B4A]">
              {formatCurrency(highestExpense.amount)}
            </span>
          </div>
        </div>
      )}

      {/* 4. Daily Spending Trend */}
      {dailySpendEntries.length > 0 && (
        <div className="bg-white border border-[#E4EAF0] rounded-3xl p-5 shadow-xs space-y-3.5">
          <div className="flex items-center justify-between border-b border-[#E4EAF0] pb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#145B4A]" />
              <h3 className="font-bold text-[#192B3D] text-sm m-0">Daily Spending Trend</h3>
            </div>
            <Calendar className="w-3.5 h-3.5 text-[#718096]" />
          </div>

          <div className="flex items-end gap-2 h-28 pt-4 px-2">
            {dailySpendEntries.map(([date, dayAmt]) => {
              const heightPct = Math.max((dayAmt / maxDaySpend) * 100, 15);
              const { month, day } = formatExpenseDate(date);

              return (
                <div key={date} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <span className="text-[9px] font-bold text-[#718096] opacity-0 group-hover:opacity-100 transition truncate mb-1">
                    {formatCurrency(dayAmt)}
                  </span>
                  <div
                    className="w-full max-w-[28px] bg-[#145B4A] rounded-t-lg transition-all duration-300 group-hover:bg-[#78C5A7]"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-[9px] font-bold text-[#718096] mt-1.5 whitespace-nowrap">
                    {day} {month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. Individual Payer Contribution */}
      <div className="bg-white border border-[#E4EAF0] rounded-3xl p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#E4EAF0] pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#145B4A]" />
            <h3 className="font-bold text-[#192B3D] text-sm m-0">Individual Spending Paid</h3>
          </div>
        </div>

        <div className="space-y-2">
          {members.map((m) => {
            const paid = payerMap[m.id] || 0;
            const pct = totalSpend > 0 ? (paid / totalSpend) * 100 : 0;

            return (
              <div key={m.id} className="p-2.5 rounded-2xl bg-[#F7F8F5] border border-[#E4EAF0] flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-7 h-7 rounded-xl ${m.avatarColor} text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs`}>
                    {m.name.charAt(0)}
                  </div>
                  <span className="font-bold text-xs text-[#192B3D] truncate">{m.name}</span>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-black text-[#192B3D]">
                    {formatCurrency(paid)}
                  </span>
                  <span className="text-[10px] text-[#718096] ml-1.5">
                    ({pct.toFixed(0)}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. Trip Actions */}
      <div className="bg-white border border-[#E4EAF0] rounded-3xl p-5 shadow-xs space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#718096] block mb-1">
          Trip Data Options
        </span>
        <button
          onClick={onResetData}
          className="w-full py-2.5 px-3.5 rounded-2xl border border-rose-200 text-[#FF784F] bg-rose-50/60 hover:bg-rose-100 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95 shadow-2xs"
          title="Reset all trip expenses (Requires Security PIN)"
        >
          <Lock className="w-3.5 h-3.5 text-[#FF784F]" />
          <span>Reset History</span>
        </button>
      </div>
    </div>
  );
};
