import React, { useState, useRef, useEffect } from 'react';
import {
  getPhonePeUrl,
  getGPayUrl,
  getPaytmUrl,
  getUniversalUpiUrl,
  type UpiPaymentParams,
} from '../utils/upi';
import { copyToClipboard } from '../utils/clipboard';
import { Copy, Check, ChevronDown } from 'lucide-react';

interface UpiPaymentActionsProps {
  params: UpiPaymentParams;
  onCopied?: () => void;
  className?: string;
  size?: 'sm' | 'md';
}

export const UpiPaymentActions: React.FC<UpiPaymentActionsProps> = ({
  params,
  onCopied,
  className = '',
  size = 'md',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const phonepeUrl = getPhonePeUrl(params);
  const gpayUrl = getGPayUrl(params);
  const paytmUrl = getPaytmUrl(params);
  const universalUrl = getUniversalUpiUrl(params);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await copyToClipboard(params.upiId);
    setCopied(true);
    if (onCopied) onCopied();
    setTimeout(() => setCopied(false), 2000);
    setIsOpen(false);
  };

  const isSmall = size === 'sm';

  return (
    <div ref={dropdownRef} className={`relative inline-flex items-center ${className}`}>
      {/* Grouped Action: Primary PhonePe Button + Options Dropdown */}
      <div className="inline-flex rounded-xl shadow-xs overflow-hidden border border-[#5f259f]/40">
        {/* Primary Action: Direct PhonePe Redirect */}
        <a
          href={phonepeUrl}
          className={`bg-[#5f259f] hover:bg-[#4d1e82] text-white font-bold flex items-center gap-1.5 transition active:scale-95 ${
            isSmall ? 'px-2.5 py-1 text-[11px]' : 'px-3.5 py-1.5 text-xs'
          }`}
          title="Direct 1-Click Pay with PhonePe (Bypasses WhatsApp)"
        >
          {/* PhonePe Brand Glyph */}
          <span className="w-4 h-4 rounded-full bg-white text-[#5f259f] flex items-center justify-center font-black text-[10px] leading-none shrink-0 shadow-2xs">
            पे
          </span>
          <span className="font-semibold">PhonePe</span>
        </a>

        {/* Dropdown Toggle for other apps & copy */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen((prev) => !prev);
          }}
          className={`bg-[#531f8b] hover:bg-[#431872] text-white border-l border-white/20 transition flex items-center justify-center active:scale-95 ${
            isSmall ? 'px-1.5 py-1' : 'px-2 py-1.5'
          }`}
          title="More payment apps (Google Pay, Paytm, Copy UPI)"
          aria-expanded={isOpen}
        >
          <ChevronDown className="w-3.5 h-3.5 text-purple-200" />
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 bottom-full mb-1.5 w-48 bg-white border border-[#E4EAF0] rounded-2xl shadow-xl py-1.5 z-50 text-left animate-in fade-in zoom-in-95 duration-100 text-[#192B3D]">
          <div className="px-3 py-1 border-b border-[#E4EAF0] text-[10px] font-bold uppercase tracking-wider text-[#718096]">
            Select Payment App
          </div>

          {/* 1. PhonePe (Recommended) */}
          <a
            href={phonepeUrl}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-[#F7F8F5] transition text-[#192B3D]"
          >
            <span className="w-5 h-5 rounded-lg bg-[#5f259f] text-white flex items-center justify-center font-black text-[10px] shrink-0">
              पे
            </span>
            <div className="flex-1 min-w-0">
              <span className="block truncate font-bold text-[#5f259f]">PhonePe</span>
              <span className="block text-[10px] text-[#718096]">Direct Launch</span>
            </div>
          </a>

          {/* 2. Google Pay */}
          <a
            href={gpayUrl}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-[#F7F8F5] transition text-[#192B3D]"
          >
            <span className="w-5 h-5 rounded-lg bg-[#4285F4] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
              G
            </span>
            <div className="flex-1 min-w-0">
              <span className="block truncate font-bold">Google Pay</span>
              <span className="block text-[10px] text-[#718096]">Direct Launch</span>
            </div>
          </a>

          {/* 3. Paytm */}
          <a
            href={paytmUrl}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-[#F7F8F5] transition text-[#192B3D]"
          >
            <span className="w-5 h-5 rounded-lg bg-[#002E6E] text-[#00BAF2] flex items-center justify-center font-black text-[9px] shrink-0">
              pay
            </span>
            <div className="flex-1 min-w-0">
              <span className="block truncate font-bold">Paytm</span>
              <span className="block text-[10px] text-[#718096]">Direct Launch</span>
            </div>
          </a>

          {/* 4. Any UPI App */}
          <a
            href={universalUrl}
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-[#F7F8F5] transition text-[#192B3D]"
          >
            <span className="w-5 h-5 rounded-lg bg-[#145B4A] text-[#78C5A7] flex items-center justify-center font-black text-[10px] shrink-0">
              ⚡
            </span>
            <div className="flex-1 min-w-0">
              <span className="block truncate font-semibold">Other UPI App</span>
              <span className="block text-[10px] text-[#718096]">Generic intent</span>
            </div>
          </a>

          <div className="my-1 border-t border-[#E4EAF0]" />

          {/* 5. Copy UPI ID */}
          <button
            type="button"
            onClick={handleCopy}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold hover:bg-[#F7F8F5] transition text-[#718096] hover:text-[#192B3D]"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-[#145B4A] stroke-[3]" />
                <span className="text-[#145B4A] font-bold">UPI Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy UPI ID</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

