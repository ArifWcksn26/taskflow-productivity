import { Task, NotificationItem } from '../types';
import { playReminderSound } from './sound';

export class NotificationService {
  private static isNotificationSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public static getPermission(): NotificationPermission {
    if (!this.isNotificationSupported()) return 'denied';
    return Notification.permission;
  }

  public static async requestPermission(): Promise<NotificationPermission> {
    if (!this.isNotificationSupported()) return 'denied';
    try {
      const permission = await Notification.requestPermission();
      return permission;
    } catch {
      return 'denied';
    }
  }

  public static showBrowserNotification(title: string, options?: NotificationOptions): void {
    if (!this.isNotificationSupported() || Notification.permission !== 'granted') {
      return;
    }

    try {
      const notification = new Notification(title, {
        icon: 'https://cdn-icons-png.flaticon.com/512/906/906334.png',
        badge: 'https://cdn-icons-png.flaticon.com/512/906/906334.png',
        ...options,
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch {
      // Fallback if browser blocks standard constructor in certain iframes
    }
  }

  /**
   * Scan tasks and identify any upcoming or overdue deadlines
   */
  public static checkDeadlines(
    tasks: Task[],
    existingNotifs: NotificationItem[],
    enableSound: boolean = true
  ): NotificationItem[] {
    const newNotifications: NotificationItem[] = [];
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    tasks.forEach((task) => {
      if (task.isCompleted) return;

      const dueDateTime = new Date(`${task.dueDate}T${task.dueTime || '23:59'}:00`);
      const diffMs = dueDateTime.getTime() - now.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));

      // Overdue Check
      if (diffMinutes < 0 && diffMinutes > -1440) {
        // Less than 24h overdue
        const overdueId = `overdue-${task.id}-${todayStr}`;
        const alreadyNotified = existingNotifs.some((n) => n.id === overdueId);

        if (!alreadyNotified) {
          const item: NotificationItem = {
            id: overdueId,
            taskId: task.id,
            title: `⚠️ Tugas Terlewat: ${task.title}`,
            message: `Tenggat waktu ${task.dueDate} ${task.dueTime || ''} telah terlewati.`,
            type: 'overdue',
            timestamp: new Date().toISOString(),
            read: false,
          };
          newNotifications.push(item);
          this.showBrowserNotification(item.title, { body: item.message });
        }
      }

      // Imminent Reminder (e.g. customized reminderMinutesBefore or default 30 mins)
      const reminderThreshold = task.reminderMinutesBefore ?? 30;
      if (diffMinutes > 0 && diffMinutes <= reminderThreshold) {
        const reminderId = `reminder-${task.id}-${todayStr}-${reminderThreshold}`;
        const alreadyNotified = existingNotifs.some((n) => n.id === reminderId);

        if (!alreadyNotified) {
          const item: NotificationItem = {
            id: reminderId,
            taskId: task.id,
            title: `⏰ Pengingat: ${task.title}`,
            message: `Tugas ini akan jatuh tempo dalam ${diffMinutes} menit (${task.dueTime || 'hari ini'}).`,
            type: 'reminder',
            timestamp: new Date().toISOString(),
            read: false,
          };
          newNotifications.push(item);
          this.showBrowserNotification(item.title, { body: item.message });
        }
      }
    });

    if (newNotifications.length > 0 && enableSound) {
      playReminderSound();
    }

    return newNotifications;
  }
}
