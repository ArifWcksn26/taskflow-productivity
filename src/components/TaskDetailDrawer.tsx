import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  Send,
  MessageSquare,
  History,
  CalendarPlus,
  Share2,
  CheckCircle2,
  Trash2,
  Edit2,
  Tag,
  Check,
  Download,
} from 'lucide-react';
import { Task, Category, TeamMember } from '../types';
import { ExportService } from '../services/exportService';

interface TaskDetailDrawerProps {
  task: Task | null;
  category?: Category;
  members: TeamMember[];
  onClose: () => void;
  onToggleComplete: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onAddComment: (taskId: string, text: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({
  task,
  category,
  members,
  onClose,
  onToggleComplete,
  onToggleSubtask,
  onAddComment,
  onEdit,
  onDelete,
}) => {
  const [newCommentText, setNewCommentText] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  if (!task) return null;

  const assignedList = members.filter((m) => task.assignedMemberIds.includes(m.id));
  const memberMap = new Map(members.map((m) => [m.id, m]));

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    onAddComment(task.id, newCommentText.trim());
    setNewCommentText('');
  };

  const handleShare = () => {
    const summary = `📌 Tugas: ${task.title}\n📅 Tenggat: ${task.dueDate || '-'} ${task.dueTime || ''}\n⭐ Prioritas: ${task.priority.toUpperCase()}\n📁 Kategori: ${category?.name || 'Umum'}\n\n${task.description || ''}`;
    navigator.clipboard.writeText(summary);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const handleAddToCalendar = () => {
    const url = ExportService.getGoogleCalendarUrl(task);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadICS = () => {
    ExportService.exportToICS([task]);
  };

  return (
    <div className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 h-full shadow-2xl border-l border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleComplete(task.id)}
              className={`w-5 h-5 rounded-md flex items-center justify-center transition-all ${
                task.isCompleted
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'border-1.5 border-slate-300 dark:border-slate-600 hover:border-indigo-500'
              }`}
            >
              {task.isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </button>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {task.isCompleted ? 'Tugas Selesai' : 'Rincian Tugas'}
            </span>
          </div>

          <div className="flex items-center gap-0.5">
            <button
              onClick={() => onEdit(task)}
              title="Edit Tugas"
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleShare}
              title="Salin Rangkuman Tugas"
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {copySuccess ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => {
                onDelete(task.id);
                onClose();
              }}
              title="Hapus Tugas"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ml-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Copy Feedback */}
        {copySuccess && (
          <div className="bg-emerald-50 dark:bg-emerald-950/60 border-b border-emerald-200 dark:border-emerald-800 px-4 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            ✓ Ringkasan tugas berhasil disalin ke papan klip!
          </div>
        )}

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Category & Priority Badges */}
          <div className="flex flex-wrap items-center gap-1.5">
            {category && (
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${category.bgLight} ${category.textLight}`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                {category.name}
              </span>
            )}
            <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Prioritas: {task.priority}
            </span>
          </div>

          {/* Title */}
          <h2
            className={`text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug ${
              task.isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''
            }`}
          >
            {task.title}
          </h2>

          {/* Description */}
          {task.description && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {task.description}
            </div>
          )}

          {/* Schedule & Calendar Sync Card */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                Jadwal & Kalender
              </span>
              {task.dueTime && (
                <span className="flex items-center gap-1 text-[10px] font-normal text-slate-500 dark:text-slate-400">
                  <Clock className="w-2.5 h-2.5" /> Pukul {task.dueTime}
                </span>
              )}
            </div>

            <div className="text-xs text-slate-600 dark:text-slate-300">
              Tenggat: <strong className="font-semibold text-slate-900 dark:text-white">{task.dueDate || 'Belum diatur'}</strong>
            </div>

            {/* Google Calendar & ICS Buttons */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              <button
                onClick={handleAddToCalendar}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-slate-700 dark:text-slate-200 shadow-xs transition-all"
              >
                <CalendarPlus className="w-3 h-3 text-indigo-600" />
                <span>+ Google Kalender</span>
              </button>
              <button
                onClick={handleDownloadICS}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-slate-700 dark:text-slate-200 shadow-xs transition-all"
              >
                <Download className="w-3 h-3 text-emerald-600" />
                <span>Unduh File .ICS</span>
              </button>
            </div>
          </div>

          {/* Subtasks */}
          {task.subtasks.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Subtasks ({task.subtasks.filter((s) => s.isCompleted).length}/{task.subtasks.length})
              </div>
              <div className="space-y-1">
                {task.subtasks.map((sub) => (
                  <div
                    key={sub.id}
                    onClick={() => onToggleSubtask(task.id, sub.id)}
                    className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-800 dark:text-slate-200 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={sub.isCompleted}
                      onChange={() => onToggleSubtask(task.id, sub.id)}
                      className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className={sub.isCompleted ? 'line-through text-slate-400' : ''}>
                      {sub.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assigned Team Members */}
          {assignedList.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Penanggung Jawab Tim
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {assignedList.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60"
                  >
                    <img
                      src={m.avatar}
                      alt={m.name}
                      className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-300"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {m.name}
                      </div>
                      <div className="text-[9px] text-slate-500 truncate">{m.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                <Tag className="w-3 h-3 text-indigo-500" />
                Label
              </div>
              <div className="flex flex-wrap gap-1">
                {task.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Comments & Discussion Thread */}
          <div className="space-y-2.5 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                Diskusi & Kolaborasi ({task.comments?.length || 0})
              </span>
            </div>

            {/* Comment Feed */}
            <div className="space-y-2">
              {task.comments && task.comments.length > 0 ? (
                task.comments.map((comm) => (
                  <div
                    key={comm.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <img
                          src={comm.avatar}
                          alt={comm.author}
                          className="w-4.5 h-4.5 rounded-full object-cover"
                        />
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {comm.author}
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-400">
                        {new Date(comm.createdAt).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 pl-6 leading-relaxed text-[11px]">
                      {comm.text}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-3 text-xs text-slate-400 italic">
                  Belum ada komentar. Berikan catatan atau feedback untuk tim!
                </div>
              )}
            </div>

            {/* Add Comment Input */}
            <form onSubmit={handleCommentSubmit} className="flex gap-1.5">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Tulis pesan atau update tugas..."
                className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!newCommentText.trim()}
                className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
