import React, { useState, useEffect } from 'react';
import type { Member } from '../types';
import { X, Check, QrCode, Sparkles, Trash2 } from 'lucide-react';
import { AVATAR_COLORS } from '../utils/sampleData';

interface EditFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  onSave: (updatedMember: Member) => void;
  onDelete?: (memberId: string) => void;
  isDeletable?: boolean;
}

const COMMON_UPI_HANDLES = [
  '@okhdfc',
  '@okaxis',
  '@okicici',
  '@oksbi',
  '@paytm',
  '@ybl',
  '@upi',
];

export const EditFriendModal: React.FC<EditFriendModalProps> = ({
  isOpen,
  onClose,
  member,
  onSave,
  onDelete,
  isDeletable = false,
}) => {
  const [name, setName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[0]);
  const [error, setError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (member) {
      setName(member.name);
      setUpiId(member.upiId || '');
      setSelectedColor(member.avatarColor || AVATAR_COLORS[0]);
      setError(null);
      setSavedSuccess(false);
    }
  }, [member, isOpen]);

  if (!isOpen || !member) return null;

  const handleApplyHandle = (handle: string) => {
    const trimmed = upiId.trim();
    if (!trimmed) {
      // If empty, suggest prefix based on member name
      const prefix = name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .slice(0, 15);
      setUpiId(`${prefix || 'user'}${handle}`);
      return;
    }

    if (trimmed.includes('@')) {
      const prefix = trimmed.split('@')[0];
      setUpiId(`${prefix}${handle}`);
    } else {
      setUpiId(`${trimmed}${handle}`);
    }
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedUpi = upiId.trim();

    if (!trimmedName) {
      setError('Please enter a friend name');
      return;
    }

    if (trimmedUpi && !trimmedUpi.includes('@')) {
      setError('UPI ID must include an "@" handle (e.g. name@okhdfc or 9876543210@paytm)');
      return;
    }

    onSave({
      ...member,
      name: trimmedName,
      avatarColor: selectedColor,
      upiId: trimmedUpi || undefined,
    });

    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 350);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white border border-[#E4EAF0] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-[#192B3D]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#145B4A] text-white flex items-center justify-between sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#78C5A7]/20 flex items-center justify-center">
              <QrCode className="w-4 h-4 text-[#78C5A7]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white m-0">
                Edit Friend & UPI ID
              </h2>
              <p className="text-xs text-[#78C5A7] mt-0.5">
                Configure UPI ID for instant 1-click settlements
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Live Preview Card */}
          <div className="flex items-center gap-3 p-3.5 bg-[#F7F8F5] border border-[#E4EAF0] rounded-2xl">
            <div
              className={`w-12 h-12 rounded-2xl ${selectedColor} text-white font-black text-lg flex items-center justify-center shadow-xs shrink-0`}
            >
              {name.trim() ? name.trim().charAt(0).toUpperCase() : '?'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm text-[#192B3D] truncate">
                  {name.trim() || 'Friend Name'}
                </span>
                {upiId.trim() && (
                  <span className="text-[10px] font-bold text-[#145B4A] bg-[#78C5A7]/25 px-1.5 py-0.5 rounded-full shrink-0">
                    UPI Active ⚡
                  </span>
                )}
              </div>
              <span className="text-xs text-[#718096] font-mono block truncate mt-0.5">
                {upiId.trim() || 'No UPI ID set (Settlements will be manual)'}
              </span>
            </div>
          </div>

          {/* Name Field */}
          <div>
            <label className="text-[11px] font-bold text-[#718096] uppercase tracking-wider block mb-1">
              Friend Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder="e.g. Raghavendra G"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4EAF0] focus:border-[#145B4A] focus:ring-2 focus:ring-[#145B4A]/10 text-xs sm:text-sm font-semibold text-[#192B3D] bg-white transition outline-none"
            />
          </div>

          {/* UPI ID Field with 1-Tap Handle Chips */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold text-[#718096] uppercase tracking-wider">
                UPI ID / VPA Handle
              </label>
              {upiId && (
                <button
                  type="button"
                  onClick={() => setUpiId('')}
                  className="text-[10px] font-semibold text-rose-600 hover:underline"
                >
                  Clear UPI
                </button>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                value={upiId}
                onChange={(e) => {
                  setUpiId(e.target.value.toLowerCase().trim());
                  setError(null);
                }}
                placeholder="e.g. srikanth@upi or 9876543210@paytm"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4EAF0] focus:border-[#145B4A] focus:ring-2 focus:ring-[#145B4A]/10 text-xs sm:text-sm font-semibold text-[#192B3D] bg-white transition outline-none font-mono"
              />
            </div>

            {/* Quick 1-tap UPI Handle Chips */}
            <div className="mt-2 space-y-1">
              <span className="text-[10px] font-bold text-[#718096] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#145B4A]" />
                <span>1-Tap Popular UPI Handles:</span>
              </span>
              <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                {COMMON_UPI_HANDLES.map((handle) => (
                  <button
                    key={handle}
                    type="button"
                    onClick={() => handleApplyHandle(handle)}
                    className="px-2 py-1 rounded-lg bg-[#F7F8F5] hover:bg-[#78C5A7]/25 text-[#192B3D] hover:text-[#145B4A] border border-[#E4EAF0] hover:border-[#78C5A7] text-[10px] font-mono font-bold transition active:scale-95"
                  >
                    {handle}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-[#718096] mt-1.5 leading-relaxed">
              When friends settle up, they can tap to pay directly via <strong>Google Pay</strong>, <strong>PhonePe</strong>, or <strong>Paytm</strong>.
            </p>
          </div>

          {/* Avatar Color Picker */}
          <div>
            <label className="text-[11px] font-bold text-[#718096] uppercase tracking-wider block mb-2">
              Avatar Color
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {AVATAR_COLORS.map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setSelectedColor(col)}
                  className={`w-7 h-7 rounded-xl ${col} flex items-center justify-center transition active:scale-95 ${
                    selectedColor === col ? 'ring-2 ring-offset-2 ring-[#145B4A] scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  {selectedColor === col && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-[#E4EAF0] flex items-center justify-between gap-2.5">
            {isDeletable && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Remove ${member.name} from group?`)) {
                    onDelete(member.id);
                    onClose();
                  }
                }}
                className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-bold transition flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-[#E4EAF0] text-xs font-bold text-[#718096] hover:bg-[#F7F8F5] transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#145B4A] hover:bg-[#0f4639] text-white text-xs font-black shadow-xs transition active:scale-95 flex items-center gap-1.5"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>Save UPI & Details</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

