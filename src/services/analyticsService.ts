import { Task, Category } from '../types';

export interface CategoryStat {
  categoryId: string;
  categoryName: string;
  color: string;
  total: number;
  completed: number;
  percentage: number;
}

export interface PriorityStat {
  priority: string;
  label: string;
  count: number;
  color: string;
}

export interface DailyTrendStat {
  date: string;
  dayName: string;
  completed: number;
  created: number;
}

export interface ProductivitySummary {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  completionRate: number;
  onTimeRate: number;
  productivityScore: number;
  currentStreak: number;
  totalEstimatedHours: number;
  totalSubtasks: number;
  completedSubtasks: number;
  categoryStats: CategoryStat[];
  priorityStats: PriorityStat[];
  trend7Days: DailyTrendStat[];
}

export class AnalyticsService {
  public static calculateSummary(tasks: Task[], categories: Category[]): ProductivitySummary {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.isCompleted).length;
    const pendingTasks = totalTasks - completedTasks;
    const todayStr = new Date().toISOString().split('T')[0];

    const overdueTasks = tasks.filter((t) => !t.isCompleted && t.dueDate < todayStr).length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // On-Time completion: completed on or before due date
    const completedWithDue = tasks.filter((t) => t.isCompleted && t.dueDate);
    const onTimeCompleted = completedWithDue.filter((t) => {
      if (!t.completedAt) return true;
      const compDate = t.completedAt.split('T')[0];
      return compDate <= t.dueDate;
    }).length;

    const onTimeRate = completedWithDue.length > 0 ? Math.round((onTimeCompleted / completedWithDue.length) * 100) : 0;

    // Subtasks stats
    let totalSubtasks = 0;
    let completedSubtasks = 0;
    let totalEstimatedMinutes = 0;

    tasks.forEach((t) => {
      totalSubtasks += t.subtasks.length;
      completedSubtasks += t.subtasks.filter((s) => s.isCompleted).length;
      totalEstimatedMinutes += t.estimatedMinutes || 0;
    });

    // Category breakdown
    const categoryStats: CategoryStat[] = categories.map((cat) => {
      const catTasks = tasks.filter((t) => t.categoryId === cat.id);
      const total = catTasks.length;
      const completed = catTasks.filter((t) => t.isCompleted).length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      return {
        categoryId: cat.id,
        categoryName: cat.name,
        color: cat.color,
        total,
        completed,
        percentage,
      };
    });

    // Priority breakdown
    const priorityLabels: Record<string, { label: string; color: string }> = {
      urgent: { label: 'Mendesak', color: '#EF4444' },
      high: { label: 'Tinggi', color: '#F97316' },
      medium: { label: 'Sedang', color: '#3B82F6' },
      low: { label: 'Rendah', color: '#10B981' },
    };

    const priorityStats: PriorityStat[] = (['urgent', 'high', 'medium', 'low'] as const).map((p) => ({
      priority: p,
      label: priorityLabels[p].label,
      count: tasks.filter((t) => t.priority === p).length,
      color: priorityLabels[p].color,
    }));

    // 7 Days Trend
    const trend7Days: DailyTrendStat[] = [];
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split('T')[0];
      const dayName = dayNames[d.getDay()];

      const completedOnDate = tasks.filter(
        (t) => t.isCompleted && t.completedAt && t.completedAt.startsWith(dStr)
      ).length;

      const createdOnDate = tasks.filter((t) => t.createdAt.startsWith(dStr)).length;

      trend7Days.push({
        date: dStr,
        dayName,
        completed: completedOnDate,
        created: createdOnDate,
      });
    }

    // Streak calculation
    let currentStreak = 0;
    const checkDate = new Date();
    for (let i = 0; i < 30; i++) {
      const cStr = checkDate.toISOString().split('T')[0];
      const hasCompleted = tasks.some((t) => t.isCompleted && t.completedAt && t.completedAt.startsWith(cStr));
      if (hasCompleted) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (i === 0) {
        // If today has no completed tasks yet, check yesterday before breaking streak
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    if (currentStreak === 0 && tasks.some((t) => t.isCompleted)) {
      currentStreak = 1; // Base active streak if user has finished tasks
    }

    // Productivity Score Formula
    // 40% completion rate + 30% on time rate + 20% subtask rate + 10% streak bonus (max 10)
    let productivityScore = 0;
    if (totalTasks > 0) {
      const subtaskRate = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;
      const streakBonus = Math.min(10, currentStreak * 2);
      const rawScore = completionRate * 0.4 + onTimeRate * 0.3 + subtaskRate * 0.2 + streakBonus;
      productivityScore = Math.min(100, Math.max(0, Math.round(rawScore)));
    }

    return {
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      completionRate,
      onTimeRate,
      productivityScore,
      currentStreak,
      totalEstimatedHours: Math.round((totalEstimatedMinutes / 60) * 10) / 10,
      totalSubtasks,
      completedSubtasks,
      categoryStats,
      priorityStats,
      trend7Days,
    };
  }
}
