export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type Recurrence = 'none' | 'daily' | 'weekly' | 'monthly';

export interface Subtask {
  id: string;
  text: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface TaskComment {
  id: string;
  author: string;
  avatar: string;
  text: string;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  priority: Priority;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  reminderMinutesBefore?: number; // e.g. 0, 10, 30, 60, 1440 (1 day)
  isCompleted: boolean;
  kanbanStatus?: 'todo' | 'in_progress' | 'completed';
  completedAt?: string;
  subtasks: Subtask[];
  assignedMemberIds: string[];
  tags: string[];
  comments: TaskComment[];
  recurrence: Recurrence;
  estimatedMinutes?: number;
  actualMinutes?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  color: string; // Hex color code
  bgLight: string;
  textLight: string;
  iconName: string;
  isDefault?: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'editor' | 'viewer';
  color: string;
  isCurrentUser?: boolean;
}

export interface ActivityLog {
  id: string;
  taskId?: string;
  taskTitle?: string;
  action: 'create' | 'complete' | 'uncomplete' | 'update' | 'delete' | 'comment' | 'assign' | 'sync';
  actorName: string;
  actorAvatar: string;
  timestamp: string;
  details?: string;
}

export interface NotificationItem {
  id: string;
  taskId?: string;
  title: string;
  message: string;
  type: 'reminder' | 'deadline' | 'overdue' | 'team' | 'sync';
  timestamp: string;
  read: boolean;
}

export interface CloudSyncState {
  status: 'synced' | 'syncing' | 'offline' | 'error';
  lastSyncedAt: string | null;
  pendingChanges: number;
  cloudKey: string;
  isAutoSync: boolean;
}

export interface Habit {
  id: string;
  title: string;
  category: string;
  color: string;
  iconName: string;
  targetDaysPerWeek: number;
  completedDates: string[];
  createdAt: string;
}

export type ViewMode = 'list' | 'board' | 'compact';

export type ActiveTab = 'all' | 'today' | 'upcoming' | 'calendar' | 'analytics' | 'team' | 'completed' | 'category' | 'kanban' | 'habits';

export interface TaskFilterOptions {
  search: string;
  categoryId: string;
  priority: Priority | 'all';
  status: 'all' | 'pending' | 'completed' | 'overdue' | 'today';
  assignedMemberId: string;
  tag: string;
  sortBy: 'dueDate' | 'priority' | 'createdAt' | 'title';
  sortOrder: 'asc' | 'desc';
}
