import React, { useState } from 'react';
import {
  Plus,
  SlidersHorizontal,
  LayoutList,
  Columns3,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import { Task, Category, TeamMember, Priority, ViewMode, TaskFilterOptions } from '../types';
import { TaskCard } from './TaskCard';

interface TaskListProps {
  tasks: Task[];
  categories: Category[];
  members: TeamMember[];
  title: string;
  subtitle?: string;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  filters: TaskFilterOptions;
  onFiltersChange: (filters: TaskFilterOptions) => void;
  onToggleComplete: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onDuplicate: (task: Task) => void;
  onOpenDetails: (task: Task) => void;
  onQuickAddTask: (title: string, categoryId: string, priority: Priority) => void;
  onOpenNewTaskModal: () => void;
}

export const TaskList: React.FC<TaskListProps> = ({
  tasks,
  categories,
  members,
  title,
  subtitle,
  viewMode,
  onViewModeChange,
  filters,
  onFiltersChange,
  onToggleComplete,
  onToggleSubtask,
  onEdit,
  onDelete,
  onDuplicate,
  onOpenDetails,
  onQuickAddTask,
  onOpenNewTaskModal,
}) => {
  const [quickTitle, setQuickTitle] = useState('');
  const [quickCategory, setQuickCategory] = useState(categories[0]?.id || 'cat-work');
  const [quickPriority, setQuickPriority] = useState<Priority>('medium');
  const [showFiltersBar, setShowFiltersBar] = useState(false);

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    onQuickAddTask(quickTitle.trim(), quickCategory, quickPriority);
    setQuickTitle('');
  };

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  // Active filters counter
  const hasActiveFilters =
    filters.priority !== 'all' ||
    filters.status !== 'all' ||
    filters.sortBy !== 'dueDate' ||
    filters.assignedMemberId !== 'all';

  return (
    <div className="space-y-3.5">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {subtitle}
            </p>
          )}
        </div>

        {/* View Mode & Filter Toggles */}
        <div className="flex items-center gap-1.5">
          {/* Filter Bar Toggle */}
          <button
            id="btn-toggle-filters"
            onClick={() => setShowFiltersBar(!showFiltersBar)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
              showFiltersBar || hasActiveFilters
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/70 dark:border-indigo-800 dark:text-indigo-300'
                : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>Filter</span>
            {hasActiveFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
            )}
          </button>

          {/* View Mode Selector */}
          <div className="flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200/80 dark:border-slate-700/60">
            <button
              id="btn-view-list"
              onClick={() => onViewModeChange('list')}
              title="Tampilan Daftar Grid"
              className={`p-1 rounded-md text-xs font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
            </button>
            <button
              id="btn-view-board"
              onClick={() => onViewModeChange('board')}
              title="Tampilan Papan Kanban"
              className={`p-1 rounded-md text-xs font-medium transition-all ${
                viewMode === 'board'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Columns3 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Add Inline Bar */}
      <form
        onSubmit={handleQuickSubmit}
        className="p-2 sm:p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs transition-all focus-within:ring-1.5 focus-within:ring-indigo-500/30 focus-within:border-indigo-500"
      >
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 sm:gap-2">
          <div className="flex-1 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-indigo-600 dark:text-indigo-400 ml-0.5 flex-shrink-0" />
            <input
              id="input-quick-task-title"
              type="text"
              value={quickTitle}
              onChange={(e) => setQuickTitle(e.target.value)}
              placeholder="Tambahkan tugas baru... (tekan Enter)"
              className="w-full bg-transparent text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 justify-between sm:justify-end">
            {/* Category Selection */}
            <select
              id="select-quick-category"
              value={quickCategory}
              onChange={(e) => setQuickCategory(e.target.value)}
              className="px-2 py-1 text-xs rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Priority Selection */}
            <select
              id="select-quick-priority"
              value={quickPriority}
              onChange={(e) => setQuickPriority(e.target.value as Priority)}
              className="px-2 py-1 text-xs rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              <option value="low">Rendah</option>
              <option value="medium">Sedang</option>
              <option value="high">Tinggi</option>
              <option value="urgent">Mendesak</option>
            </select>

            <button
              type="submit"
              disabled={!quickTitle.trim()}
              className="px-2.5 py-1 text-xs font-semibold rounded-md bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Tambah
            </button>
          </div>
        </div>
      </form>

      {/* Expanded Filters Drawer */}
      {showFiltersBar && (
        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 space-y-2.5 text-xs">
          <div className="flex items-center justify-between font-semibold text-slate-700 dark:text-slate-300">
            <div className="flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-indigo-500" />
              <span>Opsi Penyaringan & Urutan</span>
            </div>
            {hasActiveFilters && (
              <button
                onClick={() =>
                  onFiltersChange({
                    ...filters,
                    priority: 'all',
                    status: 'all',
                    sortBy: 'dueDate',
                    assignedMemberId: 'all',
                  })
                }
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Reset Filter
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {/* Filter Status */}
            <div>
              <label className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-0.5">
                Status Tugas
              </label>
              <select
                value={filters.status}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    status: e.target.value as TaskFilterOptions['status'],
                  })
                }
                className="w-full px-2 py-1 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
              >
                <option value="all">Semua Status</option>
                <option value="pending">Aktif / Belum Selesai</option>
                <option value="completed">Telah Selesai</option>
                <option value="overdue">Terlambat (Overdue)</option>
                <option value="today">Tenggat Hari Ini</option>
              </select>
            </div>

            {/* Filter Prioritas */}
            <div>
              <label className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-0.5">
                Tingkat Prioritas
              </label>
              <select
                value={filters.priority}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    priority: e.target.value as TaskFilterOptions['priority'],
                  })
                }
                className="w-full px-2 py-1 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
              >
                <option value="all">Semua Prioritas</option>
                <option value="urgent">Mendesak</option>
                <option value="high">Tinggi</option>
                <option value="medium">Sedang</option>
                <option value="low">Rendah</option>
              </select>
            </div>



            {/* Urutan Sort */}
            <div>
              <label className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 mb-0.5">
                Urutkan Berdasarkan
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    sortBy: e.target.value as TaskFilterOptions['sortBy'],
                  })
                }
                className="w-full px-2 py-1 text-xs rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
              >
                <option value="dueDate">Tenggat Waktu</option>
                <option value="priority">Prioritas Tertinggi</option>
                <option value="createdAt">Tanggal Dibuat</option>
                <option value="title">Judul (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Main Task List Views */}
      {tasks.length === 0 ? (
        /* Empty State */
        <div className="py-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Tidak ada tugas yang ditemukan
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
            Semua tugas selesai atau tidak ada tugas yang sesuai dengan kriteria filter saat ini.
          </p>
          <button
            onClick={onOpenNewTaskModal}
            className="mt-3.5 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Buat Tugas Baru</span>
          </button>
        </div>
      ) : viewMode === 'board' ? (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Column 1: Prioritas & Mendesak */}
          <div className="rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 p-2.5 space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Prioritas Tinggi & Mendesak
                </h3>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {tasks.filter((t) => !t.isCompleted && (t.priority === 'urgent' || t.priority === 'high')).length}
              </span>
            </div>
            <div className="space-y-2.5">
              {tasks
                .filter((t) => !t.isCompleted && (t.priority === 'urgent' || t.priority === 'high'))
                .map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    category={categoryMap.get(task.categoryId)}
                    members={members}
                    onToggleComplete={onToggleComplete}
                    onToggleSubtask={onToggleSubtask}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onDuplicate={onDuplicate}
                    onOpenDetails={onOpenDetails}
                  />
                ))}
            </div>
          </div>

          {/* Column 2: Tugas Aktif Lainnya */}
          <div className="rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 p-2.5 space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Sedang Berjalan / Normal
                </h3>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {tasks.filter((t) => !t.isCompleted && (t.priority === 'medium' || t.priority === 'low')).length}
              </span>
            </div>
            <div className="space-y-2.5">
              {tasks
                .filter((t) => !t.isCompleted && (t.priority === 'medium' || t.priority === 'low'))
                .map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    category={categoryMap.get(task.categoryId)}
                    members={members}
                    onToggleComplete={onToggleComplete}
                    onToggleSubtask={onToggleSubtask}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onDuplicate={onDuplicate}
                    onOpenDetails={onOpenDetails}
                  />
                ))}
            </div>
          </div>

          {/* Column 3: Selesai */}
          <div className="rounded-xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 p-2.5 space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Telah Selesai
                </h3>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {tasks.filter((t) => t.isCompleted).length}
              </span>
            </div>
            <div className="space-y-2.5">
              {tasks
                .filter((t) => t.isCompleted)
                .map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    category={categoryMap.get(task.categoryId)}
                    members={members}
                    onToggleComplete={onToggleComplete}
                    onToggleSubtask={onToggleSubtask}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onDuplicate={onDuplicate}
                    onOpenDetails={onOpenDetails}
                  />
                ))}
            </div>
          </div>
        </div>
      ) : (
        /* List / Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              category={categoryMap.get(task.categoryId)}
              members={members}
              onToggleComplete={onToggleComplete}
              onToggleSubtask={onToggleSubtask}
              onEdit={onEdit}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
              onOpenDetails={onOpenDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
};
