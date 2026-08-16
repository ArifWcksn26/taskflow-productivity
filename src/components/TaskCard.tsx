import React, { useState } from 'react';
import {
  Check,
  Clock,
  Calendar,
  AlertCircle,
  MessageSquare,
  MoreVertical,
  Edit2,
  Trash2,
  Copy,
  CalendarPlus,
  ChevronDown,
  ChevronUp,
  Bell,
  Repeat,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Task, Category, TeamMember } from '../types';
import { ExportService } from '../services/exportService';

interface TaskCardProps {
  task: Task;
  category?: Category;
  members: TeamMember[];
  onToggleComplete: (taskId: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onDuplicate: (task: Task) => void;
  onOpenDetails: (task: Task) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  category,
  members,
  onToggleComplete,
  onToggleSubtask,
  onEdit,
  onDelete,
  onDuplicate,
  onOpenDetails,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showSubtasks, setShowSubtasks] = useState(false);

  // Assigned members
  const assignedList = members.filter((m) => task.assignedMemberIds.includes(m.id));

  // Subtasks progress
  const completedSubtasks = task.subtasks.filter((s) => s.isCompleted).length;
  const totalSubtasks = task.subtasks.length;
  const subtaskProgress = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  // Deadline calculation
  const todayStr = new Date().toISOString().split('T')[0];
  const isOverdue = !task.isCompleted && task.dueDate && task.dueDate < todayStr;
  const isDueToday = !task.isCompleted && task.dueDate === todayStr;

  const getDueLabel = () => {
    if (!task.dueDate) return null;
    if (task.dueDate === todayStr) {
      return `Hari Ini${task.dueTime ? `, ${task.dueTime}` : ''}`;
    }
    const d = new Date(`${task.dueDate}T00:00:00`);
    const dateFormatted = d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
    });
    return `${dateFormatted}${task.dueTime ? `, ${task.dueTime}` : ''}`;
  };

  const priorityStyles: Record<string, { bg: string; text: string; label: string }> = {
    urgent: {
      bg: 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800/60',
      text: 'text-rose-700 dark:text-rose-300',
      label: 'Mendesak',
    },
    high: {
      bg: 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800/60',
      text: 'text-amber-700 dark:text-amber-300',
      label: 'Tinggi',
    },
    medium: {
      bg: 'bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800/60',
      text: 'text-blue-700 dark:text-blue-300',
      label: 'Sedang',
    },
    low: {
      bg: 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700',
      text: 'text-slate-600 dark:text-slate-300',
      label: 'Rendah',
    },
  };

  const priorityConfig = priorityStyles[task.priority] || priorityStyles.medium;

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!task.isCompleted) {
      // Trigger rewarding confetti
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#6366f1', '#10b981', '#f59e0b', '#3b82f6'],
        });
      } catch {
        // Safe fallback
      }
    }
    onToggleComplete(task.id);
  };

  const handleAddToCalendar = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = ExportService.getGoogleCalendarUrl(task);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      id={`task-card-${task.id}`}
      onClick={() => onOpenDetails(task)}
      className={`group relative rounded-xl p-3 transition-all duration-150 cursor-pointer border ${
        task.isCompleted
          ? 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/70 dark:border-slate-800/70 opacity-75'
          : isOverdue
          ? 'bg-white dark:bg-slate-900 border-rose-300 dark:border-rose-900/70 shadow-xs hover:border-rose-400'
          : isDueToday
          ? 'bg-white dark:bg-slate-900 border-indigo-300 dark:border-indigo-800/80 shadow-xs hover:border-indigo-400'
          : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
      }`}
    >
      <div className="flex items-start gap-2.5">
        {/* Custom Checkbox */}
        <button
          id={`btn-complete-task-${task.id}`}
          onClick={handleCheckboxClick}
          className={`mt-0.5 w-4.5 h-4.5 rounded-md flex items-center justify-center transition-all flex-shrink-0 ${
            task.isCompleted
              ? 'bg-emerald-500 text-white shadow-xs'
              : 'border border-slate-300 dark:border-slate-600 hover:border-indigo-500 dark:hover:border-indigo-400 bg-transparent'
          }`}
        >
          {task.isCompleted && <Check className="w-3 h-3 stroke-[3]" />}
        </button>

        {/* Task Content */}
        <div className="flex-1 min-w-0">
          {/* Top Line: Priority & Category */}
          <div className="flex flex-wrap items-center gap-1 mb-1">
            {/* Category Pill */}
            {category && (
              <span
                className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.2 rounded border ${
                  category.bgLight || 'bg-slate-100 text-slate-700'
                } ${category.textLight || 'text-slate-700'}`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                {category.name}
              </span>
            )}

            {/* Priority Badge */}
            <span
              className={`inline-flex items-center text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded border ${priorityConfig.bg} ${priorityConfig.text}`}
            >
              {priorityConfig.label}
            </span>

            {/* Recurrence Pill */}
            {task.recurrence !== 'none' && (
              <span className="inline-flex items-center gap-1 text-[9px] font-medium text-slate-500 dark:text-slate-400 px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800">
                <Repeat className="w-2.5 h-2.5" />
                {task.recurrence === 'daily' ? 'Harian' : task.recurrence === 'weekly' ? 'Mingguan' : 'Bulanan'}
              </span>
            )}

            {/* Reminder Indicator */}
            {task.reminderMinutesBefore !== undefined && task.reminderMinutesBefore > 0 && (
              <span
                title={`Pengingat disetel ${task.reminderMinutesBefore} menit sebelum tenggat`}
                className="inline-flex items-center text-[9px] font-medium text-indigo-600 dark:text-indigo-400 px-1 py-0.2 rounded bg-indigo-50 dark:bg-indigo-950/60"
              >
                <Bell className="w-2.5 h-2.5" />
              </span>
            )}
          </div>

          {/* Title */}
          <h4
            className={`text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug break-words ${
              task.isCompleted ? 'line-through text-slate-400 dark:text-slate-500 font-normal' : ''
            }`}
          >
            {task.title}
          </h4>

          {/* Description Snippet */}
          {task.description && (
            <p
              className={`mt-0.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-1 leading-relaxed ${
                task.isCompleted ? 'line-through opacity-60' : ''
              }`}
            >
              {task.description}
            </p>
          )}

          {/* Subtask Mini Bar */}
          {totalSubtasks > 0 && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowSubtasks(!showSubtasks);
                  }}
                  className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium"
                >
                  <span>Subtask ({completedSubtasks}/{totalSubtasks})</span>
                  {showSubtasks ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
                </button>
                <span>{Math.round(subtaskProgress)}%</span>
              </div>
              <div className="w-full h-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-300"
                  style={{ width: `${subtaskProgress}%` }}
                />
              </div>

              {/* Expandable Subtask List */}
              {showSubtasks && (
                <div className="mt-1.5 space-y-1 pl-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                  {task.subtasks.map((sub) => (
                    <div
                      key={sub.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSubtask(task.id, sub.id);
                      }}
                      className="flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer py-0.2"
                    >
                      <span
                        className={`w-3 h-3 rounded border flex items-center justify-center text-[9px] ${
                          sub.isCompleted
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {sub.isCompleted && '✓'}
                      </span>
                      <span className={sub.isCompleted ? 'line-through text-slate-400' : ''}>
                        {sub.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {task.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[9px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1 py-0.2 rounded"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer Info: Deadline, Assignees, Comments */}
          <div className="flex flex-wrap items-center justify-between gap-1.5 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400">
            {/* Due Date Indicator */}
            <div className="flex items-center gap-2.5">
              {task.dueDate && (
                <div
                  className={`flex items-center gap-1 font-medium ${
                    isOverdue
                      ? 'text-rose-600 dark:text-rose-400 font-semibold'
                      : isDueToday
                      ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {isOverdue ? <AlertCircle className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
                  <span>{getDueLabel()}</span>
                </div>
              )}

              {task.estimatedMinutes ? (
                <div className="flex items-center gap-1 text-[10px]">
                  <Clock className="w-2.5 h-2.5 text-slate-400" />
                  <span>{task.estimatedMinutes}m</span>
                </div>
              ) : null}
            </div>

            {/* Right side: Comments & Assignees */}
            <div className="flex items-center gap-2">
              {task.comments && task.comments.length > 0 && (
                <div className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <MessageSquare className="w-2.5 h-2.5" />
                  <span>{task.comments.length}</span>
                </div>
              )}

              {/* Member Avatars */}
              {assignedList.length > 0 && (
                <div className="flex items-center -space-x-1">
                  {assignedList.map((m) => (
                    <img
                      key={m.id}
                      src={m.avatar}
                      alt={m.name}
                      title={`Ditugaskan ke: ${m.name}`}
                      className="w-4.5 h-4.5 rounded-full ring-1.5 ring-white dark:ring-slate-900 object-cover"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Dropdown Menu */}
        <div className="relative">
          <button
            id={`btn-task-menu-${task.id}`}
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setShowMenu(false); }} />
              <div className="absolute right-0 top-full mt-1 w-44 rounded-lg bg-white dark:bg-slate-800 shadow-md border border-slate-200 dark:border-slate-700 py-1 z-20 text-xs">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onEdit(task);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60"
                >
                  <Edit2 className="w-3 h-3 text-indigo-500" />
                  <span>Edit Rincian</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onDuplicate(task);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60"
                >
                  <Copy className="w-3 h-3 text-blue-500" />
                  <span>Duplikat</span>
                </button>
                {task.dueDate && (
                  <button
                    onClick={(e) => {
                      setShowMenu(false);
                      handleAddToCalendar(e);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60"
                  >
                    <CalendarPlus className="w-3 h-3 text-emerald-500" />
                    <span>Google Kalender</span>
                  </button>
                )}
                <div className="my-0.5 border-t border-slate-100 dark:border-slate-700" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onDelete(task.id);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Hapus</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
