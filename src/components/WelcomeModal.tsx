import React, { useEffect } from 'react';
import { X, ArrowRight, ShieldCheck, Zap, Smartphone, Sparkles } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenShare?: () => void;
  onOpenAddExpense?: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
}) => {
  // Auto-dismiss after 2 seconds
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      onClose();
    }, 2000);

    return () => clearTimeout(timer);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white border border-[#E4EAF0] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden my-auto flex flex-col text-[#192B3D] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Welcome Thumbnail Banner */}
        <div className="relative w-full bg-[#145B4A] overflow-hidden border-b border-[#145B4A]/20">
          <img
            src="/og-thumbnail.svg"
            alt="TripTally Thumbnail"
            className="w-full h-44 sm:h-48 object-cover object-center"
          />
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#145B4A]/90 via-[#145B4A]/30 to-black/20 pointer-events-none" />

          {/* Close / Skip button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition shadow-md z-10"
            title="Skip and enter dashboard"
            aria-label="Skip and enter dashboard"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Title overlay */}
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#78C5A7] text-[10px] font-black uppercase tracking-wider text-[#145B4A] shadow-xs">
              <Sparkles className="w-3 h-3 fill-current" />
              <span>TRIPTALLY 2026</span>
            </span>
            <h2 className="text-xl sm:text-2xl font-black mt-1 tracking-tight text-white drop-shadow-sm">
              Welcome to <span className="text-[#78C5A7]">TripTally</span>
            </h2>
            <p className="text-[11px] text-white/90 font-medium mt-0.5">
              Every trip. Every expense. Sorted.
            </p>
          </div>
        </div>

        {/* Clean, Simple Feature Highlights (Zero Names) */}
        <div className="p-5 space-y-2.5 bg-white">
          <div className="grid grid-cols-1 gap-2 text-xs text-[#192B3D]">
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#F7F8F5] border border-[#E4EAF0]">
              <div className="w-6 h-6 rounded-lg bg-[#78C5A7]/20 text-[#145B4A] flex items-center justify-center shrink-0">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold">Fast group splits for fuel, food, stays & activities</span>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#F7F8F5] border border-[#E4EAF0]">
              <div className="w-6 h-6 rounded-lg bg-[#78C5A7]/20 text-[#145B4A] flex items-center justify-center shrink-0">
                <Smartphone className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold">1-Click direct UPI settlements via GPay, PhonePe & Paytm</span>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#F7F8F5] border border-[#E4EAF0]">
              <div className="w-6 h-6 rounded-lg bg-[#FF784F]/15 text-[#FF784F] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold">Protected with secure trip PIN verification</span>
            </div>
          </div>
        </div>

        {/* 2-Second Progress Countdown Bar & Skip Action */}
        <div className="bg-[#F7F8F5] border-t border-[#E4EAF0] px-5 py-3 flex items-center justify-between">
          <div className="flex-1 mr-4">
            <span className="text-[11px] font-semibold text-[#718096] block mb-1.5">
              Entering trip dashboard in 2s...
            </span>
            {/* Animated 2s progress bar */}
            <div className="w-full bg-[#E4EAF0] h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#78C5A7] h-full rounded-full animate-welcome-progress" />
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#145B4A] hover:bg-[#78C5A7]/20 transition flex items-center gap-1 active:scale-95 shrink-0"
          >
            <span>Skip</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
