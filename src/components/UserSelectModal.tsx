import React from 'react';
import type { Member } from '../types';
import { Check, X, UserCheck } from 'lucide-react';

interface UserSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  currentUserId: string;
  onSelectUser: (userId: string) => void;
}

export const UserSelectModal: React.FC<UserSelectModalProps> = ({
  isOpen,
  onClose,
  members,
  currentUserId,
  onSelectUser,
}) => {
  if (!isOpen) return null;

  const handleSelect = (memberId: string) => {
    onSelectUser(memberId);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white border border-[#E4EAF0] rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden my-auto flex flex-col text-[#192B3D] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 pb-4 text-center border-b border-[#E4EAF0] relative bg-[#F7F8F5]">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-[#718096] hover:text-[#192B3D] hover:bg-[#E4EAF0] transition"
            title="Close"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-[#145B4A] text-[#78C5A7] flex items-center justify-center mx-auto shadow-xs mb-3">
            <UserCheck className="w-6 h-6 stroke-[2.5]" />
          </div>

          <h2 className="text-xl font-black text-[#192B3D] tracking-tight">
            Who are you?
          </h2>
          <p className="text-xs text-[#718096] font-medium mt-1">
            Select your name to personalize your trip expenses
          </p>
        </div>

        {/* Member Options List */}
        <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
          {members.map((member) => {
            const isSelected = member.id === currentUserId;

            return (
              <button
                key={member.id}
                type="button"
                onClick={() => handleSelect(member.id)}
                className={`w-full flex items-center justify-between p-3 rounded-2xl transition border text-left group active:scale-[0.98] ${
                  isSelected
                    ? 'border-[#145B4A] bg-[#78C5A7]/15 shadow-xs ring-1 ring-[#145B4A]'
                    : 'border-[#E4EAF0] bg-white hover:bg-[#F7F8F5] hover:border-[#78C5A7]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-2xl ${member.avatarColor} text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-xs group-hover:scale-105 transition-transform`}
                  >
                    {member.name.charAt(0)}
                  </div>

                  <div className="min-w-0">
                    <span className="font-bold text-sm text-[#192B3D] block truncate">
                      {member.name}
                    </span>
                    {member.upiId && (
                      <span className="text-[11px] text-[#718096] font-mono block truncate">
                        {member.upiId}
                      </span>
                    )}
                  </div>
                </div>

                <div className="shrink-0 pl-2">
                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-[#145B4A] text-white flex items-center justify-center shadow-xs">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border border-[#E4EAF0] group-hover:border-[#78C5A7] transition" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
