import React, { useState } from 'react';
import type { MemberBalance, DebtTransaction, TripSettings } from '../types';
import { formatCurrency } from '../utils/settlement';
import { X, Copy, Check, MessageSquare } from 'lucide-react';

interface WhatsAppShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TripSettings;
  balances: MemberBalance[];
  settlements: DebtTransaction[];
  totalSpend: number;
}

export const WhatsAppShareModal: React.FC<WhatsAppShareModalProps> = ({
  isOpen,
  onClose,
  settings,
  balances,
  settlements,
  totalSpend,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const memberCount = balances.length;
  const avgPerPerson = memberCount > 0 ? totalSpend / memberCount : 0;

  const balanceLines = balances.map((b) => {
    if (b.netBalance > 0.01) {
      return `• ${b.name}: +${formatCurrency(b.netBalance)} (Gets back 🟢)`;
    } else if (b.netBalance < -0.01) {
      return `• ${b.name}: -${formatCurrency(Math.abs(b.netBalance))} (Owes 🔴)`;
    } else {
      return `• ${b.name}: Settled (⚪)`;
    }
  });

  const settlementLines =
    settlements.length > 0
      ? settlements.map((tx, idx) => {
          const upiNote = tx.toUpiId ? ` [UPI: ${tx.toUpiId}]` : '';
          return `${idx + 1}. *${tx.fromName}* ➡️ *${tx.toName}*: ${formatCurrency(tx.amount)}${upiNote}`;
        })
      : ['🎉 Everyone is settled up! Nobody owes anything.'];

  const messageText = `🚗 *${settings.tripName.toUpperCase()} - ROAD TRIP EXPENSE SUMMARY* 🏖️
📍 ${settings.location}
💰 *Total Spend:* ${formatCurrency(totalSpend)}
👥 *Avg / Friend (${memberCount} friends):* ${formatCurrency(avgPerPerson)}

━━━━━━━━━━━━━━━━━━━
📊 *INDIVIDUAL BALANCES*
${balanceLines.join('\n')}

━━━━━━━━━━━━━━━━━━━
🤝 *SIMPLIFIED SETTLEMENT PLAN (UPI)*
${settlementLines.join('\n')}

✨ _Generated with GoaTab 🚗🏖️_`;

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    messageText
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-800">
        {/* Header */}
        <div className="px-6 py-4 bg-[#25D366] text-white flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-5 h-5 fill-white" />
            <div>
              <h2 className="text-lg font-black text-white m-0">
                WhatsApp Group Summary
              </h2>
              <p className="text-xs text-white/90 mt-0.5">
                Share full breakdown and settlement steps in 1 click
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white hover:bg-white/20 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-3 overflow-y-auto flex-1">
          <p className="text-xs text-slate-500 font-medium">
            Formatted summary ready to paste into your WhatsApp group:
          </p>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 font-mono text-xs text-slate-700 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto select-all">
            {messageText}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-2 bg-slate-50">
          <button
            type="button"
            onClick={handleCopy}
            className="w-full sm:w-auto px-4 py-2 rounded-md border border-slate-300 hover:bg-slate-100 bg-white text-xs font-bold text-slate-700 transition flex items-center justify-center gap-1.5"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Text</span>
              </>
            )}
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-5 py-2 rounded-md bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs transition flex items-center justify-center gap-1.5 shadow-xs"
          >
            <MessageSquare className="w-3.5 h-3.5 fill-white" />
            <span>Open WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};
