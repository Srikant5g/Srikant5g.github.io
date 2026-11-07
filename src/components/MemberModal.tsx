import React, { useState, useEffect } from 'react';
import type { Member } from '../types';
import { X, Users, Check, Lock, ShieldCheck } from 'lucide-react';

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  onSaveMembers: (updatedMembers: Member[]) => void;
}

export const MemberModal: React.FC<MemberModalProps> = ({
  isOpen,
  onClose,
  members,
  onSaveMembers,
}) => {
  const [list, setList] = useState<Member[]>(members);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setList(members);
      setSavedSuccess(false);
    }
  }, [isOpen, members]);

  if (!isOpen) return null;

  const handleUpdateUpi = (id: string, upiId: string) => {
    setList((prev) =>
      prev.map((m) => (m.id === id ? { ...m, upiId: upiId.trim() || undefined } : m))
    );
  };

  const handleSave = () => {
    onSaveMembers(list);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white border border-[#E4EAF0] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-[#192B3D]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#145B4A] text-white flex items-center justify-between sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#78C5A7]/20 flex items-center justify-center">
              <Users className="w-4 h-4 text-[#78C5A7]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white m-0">
                Trip Members ({list.length})
              </h2>
              <p className="text-xs text-[#78C5A7] mt-0.5">
                Fixed members • Configure UPI handles for instant settlements
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close members modal"
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Member List (Names are Non-Editable) */}
        <div className="p-5 sm:p-6 space-y-3.5 overflow-y-auto flex-1">
          <div className="p-3 rounded-2xl bg-[#F7F8F5] border border-[#E4EAF0] text-[#718096] text-xs flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#145B4A] shrink-0" />
            <span className="leading-relaxed">
              <strong className="text-[#192B3D]">Locked Group Members:</strong> All 7 participants are preserved. Enter UPI IDs below to enable 1-click Pay UPI for settlements.
            </span>
          </div>

          <div className="space-y-2.5 pt-1">
            {list.map((member) => (
              <div
                key={member.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3.5 bg-white rounded-2xl border border-[#E4EAF0] hover:border-[#78C5A7] transition shadow-2xs"
              >
                {/* Fixed Non-Editable Member Name & Avatar */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-full ${member.avatarColor} text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs`}
                  >
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-[#192B3D] text-sm truncate">
                        {member.name}
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#718096] bg-[#F7F8F5] border border-[#E4EAF0] px-1.5 py-0.5 rounded-full shrink-0">
                        <Lock className="w-2.5 h-2.5" />
                        Fixed
                      </span>
                    </div>
                  </div>
                </div>

                {/* Editable UPI ID */}
                <div className="flex items-center gap-2 shrink-0 sm:w-56">
                  <label htmlFor={`upi-input-${member.id}`} className="sr-only">
                    UPI ID for {member.name}
                  </label>
                  <input
                    id={`upi-input-${member.id}`}
                    name={`upi-${member.id}`}
                    type="text"
                    value={member.upiId || ''}
                    onChange={(e) => handleUpdateUpi(member.id, e.target.value)}
                    placeholder="name@okaxis / upi"
                    aria-label={`UPI ID for ${member.name}`}
                    className="w-full text-xs font-mono px-3 py-2 rounded-xl bg-[#F7F8F5] border border-[#E4EAF0] focus:outline-none focus:border-[#145B4A] focus:bg-white transition text-[#192B3D]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-[#F7F8F5] border-t border-[#E4EAF0] flex items-center justify-between gap-3 shrink-0">
          <p className="text-[11px] text-[#718096]">
            Changes persist to offline storage & sync
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#E4EAF0] text-xs font-bold text-[#718096] hover:bg-white transition"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-[#145B4A] hover:bg-[#0f4437] text-white text-xs font-bold transition flex items-center gap-1.5 active:scale-95 shadow-xs"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Saved!</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
