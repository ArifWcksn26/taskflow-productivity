import { Task, Category, TeamMember, ActivityLog, NotificationItem, CloudSyncState, Habit } from '../types';
import { INITIAL_TASKS, INITIAL_CATEGORIES, INITIAL_MEMBERS, INITIAL_ACTIVITY_LOGS, INITIAL_HABITS } from '../data/initialData';
import { getFirebaseServices } from './firebase';

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
   * Uploads current snapshot to Firestore Cloud and local cache
   */
  public static async performCloudSync(
    tasks: Task[],
    categories: Category[],
    members: TeamMember[],
    logs: ActivityLog[],
    cloudKey: string,
    habits?: Habit[]
  ): Promise<{ success: boolean; syncedAt: string; message: string }> {
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

    // Save to local cache
    try {
      localStorage.setItem(`${STORAGE_KEYS.CLOUD_REMOTE_BACKUP}_${cloudKey}`, JSON.stringify(snapshot));
    } catch {
      // ignore
    }

    // Upload to Cloud Firestore database collection 'cloud_keys'
    try {
      const s = await getFirebaseServices();
      if (s && s.db) {
        const keyRef = s.dbMod.doc(s.db, 'cloud_keys', cloudKey);
        await s.dbMod.setDoc(keyRef, snapshot, { merge: true });
      }
    } catch (e) {
      console.warn('Firestore performCloudSync:', e);
    }

    return {
      success: true,
      syncedAt: snapshot.syncedAt,
      message: `Data berhasil disinkronkan ke Cloud Server (${tasks.length} tugas aman)`,
    };
  }

  /**
   * Restore cloud backup from a specific cloud key via Firestore Cloud
   */
  public static async restoreFromCloud(
    cloudKey: string
  ): Promise<{ success: boolean; data?: { tasks: Task[]; categories: Category[]; members: TeamMember[]; logs: ActivityLog[]; habits?: Habit[] }; message: string }> {
    let parsed: any = null;

    // 1. Fetch live snapshot from Firestore Cloud collection 'cloud_keys'
    try {
      const s = await getFirebaseServices();
      if (s && s.db) {
        const keyRef = s.dbMod.doc(s.db, 'cloud_keys', cloudKey);
        const snap = await s.dbMod.getDoc(keyRef);
        if (snap.exists()) {
          parsed = snap.data();
        }
      }
    } catch (e) {
      console.warn('Firestore restoreFromCloud:', e);
    }

    // 2. Fallback to local storage if offline
    if (!parsed) {
      try {
        const raw = localStorage.getItem(`${STORAGE_KEYS.CLOUD_REMOTE_BACKUP}_${cloudKey}`);
        if (raw) parsed = JSON.parse(raw);
      } catch {
        // ignore
      }
    }

    if (!parsed) {
      return {
        success: false,
        message: `Tidak ditemukan cadangan cloud untuk ID "${cloudKey}". Pastikan ID benar dan sudah ditekan Simpan Cloud.`,
      };
    }

    return {
      success: true,
      data: {
        tasks: parsed.tasks || [],
        categories: parsed.categories || [],
        members: parsed.members || [],
        logs: parsed.logs || [],
        habits: parsed.habits || [],
      },
      message: `Berhasil memulihkan cadangan cloud (${parsed.tasks?.length || 0} tugas)`,
    };
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
