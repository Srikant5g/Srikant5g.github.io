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
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg px-2 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-around relative">
        {/* Tab 1: Expenses */}
        <button
          onClick={() => onSelectTab('expenses')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
            activeTab === 'expenses'
              ? 'text-[#5bc5a7] font-bold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className="relative">
            <Receipt className="w-5 h-5" />
            {expensesCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#5bc5a7] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {expensesCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">Bills</span>
        </button>

        {/* Tab 2: Friends */}
        <button
          onClick={() => onSelectTab('friends')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
            activeTab === 'friends'
              ? 'text-[#5bc5a7] font-bold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className="relative">
            <Users className="w-5 h-5" />
            <span className="absolute -top-1 -right-2 bg-slate-200 text-slate-700 text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
              {friendsCount}
            </span>
          </div>
          <span className="text-[10px] mt-0.5">Friends</span>
        </button>

        {/* Floating Center Button: + Add Expense */}
        <div className="relative -top-5 flex-1 flex justify-center">
          <button
            onClick={onOpenAddExpense}
            className="w-12 h-12 rounded-full bg-[#ff652f] hover:bg-[#e55320] text-white flex items-center justify-center shadow-lg shadow-[#ff652f]/30 active:scale-95 transition transform"
            title="Add Expense"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        {/* Tab 3: Settle Up */}
        <button
          onClick={() => onSelectTab('settle')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
            activeTab === 'settle'
              ? 'text-[#5bc5a7] font-bold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <div className="relative">
            <ArrowLeftRight className="w-5 h-5" />
            {settlementsCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#ff652f] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {settlementsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">Settle</span>
        </button>

        {/* Tab 4: Totals */}
        <button
          onClick={() => onSelectTab('totals')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition ${
            activeTab === 'totals'
              ? 'text-[#5bc5a7] font-bold'
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <PieChart className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Totals</span>
        </button>
      </div>
    </div>
  );
};
