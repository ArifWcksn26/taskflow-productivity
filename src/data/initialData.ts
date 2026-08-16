import { Category, Task, TeamMember, ActivityLog, Habit } from '../types';

// Helper to format date offset from today (YYYY-MM-DD)
export const getDateOffset = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const INITIAL_HABITS: Habit[] = [
  {
    id: 'habit-1',
    title: 'Olahraga 30 Menit',
    category: 'Kesehatan',
    color: '#F59E0B',
    iconName: 'Activity',
    targetDaysPerWeek: 7,
    completedDates: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'habit-2',
    title: 'Minum Air 2 Liter',
    category: 'Kesehatan',
    color: '#06B6D4',
    iconName: 'Droplet',
    targetDaysPerWeek: 7,
    completedDates: [],
    createdAt: new Date().toISOString(),
  },
  {
    id: 'habit-3',
    title: 'Membaca Buku 15 Menit',
    category: 'Pengembangan Diri',
    color: '#8B5CF6',
    iconName: 'BookOpen',
    targetDaysPerWeek: 5,
    completedDates: [],
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat-work',
    name: 'Pekerjaan',
    color: '#3B82F6', // Blue
    bgLight: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60',
    textLight: 'text-blue-700 dark:text-blue-300',
    iconName: 'Briefcase',
    isDefault: true,
  },
  {
    id: 'cat-personal',
    name: 'Pribadi',
    color: '#10B981', // Emerald
    bgLight: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60',
    textLight: 'text-emerald-700 dark:text-emerald-300',
    iconName: 'User',
    isDefault: true,
  },
  {
    id: 'cat-project',
    name: 'Proyek Tim',
    color: '#8B5CF6', // Purple
    bgLight: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/60',
    textLight: 'text-purple-700 dark:text-purple-300',
    iconName: 'Users',
    isDefault: true,
  },
  {
    id: 'cat-finance',
    name: 'Keuangan',
    color: '#F59E0B', // Amber
    bgLight: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60',
    textLight: 'text-amber-700 dark:text-amber-300',
    iconName: 'CreditCard',
    isDefault: true,
  },
  {
    id: 'cat-health',
    name: 'Kesehatan',
    color: '#EC4899', // Pink
    bgLight: 'bg-pink-50 dark:bg-pink-950/40 border-pink-200 dark:border-pink-800/60',
    textLight: 'text-pink-700 dark:text-pink-300',
    iconName: 'HeartPulse',
    isDefault: true,
  },
  {
    id: 'cat-study',
    name: 'Belajar & Riset',
    color: '#06B6D4', // Cyan
    bgLight: 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800/60',
    textLight: 'text-cyan-700 dark:text-cyan-300',
    iconName: 'BookOpen',
    isDefault: true,
  },
];

export const INITIAL_MEMBERS: TeamMember[] = [
  {
    id: 'user-1',
    name: 'Saya (Anda)',
    email: 'user@taskflow.pro',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'admin',
    color: '#3B82F6',
    isCurrentUser: true,
  },
];

export const INITIAL_TASKS: Task[] = [];

export const INITIAL_ACTIVITY_LOGS: ActivityLog[] = [];

