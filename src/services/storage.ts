import { Task, Category, TeamMember, ActivityLog, NotificationItem, CloudSyncState, Habit } from '../types';
import { INITIAL_TASKS, INITIAL_CATEGORIES, INITIAL_MEMBERS, INITIAL_ACTIVITY_LOGS, INITIAL_HABITS } from '../data/initialData';

const STORAGE_KEYS = {
  TASKS: 'taskflow_tasks_v3',
  CATEGORIES: 'taskflow_categories_v3',
  MEMBERS: 'taskflow_members_v3',
  HABITS: 'taskflow_habits_v3',
  LOGS: 'taskflow_logs_v3',
  NOTIFICATIONS: 'taskflow_notifications_v3',
  CLOUD_SYNC: 'taskflow_cloud_sync_v3',
  THEME: 'taskflow_theme_v1',
  CLOUD_REMOTE_BACKUP: 'taskflow_remote_cloud_storage_simulation_v3',
};

export class StorageService {
  public static loadHabits(): Habit[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HABITS);
      if (!data) return INITIAL_HABITS;
      return JSON.parse(data);
    } catch {
      return INITIAL_HABITS;
    }
  }

  public static saveHabits(habits: Habit[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
    } catch (e) {
      console.error('Failed to save habits to storage', e);
    }
  }

  public static loadTasks(): Task[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (!data) return INITIAL_TASKS;
      return JSON.parse(data);
    } catch {
      return INITIAL_TASKS;
    }
  }

  public static saveTasks(tasks: Task[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks to storage', e);
    }
  }

  public static loadCategories(): Category[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (!data) return INITIAL_CATEGORIES;
      return JSON.parse(data);
    } catch {
      return INITIAL_CATEGORIES;
    }
  }

  public static saveCategories(categories: Category[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error('Failed to save categories to storage', e);
    }
  }

  public static loadMembers(): TeamMember[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEMBERS);
      if (!data) return INITIAL_MEMBERS;
      return JSON.parse(data);
    } catch {
      return INITIAL_MEMBERS;
    }
  }

  public static saveMembers(members: TeamMember[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
    } catch (e) {
      console.error('Failed to save members to storage', e);
    }
  }

  public static loadLogs(): ActivityLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (!data) return INITIAL_ACTIVITY_LOGS;
      return JSON.parse(data);
    } catch {
      return INITIAL_ACTIVITY_LOGS;
    }
  }

  public static saveLogs(logs: ActivityLog[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(logs.slice(0, 100))); // Keep last 100
    } catch (e) {
      console.error('Failed to save logs to storage', e);
    }
  }

  public static loadNotifications(): NotificationItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  public static saveNotifications(notifs: NotificationItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifs.slice(0, 50)));
    } catch (e) {
      console.error('Failed to save notifications', e);
    }
  }

  public static loadCloudSyncState(): CloudSyncState {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CLOUD_SYNC);
      if (!data) {
        return {
          status: 'synced',
          lastSyncedAt: new Date().toISOString(),
          pendingChanges: 0,
          cloudKey: 'TF-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
          isAutoSync: true,
        };
      }
      return JSON.parse(data);
    } catch {
      return {
        status: 'synced',
        lastSyncedAt: new Date().toISOString(),
        pendingChanges: 0,
        cloudKey: 'TF-DEFAULT-SYNC',
        isAutoSync: true,
      };
    }
  }

  public static saveCloudSyncState(state: CloudSyncState): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CLOUD_SYNC, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save cloud sync state', e);
    }
  }

  /**
   * Cloud sync simulation: Uploads current snapshot to remote simulated cloud
   */
  public static async performCloudSync(
    tasks: Task[],
    categories: Category[],
    members: TeamMember[],
    logs: ActivityLog[],
    cloudKey: string,
    habits?: Habit[]
  ): Promise<{ success: boolean; syncedAt: string; message: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const snapshot = {
            cloudKey,
            syncedAt: new Date().toISOString(),
            tasks,
            categories,
            members,
            logs,
            habits: habits || StorageService.loadHabits(),
            version: '1.0.0',
          };
          localStorage.setItem(`${STORAGE_KEYS.CLOUD_REMOTE_BACKUP}_${cloudKey}`, JSON.stringify(snapshot));
          resolve({
            success: true,
            syncedAt: snapshot.syncedAt,
            message: `Data berhasil disinkronkan ke Cloud Server (${tasks.length} tugas aman)`,
          });
        } catch {
          resolve({
            success: false,
            syncedAt: new Date().toISOString(),
            message: 'Gagal menyinkronkan data ke cloud storage',
          });
        }
      }, 750); // Realistic network delay
    });
  }

  /**
   * Restore cloud backup from a specific cloud key
   */
  public static async restoreFromCloud(
    cloudKey: string
  ): Promise<{ success: boolean; data?: { tasks: Task[]; categories: Category[]; members: TeamMember[]; logs: ActivityLog[]; habits?: Habit[] }; message: string }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          const raw = localStorage.getItem(`${STORAGE_KEYS.CLOUD_REMOTE_BACKUP}_${cloudKey}`);
          if (!raw) {
            resolve({
              success: false,
              message: `Tidak ditemukan cadangan cloud untuk ID "${cloudKey}". Pastikan ID benar atau buat sinkronisasi baru.`,
            });
            return;
          }
          const parsed = JSON.parse(raw);
          resolve({
            success: true,
            data: {
              tasks: parsed.tasks || [],
              categories: parsed.categories || [],
              members: parsed.members || [],
              logs: parsed.logs || [],
              habits: parsed.habits || [],
            },
            message: `Berhasil memulihkan cadangan cloud (${parsed.tasks?.length || 0} tugas)`,
          });
        } catch {
          resolve({
            success: false,
            message: 'Terjadi kesalahan saat membaca arsip cloud',
          });
        }
      }, 900);
    });
  }

  public static resetToDefault(): void {
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.MEMBERS);
    localStorage.removeItem(STORAGE_KEYS.LOGS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.CLOUD_SYNC);
  }
}
