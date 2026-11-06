import { useState, useMemo, useEffect } from 'react';
import type { Member, Expense, TripSettings } from './types';
import {
  loadMembers,
  saveMembers,
  loadExpenses,
  saveExpenses,
  loadTripSettings,
  saveTripSettings,
} from './utils/storage';
import { SAMPLE_GOA_EXPENSES, DEFAULT_MEMBERS } from './utils/sampleData';
import { calculateBalances, calculateSettlements } from './utils/settlement';
import { SplitwiseNavbar } from './components/SplitwiseNavbar';
import { SplitwiseLeftSidebar } from './components/SplitwiseLeftSidebar';
import { SplitwiseCenterView } from './components/SplitwiseCenterView';
import { SplitwiseRightSidebar } from './components/SplitwiseRightSidebar';
import { ExpenseModal } from './components/ExpenseModal';
import { SettleUpModal } from './components/SettleUpModal';
import { MemberModal } from './components/MemberModal';
import { WhatsAppShareModal } from './components/WhatsAppShareModal';

export function App() {
  const [members, setMembers] = useState<Member[]>(() => loadMembers());
  const [expenses, setExpenses] = useState<Expense[]>(() => loadExpenses());
  const [settings] = useState<TripSettings>(() => loadTripSettings());

  // Active viewing member (defaults to first friend, e.g. Srikant)
  const [currentUserId, setCurrentUserId] = useState<string>(
    () => members[0]?.id || 'm1'
  );

  // Left sidebar state
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'dashboard' | 'all' | 'recent'>('dashboard');

  // Modals
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isSettleUpModalOpen, setIsSettleUpModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    saveMembers(members);
  }, [members]);

  useEffect(() => {
    saveExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    saveTripSettings(settings);
  }, [settings]);

  // Derived metrics
  const totalSpend = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );

  const balances = useMemo(
    () => calculateBalances(members, expenses),
    [members, expenses]
  );

  const settlements = useMemo(
    () => calculateSettlements(members, balances),
    [members, balances]
  );

  // Expense Handlers
  const handleSaveExpense = (
    expenseData: Omit<Expense, 'id' | 'createdAt'>,
    editId?: string
  ) => {
    if (editId) {
      setExpenses((prev) =>
        prev.map((e) =>
          e.id === editId
            ? {
                ...e,
                ...expenseData,
              }
            : e
        )
      );
    } else {
      const newExpense: Expense = {
        ...expenseData,
        id: `exp_${Date.now()}`,
        createdAt: Date.now(),
      };
      setExpenses((prev) => [newExpense, ...prev]);
    }
    setEditingExpense(null);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsExpenseModalOpen(true);
  };

  const handleDeleteExpense = (id: string) => {
    if (window.confirm('Delete this bill?')) {
      setExpenses((prev) => prev.filter((e) => e.id !== id));
    }
  };

  const handleRecordPayment = (fromId: string, toId: string, amount: number) => {
    const fromMember = members.find((m) => m.id === fromId);
    const toMember = members.find((m) => m.id === toId);

    const paymentExpense: Expense = {
      id: `pay_${Date.now()}`,
      title: `${fromMember?.name || 'Friend'} paid ${toMember?.name || 'Friend'}`,
      amount,
      date: new Date().toISOString().split('T')[0],
      paidById: fromId,
      category: 'Misc',
      splitMode: 'EQUAL',
      splitMemberIds: [toId],
      notes: 'Recorded payment settlement',
      createdAt: Date.now(),
    };

    setExpenses((prev) => [paymentExpense, ...prev]);
  };

  const handleResetData = () => {
    if (
      window.confirm('Are you sure you want to clear all bills and start fresh?')
    ) {
      setExpenses([]);
      setSelectedFriendId(null);
    }
  };

  const handleLoadSample = () => {
    if (
      window.confirm(
        'Load realistic Goa road-trip bills (Diesel, Tolls, Breakfast, Lunch, Snacks, Alcohol, Villa, Dinner)?'
      )
    ) {
      setExpenses(SAMPLE_GOA_EXPENSES);
      setMembers(DEFAULT_MEMBERS);
      setSelectedFriendId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f6f6] text-[#333333] flex flex-col font-sans">
      {/* Authentic Splitwise Navigation Bar */}
      <SplitwiseNavbar
        settings={settings}
        members={members}
        currentUserId={currentUserId}
        onSelectCurrentUser={setCurrentUserId}
        onOpenMembers={() => setIsMemberModalOpen(true)}
        onOpenShare={() => setIsShareModalOpen(true)}
        onResetData={handleResetData}
        onLoadSample={handleLoadSample}
      />

      {/* Main 3-Column Splitwise Layout */}
      <main className="max-w-6xl mx-auto px-4 py-6 w-full flex-1 flex flex-col md:flex-row gap-6 items-start">
        {/* Column 1: Left Navigation & 7 Friends List */}
        <SplitwiseLeftSidebar
          members={members}
          balances={balances}
          currentUserId={currentUserId}
          selectedFriendId={selectedFriendId}
          onSelectFriend={setSelectedFriendId}
          activeView={activeView}
          onChangeView={setActiveView}
          onOpenMembers={() => setIsMemberModalOpen(true)}
        />

        {/* Column 2: Center Dashboard / Expenses Feed */}
        <SplitwiseCenterView
          expenses={expenses}
          members={members}
          currentUserId={currentUserId}
          selectedFriendId={selectedFriendId}
          settlements={settlements}
          onOpenAddExpense={() => {
            setEditingExpense(null);
            setIsExpenseModalOpen(true);
          }}
          onOpenSettleUp={() => setIsSettleUpModalOpen(true)}
          onEditExpense={handleEditExpense}
          onDeleteExpense={handleDeleteExpense}
        />

        {/* Column 3: Right Sidebar (Totals, Debts & Road Trip Presets) */}
        <SplitwiseRightSidebar
          balances={balances}
          totalSpend={totalSpend}
          members={members}
          onOpenAddExpense={() => {
            setEditingExpense(null);
            setIsExpenseModalOpen(true);
          }}
          onOpenShare={() => setIsShareModalOpen(true)}
          onLoadSample={handleLoadSample}
        />
      </main>

      {/* Splitwise Modals */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
        members={members}
        editingExpense={editingExpense}
      />

      <SettleUpModal
        isOpen={isSettleUpModalOpen}
        onClose={() => setIsSettleUpModalOpen(false)}
        settlements={settlements}
        onRecordPayment={handleRecordPayment}
      />

      <MemberModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        members={members}
        onSaveMembers={setMembers}
      />

      <WhatsAppShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        settings={settings}
        balances={balances}
        settlements={settlements}
        totalSpend={totalSpend}
      />
    </div>
  );
}

export default App;
