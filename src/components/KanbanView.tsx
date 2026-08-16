import React, { useState } from 'react';
import {
  Circle,
  Clock,
  CheckCircle2,
  Plus,
  Calendar,
  AlertCircle,
  MoreVertical,
  CheckSquare,
  Edit2,
  Trash2,
  Sparkles,
} from 'lucide-react';
import { Task, Category, TeamMember } from '../types';

interface KanbanViewProps {
  tasks: Task[];
  categories: Category[];
  members: TeamMember[];
  onToggleCompleteTask: (taskId: string) => void;
  onSelectTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onOpenNewTaskModal: () => void;
  onUpdateTaskStatus?: (taskId: string, newStatus: 'todo' | 'in_progress' | 'completed') => void;
}

type ColumnId = 'todo' | 'in_progress' | 'completed';

interface ColumnConfig {
  id: ColumnId;
  title: string;
  subtitle: string;
  badgeColor: string;
  icon: typeof Circle;
  borderColor: string;
}

const COLUMNS: ColumnConfig[] = [
  {
    id: 'todo',
    title: 'Belum Dimulai',
    subtitle: 'Tugas yang harus dikerjakan',
    badgeColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    icon: Circle,
    borderColor: 'border-t-slate-400',
  },
  {
    id: 'in_progress',
    title: 'Sedang Dikerjakan',
    subtitle: 'Fokus pengerjaan aktif saat ini',
    badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    icon: Clock,
    borderColor: 'border-t-amber-500',
  },
  {
    id: 'completed',
    title: 'Selesai',
    subtitle: 'Tugas yang berhasil diselesaikan',
    badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    icon: CheckCircle2,
    borderColor: 'border-t-emerald-500',
  },
];

export const KanbanView: React.FC<KanbanViewProps> = ({
  tasks,
  categories,
  onToggleCompleteTask,
  onSelectTask,
  onEditTask,
  onDeleteTask,
  onOpenNewTaskModal,
  onUpdateTaskStatus,
}) => {
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<ColumnId | null>(null);

  const categoryMap = new Map<string, Category>(categories.map((c) => [c.id, c]));
  const todayStr = new Date().toISOString().split('T')[0];

  // Helper to classify task into column
  const getTaskColumn = (task: Task): ColumnId => {
    if (task.kanbanStatus) return task.kanbanStatus;
    if (task.isCompleted) return 'completed';
    const subDone = task.subtasks.filter((s) => s.isCompleted).length;
    if (subDone > 0) return 'in_progress';
    return 'todo';
  };

  // Group tasks by column
  const tasksByColumn: Record<ColumnId, Task[]> = {
    todo: tasks.filter((t) => getTaskColumn(t) === 'todo'),
    in_progress: tasks.filter((t) => getTaskColumn(t) === 'in_progress'),
    completed: tasks.filter((t) => getTaskColumn(t) === 'completed'),
  };

  // Drag Handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    setDraggedTaskId(taskId);
    e.dataTransfer.setData('text/plain', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, colId: ColumnId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== colId) {
      setDragOverColumn(colId);
    }
  };

  const handleDragLeave = (colId: ColumnId) => {
    if (dragOverColumn === colId) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetCol: ColumnId) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('text/plain') || draggedTaskId;
    if (!taskId) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    if (onUpdateTaskStatus) {
      onUpdateTaskStatus(taskId, targetCol);
    } else {
      if (targetCol === 'completed' && !task.isCompleted) {
        onToggleCompleteTask(taskId);
      } else if (targetCol !== 'completed' && task.isCompleted) {
        onToggleCompleteTask(taskId);
      }
    }

    setDraggedTaskId(null);
  };

  const priorityColors: Record<string, { bg: string; text: string; label: string }> = {
    urgent: { bg: 'bg-rose-100 dark:bg-rose-950/80', text: 'text-rose-700 dark:text-rose-300', label: 'Mendesak' },
    high: { bg: 'bg-orange-100 dark:bg-orange-950/80', text: 'text-orange-700 dark:text-orange-300', label: 'Tinggi' },
    medium: { bg: 'bg-blue-100 dark:bg-blue-950/80', text: 'text-blue-700 dark:text-blue-300', label: 'Sedang' },
    low: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400', label: 'Rendah' },
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <span>Papan Kanban</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Geser (*drag & drop*) tugas antar kolom untuk memperbarui status pengerjaan secara visual.
          </p>
        </div>

        <button
          onClick={onOpenNewTaskModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Tugas</span>
        </button>
      </div>

      {/* 3 Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[500px]">
        {COLUMNS.map((col) => {
          const ColumnIcon = col.icon;
          const colTasks = tasksByColumn[col.id];
          const isOver = dragOverColumn === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={() => handleDragLeave(col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`flex flex-col rounded-2xl bg-slate-100/70 dark:bg-slate-900/60 border ${
                isOver
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/30 dark:bg-indigo-950/20'
                  : 'border-slate-200/80 dark:border-slate-800'
              } transition-all duration-200 p-3`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800 mb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg border ${col.badgeColor}`}>
                    <ColumnIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                      {col.title}
                    </h3>
                    <span className="text-[10px] text-slate-400">
                      {colTasks.length} tugas
                    </span>
                  </div>
                </div>

                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {colTasks.length}
                </span>
              </div>

              {/* Task Cards Container */}
              <div className="flex-1 space-y-2.5 min-h-[300px] overflow-y-auto pr-0.5">
                {colTasks.length === 0 ? (
                  <div className="h-32 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-center p-4">
                    <p className="text-xs text-slate-400">
                      {isOver ? 'Lepaskan di sini' : 'Belum ada tugas di kolom ini'}
                    </p>
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const category = categoryMap.get(task.categoryId);
                    const prio = priorityColors[task.priority] || priorityColors.medium;
                    const subtotal = task.subtasks.length;
                    const subdone = task.subtasks.filter((s) => s.isCompleted).length;
                    const isOverdue = !task.isCompleted && task.dueDate < todayStr;
                    const isBeingDragged = draggedTaskId === task.id;

                    return (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task.id)}
                        onClick={() => onSelectTask(task)}
                        className={`p-3.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 shadow-xs hover:shadow-md cursor-grab active:cursor-grabbing transition-all ${
                          isBeingDragged ? 'opacity-40 scale-95 border-indigo-400' : ''
                        } hover:border-indigo-300 dark:hover:border-indigo-700 group`}
                      >
                        {/* Top Metadata */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span
                            className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md ${prio.bg} ${prio.text}`}
                          >
                            {prio.label}
                          </span>

                          {category && (
                            <span className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[120px]">
                              <span
                                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: category.color }}
                              />
                              <span className="truncate">{category.name}</span>
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h4
                          className={`text-xs font-bold text-slate-900 dark:text-white leading-snug line-clamp-2 ${
                            task.isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''
                          }`}
                        >
                          {task.title}
                        </h4>

                        {/* Description snippet */}
                        {task.description && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-tight">
                            {task.description}
                          </p>
                        )}

                        {/* Footer info */}
                        <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100 dark:border-slate-700/60 text-[10px] text-slate-400">
                          {/* Due date */}
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span className={isOverdue ? 'text-rose-500 font-bold' : ''}>
                              {task.dueDate || '-'}
                            </span>
                            {isOverdue && <AlertCircle className="w-3 h-3 text-rose-500" />}
                          </div>

                          {/* Subtasks */}
                          {subtotal > 0 && (
                            <div className="flex items-center gap-1 font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/60 px-1.5 py-0.5 rounded-md">
                              <CheckSquare className="w-3 h-3 text-indigo-500" />
                              <span>
                                {subdone}/{subtotal}
                              </span>
                            </div>
                          )}

                          {/* Quick Action buttons */}
                          <div
                            className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              onClick={() => onEditTask(task)}
                              title="Edit Tugas"
                              className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => onDeleteTask(task.id)}
                              title="Hapus Tugas"
                              className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
