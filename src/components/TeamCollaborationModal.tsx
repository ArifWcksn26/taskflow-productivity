import React, { useState } from 'react';
import {
  X,
  Users,
  UserPlus,
  Mail,
  Shield,
  Copy,
  CheckCircle2,
  Trash2,
  Share2,
} from 'lucide-react';
import { TeamMember, Task } from '../types';

interface TeamCollaborationModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: TeamMember[];
  tasks: Task[];
  onAddMember: (member: Omit<TeamMember, 'id'>) => void;
  onRemoveMember: (id: string) => void;
  workspaceId?: string;
}

export const TeamCollaborationModal: React.FC<TeamCollaborationModalProps> = ({
  isOpen,
  onClose,
  members,
  tasks,
  onAddMember,
  onRemoveMember,
  workspaceId = 'pro-workspace-1',
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'editor' | 'viewer'>('editor');
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const currentInviteLink = `${window.location.origin}/?invite=${encodeURIComponent(workspaceId)}`;

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const colors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const avatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

    onAddMember({
      name: name.trim(),
      email: email.trim(),
      role,
      avatar,
      color: randomColor,
    });

    setName('');
    setEmail('');
  };

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(currentInviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const getMemberTaskStats = (memberId: string) => {
    const assigned = tasks.filter((t) => t.assignedMemberIds.includes(memberId));
    const completed = assigned.filter((t) => t.isCompleted).length;
    return { total: assigned.length, completed };
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-4">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Kolaborasi Tim & Penugasan
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Kelola akses kolaborator dan pantau pembagian beban tugas.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup Modal Kolaborasi Tim"
            className="p-1 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3.5 max-h-[82vh] overflow-y-auto">
          {/* Shareable Invite Link Card */}
          <div className="p-3 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-900 dark:text-indigo-200 flex items-center gap-1.5">
                <Share2 className="w-3 h-3" />
                Tautan Undangan Proyek Real-Time (Akun Google)
              </span>
              {copiedLink && (
                <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Tersalin!
                </span>
              )}
            </div>
            <div className="flex gap-1.5">
              <input
                type="text"
                readOnly
                aria-label="Tautan Undangan Proyek Real-Time"
                value={currentInviteLink}
                className="flex-1 px-2.5 py-1 text-xs rounded-lg bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800/80 text-slate-600 dark:text-slate-300 select-all"
              />
              <button
                onClick={handleCopyInviteLink}
                aria-label="Salin Tautan Undangan Proyek"
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
              >
                <Copy className="w-3 h-3" />
                <span>Salin Link</span>
              </button>
            </div>
          </div>

          {/* Members List */}
          <div className="space-y-2">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Daftar Anggota Tim ({members.length})
            </h3>

            <div className="space-y-1.5">
              {members.map((m) => {
                const stats = getMemberTaskStats(m.id);
                return (
                  <div
                    key={m.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-2.5 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={m.avatar}
                        alt={m.name}
                        className="w-7 h-7 rounded-full object-cover ring-1 ring-white dark:ring-slate-800"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-slate-900 dark:text-slate-100 truncate text-xs">
                            {m.name}
                          </span>
                          {m.isCurrentUser ? (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                              Anda (Google)
                            </span>
                          ) : m.id.startsWith('google-') ? (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
                              Google Auth Verified
                            </span>
                          ) : (
                            <span className="text-[9px] font-medium px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                              Menunggu Login Google
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">{m.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 flex-shrink-0">
                      <div className="text-right hidden sm:block">
                        <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
                          {stats.completed}/{stats.total} Tugas
                        </div>
                        <div className="text-[9px] text-slate-400 uppercase">{m.role}</div>
                      </div>

                      {!m.isCurrentUser && !m.id.startsWith('google-') && (
                        <button
                          onClick={() => {
                            const link = `${window.location.origin}/?invite=${encodeURIComponent(workspaceId)}&email=${encodeURIComponent(m.email)}`;
                            navigator.clipboard.writeText(link);
                            alert(`Tautan khusus untuk ${m.email} berhasil disalin! Bagikan ke ${m.name} agar akun Google miliknya langsung terhubung.`);
                          }}
                          className="px-2 py-1 text-[10px] font-semibold rounded bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300 hover:bg-indigo-100 transition-colors"
                          title="Salin Link Undangan Khusus Email Ini"
                        >
                          Salin Link Email
                        </button>
                      )}

                      {!m.isCurrentUser && (
                        <button
                          onClick={() => onRemoveMember(m.id)}
                          aria-label={`Hapus ${m.name}`}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                          title="Hapus Anggota"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Add New Member Form */}
          <form
            onSubmit={handleAddSubmit}
            className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2"
          >
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <UserPlus className="w-3.5 h-3.5 text-indigo-500" />
              <span>Undang Anggota Baru</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nama lengkap..."
                className="px-2.5 py-1 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Alamat email..."
                className="px-2.5 py-1 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as 'admin' | 'editor' | 'viewer')}
                className="px-2 py-1 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
              >
                <option value="editor">Editor (Bisa edit tugas)</option>
                <option value="admin">Admin (Akses penuh)</option>
                <option value="viewer">Viewer (Hanya lihat)</option>
              </select>

              <button
                type="submit"
                disabled={!name.trim() || !email.trim()}
                className="px-3 py-1 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition-colors"
              >
                + Tambahkan Anggota
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
