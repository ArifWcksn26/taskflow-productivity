import React from 'react';
import {
  X,
  Bell,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Volume2,
  Trash2,
  CheckCheck,
  ShieldCheck,
} from 'lucide-react';
import { NotificationItem } from '../types';
import { NotificationService } from '../services/notifications';
import { playReminderSound } from '../services/sound';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onSelectTask?: (taskId: string) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onClearAll,
  onSelectTask,
}) => {
  if (!isOpen) return null;

  const [permState, setPermState] = React.useState<NotificationPermission>(
    NotificationService.getPermission()
  );

  const handleRequestPush = async () => {
    const res = await NotificationService.requestPermission();
    const current = res || NotificationService.getPermission();
    setPermState(current);
    if (current === 'granted') {
      NotificationService.showBrowserNotification('TaskFlow Notifikasi Aktif', {
        body: 'Anda akan menerima pemberitahuan otomatis saat tenggat tugas mendekat!',
      });
    } else {
      alert('Izin Notifikasi diblokir oleh HP/Browser. Buka Setelan Situs di Chrome/Safari -> Izinkan Notifikasi untuk TaskFlow.');
    }
  };

  const handleTestSound = () => {
    playReminderSound();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-4">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Bell className="w-3.5 h-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Pusat Pengingat & Notifikasi
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Peringatan tenggat waktu dan update aktivitas tim.
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

        <div className="p-4 space-y-3 max-h-[82vh] overflow-y-auto">
          {/* Push & Sound Quick Controls */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
              <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                Izin Push Web: {permState === 'granted' ? 'Aktif' : 'Belum Diizinkan'}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              {permState !== 'granted' && (
                <button
                  onClick={handleRequestPush}
                  className="px-2 py-0.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                >
                  Izinkan Notifikasi
                </button>
              )}
              <button
                onClick={handleTestSound}
                className="flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-colors"
              >
                <Volume2 className="w-3 h-3 text-indigo-500" />
                <span>Tes Suara</span>
              </button>
            </div>
          </div>

          {/* Action Bar */}
          {notifications.length > 0 && (
            <div className="flex items-center justify-between text-xs pt-0.5">
              <button
                onClick={onMarkAllAsRead}
                className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline text-[11px]"
              >
                <CheckCheck className="w-3 h-3" />
                <span>Tandai Semua Dibaca</span>
              </button>
              <button
                onClick={onClearAll}
                className="flex items-center gap-1 text-slate-400 hover:text-rose-500 transition-colors text-[11px]"
              >
                <Trash2 className="w-3 h-3" />
                <span>Bersihkan Riwayat</span>
              </button>
            </div>
          )}

          {/* Feed */}
          {notifications.length === 0 ? (
            <div className="text-center py-8 space-y-1.5">
              <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Bell className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Tidak ada notifikasi baru
              </h4>
              <p className="text-[10px] text-slate-400">
                Semua pengingat telah bersih dan tidak ada batas waktu yang terlewat.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    if (n.taskId && onSelectTask) {
                      onSelectTask(n.taskId);
                      onClose();
                    }
                  }}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    !n.read
                      ? 'bg-indigo-50/50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/80'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5">
                      {n.type === 'overdue' ? (
                        <div className="w-5 h-5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center">
                          <AlertTriangle className="w-3 h-3" />
                        </div>
                      ) : n.type === 'reminder' ? (
                        <div className="w-5 h-5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
                          <Clock className="w-3 h-3" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center">
                          <Bell className="w-3 h-3" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1.5">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {n.title}
                        </h4>
                        <span className="text-[9px] text-slate-400 flex-shrink-0">
                          {new Date(n.timestamp).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                        {n.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
