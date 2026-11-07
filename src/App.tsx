import { useState, useMemo, useEffect, useRef } from 'react';
import type { Member, Expense, TripSettings, Group } from './types';
import {
  loadMembers,
  saveMembers,
  loadExpenses,
  saveExpenses,
  loadTripSettings,
  saveTripSettings,
  getLastUpdatedAt,
  setLastUpdatedAt,
  enforceFixedMembers,
  loadGroups,
  saveGroups,
  loadActiveGroupId,
  saveActiveGroupId,
} from './utils/storage';
import {
  pullFromCloud,
  pushToCloud,
  listenToCloudEvents,
  subscribeToTabs,
  type SyncStatus,
} from './utils/cloudSync';
import {
  SAMPLE_ROADTRIP_EXPENSES,
  DEFAULT_MEMBERS,
  DEFAULT_GROUPS,
  DEFAULT_GROUP_ID,
} from './utils/sampleData';
import { calculateBalances, calculateSettlements, formatCurrency, calculateTotalTripSpend } from './utils/settlement';
import { SplitwiseNavbar } from './components/SplitwiseNavbar';
import { SplitwiseLeftSidebar } from './components/SplitwiseLeftSidebar';
import { SplitwiseCenterView } from './components/SplitwiseCenterView';
import { SplitwiseRightSidebar } from './components/SplitwiseRightSidebar';
import { MobileBottomNav, type MobileTab } from './components/MobileBottomNav';
import { MobileFriendsView } from './components/MobileFriendsView';
import { MobileBillsView } from './components/mobile/MobileBillsView';
import { MobileSettleView } from './components/mobile/MobileSettleView';
import { MobileTotalsView } from './components/mobile/MobileTotalsView';
import { ExpenseModal } from './components/ExpenseModal';
import { SettleUpModal } from './components/SettleUpModal';
import { MemberModal } from './components/MemberModal';
import { WhatsAppShareModal } from './components/WhatsAppShareModal';
import { PinModal } from './components/PinModal';
import { UserSelectModal } from './components/UserSelectModal';
import { AddGroupModal } from './components/AddGroupModal';
import { AddFriendModal } from './components/AddFriendModal';

export function App() {
  const [members, setMembers] = useState<Member[]>(() => loadMembers());
  const [expenses, setExpenses] = useState<Expense[]>(() => loadExpenses());
  const [groups, setGroups] = useState<Group[]>(() => loadGroups());
  const [activeGroupId, setActiveGroupId] = useState<string>(() => loadActiveGroupId());
  const [settings] = useState<TripSettings>(() => loadTripSettings());
  const [, setSyncStatus] = useState<SyncStatus>('synced');

  // Active viewing member - starts unselected so user must select their name on open
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const handleSelectUser = (userId: string) => {
    setCurrentUserId(userId);
    setSelectedFriendId((prev) => (prev === userId ? null : prev));
    try {
      localStorage.setItem('triptally_current_user_id', userId);
    } catch {
      // ignore
    }
  };

  // Left sidebar & mobile tab state
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'dashboard' | 'all' | 'recent'>('dashboard');
  const [mobileTab, setMobileTab] = useState<MobileTab>('expenses');

  // Modals
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isSettleUpModalOpen, setIsSettleUpModalOpen] = useState(false);
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isUserSelectModalOpen, setIsUserSelectModalOpen] = useState(true);
  const [isAddGroupModalOpen, setIsAddGroupModalOpen] = useState(false);
  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);

  // PIN Protection State (0852)
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pendingPinAction, setPendingPinAction] = useState<{
    type: 'delete_expense' | 'reset_all';
    expenseId?: string;
    actionTitle: string;
    actionDescription: string;
  } | null>(null);

  // Timestamp tracking for cloud & tab reconciliation
  const lastUpdatedRef = useRef<number>(getLastUpdatedAt());

  const applyRemoteData = (
    cloudExpenses: Expense[],
    cloudMembers?: Member[],
    remoteUpdatedAt?: number,
    isCleared?: boolean
  ) => {
    if ((remoteUpdatedAt && remoteUpdatedAt > lastUpdatedRef.current) || isCleared) {
      const ts = remoteUpdatedAt || Date.now();
      lastUpdatedRef.current = ts;
      setLastUpdatedAt(ts);
      setExpenses((prev) => {
        if (prev.length === cloudExpenses.length && JSON.stringify(prev) === JSON.stringify(cloudExpenses)) {
          return prev;
        }
        return cloudExpenses;
      });
      saveExpenses(cloudExpenses);
      if (cloudMembers && cloudMembers.length > 0) {
        const enforced = enforceFixedMembers(cloudMembers);
        setMembers((prev) => {
          if (
            prev.length === enforced.length &&
            prev.every((m, i) => m.id === enforced[i].id && m.name === enforced[i].name && m.upiId === enforced[i].upiId)
          ) {
            return prev;
          }
          saveMembers(enforced);
          return enforced;
        });
      }
      setSyncStatus('synced');
    }
  };

  const syncToCloud = async (
    newExpenses: Expense[],
    newMembers: Member[],
    isCleared: boolean = false
  ) => {
    const now = Date.now();
    lastUpdatedRef.current = now;
    setLastUpdatedAt(now);
    setSyncStatus('syncing');

    try {
      const ok = await pushToCloud(newExpenses, newMembers, now, isCleared);
      setSyncStatus(ok ? 'synced' : 'error');
    } catch {
      setSyncStatus('error');
    }
  };

  // Cloud & Cross-Tab Realtime Synchronization Lifecycle
  useEffect(() => {
    // 1. Initial Cloud Fetch on Mount
    pullFromCloud().then((cloudData) => {
      if (cloudData) {
        // If cloud data is newer or explicitly cleared, adopt cloud state
        if (cloudData.updatedAt > lastUpdatedRef.current || cloudData.isCleared) {
          lastUpdatedRef.current = cloudData.updatedAt;
          setLastUpdatedAt(cloudData.updatedAt);
          setExpenses(cloudData.expenses || []);
          saveExpenses(cloudData.expenses || []);
          if (cloudData.members && cloudData.members.length > 0) {
            const enforced = enforceFixedMembers(cloudData.members);
            setMembers((prev) => {
              if (
                prev.length === enforced.length &&
                prev.every((m, i) => m.id === enforced[i].id && m.name === enforced[i].name && m.upiId === enforced[i].upiId)
              ) {
                return prev;
              }
              saveMembers(enforced);
              return enforced;
            });
          }
        }
        setSyncStatus('synced');
      } else {
        setSyncStatus('synced');
      }
    });

    // 2. Cross-Tab Live Sync on same device (0ms latency via BroadcastChannel)
    const unsubTabs = subscribeToTabs((payload) => {
      if (payload.updatedAt > lastUpdatedRef.current || payload.isCleared) {
        applyRemoteData(payload.expenses, payload.members, payload.updatedAt, payload.isCleared);
      }
    });

    // 3. Native Browser Storage Event for Instant Cross-Tab Sync
    const handleStorageChange = (e: StorageEvent) => {
      if (
        e.key === 'triptab_expenses_v1' ||
        e.key === 'triptab_members_v1' ||
        e.key === 'triptab_updated_at_v1' ||
        e.key === 'goa_splitwise_expenses_v1' ||
        e.key === 'goa_splitwise_members_v1' ||
        e.key === 'goa_splitwise_updated_at_v1'
      ) {
        const freshExpenses = loadExpenses();
        const freshMembers = loadMembers();
        const freshUpdatedAt = getLastUpdatedAt();
        if (freshUpdatedAt >= lastUpdatedRef.current) {
          lastUpdatedRef.current = freshUpdatedAt;
          setExpenses(freshExpenses);
          setMembers(freshMembers);
          setSyncStatus('synced');
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // 4. Remote Cloud SSE Push Listener via ntfy (sub-second cross-device)
    const unsubSSE = listenToCloudEvents((remotePayload) => {
      if (remotePayload && (remotePayload.updatedAt > lastUpdatedRef.current || remotePayload.isCleared)) {
        applyRemoteData(remotePayload.expenses, remotePayload.members, remotePayload.updatedAt, remotePayload.isCleared);
      }
    });

    // 5. On Window Focus / Visibility Change (Mobile browser wake-up)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        pullFromCloud().then((cloudData) => {
          if (cloudData && (cloudData.updatedAt > lastUpdatedRef.current || cloudData.isCleared)) {
            applyRemoteData(cloudData.expenses, cloudData.members, cloudData.updatedAt, cloudData.isCleared);
          }
        });
      }
    };
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    // 6. Periodic Polling fallback (every 8s while tab is visible)
    const pollInterval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        pullFromCloud().then((cloudData) => {
          if (cloudData && (cloudData.updatedAt > lastUpdatedRef.current || cloudData.isCleared)) {
            applyRemoteData(cloudData.expenses, cloudData.members, cloudData.updatedAt, cloudData.isCleared);
          }
        });
      }
    }, 8000);

    return () => {
      unsubTabs();
      unsubSSE();
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
      clearInterval(pollInterval);
    };
  }, []);

  // Save Settings to local storage
  useEffect(() => {
    saveTripSettings(settings);
  }, [settings]);

  // Active group derived
  const activeGroup = useMemo(() => {
    return groups.find((g) => g.id === activeGroupId) || groups[0] || DEFAULT_GROUPS[0];
  }, [groups, activeGroupId]);

  // Members belonging to the current active group
  const currentGroupMembers = useMemo(() => {
    if (!activeGroup || !activeGroup.memberIds || activeGroup.memberIds.length === 0) {
      return members;
    }
    const filtered = members.filter((m) => activeGroup.memberIds.includes(m.id));
    return filtered.length > 0 ? filtered : members;
  }, [activeGroup, members]);

  // Expenses belonging to the current active group
  const currentGroupExpenses = useMemo(() => {
    return expenses.filter((e) => (e.groupId || DEFAULT_GROUP_ID) === activeGroup.id);
  }, [expenses, activeGroup]);

  // Derived metrics
  const totalSpend = useMemo(
    () => calculateTotalTripSpend(currentGroupExpenses),
    [currentGroupExpenses]
  );

  const balances = useMemo(
    () => calculateBalances(currentGroupMembers, currentGroupExpenses),
    [currentGroupMembers, currentGroupExpenses]
  );

  const settlements = useMemo(
    () => calculateSettlements(currentGroupMembers, balances),
    [currentGroupMembers, balances]
  );

  // Group Handlers
  const handleCreateGroup = (name: string, location?: string, memberIds?: string[]) => {
    const newGroup: Group = {
      id: `grp_${Date.now()}`,
      name: name.trim(),
      location: location?.trim(),
      memberIds: memberIds && memberIds.length > 0 ? memberIds : members.map((m) => m.id),
      createdAt: Date.now(),
    };
    const updated = [...groups, newGroup];
    setGroups(updated);
    saveGroups(updated);
    setActiveGroupId(newGroup.id);
    saveActiveGroupId(newGroup.id);
    setSelectedFriendId(null);
  };

  const handleSelectGroup = (groupId: string) => {
    setActiveGroupId(groupId);
    saveActiveGroupId(groupId);
    setSelectedFriendId(null);
  };

  // Friend Handler
  const handleAddFriend = (name: string, upiId?: string, avatarColor?: string) => {
    const newMember: Member = {
      id: `m_${Date.now()}`,
      name: name.trim(),
      upiId: upiId?.trim() || '',
      avatarColor: avatarColor || '#145B4A',
    };
    const updatedMembers = [...members, newMember];
    setMembers(updatedMembers);
    saveMembers(updatedMembers);

    const updatedGroups = groups.map((g) => {
      if (g.id === activeGroup.id) {
        const mIds = g.memberIds || [];
        return {
          ...g,
          memberIds: mIds.includes(newMember.id) ? mIds : [...mIds, newMember.id],
        };
      }
      return g;
    });
    setGroups(updatedGroups);
    saveGroups(updatedGroups);

    syncToCloud(expenses, updatedMembers);
  };

  // Expense Handlers
  const handleSaveExpense = (
    expenseData: Omit<Expense, 'id' | 'createdAt'>,
    editId?: string
  ) => {
    let updated: Expense[];
    if (editId) {
      updated = expenses.map((e) =>
        e.id === editId
          ? {
              ...e,
              ...expenseData,
              groupId: e.groupId || activeGroup.id,
            }
          : e
      );
    } else {
      const newExpense: Expense = {
        ...expenseData,
        groupId: activeGroup.id,
        type: expenseData.type || 'EXPENSE',
        id: `exp_${Date.now()}`,
        createdAt: Date.now(),
      };
      updated = [newExpense, ...expenses];
    }

    setExpenses(updated);
    saveExpenses(updated);
    syncToCloud(updated, members);
    setEditingExpense(null);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsExpenseModalOpen(true);
  };

  // PIN-Protected Single Bill Deletion (PIN: 0852)
  const handleDeleteExpense = (id: string) => {
    const target = expenses.find((e) => e.id === id);
    const billTitle = target ? `"${target.title}" (${formatCurrency(target.amount)})` : 'this bill';
    setPendingPinAction({
      type: 'delete_expense',
      expenseId: id,
      actionTitle: 'Delete Expense',
      actionDescription: `Enter Security PIN to delete ${billTitle}`,
    });
    setIsPinModalOpen(true);
  };

  // PIN-Protected Clear / Reset All Data (PIN: 0852)
  const handleResetData = () => {
    setPendingPinAction({
      type: 'reset_all',
      actionTitle: 'Clear All Expenses',
      actionDescription: `Enter Security PIN to permanently clear all bills in "${activeGroup.name}" and sync across devices`,
    });
    setIsPinModalOpen(true);
  };

  // When PIN (0852) is correctly entered
  const handlePinSuccess = () => {
    if (!pendingPinAction) return;

    if (pendingPinAction.type === 'delete_expense' && pendingPinAction.expenseId) {
      const updated = expenses.filter((e) => e.id !== pendingPinAction.expenseId);
      setExpenses(updated);
      saveExpenses(updated);
      syncToCloud(updated, members);
    } else if (pendingPinAction.type === 'reset_all') {
      const updated = expenses.filter((e) => (e.groupId || DEFAULT_GROUP_ID) !== activeGroup.id);
      setExpenses(updated);
      setSelectedFriendId(null);
      saveExpenses(updated);
      syncToCloud(updated, members, true);
    }

    setPendingPinAction(null);
  };

  const handleRecordPayment = (fromId: string, toId: string, amount: number, note?: string) => {
    const fromMember = members.find((m) => m.id === fromId);
    const toMember = members.find((m) => m.id === toId);

    const isDeposit = note?.toLowerCase().includes('deposit') || note?.toLowerCase().includes('kitty') || note?.toLowerCase().includes('fund');

    const paymentExpense: Expense = {
      id: `pay_${Date.now()}`,
      groupId: activeGroup.id,
      type: 'PAYMENT',
      title: isDeposit
        ? `${fromMember?.name || 'Friend'} deposited to ${toMember?.name || 'Friend'}`
        : `${fromMember?.name || 'Friend'} paid ${toMember?.name || 'Friend'}`,
      amount,
      date: new Date().toISOString().split('T')[0],
      paidById: fromId,
      category: 'Misc',
      splitMode: 'EQUAL',
      splitMemberIds: [toId],
      notes: note || 'Recorded payment settlement',
      createdAt: Date.now(),
    };

    const updated = [paymentExpense, ...expenses];
    setExpenses(updated);
    saveExpenses(updated);
    syncToCloud(updated, members);
  };

  const handleLoadSample = () => {
    if (
      window.confirm(
        'Load realistic road-trip bills (Diesel, Tolls, Breakfast, Lunch, Snacks, Drinks, Villa, Dinner)?'
      )
    ) {
      setExpenses(SAMPLE_ROADTRIP_EXPENSES);
      setMembers(DEFAULT_MEMBERS);
      saveExpenses(SAMPLE_ROADTRIP_EXPENSES);
      saveMembers(DEFAULT_MEMBERS);
      setSelectedFriendId(null);
      syncToCloud(SAMPLE_ROADTRIP_EXPENSES, DEFAULT_MEMBERS);
    }
  };

  const handleSaveMembers = (updatedMembers: Member[]) => {
    const enforced = enforceFixedMembers(updatedMembers);
    setMembers(enforced);
    saveMembers(enforced);
    syncToCloud(expenses, enforced);
  };

  // Map mobile tab to center view sub-tabs
  const activeSubTab =
    mobileTab === 'settle'
      ? 'debts'
      : mobileTab === 'totals'
      ? 'breakdown'
      : 'expenses';

  const handleChangeSubTab = (subTab: 'expenses' | 'debts' | 'breakdown') => {
    if (subTab === 'expenses') setMobileTab('expenses');
    else if (subTab === 'debts') setMobileTab('settle');
    else if (subTab === 'breakdown') setMobileTab('totals');
  };

  return (
    <div className="min-h-screen bg-[#F7F8F5] text-[#192B3D] flex flex-col font-sans pb-16 md:pb-0 w-full max-w-full overflow-x-hidden">
      {/* TripTally Navigation Bar with Live Cloud Sync */}
      <SplitwiseNavbar
        members={members}
        currentUserId={currentUserId}
        onSelectCurrentUser={handleSelectUser}
        onOpenMembers={() => setIsMemberModalOpen(true)}
        onOpenShare={() => setIsShareModalOpen(true)}
        onResetData={handleResetData}
        onLoadSample={handleLoadSample}
        onOpenUserSelect={() => setIsUserSelectModalOpen(true)}
        tripName={activeGroup.name}
        groups={groups}
        activeGroupId={activeGroup.id}
        onSelectGroup={handleSelectGroup}
        onOpenAddGroup={() => setIsAddGroupModalOpen(true)}
      />

      {/* Main Layout (Desktop 3-Column / Mobile Native Tabs) */}
      <main className="max-w-[1380px] mx-auto px-3 sm:px-6 py-4 sm:py-6 w-full flex-1 flex flex-col md:flex-row gap-5 lg:gap-6 items-start">
        {/* Column 1: Left Navigation & Friends List (Desktop only) */}
        <SplitwiseLeftSidebar
          groups={groups}
          activeGroupId={activeGroup.id}
          onSelectGroup={handleSelectGroup}
          onOpenAddGroup={() => setIsAddGroupModalOpen(true)}
          members={currentGroupMembers}
          balances={balances}
          currentUserId={currentUserId}
          selectedFriendId={selectedFriendId}
          onSelectFriend={setSelectedFriendId}
          activeView={activeView}
          onChangeView={setActiveView}
          onOpenMembers={() => setIsMemberModalOpen(true)}
          onOpenAddFriend={() => setIsAddFriendModalOpen(true)}
        />

        {/* Mobile View: Dedicated Screen for each Tab */}
        <div className="w-full md:hidden">
          {mobileTab === 'expenses' && (
            <MobileBillsView
              expenses={currentGroupExpenses}
              members={currentGroupMembers}
              currentUserId={currentUserId}
              selectedFriendId={selectedFriendId}
              onClearFriendFilter={() => setSelectedFriendId(null)}
              onOpenAddExpense={() => {
                setEditingExpense(null);
                setIsExpenseModalOpen(true);
              }}
              onEditExpense={handleEditExpense}
              onDeleteExpense={handleDeleteExpense}
              onLoadSample={handleLoadSample}
              tripName={activeGroup.name}
              groups={groups}
              activeGroupId={activeGroup.id}
              onSelectGroup={handleSelectGroup}
              onOpenAddGroup={() => setIsAddGroupModalOpen(true)}
            />
          )}

          {mobileTab === 'friends' && (
            <MobileFriendsView
              members={currentGroupMembers}
              balances={balances}
              currentUserId={currentUserId}
              selectedFriendId={selectedFriendId}
              onSelectFriend={(id) => {
                setSelectedFriendId(id);
                setMobileTab('expenses');
              }}
              onOpenMembers={() => setIsMemberModalOpen(true)}
              onOpenAddFriend={() => setIsAddFriendModalOpen(true)}
            />
          )}

          {mobileTab === 'settle' && (
            <MobileSettleView
              settlements={settlements}
              currentUserId={currentUserId}
            />
          )}

          {mobileTab === 'totals' && (
            <MobileTotalsView
              expenses={currentGroupExpenses}
              members={currentGroupMembers}
              onOpenShare={() => setIsShareModalOpen(true)}
              onLoadSample={handleLoadSample}
              onResetData={handleResetData}
            />
          )}
        </div>

        {/* Desktop View (md:): Classic 3-Column Splitwise */}
        <div className="hidden md:block flex-1 min-w-0 w-full">
          <SplitwiseCenterView
            expenses={currentGroupExpenses}
            members={currentGroupMembers}
            currentUserId={currentUserId}
            selectedFriendId={selectedFriendId}
            settlements={settlements}
            activeSubTab={activeSubTab}
            onChangeSubTab={handleChangeSubTab}
            onOpenAddExpense={() => {
              setEditingExpense(null);
              setIsExpenseModalOpen(true);
            }}
            onOpenSettleUp={() => setIsSettleUpModalOpen(true)}
            onEditExpense={handleEditExpense}
            onDeleteExpense={handleDeleteExpense}
            onLoadSample={handleLoadSample}
          />
        </div>

        {/* Column 3: Right Sidebar (Desktop only) */}
        <SplitwiseRightSidebar
          balances={balances}
          totalSpend={totalSpend}
          members={currentGroupMembers}
          settlements={settlements}
          onOpenAddExpense={() => {
            setEditingExpense(null);
            setIsExpenseModalOpen(true);
          }}
          onOpenShare={() => setIsShareModalOpen(true)}
          onLoadSample={handleLoadSample}
        />
      </main>

      {/* Mobile Bottom Navigation Bar with Floating + Action Button */}
      <MobileBottomNav
        activeTab={mobileTab}
        onSelectTab={setMobileTab}
        onOpenAddExpense={() => {
          setEditingExpense(null);
          setIsExpenseModalOpen(true);
        }}
        expensesCount={currentGroupExpenses.length}
        friendsCount={currentGroupMembers.length}
        settlementsCount={settlements.length}
      />

      {/* Splitwise Modals */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
        members={currentGroupMembers}
        editingExpense={editingExpense}
        onDeleteExpense={handleDeleteExpense}
        currentUserId={currentUserId}
        tripName={activeGroup.name}
      />

      <SettleUpModal
        isOpen={isSettleUpModalOpen}
        onClose={() => setIsSettleUpModalOpen(false)}
        settlements={settlements}
        members={currentGroupMembers}
        currentUserId={currentUserId}
        onRecordPayment={handleRecordPayment}
      />

      <MemberModal
        isOpen={isMemberModalOpen}
        onClose={() => setIsMemberModalOpen(false)}
        members={members}
        onSaveMembers={handleSaveMembers}
      />

      <WhatsAppShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        settings={settings}
        balances={balances}
        settlements={settlements}
        totalSpend={totalSpend}
        expenses={currentGroupExpenses}
        members={currentGroupMembers}
      />

      {/* PIN Security Modal (PIN: 0852) */}
      <PinModal
        isOpen={isPinModalOpen}
        onClose={() => {
          setIsPinModalOpen(false);
          setPendingPinAction(null);
        }}
        onSuccess={handlePinSuccess}
        actionTitle={pendingPinAction?.actionTitle}
        actionDescription={pendingPinAction?.actionDescription}
      />

      {/* Clean User Name Selection on App Open */}
      <UserSelectModal
        isOpen={isUserSelectModalOpen}
        onClose={() => setIsUserSelectModalOpen(false)}
        members={members}
        currentUserId={currentUserId}
        onSelectUser={handleSelectUser}
      />

      {/* Add New Group Modal */}
      <AddGroupModal
        isOpen={isAddGroupModalOpen}
        onClose={() => setIsAddGroupModalOpen(false)}
        onCreateGroup={handleCreateGroup}
        allMembers={members}
        onOpenAddFriend={() => {
          setIsAddGroupModalOpen(false);
          setIsAddFriendModalOpen(true);
        }}
      />

      {/* Add New Friend Modal */}
      <AddFriendModal
        isOpen={isAddFriendModalOpen}
        onClose={() => setIsAddFriendModalOpen(false)}
        onAddFriend={handleAddFriend}
        existingNames={members.map((m) => m.name)}
      />
    </div>
  );
}

export default App;
