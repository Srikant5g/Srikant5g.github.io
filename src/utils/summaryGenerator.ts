import type { Expense, Member, DebtTransaction, MemberBalance } from '../types';
import { formatCurrency, calculateTotalTripSpend, getActualExpenses } from './settlement';
import { copyToClipboard } from './clipboard';

export interface SummaryParams {
  tripName?: string;
  expenses: Expense[];
  members: Member[];
  settlements: DebtTransaction[];
  balances: MemberBalance[];
}

/**
 * Generate a clean, beautifully formatted WhatsApp road trip summary with emoji styling
 */
export function generateWhatsAppTripSummary({
  tripName = 'Goa',
  expenses,
  members,
  settlements,
  balances = [],
}: SummaryParams): string {
  const actualBills = getActualExpenses(expenses);
  const totalSpend = calculateTotalTripSpend(expenses);
  const avgSpend = members.length > 0 ? totalSpend / members.length : 0;

  // Category breakdown
  const catMap: Record<string, number> = {};
  actualBills.forEach((e) => {
    catMap[e.category] = (catMap[e.category] || 0) + e.amount;
  });

  const sortedCategories = Object.entries(catMap)
    .filter(([_, amt]) => amt > 0)
    .sort((a, b) => b[1] - a[1]);

  let text = `🚗 *${tripName.toUpperCase()} — EXPENSE SUMMARY*\n`;
  text += `📍 _Every trip. Every expense. Sorted._\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  text += `💰 *Total Trip Spending:* ${formatCurrency(totalSpend)} (${actualBills.length} ${actualBills.length === 1 ? 'bill' : 'bills'})\n`;
  text += `👥 *Average per Person:* ${formatCurrency(avgSpend)} (${members.length} friends)\n\n`;

  if (sortedCategories.length > 0) {
    text += `📊 *Category Breakdown:*\n`;
    sortedCategories.forEach(([cat, amt]) => {
      const pct = totalSpend > 0 ? ((amt / totalSpend) * 100).toFixed(1) : '0';
      text += `• ${cat}: ${formatCurrency(amt)} (${pct}%)\n`;
    });
    text += `\n`;
  }

  if (balances && balances.length > 0) {
    text += `💳 *Individual Balances:*\n`;
    balances.forEach((b) => {
      if (b.netBalance > 0.01) {
        text += `• ${b.name}: +${formatCurrency(b.netBalance)} (Gets back 🟢)\n`;
      } else if (b.netBalance < -0.01) {
        text += `• ${b.name}: -${formatCurrency(Math.abs(b.netBalance))} (Owes 🔴)\n`;
      } else {
        text += `• ${b.name}: Settled (⚪)\n`;
      }
    });
    text += `\n`;
  }

  text += `🤝 *Final Simplified Settlements:*\n`;
  if (settlements.length === 0) {
    text += `🎉 All settled up! Nobody owes anything across the group.\n`;
  } else {
    settlements.forEach((tx) => {
      text += `• *${tx.fromName}* pays *${tx.toName}*: ${formatCurrency(tx.amount)}`;
      if (tx.toUpiId) {
        text += ` (UPI: ${tx.toUpiId})`;
      }
      text += `\n`;
    });
  }

  text += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `✨ Generated via *TripTally*\n`;
  text += `🔗 https://srikant5g.github.io/`;

  return text;
}

/**
 * Share summary directly to WhatsApp via intent URL
 */
export function shareSummaryToWhatsApp(params: SummaryParams) {
  const text = generateWhatsAppTripSummary(params);
  const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
  if (typeof window !== 'undefined') {
    window.open(url, '_blank');
  }
}

/**
 * Copy formatted summary text to clipboard
 */
export async function copySummaryToClipboard(params: SummaryParams): Promise<boolean> {
  const text = generateWhatsAppTripSummary(params);
  return await copyToClipboard(text);
}
