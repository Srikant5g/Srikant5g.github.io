import React, { useEffect } from 'react';
import { X, ArrowRight, ShieldCheck, Zap, Smartphone } from 'lucide-react';

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
        className="bg-white border border-slate-200 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden my-auto flex flex-col text-slate-800 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Welcome Thumbnail Banner */}
        <div className="relative w-full bg-[#0a3c36] overflow-hidden border-b border-teal-800/30">
          <img
            src="/og-thumbnail.svg"
            alt="Road Trip 2026 Thumbnail"
            className="w-full h-44 sm:h-48 object-cover object-center"
          />
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-black/20 pointer-events-none" />

          {/* Close / Skip button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-md transition shadow-md z-10"
            title="Skip and enter dashboard"
            aria-label="Skip and enter dashboard"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Title overlay */}
          <div className="absolute bottom-3 left-4 right-4 text-white">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/90 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-white shadow-xs">
              🚗 ROAD TRIP 2026
            </span>
            <h2 className="text-xl sm:text-2xl font-black mt-1 tracking-tight text-white drop-shadow-md">
              Welcome to <span className="text-amber-300">TripTab</span> 🚗💨
            </h2>
            <p className="text-[11px] text-emerald-100 font-medium mt-0.5">
              The official road trip expense tab
            </p>
          </div>
        </div>

        {/* Clean, Simple Feature Highlights (Zero Names) */}
        <div className="p-5 space-y-3 bg-white">
          <div className="grid grid-cols-1 gap-2 text-xs text-slate-700">
            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold">Fast highway splits for diesel, food & stay</span>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                <Smartphone className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold">1-Click direct UPI settlement via GPay & PhonePe</span>
            </div>

            <div className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100">
              <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <span className="font-semibold">Protected with Security PIN</span>
            </div>
          </div>
        </div>

        {/* 2-Second Progress Countdown Bar & Skip Action */}
        <div className="bg-slate-50 border-t border-slate-100 px-5 py-3 flex items-center justify-between">
          <div className="flex-1 mr-4">
            <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
              Entering trip dashboard in 2s...
            </span>
            {/* Animated 2s progress bar */}
            <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
              <div className="bg-[#5bc5a7] h-full rounded-full animate-welcome-progress" />
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-200 transition flex items-center gap-1 active:scale-95 shrink-0"
          >
            <span>Skip</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
