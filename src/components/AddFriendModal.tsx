import React, { useState } from 'react';
import { X, UserPlus, Check } from 'lucide-react';
import { AVATAR_COLORS } from '../utils/sampleData';

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFriend: (name: string, upiId?: string, avatarColor?: string) => void;
  existingNames?: string[];
}

export const AddFriendModal: React.FC<AddFriendModalProps> = ({
  isOpen,
  onClose,
  onAddFriend,
  existingNames = [],
}) => {
  const [name, setName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [selectedColor, setSelectedColor] = useState(AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Please enter a friend name');
      return;
    }

    if (existingNames.some((n) => n.toLowerCase() === trimmedName.toLowerCase())) {
      setError(`A friend named "${trimmedName}" already exists in the group`);
      return;
    }

    onAddFriend(trimmedName, upiId.trim() || undefined, selectedColor);
    setName('');
    setUpiId('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white border border-[#E4EAF0] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-[#192B3D]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#145B4A] text-white flex items-center justify-between sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#78C5A7]/20 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-[#78C5A7]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white m-0">
                Add New Friend
              </h2>
              <p className="text-xs text-[#78C5A7] mt-0.5">
                Add a participant to split expenses & settle debts
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

          {/* Avatar Preview */}
          <div className="flex items-center gap-3 p-3 bg-[#F7F8F5] border border-[#E4EAF0] rounded-2xl">
            <div
              className={`w-12 h-12 rounded-2xl ${selectedColor} text-white font-black text-lg flex items-center justify-center shadow-xs shrink-0`}
            >
              {name.trim() ? name.trim().charAt(0).toUpperCase() : '?'}
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-bold text-sm text-[#192B3D] block truncate">
                {name.trim() || 'New Friend Name'}
              </span>
              <span className="text-xs text-[#718096] block truncate">
                {upiId.trim() || 'No UPI ID specified'}
              </span>
            </div>
          </div>

          {/* Name Field */}
          <div>
            <label className="text-[11px] font-bold text-[#718096] uppercase tracking-wider block mb-1">
              Friend's Full Name *
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder="e.g. Rahul Sharma, Sneha M"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4EAF0] focus:border-[#145B4A] focus:ring-2 focus:ring-[#145B4A]/10 text-xs sm:text-sm font-semibold text-[#192B3D] bg-white transition outline-none"
            />
          </div>

          {/* UPI ID Field */}
          <div>
            <label className="text-[11px] font-bold text-[#718096] uppercase tracking-wider block mb-1">
              UPI ID (Optional for 1-Click Payments)
            </label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="e.g. name@okaxis, friend@paytm"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4EAF0] focus:border-[#145B4A] focus:ring-2 focus:ring-[#145B4A]/10 text-xs sm:text-sm font-semibold text-[#192B3D] bg-white transition outline-none font-mono"
            />
            <p className="text-[11px] text-[#718096] mt-1">
              Allows group members to pay this friend directly via PhonePe, GPay, or Paytm.
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
          <div className="pt-3 border-t border-[#E4EAF0] flex items-center justify-end gap-2.5">
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
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add Friend</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

