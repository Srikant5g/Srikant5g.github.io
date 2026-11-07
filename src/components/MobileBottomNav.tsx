import React from 'react';
import { Receipt, Users, ArrowLeftRight, PieChart, Plus } from 'lucide-react';

export type MobileTab = 'expenses' | 'friends' | 'settle' | 'totals';

interface MobileBottomNavProps {
  activeTab: MobileTab;
  onSelectTab: (tab: MobileTab) => void;
  onOpenAddExpense: () => void;
  expensesCount: number;
  friendsCount: number;
  settlementsCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenAddExpense,
  expensesCount,
  friendsCount,
  settlementsCount,
}) => {
  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-[#E4EAF0] shadow-[0_-4px_20px_rgba(25,43,61,0.06)] px-2 py-1.5 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    >
      <div className="flex items-center justify-around relative max-w-md mx-auto">
        {/* Tab 1: Expenses */}
        <button
          type="button"
          onClick={() => onSelectTab('expenses')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
            activeTab === 'expenses'
              ? 'text-[#145B4A] font-bold'
              : 'text-[#718096] hover:text-[#192B3D]'
          }`}
        >
          <div className="relative">
            <Receipt className={`w-5 h-5 ${activeTab === 'expenses' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            {expensesCount > 0 && (
              <span className="absolute -top-1 -right-2.5 bg-[#145B4A] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {expensesCount}
              </span>
            )}
          </div>
          <span className="text-[11px] mt-1 tracking-tight">Expenses</span>
        </button>

        {/* Tab 2: Friends */}
        <button
          type="button"
          onClick={() => onSelectTab('friends')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
            activeTab === 'friends'
              ? 'text-[#145B4A] font-bold'
              : 'text-[#718096] hover:text-[#192B3D]'
          }`}
        >
          <div className="relative">
            <Users className={`w-5 h-5 ${activeTab === 'friends' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="absolute -top-1 -right-2.5 bg-[#E4EAF0] text-[#192B3D] text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {friendsCount}
            </span>
          </div>
          <span className="text-[11px] mt-1 tracking-tight">Friends</span>
        </button>

        {/* Center Prominent Button: + Add Expense */}
        <div className="relative -top-5 flex-1 flex justify-center">
          <button
            type="button"
            onClick={onOpenAddExpense}
            className="w-13 h-13 rounded-2xl bg-[#145B4A] hover:bg-[#0f4639] text-white flex items-center justify-center shadow-lg shadow-[#145B4A]/30 active:scale-95 transition-all transform border-2 border-white"
            title="Add Expense"
            aria-label="Add Expense"
          >
            <Plus className="w-6 h-6 stroke-[3] text-white" />
          </button>
        </div>

        {/* Tab 3: Settle Up */}
        <button
          type="button"
          onClick={() => onSelectTab('settle')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
            activeTab === 'settle'
              ? 'text-[#145B4A] font-bold'
              : 'text-[#718096] hover:text-[#192B3D]'
          }`}
        >
          <div className="relative">
            <ArrowLeftRight className={`w-5 h-5 ${activeTab === 'settle' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            {settlementsCount > 0 && (
              <span className="absolute -top-1 -right-2.5 bg-[#FF784F] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {settlementsCount}
              </span>
            )}
          </div>
          <span className="text-[11px] mt-1 tracking-tight">Settle</span>
        </button>

        {/* Tab 4: Insights (Analytics) */}
        <button
          type="button"
          onClick={() => onSelectTab('totals')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
            activeTab === 'totals'
              ? 'text-[#145B4A] font-bold'
              : 'text-[#718096] hover:text-[#192B3D]'
          }`}
        >
          <PieChart className={`w-5 h-5 ${activeTab === 'totals' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[11px] mt-1 tracking-tight">Insights</span>
        </button>
      </div>
    </nav>
  );
};
