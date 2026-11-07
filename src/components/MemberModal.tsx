import React, { useState, useEffect } from 'react';
import type { Member } from '../types';
import { X, Users, Check, Lock } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-800">
        {/* Header */}
        <div className="px-6 py-4 bg-[#5bc5a7] text-white flex items-center justify-between sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-white" />
            <div>
              <h2 className="text-lg font-black text-white m-0">
                Road Trip Friends ({list.length})
              </h2>
              <p className="text-xs text-white/90 mt-0.5">
                Member names are locked • Update UPI IDs for 1-click settlements
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

        {/* Member List (Names are Non-Editable) */}
        <div className="p-5 sm:p-6 space-y-3 overflow-y-auto flex-1">
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Fixed Trip Members:</strong> User names cannot be altered or removed. You can update each friend's UPI handle below for instant settlements.
            </span>
          </div>

          <div className="space-y-2.5 pt-1">
            {list.map((member) => (
              <div
                key={member.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition"
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
                      <span className="font-bold text-slate-900 text-sm truncate">
                        {member.name}
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-slate-500 bg-slate-200/80 px-1.5 py-0.5 rounded-full shrink-0">
                        <Lock className="w-2.5 h-2.5" />
                        Fixed
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400">Road Trip Member</span>
                  </div>
                </div>

                {/* Editable UPI ID */}
                <div className="w-full sm:w-56 shrink-0">
                  <label htmlFor={`member-upi-${member.id}`} className="sr-only">
                    UPI ID for {member.name}
                  </label>
                  <input
                    id={`member-upi-${member.id}`}
                    name={`upi_${member.id}`}
                    type="text"
                    value={member.upiId || ''}
                    onChange={(e) => handleUpdateUpi(member.id, e.target.value)}
                    placeholder="UPI ID (e.g. name@okhdfc)"
                    aria-label={`UPI ID for ${member.name}`}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-mono focus:outline-none focus:border-[#5bc5a7] focus:ring-1 focus:ring-[#5bc5a7]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 flex items-center justify-end gap-2 bg-slate-50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-[#5bc5a7] hover:bg-[#48b396] text-white transition flex items-center gap-1.5 shadow-xs active:scale-95"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save UPI Settings</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
