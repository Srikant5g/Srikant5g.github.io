import React, { useState } from 'react';
import type { MemberBalance, DebtTransaction, TripSettings } from '../types';
import { formatCurrency } from '../utils/settlement';
import { copyToClipboard } from '../utils/clipboard';
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

  const messageText = `🌴 *${settings.tripName.toUpperCase()} - EXPENSE SUMMARY* 📊
📍 ${settings.location}
💰 *Total Spend:* ${formatCurrency(totalSpend)}
👥 *Avg / Friend (${memberCount} friends):* ${formatCurrency(avgPerPerson)}

━━━━━━━━━━━━━━━━━━━
📊 *INDIVIDUAL BALANCES*
${balanceLines.join('\n')}

━━━━━━━━━━━━━━━━━━━
🤝 *SIMPLIFIED SETTLEMENT PLAN (UPI)*
${settlementLines.join('\n')}

✨ _Generated with TripTally • Every trip. Every expense. Sorted._`;

  const handleCopy = async () => {
    await copyToClipboard(messageText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
    messageText
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white border border-[#E4EAF0] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-[#192B3D]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#145B4A] text-white flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#78C5A7]/20 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-[#78C5A7]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white m-0">
                Share Trip Summary
              </h2>
              <p className="text-xs text-[#78C5A7] mt-0.5">
                Formatted breakdown ready for WhatsApp or group chat
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close share modal"
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-3.5 overflow-y-auto flex-1">
          <p className="text-xs text-[#718096] font-medium">
            Preview the formatted summary that will be shared with your group:
          </p>

          <pre className="p-4 bg-[#F7F8F5] border border-[#E4EAF0] rounded-2xl text-xs font-mono text-[#192B3D] whitespace-pre-wrap max-h-72 overflow-y-auto leading-relaxed shadow-inner">
            {messageText}
          </pre>
        </div>

        {/* Action Buttons */}
        <div className="p-4 sm:p-5 bg-[#F7F8F5] border-t border-[#E4EAF0] flex flex-col sm:flex-row items-center justify-end gap-2.5">
          <button
            onClick={handleCopy}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#E4EAF0] bg-white text-[#192B3D] font-bold text-xs hover:bg-[#F7F8F5] transition flex items-center justify-center gap-1.5 active:scale-95 shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-[#145B4A] stroke-[3]" />
                <span className="text-[#145B4A]">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[#718096]" />
                <span>Copy Summary Text</span>
              </>
            )}
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-black text-xs transition flex items-center justify-center gap-1.5 active:scale-95 shadow-xs"
          >
            <MessageSquare className="w-4 h-4 fill-white" />
            <span>Open in WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};
