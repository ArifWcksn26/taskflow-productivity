import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Bell,
  Tag,
  Plus,
  Trash2,
  Users,
  Repeat,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { Task, Category, TeamMember, Priority, Recurrence, Subtask } from '../types';
import { getDateOffset } from '../data/initialData';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: Partial<Task>) => void;
  taskToEdit?: Task | null;
  categories: Category[];
  members: TeamMember[];
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  onSave,
  taskToEdit,
  categories,
  members,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat-work');
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState(getDateOffset(0));
  const [dueTime, setDueTime] = useState('18:00');
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState<number>(30);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskText, setNewSubtaskText] = useState('');
  const [assignedMemberIds, setAssignedMemberIds] = useState<string[]>(['user-1']);
  const [recurrence, setRecurrence] = useState<Recurrence>('none');
  const [estimatedMinutes, setEstimatedMinutes] = useState<number>(60);
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [errors, setErrors] = useState<{ title?: string }>({});

  useEffect(() => {
    if (!isOpen) return;
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setCategoryId(taskToEdit.categoryId);
      setPriority(taskToEdit.priority);
      setDueDate(taskToEdit.dueDate || getDateOffset(0));
      setDueTime(taskToEdit.dueTime || '18:00');
      setReminderMinutesBefore(taskToEdit.reminderMinutesBefore ?? 30);
      setSubtasks(taskToEdit.subtasks || []);
      setAssignedMemberIds(taskToEdit.assignedMemberIds || ['user-1']);
      setRecurrence(taskToEdit.recurrence || 'none');
      setEstimatedMinutes(taskToEdit.estimatedMinutes || 60);
      setTags(taskToEdit.tags || []);
    } else {
      // Default new task
      setTitle('');
      setDescription('');
      setCategoryId(categories[0]?.id || 'cat-work');
      setPriority('medium');
      setDueDate(getDateOffset(0));
      setDueTime('18:00');
      setReminderMinutesBefore(30);
      setSubtasks([]);
      setAssignedMemberIds(['user-1']);
      setRecurrence('none');
      setEstimatedMinutes(60);
      setTags([]);
    }
    setErrors({});
  }, [isOpen, taskToEdit]);

  if (!isOpen) return null;

  const handleAddSubtask = () => {
    if (!newSubtaskText.trim()) return;
    const newSub: Subtask = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      text: newSubtaskText.trim(),
      isCompleted: false,
    };
    setSubtasks([...subtasks, newSub]);
    setNewSubtaskText('');
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks(subtasks.filter((s) => s.id !== id));
  };

  const handleToggleSubtask = (id: string) => {
    setSubtasks(
      subtasks.map((s) => (s.id === id ? { ...s, isCompleted: !s.isCompleted } : s))
    );
  };

  const handleAddTag = () => {
    if (!newTagInput.trim()) return;
    if (!tags.includes(newTagInput.trim())) {
      setTags([...tags, newTagInput.trim()]);
    }
    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const toggleMember = (memberId: string) => {
    if (assignedMemberIds.includes(memberId)) {
      setAssignedMemberIds(assignedMemberIds.filter((id) => id !== memberId));
    } else {
      setAssignedMemberIds([...assignedMemberIds, memberId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setErrors({ title: 'Judul tugas wajib diisi' });
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      categoryId,
      priority,
      dueDate,
      dueTime,
      reminderMinutesBefore,
      subtasks,
      assignedMemberIds,
      recurrence,
      estimatedMinutes: Number(estimatedMinutes) || 0,
      tags,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {taskToEdit ? 'Edit Rincian Tugas' : 'Buat Tugas Baru'}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Atur jadwal, pengingat, dan kolaborator untuk tugas ini.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup Modal Tugas"
            className="p-1 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 max-h-[82vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label htmlFor="modal-input-task-title" className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Judul Tugas <span className="text-rose-500">*</span>
            </label>
            <input
              id="modal-input-task-title"
              aria-label="Judul Tugas"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (errors.title) setErrors({});
              }}
              placeholder="Contoh: Selesaikan presentasi laporan kuartal..."
              className={`w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1.5 focus:ring-indigo-500/30 ${
                errors.title
                  ? 'border-rose-400 focus:border-rose-500'
                  : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
              }`}
            />
            {errors.title && (
              <p className="flex items-center gap-1 text-[11px] text-rose-500 mt-0.5">
                <AlertCircle className="w-3 h-3" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="modal-input-task-desc" className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Deskripsi & Catatan Tambahan
            </label>
            <textarea
              id="modal-input-task-desc"
              aria-label="Deskripsi & Catatan Tambahan"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tuliskan catatan teknis, link referensi, atau instruksi langkah kerja..."
              className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none focus:ring-1.5 focus:ring-indigo-500/30 focus:border-indigo-500"
            />
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Category */}
            <div>
              <label htmlFor="modal-select-category" className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Kategori / Folder
              </label>
              <select
                id="modal-select-category"
                aria-label="Pilih Kategori atau Folder"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Prioritas
              </label>
              <div className="grid grid-cols-4 gap-1">
                {(['low', 'medium', 'high', 'urgent'] as const).map((p) => {
                  const labels = {
                    low: 'Rendah',
                    medium: 'Sedang',
                    high: 'Tinggi',
                    urgent: 'Mendesak',
                  };
                  const isSelected = priority === p;
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPriority(p)}
                      className={`py-1.5 px-1 text-[10px] font-semibold rounded-lg border transition-all text-center ${
                        isSelected
                          ? p === 'urgent'
                            ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                            : p === 'high'
                            ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                            : p === 'medium'
                            ? 'bg-blue-600 text-white border-blue-700 shadow-xs'
                            : 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {labels[p]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Due Date, Time & Reminder */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 space-y-2.5">
            <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              <span>Jadwal & Pengingat Otomatis</span>
            </div>

            {/* Quick Date Presets */}
            <div className="flex flex-wrap gap-1">
              <button
                type="button"
                onClick={() => setDueDate(getDateOffset(0))}
                className={`px-2 py-0.5 text-[10px] rounded-md font-medium border transition-colors ${
                  dueDate === getDateOffset(0)
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                Hari Ini
              </button>
              <button
                type="button"
                onClick={() => setDueDate(getDateOffset(1))}
                className={`px-2 py-0.5 text-[10px] rounded-md font-medium border transition-colors ${
                  dueDate === getDateOffset(1)
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                Besok
              </button>
              <button
                type="button"
                onClick={() => setDueDate(getDateOffset(3))}
                className={`px-2 py-0.5 text-[10px] rounded-md font-medium border transition-colors ${
                  dueDate === getDateOffset(3)
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                3 Hari Lagi
              </button>
              <button
                type="button"
                onClick={() => setDueDate(getDateOffset(7))}
                className={`px-2 py-0.5 text-[10px] rounded-md font-medium border transition-colors ${
                  dueDate === getDateOffset(7)
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                Minggu Depan
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Date Input */}
              <div>
                <label htmlFor="modal-input-due-date" className="block text-[10px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">
                  Tanggal Tenggat
                </label>
                <input
                  id="modal-input-due-date"
                  aria-label="Tanggal Tenggat"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs"
                />
              </div>

              {/* Time Input */}
              <div>
                <label htmlFor="modal-input-due-time" className="block text-[10px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">
                  Waktu / Jam
                </label>
                <input
                  id="modal-input-due-time"
                  aria-label="Waktu atau Jam Tenggat"
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs"
                />
              </div>

              {/* Reminder Threshold */}
              <div>
                <label htmlFor="modal-select-reminder" className="block text-[10px] font-semibold text-slate-600 dark:text-slate-300 mb-0.5">
                  Pengingat Suara & Push
                </label>
                <select
                  id="modal-select-reminder"
                  aria-label="Pengingat Suara dan Push Notification"
                  value={reminderMinutesBefore}
                  onChange={(e) => setReminderMinutesBefore(Number(e.target.value))}
                  className="w-full px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs"
                >
                  <option value={0}>Tepat saat jatuh tempo</option>
                  <option value={10}>10 menit sebelumnya</option>
                  <option value={30}>30 menit sebelumnya</option>
                  <option value={60}>1 jam sebelumnya</option>
                  <option value={1440}>1 hari sebelumnya</option>
                </select>
              </div>
            </div>
          </div>

          {/* Subtasks Builder */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Daftar Subtask / Checklist ({subtasks.filter((s) => s.isCompleted).length}/{subtasks.length})
            </label>
            <div className="space-y-1.5 mb-2">
              {subtasks.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs"
                >
                  <input
                    type="checkbox"
                    checked={sub.isCompleted}
                    onChange={() => handleToggleSubtask(sub.id)}
                    className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span
                    className={`flex-1 text-slate-800 dark:text-slate-200 ${
                      sub.isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''
                    }`}
                  >
                    {sub.text}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(sub.id)}
                    className="text-slate-400 hover:text-rose-500 p-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Subtask Input */}
            <div className="flex gap-1.5">
              <input
                type="text"
                value={newSubtaskText}
                onChange={(e) => setNewSubtaskText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
                placeholder="Tambahkan subtask baru..."
                className="flex-1 px-2.5 py-1 text-xs rounded-lg bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddSubtask}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-indigo-600 hover:text-white dark:hover:bg-indigo-600 text-slate-700 dark:text-slate-200 transition-colors"
              >
                + Subtask
              </button>
            </div>
          </div>



          {/* Recurrence & Estimation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Recurrence */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Repeat className="w-3.5 h-3.5 text-indigo-500" />
                <span>Pengulangan Jadwal</span>
              </label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as Recurrence)}
                className="w-full px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none"
              >
                <option value="none">Tidak Berulang (Sekali)</option>
                <option value="daily">Setiap Hari (Harian)</option>
                <option value="weekly">Setiap Minggu (Mingguan)</option>
                <option value="monthly">Setiap Bulan (Bulanan)</option>
              </select>
            </div>

            {/* Estimated Minutes */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span>Estimasi Durasi (Menit)</span>
              </label>
              <input
                type="number"
                min="5"
                step="5"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(Number(e.target.value))}
                className="w-full px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-indigo-500" />
              <span>Label & Tagar</span>
            </label>
            <div className="flex flex-wrap gap-1 mb-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-rose-500 ml-0.5"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-1.5">
              <input
                type="text"
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="Tambah label (misal: Sprint, Klien)..."
                className="flex-1 px-2.5 py-1 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
              >
                + Label
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              id="modal-btn-submit-task"
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all"
            >
              {taskToEdit ? 'Simpan Perubahan' : 'Buat Tugas Sekarang'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
