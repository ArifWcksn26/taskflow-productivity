import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Clock,
  CheckCircle2,
  CalendarPlus,
  Download,
  AlertCircle,
} from 'lucide-react';
import { Task, Category, TeamMember } from '../types';
import { ExportService } from '../services/exportService';

interface CalendarViewProps {
  tasks: Task[];
  categories: Category[];
  members: TeamMember[];
  onOpenNewTaskModalWithDate: (dateStr: string) => void;
  onOpenDetails: (task: Task) => void;
  onToggleComplete: (taskId: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  categories,
  members,
  onOpenNewTaskModalWithDate,
  onOpenDetails,
  onToggleComplete,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const categoryMap = new Map<string, Category>(categories.map((c) => [c.id, c]));

  // Month navigation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  // Generate days matrix for current month
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const todayStr = new Date().toISOString().split('T')[0];

  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];

  const dayHeaders = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  // Calendar cells
  const calendarCells = [];

  // 1. Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayNum = daysInPrevMonth - i;
    const prevD = new Date(year, month - 1, dayNum);
    const dateKey = prevD.toISOString().split('T')[0];
    calendarCells.push({
      dateKey,
      dayNum,
      isCurrentMonth: false,
    });
  }

  // 2. Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    calendarCells.push({
      dateKey,
      dayNum: day,
      isCurrentMonth: true,
    });
  }

  // 3. Next month leading days to complete grid (42 cells total)
  const remainingCells = 42 - calendarCells.length;
  for (let day = 1; day <= remainingCells; day++) {
    const nextD = new Date(year, month + 1, day);
    const dateKey = nextD.toISOString().split('T')[0];
    calendarCells.push({
      dateKey,
      dayNum: day,
      isCurrentMonth: false,
    });
  }

  // Tasks for selected date
  const selectedDateTasks = tasks.filter((t) => t.dueDate === selectedDateStr);

  const handleExportAllICS = () => {
    ExportService.exportToICS(tasks);
  };

  return (
    <div className="space-y-4">
      {/* Calendar Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Kalender & Tenggat Waktu</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pantau jadwal pelaksanaan tugas secara visual per hari dan minggu.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportAllICS}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-emerald-500" />
            <span>Unduh Kalender (.ICS)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
        {/* Main Monthly Grid (2 Cols on Desktop) */}
        <div className="lg:col-span-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-3 sm:p-4 shadow-xs">
          {/* Navigation Bar */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {monthNames[month]} {year}
            </h2>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleToday}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-700 dark:text-slate-300 hover:text-indigo-600 transition-colors"
              >
                Hari Ini
              </button>
              <div className="flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200/80 dark:border-slate-700">
                <button
                  onClick={handlePrevMonth}
                  className="p-1 rounded hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-1 rounded hover:bg-white dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Day Names Row */}
          <div className="grid grid-cols-7 gap-1 mb-1 text-center text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
            {dayHeaders.map((day, idx) => (
              <div key={idx} className="py-0.5">
                {day}
              </div>
            ))}
          </div>

          {/* Month Matrix Grid */}
          <div className="grid grid-cols-7 gap-1">
            {calendarCells.map((cell, idx) => {
              const cellTasks = tasks.filter((t) => t.dueDate === cell.dateKey);
              const isSelected = cell.dateKey === selectedDateStr;
              const isToday = cell.dateKey === todayStr;
              const hasOverdue = cellTasks.some((t) => !t.isCompleted && cell.dateKey < todayStr);

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDateStr(cell.dateKey)}
                  className={`min-h-[52px] sm:min-h-[64px] p-1 sm:p-1.5 rounded-lg cursor-pointer border transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-indigo-50/80 dark:bg-indigo-950/50 border-indigo-500 ring-1.5 ring-indigo-500/20'
                      : isToday
                      ? 'bg-slate-50 dark:bg-slate-800/60 border-indigo-300 dark:border-indigo-800'
                      : cell.isCurrentMonth
                      ? 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800/80 hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                      : 'bg-slate-50/40 dark:bg-slate-950/40 border-transparent opacity-40 hover:opacity-80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[11px] font-bold w-4.5 h-4.5 flex items-center justify-center rounded-full ${
                        isToday
                          ? 'bg-indigo-600 text-white'
                          : isSelected
                          ? 'text-indigo-600 dark:text-indigo-400 font-extrabold'
                          : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {cell.dayNum}
                    </span>

                    {hasOverdue && (
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500" title="Ada tugas terlambat" />
                    )}
                  </div>

                  {/* Task Dots / Badges */}
                  <div className="space-y-0.5 mt-0.5">
                    {cellTasks.slice(0, 2).map((t) => {
                      return (
                        <div
                          key={t.id}
                          className={`hidden sm:block text-[9px] font-semibold truncate px-1 py-0.2 rounded ${
                            t.isCompleted
                              ? 'line-through bg-slate-100 dark:bg-slate-800 text-slate-400'
                              : 'bg-indigo-100/70 text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200'
                          }`}
                        >
                          {t.title}
                        </div>
                      );
                    })}

                    {/* Mobile Dot Indicators */}
                    <div className="flex sm:hidden items-center gap-0.5">
                      {cellTasks.slice(0, 3).map((t) => (
                        <span
                          key={t.id}
                          className={`w-1 h-1 rounded-full ${
                            t.isCompleted ? 'bg-slate-400' : 'bg-indigo-500'
                          }`}
                        />
                      ))}
                    </div>

                    {cellTasks.length > 2 && (
                      <span className="hidden sm:inline text-[8px] font-bold text-slate-400 pl-0.5">
                        +{cellTasks.length - 2}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Date Task List Side Panel */}
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-3.5 flex flex-col justify-between shadow-xs">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Agenda Tanggal
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                  {new Date(`${selectedDateStr}T00:00:00`).toLocaleDateString('id-ID', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </h3>
              </div>
              <button
                id="btn-calendar-add-task"
                onClick={() => onOpenNewTaskModalWithDate(selectedDateStr)}
                className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
                title="Tambah Tugas Pada Tanggal Ini"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Task Items */}
            {selectedDateTasks.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tidak ada jadwal tugas untuk tanggal ini.
                </p>
                <button
                  onClick={() => onOpenNewTaskModalWithDate(selectedDateStr)}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  + Jadwalkan Tugas Baru
                </button>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[400px] overflow-y-auto pr-0.5">
                {selectedDateTasks.map((t) => {
                  const cat = categoryMap.get(t.categoryId);
                  return (
                    <div
                      key={t.id}
                      onClick={() => onOpenDetails(t)}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 cursor-pointer hover:border-indigo-400 transition-all space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        {cat && (
                          <span
                            className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border ${cat.bgLight} ${cat.textLight}`}
                          >
                            {cat.name}
                          </span>
                        )}
                        {t.dueTime && (
                          <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                            <Clock className="w-2.5 h-2.5" /> {t.dueTime}
                          </span>
                        )}
                      </div>

                      <div className="flex items-start gap-1.5 pt-0.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleComplete(t.id);
                          }}
                          className={`w-3.5 h-3.5 mt-0.5 rounded border flex items-center justify-center text-[9px] ${
                            t.isCompleted
                              ? 'bg-emerald-500 border-emerald-500 text-white'
                              : 'border-slate-300 dark:border-slate-600'
                          }`}
                        >
                          {t.isCompleted && '✓'}
                        </button>
                        <span
                          className={`text-xs font-medium text-slate-900 dark:text-slate-100 ${
                            t.isCompleted ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {t.title}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 text-center">
            <span className="text-[11px] text-slate-400">
              Total {selectedDateTasks.length} tugas terjadwal
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
