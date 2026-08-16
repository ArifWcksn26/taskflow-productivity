import React from 'react';
import {
  ListTodo,
  CalendarDays,
  CalendarCheck,
  BarChart3,
  Users,
  CheckCircle2,
  FolderPlus,
  Flame,
  Cloud,
  ChevronRight,
  Briefcase,
  User,
  CreditCard,
  HeartPulse,
  BookOpen,
  Tag,
  KanbanSquare,
} from 'lucide-react';
import { Category, Task, ActiveTab } from '../types';

interface SidebarProps {
  categories: Category[];
  tasks: Task[];
  activeTab: ActiveTab;
  selectedCategoryId: string;
  onSelectTab: (tab: ActiveTab) => void;
  onSelectCategory: (categoryId: string) => void;
  onOpenNewCategoryModal: () => void;
  onOpenCloudSync: () => void;
  productivityScore: number;
  currentStreak: number;
}

const ICON_COMPONENTS: Record<string, React.ElementType> = {
  Briefcase,
  User,
  Users,
  CreditCard,
  HeartPulse,
  BookOpen,
  Tag,
};

export const Sidebar: React.FC<SidebarProps> = ({
  categories,
  tasks,
  activeTab,
  selectedCategoryId,
  onSelectTab,
  onSelectCategory,
  onOpenNewCategoryModal,
  onOpenCloudSync,
  productivityScore,
  currentStreak,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const totalTasks = tasks.length;
  const todayTasks = tasks.filter((t) => !t.isCompleted && t.dueDate === todayStr).length;
  const upcomingTasks = tasks.filter((t) => !t.isCompleted && t.dueDate > todayStr).length;
  const completedTasks = tasks.filter((t) => t.isCompleted).length;

  const getCategoryTaskCount = (catId: string) => {
    return tasks.filter((t) => t.categoryId === catId && !t.isCompleted).length;
  };

  const navItems = [
    {
      id: 'all',
      label: 'Semua Tugas',
      icon: ListTodo,
      count: tasks.filter((t) => !t.isCompleted).length,
      tab: 'all' as ActiveTab,
    },
    {
      id: 'today',
      label: 'Hari Ini',
      icon: CalendarDays,
      count: todayTasks,
      tab: 'today' as ActiveTab,
      highlight: todayTasks > 0,
    },
    {
      id: 'upcoming',
      label: 'Mendatang',
      icon: CalendarCheck,
      count: upcomingTasks,
      tab: 'upcoming' as ActiveTab,
    },
    {
      id: 'calendar',
      label: 'Kalender',
      icon: CalendarDays,
      tab: 'calendar' as ActiveTab,
    },
    {
      id: 'kanban',
      label: 'Papan Kanban',
      icon: KanbanSquare,
      tab: 'kanban' as ActiveTab,
    },
    {
      id: 'analytics',
      label: 'Analitik & Laporan',
      icon: BarChart3,
      tab: 'analytics' as ActiveTab,
    },
    {
      id: 'completed',
      label: 'Telah Selesai',
      icon: CheckCircle2,
      count: completedTasks,
      tab: 'completed' as ActiveTab,
    },
  ];

  return (
    <aside className="w-full md:w-56 lg:w-60 flex-shrink-0 flex flex-col gap-4 py-3.5 px-2.5 sm:px-3 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 transition-colors duration-200">
      {/* Main Views */}
      <div className="space-y-0.5">
        <div className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-400">
          Tampilan Utama
        </div>
        <div className="flex overflow-x-auto gap-1.5 md:flex-col md:space-y-0.5 md:gap-0 pb-1 md:pb-0 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.tab && selectedCategoryId === 'all';
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => {
                  onSelectTab(item.tab);
                }}
                className={`flex-shrink-0 md:w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${isActive
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-300 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Icon
                    className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-400'
                      }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${item.highlight
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      : isActive
                        ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-200'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Categories Section */}
      <div className="space-y-0.5">
        <div className="flex items-center justify-between px-2.5 py-1">
          <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-400">
            Kategori & Proyek
          </span>
          <button
            id="btn-add-category"
            onClick={onOpenNewCategoryModal}
            title="Tambah Kategori Baru"
            className="p-0.5 rounded text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <FolderPlus className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex overflow-x-auto gap-1.5 md:flex-col md:space-y-0.5 md:gap-0 pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const isCatActive = selectedCategoryId === cat.id;
            const count = getCategoryTaskCount(cat.id);
            const Icon = ICON_COMPONENTS[cat.iconName] || Tag;

            return (
              <button
                key={cat.id}
                id={`cat-item-${cat.id}`}
                onClick={() => {
                  onSelectCategory(cat.id);
                  onSelectTab('category');
                }}
                className={`flex-shrink-0 md:w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${isCatActive
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-300 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                  }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="truncate">{cat.name}</span>
                </div>
                {count > 0 && (
                  <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-400 px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800">
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Streak & Productivity Card */}
      <div className="mt-auto space-y-2 pt-3 border-t border-slate-200/80 dark:border-slate-800">
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-800 dark:text-slate-200">
              <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span>Streak: {currentStreak} Hari</span>
            </div>
            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">
              {productivityScore}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className="h-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-500"
              style={{ width: `${productivityScore}%` }}
            />
          </div>

          <div className="flex items-center justify-between mt-1.5 text-[10px] text-slate-500 dark:text-slate-400">
            <span>{completedTasks}/{totalTasks} selesai</span>
            <button
              onClick={() => onSelectTab('analytics')}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-0.5"
            >
              Analitik <ChevronRight className="w-2.5 h-2.5" />
            </button>
          </div>
        </div>

        {/* Cloud Sync Status Footer Pill */}
        <button
          onClick={onOpenCloudSync}
          className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-100/90 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <Cloud className="w-3 h-3 text-emerald-500" />
            <span className="text-[11px]">Cloud Sync</span>
          </div>
          <span className="text-[10px] text-slate-400">Aktif</span>
        </button>
      </div>
    </aside>
  );
};
