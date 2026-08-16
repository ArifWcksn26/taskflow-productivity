import React, { useRef, useState } from 'react';
import {
  X,
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  Database,
  Upload,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Task, Category, TeamMember } from '../types';
import { ExportService } from '../services/exportService';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  categories: Category[];
  members: TeamMember[];
  onImportJSON: (data: { tasks: Task[]; categories?: Category[]; members?: TeamMember[] }) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  tasks,
  categories,
  members,
  onImportJSON,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCSV = () => {
    ExportService.exportToCSV(tasks, categories, members);
    onClose();
  };

  const handlePDF = () => {
    ExportService.exportToPDF(tasks, categories, members);
    onClose();
  };

  const handleICS = () => {
    ExportService.exportToICS(tasks);
    onClose();
  };

  const handleDownloadJSON = () => {
    const backup = {
      app: 'TaskFlow',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      tasks,
      categories,
      members,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TaskFlow_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.tasks && Array.isArray(parsed.tasks)) {
          onImportJSON(parsed);
          setImportStatus('Data backup berhasil diimpor!');
          setTimeout(() => {
            setImportStatus(null);
            onClose();
          }, 1500);
        } else {
          setImportStatus('Format file tidak valid. Pastikan file JSON cadangan TaskFlow.');
        }
      } catch {
        setImportStatus('Gagal membaca file JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-4">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Download className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Ekspor & Cadangan Data
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Pilih format cadangan sesuai kebutuhan Anda.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-3">
          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* CSV */}
            <button
              onClick={handleCSV}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-500 dark:hover:border-emerald-500 text-left transition-all group"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div className="font-bold text-xs text-slate-900 dark:text-white">
                Format CSV (Excel)
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                Format tabel spreadsheet untuk analisis data mandiri.
              </p>
            </button>

            {/* PDF */}
            <button
              onClick={handlePDF}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 hover:border-indigo-500 dark:hover:border-indigo-500 text-left transition-all group"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                <FileText className="w-4 h-4" />
              </div>
              <div className="font-bold text-xs text-slate-900 dark:text-white">
                Dokumen PDF Rapi
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                Laporan visual formal siap cetak dan dibagikan.
              </p>
            </button>

            {/* ICS */}
            <button
              onClick={handleICS}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 hover:border-blue-500 dark:hover:border-blue-500 text-left transition-all group"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="font-bold text-xs text-slate-900 dark:text-white">
                Kalender iCal (.ICS)
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                Sinkronkan jadwal tugas ke Apple Calendar & Outlook.
              </p>
            </button>

            {/* JSON Backup */}
            <button
              onClick={handleDownloadJSON}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 hover:border-purple-500 dark:hover:border-purple-500 text-left transition-all group"
            >
              <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
                <Database className="w-4 h-4" />
              </div>
              <div className="font-bold text-xs text-slate-900 dark:text-white">
                Arsip JSON Lengkap
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                Cadangan utuh seluruh tugas, subtask, komentar, dan kategori.
              </p>
            </button>
          </div>

          {/* Import JSON Section */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-1.5">
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-indigo-500" />
              <span>Pulihkan dari File Cadangan (JSON)</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Punya file cadangan sebelumnya? Klik tombol di bawah untuk mengunggah dan memulihkan data.
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors"
            >
              Pilih File Cadangan JSON...
            </button>
          </div>

          {importStatus && (
            <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{importStatus}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
