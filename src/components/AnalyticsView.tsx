import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Award,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Download,
  Calendar,
  Flame,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';
import { Task, Category, TeamMember } from '../types';
import { AnalyticsService } from '../services/analyticsService';
import { ExportService } from '../services/exportService';

interface AnalyticsViewProps {
  tasks: Task[];
  categories: Category[];
  members: TeamMember[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  tasks,
  categories,
  members,
}) => {
  const summary = AnalyticsService.calculateSummary(tasks, categories);

  const getScoreRating = (score: number) => {
    if (score >= 90) return { label: 'Sangat Luar Biasa', color: 'text-emerald-500' };
    if (score >= 75) return { label: 'Sangat Produktif', color: 'text-indigo-500' };
    if (score >= 50) return { label: 'Progres Baik', color: 'text-blue-500' };
    return { label: 'Perlu Ditingkatkan', color: 'text-amber-500' };
  };

  const scoreRating = getScoreRating(summary.productivityScore);

  // Maximum value for 7-day velocity chart
  const maxTrendVal = Math.max(
    ...summary.trend7Days.map((d) => Math.max(d.completed, d.created)),
    4
  );

  const handleExportPDF = () => {
    ExportService.exportToPDF(tasks, categories, members, 'Laporan Produktivitas & Kinerja Tim');
  };

  const handleExportCSV = () => {
    ExportService.exportToCSV(tasks, categories, members);
  };

  return (
    <div className="space-y-4">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span>Laporan & Analitik Produktivitas</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Evaluasi kecepatan penyelesaian, tren mingguan, dan efisiensi waktu kerja Anda.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
            <span>Ekspor CSV</span>
          </button>
          <button
            id="btn-download-pdf-analytics"
            onClick={handleExportPDF}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Unduh PDF</span>
          </button>
        </div>
      </div>

      {/* Main Highlights Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Productivity Score Gauge Card */}
        <div className="rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white p-4 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200">
              Skor Produktivitas
            </span>
            <Award className="w-4 h-4 text-indigo-200" />
          </div>

          <div className="my-2.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {summary.productivityScore}
              </span>
              <span className="text-sm text-indigo-200 font-semibold">/ 100</span>
            </div>
            <p className="text-[11px] text-indigo-100 mt-0.5 font-medium">
              Tingkat: <strong>{scoreRating.label}</strong>
            </p>
          </div>

          <div className="space-y-1 pt-2 border-t border-indigo-400/30 text-[11px] text-indigo-100">
            <div className="flex justify-between">
              <span>Keberhasilan Tepat Waktu</span>
              <strong className="font-semibold">{summary.onTimeRate}%</strong>
            </div>
            <div className="w-full h-1 rounded-full bg-indigo-900/50 overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full"
                style={{ width: `${summary.onTimeRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Streak & Consistency Card */}
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Konsistensi & Streak
            </span>
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>

          <div className="my-2.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                {summary.currentStreak}
              </span>
              <span className="text-xs font-semibold text-slate-500">Hari Berturut-turut</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Penyelesaian konsisten setiap hari menjaga ritme kerja tim.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
            <div>
              <span className="text-slate-400 text-[10px]">Subtask Tuntas</span>
              <div className="font-bold text-slate-800 dark:text-slate-200">
                {summary.completedSubtasks} / {summary.totalSubtasks}
              </div>
            </div>
            <div>
              <span className="text-slate-400 text-[10px]">Total Estimasi</span>
              <div className="font-bold text-slate-800 dark:text-slate-200">
                {summary.totalEstimatedHours} Jam
              </div>
            </div>
          </div>
        </div>

        {/* Completion Velocity Ratio Card */}
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Penyelesaian Total
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>

          <div className="my-2.5">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
                {summary.completionRate}%
              </span>
              <span className="text-xs font-semibold text-slate-500">
                ({summary.completedTasks}/{summary.totalTasks})
              </span>
            </div>

            {summary.overdueTasks > 0 ? (
              <p className="text-[11px] text-rose-500 flex items-center gap-1 mt-0.5 font-semibold">
                <AlertTriangle className="w-3 h-3" />
                {summary.overdueTasks} tugas melewati tenggat
              </p>
            ) : (
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                ✓ Tidak ada tugas yang terlewat
              </p>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
            <span>Tugas Aktif: <strong>{summary.pendingTasks}</strong></span>
            <span>Tugas Selesai: <strong>{summary.completedTasks}</strong></span>
          </div>
        </div>
      </div>

      {/* 7-Day Productivity Velocity Chart */}
      <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-3.5 sm:p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-3">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-indigo-500" />
              <span>Aktivitas 7 Hari Terakhir</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Perbandingan tugas dibuat vs diselesaikan per hari.
            </p>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
              <span className="text-slate-600 dark:text-slate-400">Selesai</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-indigo-400" />
              <span className="text-slate-600 dark:text-slate-400">Dibuat</span>
            </div>
          </div>
        </div>

        {/* SVG Velocity Bar Chart */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-3 items-end h-36 pt-4 pb-1">
          {summary.trend7Days.map((day, idx) => {
            const completedHeight = Math.max(6, (day.completed / maxTrendVal) * 90);
            const createdHeight = Math.max(6, (day.created / maxTrendVal) * 90);

            return (
              <div key={idx} className="flex flex-col items-center justify-end h-full gap-1.5">
                <div className="flex items-end gap-1 sm:gap-1.5 w-full justify-center">
                  {/* Created Bar */}
                  <div
                    title={`${day.created} dibuat`}
                    className="w-2.5 sm:w-4 bg-indigo-300 dark:bg-indigo-700/60 rounded-t transition-all hover:opacity-80"
                    style={{ height: `${createdHeight}px` }}
                  />
                  {/* Completed Bar */}
                  <div
                    title={`${day.completed} selesai`}
                    className="w-2.5 sm:w-4 bg-emerald-500 rounded-t transition-all hover:opacity-80 shadow-xs"
                    style={{ height: `${completedHeight}px` }}
                  />
                </div>

                <div className="text-center">
                  <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    {day.dayName}
                  </span>
                  <span className="text-[9px] text-slate-400">
                    {day.date.split('-')[2]}/{day.date.split('-')[1]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Breakdown & Priority Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
        {/* Category Breakdown */}
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-3.5 sm:p-4 shadow-xs space-y-2.5">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
            Distribusi per Kategori & Proyek
          </h3>

          <div className="space-y-2">
            {summary.categoryStats.map((cat) => (
              <div key={cat.categoryId} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {cat.categoryName}
                    </span>
                  </div>
                  <span className="text-slate-500 font-medium">
                    {cat.completed}/{cat.total} ({cat.percentage}%)
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${cat.percentage}%`,
                      backgroundColor: cat.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-3.5 sm:p-4 shadow-xs space-y-2.5">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
            Komposisi Berdasarkan Prioritas
          </h3>

          <div className="grid grid-cols-2 gap-2">
            {summary.priorityStats.map((p) => (
              <div
                key={p.priority}
                className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block uppercase">
                    {p.label}
                  </span>
                  <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {p.count}
                  </span>
                </div>
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: p.color }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
