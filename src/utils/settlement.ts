import type { Member, Expense, MemberBalance, DebtTransaction } from '../types';

export function calculateBalances(members: Member[], expenses: Expense[]): MemberBalance[] {
  const memberMap = new Map<string, MemberBalance>();

  // Initialize balances for all members
  members.forEach((m) => {
    memberMap.set(m.id, {
      memberId: m.id,
      name: m.name,
      avatarColor: m.avatarColor,
      upiId: m.upiId,
      totalPaid: 0,
      totalShare: 0,
      netBalance: 0,
    });
  });

  // Calculate based on expenses
  expenses.forEach((expense) => {
    // Credit payer
    const payer = memberMap.get(expense.paidById);
    if (payer) {
      payer.totalPaid += expense.amount;
    }

    // Debit split members
    if (expense.splitMemberIds && expense.splitMemberIds.length > 0) {
      if (expense.splitMode === 'CUSTOM' && expense.customSplits) {
        Object.entries(expense.customSplits).forEach(([mId, share]) => {
          const participant = memberMap.get(mId);
          if (participant) {
            participant.totalShare += share;
          }
        });
      } else if (expense.splitMode === 'SHARES' && expense.shares) {
        // Split by shares (ratio) with exact penny allocation
        const totalShares = expense.splitMemberIds.reduce(
          (sum, id) => sum + (expense.shares?.[id] || 1),
          0
        );
        const totalPaise = Math.round(expense.amount * 100);

        if (totalShares > 0) {
          let allocatedPaise = 0;
          const shareShares: { id: string; paise: number; rawFraction: number }[] = [];

          expense.splitMemberIds.forEach((mId) => {
            const memberRatio = (expense.shares?.[mId] || 1) / totalShares;
            const exactPaise = totalPaise * memberRatio;
            const flooredPaise = Math.floor(exactPaise);
            shareShares.push({ id: mId, paise: flooredPaise, rawFraction: exactPaise - flooredPaise });
            allocatedPaise += flooredPaise;
          });

          // Distribute remainder paise by highest fractional share
          let remainder = totalPaise - allocatedPaise;
          shareShares.sort((a, b) => b.rawFraction - a.rawFraction);
          for (let i = 0; i < remainder && i < shareShares.length; i++) {
            shareShares[i].paise += 1;
          }

          shareShares.forEach((item) => {
            const participant = memberMap.get(item.id);
            if (participant) {
              participant.totalShare += item.paise / 100;
            }
          });
        }
      } else {
        // Equal split with exact penny allocation (paise) to guarantee zero rounding drift
        const count = expense.splitMemberIds.length;
        const totalPaise = Math.round(expense.amount * 100);
        const baseSharePaise = Math.floor(totalPaise / count);
        const remainderPaise = totalPaise % count;

        expense.splitMemberIds.forEach((mId, idx) => {
          const participant = memberMap.get(mId);
          if (participant) {
            const personPaise = baseSharePaise + (idx < remainderPaise ? 1 : 0);
            participant.totalShare += personPaise / 100;
          }
        });
      }
    }
  });

  // Compute net balance and round
  const results: MemberBalance[] = [];
  memberMap.forEach((balance) => {
    balance.netBalance = Number((balance.totalPaid - balance.totalShare).toFixed(2));
    balance.totalPaid = Number(balance.totalPaid.toFixed(2));
    balance.totalShare = Number(balance.totalShare.toFixed(2));
    results.push(balance);
  });

  return results;
}

/**
 * Splitwise simplified debt algorithm (Minimizes number of transactions)
 */
export function calculateSettlements(
  members: Member[],
  balances: MemberBalance[]
): DebtTransaction[] {
  const nameMap = new Map<string, { name: string; upiId?: string }>();
  members.forEach((m) => nameMap.set(m.id, { name: m.name, upiId: m.upiId }));

  // Separate into debtors and creditors
  // positive net = creditor (gets money)
  // negative net = debtor (owes money)
  const creditors: { id: string; amount: number }[] = [];
  const debtors: { id: string; amount: number }[] = [];

  balances.forEach((b) => {
    const rounded = Number(b.netBalance.toFixed(2));
    if (rounded > 0.01) {
      creditors.push({ id: b.memberId, amount: rounded });
    } else if (rounded < -0.01) {
      debtors.push({ id: b.memberId, amount: -rounded }); // positive amount representing debt
    }
  });

  // Sort descending to settle largest amounts first
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const transactions: DebtTransaction[] = [];
  let cIdx = 0;
  let dIdx = 0;

  while (cIdx < creditors.length && dIdx < debtors.length) {
    const creditor = creditors[cIdx];
    const debtor = debtors[dIdx];

    const settledAmount = Math.min(creditor.amount, debtor.amount);
    const roundedAmount = Number(settledAmount.toFixed(2));

    if (roundedAmount > 0) {
      const credInfo = nameMap.get(creditor.id);
      const debtorInfo = nameMap.get(debtor.id);

      transactions.push({
        id: `settle-${debtor.id}-${creditor.id}-${transactions.length}`,
        fromId: debtor.id,
        fromName: debtorInfo?.name || 'Unknown',
        toId: creditor.id,
        toName: credInfo?.name || 'Unknown',
        toUpiId: credInfo?.upiId,
        amount: roundedAmount,
      });
    }

    creditor.amount = Number((creditor.amount - settledAmount).toFixed(2));
    debtor.amount = Number((debtor.amount - settledAmount).toFixed(2));

    if (creditor.amount <= 0.01) {
      cIdx++;
    }
    if (debtor.amount <= 0.01) {
      dIdx++;
    }
  }

  // Absorb any microscopic residual penny difference into the last transaction
  if (transactions.length > 0) {
    const lastTx = transactions[transactions.length - 1];
    if (cIdx < creditors.length && creditors[cIdx].amount > 0 && creditors[cIdx].amount <= 0.05) {
      lastTx.amount = Number((lastTx.amount + creditors[cIdx].amount).toFixed(2));
      creditors[cIdx].amount = 0;
    }
  }

  return transactions;
}

export function formatCurrency(amount: number, currency = '₹'): string {
  const absAmount = Math.abs(amount);
  if (absAmount < 0.005) {
    return `${currency}0`;
  }
  const isNegative = amount < 0;
  const formatted = absAmount.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: Number.isInteger(absAmount) ? 0 : 2,
  });
  return `${isNegative ? '-' : ''}${currency}${formatted}`;
}

/**
 * Checks if an expense is a peer-to-peer transfer, settlement, or advance fund deposit
 * (e.g. paying Raghavendra ₹10,000 so he can book the hotel).
 * Such transactions adjust balances directly and should NOT be added to Total Trip Spend.
 */
export function isAdvanceOrTransfer(expense: Expense): boolean {
  if (expense.type === 'PAYMENT') return true;

  // Check 1-on-1 transfers with title or notes matching advance / kitty / deposit / transfer
  if (
    expense.splitMemberIds &&
    expense.splitMemberIds.length === 1 &&
    expense.splitMemberIds[0] !== expense.paidById
  ) {
    const lowerTitle = (expense.title || '').toLowerCase().trim();
    const lowerNotes = (expense.notes || '').toLowerCase().trim();
    const isAdv =
      lowerTitle === 'adv' ||
      lowerTitle.startsWith('adv ') ||
      lowerTitle.endsWith(' adv') ||
      lowerTitle.includes('advance') ||
      lowerTitle.includes('deposit') ||
      lowerTitle.includes('kitty') ||
      lowerTitle.includes('fund') ||
      lowerTitle.includes('transfer') ||
      lowerNotes.includes('advance') ||
      lowerNotes.includes('transfer');
    if (isAdv) return true;
  }

  return false;
}

/**
 * Total Trip Spend excluding debt settlements and advance money transfers between friends
 */
export function calculateTotalTripSpend(expenses: Expense[]): number {
  return expenses
    .filter((e) => !isAdvanceOrTransfer(e))
    .reduce((sum, e) => sum + e.amount, 0);
}

/**
 * Filter out settlement transfers and advances to only get actual consumption expenses
 */
export function getActualExpenses(expenses: Expense[]): Expense[] {
  return expenses.filter((e) => !isAdvanceOrTransfer(e));
}

/**
 * Calculates a specific member's share for an individual expense based on splitMode
 * with exact penny matching to calculateBalances
 */
export function getUserExpenseShare(expense: Expense, userId: string): number {
  if (!expense.splitMemberIds || !expense.splitMemberIds.includes(userId)) {
    return 0;
  }

  const count = expense.splitMemberIds.length;
  if (count === 0) return 0;

  if (expense.splitMode === 'CUSTOM' && expense.customSplits) {
    return expense.customSplits[userId] || 0;
  }

  if (expense.splitMode === 'SHARES' && expense.shares) {
    const totalShares = expense.splitMemberIds.reduce(
      (sum, id) => sum + (expense.shares?.[id] || 1),
      0
    );
    if (totalShares <= 0) return 0;

    const totalPaise = Math.round(expense.amount * 100);
    let allocatedPaise = 0;
    const shareShares: { id: string; paise: number; rawFraction: number }[] = [];

    expense.splitMemberIds.forEach((mId) => {
      const memberRatio = (expense.shares?.[mId] || 1) / totalShares;
      const exactPaise = totalPaise * memberRatio;
      const flooredPaise = Math.floor(exactPaise);
      shareShares.push({ id: mId, paise: flooredPaise, rawFraction: exactPaise - flooredPaise });
      allocatedPaise += flooredPaise;
    });

    // Distribute remainder paise by highest fractional share
    const remainder = totalPaise - allocatedPaise;
    shareShares.sort((a, b) => b.rawFraction - a.rawFraction);
    for (let i = 0; i < remainder && i < shareShares.length; i++) {
      shareShares[i].paise += 1;
    }

    const userItem = shareShares.find((item) => item.id === userId);
    return userItem ? userItem.paise / 100 : 0;
  }

  // Equal split with exact penny allocation matching calculateBalances
  const totalPaise = Math.round(expense.amount * 100);
  const baseSharePaise = Math.floor(totalPaise / count);
  const remainderPaise = totalPaise % count;
  const userIdx = expense.splitMemberIds.indexOf(userId);
  const personPaise = baseSharePaise + (userIdx >= 0 && userIdx < remainderPaise ? 1 : 0);
  return personPaise / 100;
}

/**
 * Format date for group section headers (e.g. "Today", "Yesterday", "Sat, 5 Nov")
 */
export function formatGroupDate(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const [year, month, day] = parts.map(Number);
    const date = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(year, month - 1, day);
    target.setHours(0, 0, 0, 0);

    const diffDays = Math.round((today.getTime() - target.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';

    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  } catch {
    return dateStr;
  }
}

/**
 * Robust timezone-independent date formatter for YYYY-MM-DD
 */
export function formatExpenseDate(dateStr: string): { month: string; day: string } {
  const MONTH_NAMES = [
    'JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
    'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC',
  ];
  try {
    const parts = (dateStr || '').split('-');
    if (parts.length >= 3) {
      const mIdx = parseInt(parts[1], 10) - 1;
      const day = parts[2].padStart(2, '0');
      return {
        month: MONTH_NAMES[mIdx] || 'NOV',
        day: day,
      };
    }
  } catch {
    // fallback
  }
  return { month: 'NOV', day: '01' };
}

