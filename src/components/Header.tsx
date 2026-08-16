import React from 'react';
import {
  CheckSquare,
  Search,
  Plus,
  Bell,
  Cloud,
  CloudCheck,
  CloudOff,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Users,
  Download,
  Calendar as CalendarIcon,
  BarChart3,
  Timer,
  KanbanSquare,
} from 'lucide-react';
import { CloudSyncState, NotificationItem, ViewMode, ActiveTab } from '../types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenNewTaskModal: () => void;
  onOpenNotifications: () => void;
  onOpenCloudSync: () => void;
  onOpenExport: () => void;
  onOpenTeam: () => void;
  notifications: NotificationItem[];
  cloudSyncState: CloudSyncState;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  viewMode: ViewMode;
  onSelectViewMode: (mode: ViewMode) => void;
  onOpenFirebaseAuth?: () => void;
  firebaseUser?: any;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  onOpenNewTaskModal,
  onOpenNotifications,
  onOpenCloudSync,
  onOpenExport,
  onOpenTeam,
  notifications,
  cloudSyncState,
  isDarkMode,
  onToggleDarkMode,
  soundEnabled,
  onToggleSound,
  activeTab,
  onSelectTab,
  onOpenFirebaseAuth,
  firebaseUser,
}) => {
  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-[1700px] mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-13 sm:h-14 gap-2.5">
          {/* Logo & Mobile Tab Links */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => onSelectTab('all')}>
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700 flex items-center justify-center text-white shadow-xs">
                <CheckSquare className="w-4.5 h-4.5" />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
                    TaskFlow
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Navigation Pills for Top Bar */}
            <nav className="hidden lg:flex items-center gap-1 ml-3 pl-3 border-l border-slate-200 dark:border-slate-800">
              <button
                id="btn-nav-tasks"
                onClick={() => onSelectTab('all')}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${activeTab === 'all' || activeTab === 'today' || activeTab === 'upcoming' || activeTab === 'completed'
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
              >
                Daftar Tugas
              </button>
              <button
                id="btn-nav-kanban"
                onClick={() => onSelectTab('kanban')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${activeTab === 'kanban'
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
              >
                <KanbanSquare className="w-3.5 h-3.5" />
                Kanban
              </button>
              <button
                id="btn-nav-calendar"
                onClick={() => onSelectTab('calendar')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${activeTab === 'calendar'
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                Kalender
              </button>
              <button
                id="btn-nav-analytics"
                onClick={() => onSelectTab('analytics')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${activeTab === 'analytics'
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                Analitik
              </button>
            </nav>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-sm sm:max-w-md mx-1 sm:mx-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                id="input-header-search"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Cari tugas, tag, atau deskripsi..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/60 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1.5 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right Action Icons & Buttons */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Quick Add Button */}
            <button
              id="btn-header-add-task"
              onClick={onOpenNewTaskModal}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs font-semibold shadow-xs transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tugas Baru</span>
            </button>

            {/* Firebase User Auth Button */}
            <button
              id="btn-firebase-user-auth"
              onClick={onOpenFirebaseAuth}
              title={firebaseUser ? `Tersambung: ${firebaseUser.displayName || firebaseUser.email}` : 'Masuk Akun Firebase / Google'}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 transition-all text-xs font-medium"
            >
              {firebaseUser ? (
                <div className="flex items-center gap-1.5">
                  <img
                    src={firebaseUser.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                    alt="User"
                    className="w-4.5 h-4.5 rounded-full object-cover ring-1 ring-emerald-500"
                  />
                  <span className="hidden md:inline font-bold text-[11px] truncate max-w-[90px]">
                    {firebaseUser.displayName?.split(' ')[0] || 'Cloud User'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Cloud className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="hidden md:inline text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
                    Masuk Google
                  </span>
                </div>
              )}
            </button>

            {/* Cloud Sync Status Button */}
            <button
              id="btn-cloud-sync-status"
              onClick={onOpenCloudSync}
              title={`Status Cloud Sync: ${cloudSyncState.status === 'synced' ? 'Tersinkronisasi' : 'Menyinkronkan'}`}
              className="relative p-1.5 sm:p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 transition-all"
            >
              {cloudSyncState.status === 'synced' ? (
                <div className="relative">
                  <CloudCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                </div>
              ) : cloudSyncState.status === 'syncing' ? (
                <div className="relative animate-pulse">
                  <Cloud className="w-4 h-4 text-indigo-500 animate-spin" />
                </div>
              ) : (
                <CloudOff className="w-4 h-4 text-amber-500" />
              )}
            </button>

            {/* Notification Bell */}
            <button
              id="btn-header-notifications"
              onClick={onOpenNotifications}
              title="Notifikasi & Pengingat"
              className="relative p-1.5 sm:p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 transition-all"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {/* Export Modal Button */}
            <button
              id="btn-header-export"
              onClick={onOpenExport}
              title="Ekspor CSV / PDF"
              className="hidden md:flex p-1.5 sm:p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 transition-all"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Sound Mute/Unmute */}
            <button
              id="btn-toggle-sound"
              onClick={onToggleSound}
              title={soundEnabled ? 'Suara Notifikasi: Aktif' : 'Suara Notifikasi: Hening'}
              className="p-1.5 sm:p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 transition-all"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            {/* Dark Mode Toggle */}
            <button
              id="btn-toggle-darkmode"
              onClick={onToggleDarkMode}
              title={isDarkMode ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
              className="p-1.5 sm:p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 transition-all"
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
