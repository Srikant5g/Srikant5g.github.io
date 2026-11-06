import React, { useState } from 'react';
import type { Member } from '../types';
import { AVATAR_COLORS } from '../utils/sampleData';
import { X, UserPlus, Trash2, Users, Check } from 'lucide-react';

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
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberUpi, setNewMemberUpi] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleUpdateMember = (
    id: string,
    field: keyof Member,
    value: string
  ) => {
    setList((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    const randomColor =
      AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    const newMember: Member = {
      id: `m_${Date.now()}`,
      name: newMemberName.trim(),
      avatarColor: randomColor,
      upiId: newMemberUpi.trim() || undefined,
    };

    setList([...list, newMember]);
    setNewMemberName('');
    setNewMemberUpi('');
  };

  const handleRemoveMember = (id: string) => {
    if (list.length <= 2) {
      alert('You need at least 2 members for expense splitting.');
      return;
    }
    setList(list.filter((m) => m.id !== id));
  };

  const handleSave = () => {
    onSaveMembers(list);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col text-slate-800">
        {/* Header */}
        <div className="px-6 py-4 bg-[#5bc5a7] text-white flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <Users className="w-5 h-5 text-white" />
            <div>
              <h2 className="text-lg font-black text-white m-0">
                Goa Friends ({list.length})
              </h2>
              <p className="text-xs text-white/90 mt-0.5">
                Rename members & set UPI IDs for 1-click settlements
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

        {/* Member List */}
        <div className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="space-y-2.5">
            {list.map((member, index) => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200"
              >
                <div
                  className={`w-8 h-8 rounded-full ${member.avatarColor} text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs`}
                >
                  {member.name.charAt(0).toUpperCase() || index + 1}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                  <input
                    type="text"
                    value={member.name}
                    onChange={(e) =>
                      handleUpdateMember(member.id, 'name', e.target.value)
                    }
                    placeholder="Friend's Name"
                    className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-[#5bc5a7]"
                  />
                  <input
                    type="text"
                    value={member.upiId || ''}
                    onChange={(e) =>
                      handleUpdateMember(member.id, 'upiId', e.target.value)
                    }
                    placeholder="UPI ID (e.g. name@okhdfc)"
                    className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-800 focus:outline-none focus:border-[#5bc5a7]"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveMember(member.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                  title="Remove friend"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Another Friend */}
          <div className="pt-3 border-t border-slate-200">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Add Friend
            </h4>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="Name"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#5bc5a7] flex-1"
              />
              <input
                type="text"
                placeholder="UPI ID (optional)"
                value={newMemberUpi}
                onChange={(e) => setNewMemberUpi(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-[#5bc5a7] flex-1"
              />
              <button
                type="button"
                onClick={handleAddMember}
                className="px-3.5 py-1.5 rounded-lg bg-[#5bc5a7] hover:bg-[#48b396] text-white text-xs font-bold flex items-center justify-center gap-1 transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 flex items-center justify-end gap-2 bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-md text-xs font-bold bg-[#5bc5a7] hover:bg-[#48b396] text-white transition flex items-center gap-1.5 shadow-xs"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Saved!</span>
              </>
            ) : (
              <span>Save Friends</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
