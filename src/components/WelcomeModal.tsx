import React from 'react';
import type { Member } from '../types';
import { X, Sparkles, Share2, Compass, ArrowRight } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  onOpenShare: () => void;
  onOpenAddExpense: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  members,
  onOpenShare,
  onOpenAddExpense,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-800 animate-in zoom-in-95 duration-200">
        {/* Modal Header with Close Button */}
        <div className="relative shrink-0">
          {/* Welcome Thumbnail Banner */}
          <div className="w-full bg-[#0a3c36] overflow-hidden relative border-b border-teal-800/40">
            <img
              src="/og-thumbnail.svg"
              alt="Goa Road Trip 2026 Thumbnail"
              className="w-full h-44 sm:h-52 object-cover object-center"
            />
            {/* Top gradient vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-black/30 pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center backdrop-blur-md transition shadow-md z-10"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Overlaid Title on Thumbnail */}
            <div className="absolute bottom-2.5 left-4 right-4 text-white">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/90 backdrop-blur-md text-[10px] font-black uppercase tracking-wider text-white shadow-xs">
                🚗 GOA ROAD TRIP 2026
              </span>
              <h2 className="text-xl sm:text-2xl font-black mt-1 tracking-tight text-white drop-shadow-md">
                Welcome to <span className="text-amber-300">GoaTab</span> 🏖️
              </h2>
              <p className="text-[11px] sm:text-xs text-emerald-100 font-medium line-clamp-1">
                The official road trip expense tab for our 7 friends
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto flex-1">
          {/* Crew Members Showcase */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#5bc5a7]" />
                Official Road Trip Crew ({members.length})
              </span>
              <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Names Locked
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {members.map((member, idx) => {
                const isLastOdd = members.length % 2 !== 0 && idx === members.length - 1;
                return (
                  <div
                    key={member.id}
                    className={`flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-200 ${
                      isLastOdd ? 'col-span-2 sm:col-span-1' : ''
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-full ${member.avatarColor} text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs`}
                    >
                      {member.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {member.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono truncate">
                        {member.upiId || 'No UPI set'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Guide / How It Works */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-600 block">
              Trip Rules & How It Works:
            </span>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-[11px] font-black shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <strong className="text-slate-800">Record Every Bill on Highway:</strong> Diesel, Fastag tolls, highway dhabha food, drinks, and villa booking. Split equally or custom.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-[11px] font-black shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <strong className="text-slate-800">Instant Realtime Sync:</strong> Updates on any phone or laptop sync across all 7 friends in seconds.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-[11px] font-black shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <strong className="text-slate-800">1-Click UPI Settlement:</strong> Smart algorithms minimize group debts into direct payments via GPay, PhonePe, or Paytm.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-[11px] font-black shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <strong className="text-slate-800">PIN Protected (0852):</strong> Accidental bill deletion or resetting trip history is guarded by security PIN <strong>0852</strong>.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Sticky Footer Actions */}
        <div className="px-5 sm:px-6 py-3.5 bg-slate-50 border-t border-slate-200 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenShare();
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-100 font-bold text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
          >
            <Share2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Share Link on WhatsApp</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAddExpense();
              }}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold bg-[#5bc5a7] hover:bg-[#48b396] text-white transition text-center shadow-xs active:scale-95 flex items-center justify-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>+ Add Bill</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black bg-[#ff652f] hover:bg-[#e55320] text-white shadow-xs transition active:scale-95 text-center flex items-center justify-center gap-1.5"
            >
              <span>Enter Trip Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
