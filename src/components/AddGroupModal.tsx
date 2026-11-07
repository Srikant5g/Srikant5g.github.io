import React, { useState } from 'react';
import type { Member } from '../types';
import { X, Plus, FolderPlus, Users } from 'lucide-react';

interface AddGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (name: string, location?: string, memberIds?: string[]) => void;
  allMembers: Member[];
  onOpenAddFriend?: () => void;
}

export const AddGroupModal: React.FC<AddGroupModalProps> = ({
  isOpen,
  onClose,
  onCreateGroup,
  allMembers,
  onOpenAddFriend,
}) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>(allMembers.map((m) => m.id));
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      setSelectedMemberIds(allMembers.map((m) => m.id));
      setError(null);
    }
  }, [isOpen, allMembers.length]);

  if (!isOpen) return null;

  const toggleMember = (id: string) => {
    if (selectedMemberIds.includes(id)) {
      if (selectedMemberIds.length === 1) {
        setError('At least one friend must be in the group');
        return;
      }
      setSelectedMemberIds(selectedMemberIds.filter((mId) => mId !== id));
    } else {
      setSelectedMemberIds([...selectedMemberIds, id]);
    }
    setError(null);
  };

  const selectAll = () => {
    setSelectedMemberIds(allMembers.map((m) => m.id));
    setError(null);
  };

  const deselectAll = () => {
    if (allMembers.length > 0) {
      setSelectedMemberIds([allMembers[0].id]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError('Please enter a group name');
      return;
    }

    if (selectedMemberIds.length === 0) {
      setError('Please select at least one friend for this group');
      return;
    }

    onCreateGroup(trimmedName, location.trim() || undefined, selectedMemberIds);
    setName('');
    setLocation('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white border border-[#E4EAF0] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-[#192B3D]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#145B4A] text-white flex items-center justify-between sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#78C5A7]/20 flex items-center justify-center">
              <FolderPlus className="w-4 h-4 text-[#78C5A7]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white m-0">
                Create New Group
              </h2>
              <p className="text-xs text-[#78C5A7] mt-0.5">
                Organize a new road trip, vacation, or shared expense pool
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

          {/* Group Name Field */}
          <div>
            <label className="text-[11px] font-bold text-[#718096] uppercase tracking-wider block mb-1">
              Group / Trip Name *
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
              placeholder="e.g. Manali Snow Trip, Goa Beach Villa, Flatmates"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4EAF0] focus:border-[#145B4A] focus:ring-2 focus:ring-[#145B4A]/10 text-xs sm:text-sm font-semibold text-[#192B3D] bg-white transition outline-none"
            />
          </div>

          {/* Location Field */}
          <div>
            <label className="text-[11px] font-bold text-[#718096] uppercase tracking-wider block mb-1">
              Destination / Location (Optional)
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Himachal Pradesh 🏔️, North Goa 🏖️"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4EAF0] focus:border-[#145B4A] focus:ring-2 focus:ring-[#145B4A]/10 text-xs sm:text-sm font-semibold text-[#192B3D] bg-white transition outline-none"
            />
          </div>

          {/* Friends Selection */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-bold text-[#718096] uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#145B4A]" />
                <span>Friends in this Group ({selectedMemberIds.length}/{allMembers.length})</span>
              </label>
              <div className="flex items-center gap-2 text-xs">
                {selectedMemberIds.length === allMembers.length ? (
                  <button
                    type="button"
                    onClick={deselectAll}
                    className="text-[#718096] hover:text-[#192B3D] font-bold"
                  >
                    Reset
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={selectAll}
                    className="text-[#145B4A] hover:underline font-bold"
                  >
                    Select All
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1">
              {allMembers.map((member) => {
                const isChecked = selectedMemberIds.includes(member.id);
                return (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => toggleMember(member.id)}
                    className={`flex items-center gap-2.5 p-2 rounded-xl border text-left transition active:scale-98 ${
                      isChecked
                        ? 'border-[#145B4A] bg-[#145B4A]/5'
                        : 'border-[#E4EAF0] bg-white opacity-60 hover:opacity-100'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                        isChecked
                          ? 'bg-[#145B4A] border-[#145B4A] text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isChecked && <span className="text-[10px] font-black leading-none">✓</span>}
                    </div>
                    <div
                      className={`w-6 h-6 rounded-full ${member.avatarColor} text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-xs`}
                    >
                      {member.name.charAt(0)}
                    </div>
                    <span className="text-xs font-bold text-[#192B3D] truncate flex-1">
                      {member.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {onOpenAddFriend && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenAddFriend();
                }}
                className="w-full py-2 px-3 rounded-xl border border-dashed border-[#78C5A7] text-[#145B4A] bg-[#78C5A7]/10 hover:bg-[#78C5A7]/20 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add a New Friend to include</span>
              </button>
            )}
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
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Create Group</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
