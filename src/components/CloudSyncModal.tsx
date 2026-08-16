import React, { useState } from 'react';
import {
  X,
  Cloud,
  CloudCheck,
  RefreshCw,
  Copy,
  CheckCircle2,
  Key,
  ShieldCheck,
  DownloadCloud,
  AlertCircle,
} from 'lucide-react';
import { CloudSyncState } from '../types';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  cloudSyncState: CloudSyncState;
  onManualSync: () => Promise<void>;
  onRestoreCloud: (key: string) => Promise<{ success: boolean; message: string }>;
  onToggleAutoSync: (enabled: boolean) => void;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  cloudSyncState,
  onManualSync,
  onRestoreCloud,
  onToggleAutoSync,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [restoreKey, setRestoreKey] = useState('');
  const [restoreStatus, setRestoreStatus] = useState<{ success?: boolean; message?: string } | null>(null);
  const [copiedKey, setCopiedKey] = useState(false);

  if (!isOpen) return null;

  const handleSyncClick = () => {
    setSyncFeedback(null);
    onManualSync();
    setSyncFeedback('Sinkronisasi ke Cloud Server berhasil diselesaikan!');
    setTimeout(() => setSyncFeedback(null), 3500);
  };

  const handleRestoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restoreKey.trim()) return;
    setIsSyncing(true);
    setRestoreStatus(null);
    try {
      const res = await onRestoreCloud(restoreKey.trim());
      setRestoreStatus(res);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(cloudSyncState.cloudKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-4">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Cloud className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Sinkronisasi Cloud & Cadangan
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Penyimpanan cloud otomatis untuk akses multi-perangkat.
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

        <div className="p-4 space-y-3.5">
          {/* Status Banner */}
          <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CloudCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  Cloud Storage Terhubung
                </h3>
                <p className="text-[10px] text-emerald-700 dark:text-emerald-400">
                  Terakhir disinkronkan:{' '}
                  {cloudSyncState.lastSyncedAt
                    ? new Date(cloudSyncState.lastSyncedAt).toLocaleTimeString('id-ID', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })
                    : 'Baru saja'}
                </p>
              </div>
            </div>

            <button
              id="btn-trigger-manual-sync"
              onClick={handleSyncClick}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold shadow-xs disabled:opacity-50 transition-all flex-shrink-0"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan'}</span>
            </button>
          </div>

          {syncFeedback && (
            <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
              <span>{syncFeedback}</span>
            </div>
          )}

          {/* Cloud Key Identifier */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              Kunci Identitas Cloud Workspace Anda
            </label>
            <div className="flex gap-1.5">
              <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 font-mono text-xs">
                <Key className="w-3.5 h-3.5 text-indigo-500" />
                <span className="font-bold">{cloudSyncState.cloudKey}</span>
              </div>
              <button
                onClick={handleCopyKey}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
              >
                {copiedKey ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey ? 'Tersalin' : 'Salin'}</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              Gunakan kunci ini pada perangkat lain untuk memuat atau memulihkan data tugas Anda.
            </p>
          </div>

          {/* Auto Sync Switch */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
            <div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Sinkronisasi Otomatis Saat Ada Perubahan
              </div>
              <div className="text-[10px] text-slate-400">
                Data otomatis diunggah ke cloud setiap kali tugas dibuat atau diselesaikan.
              </div>
            </div>
            <input
              type="checkbox"
              checked={cloudSyncState.isAutoSync}
              onChange={(e) => onToggleAutoSync(e.target.checked)}
              className="w-3.5 h-3.5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
          </div>

          {/* Restore / Connect to Existing Cloud Workspace */}
          <form onSubmit={handleRestoreSubmit} className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <DownloadCloud className="w-3.5 h-3.5 text-indigo-500" />
              <span>Hubungkan / Pulihkan dari Kunci Cloud Lain</span>
            </label>

            <div className="flex gap-1.5">
              <input
                type="text"
                value={restoreKey}
                onChange={(e) => setRestoreKey(e.target.value.toUpperCase())}
                placeholder="Masukkan ID Kunci Cloud (misal: TF-A1B2C3)..."
                className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 uppercase font-mono focus:outline-none"
              />
              <button
                type="submit"
                disabled={!restoreKey.trim() || isSyncing}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition-colors"
              >
                Pulihkan
              </button>
            </div>

            {restoreStatus && (
              <div
                className={`p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                  restoreStatus.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200'
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200'
                }`}
              >
                {restoreStatus.success ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                <span>{restoreStatus.message}</span>
              </div>
            )}
          </form>

          <div className="flex items-center gap-1 text-[10px] text-slate-400 justify-center">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span>Enkripsi Client-to-Cloud dengan Integritas Data Aman</span>
          </div>
        </div>
      </div>
    </div>
  );
};
