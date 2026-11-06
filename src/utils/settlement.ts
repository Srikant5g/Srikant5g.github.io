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
      } else {
        // Equal split
        const sharePerPerson = expense.amount / expense.splitMemberIds.length;
        expense.splitMemberIds.forEach((mId) => {
          const participant = memberMap.get(mId);
          if (participant) {
            participant.totalShare += sharePerPerson;
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

  return transactions;
}

export function formatCurrency(amount: number, currency = '₹'): string {
  const isNegative = amount < -0.0001;
  const absAmount = Math.abs(amount);
  const formatted = absAmount.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: Number.isInteger(absAmount) ? 0 : 2,
  });
  return `${isNegative ? '-' : ''}${currency}${formatted}`;
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

