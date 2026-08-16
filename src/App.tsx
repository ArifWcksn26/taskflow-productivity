import React, { useState, useEffect, useMemo, useCallback, useRef, lazy, Suspense } from 'react';
import {
  Task,
  Category,
  TeamMember,
  ActivityLog,
  NotificationItem,
  CloudSyncState,
  ActiveTab,
  ViewMode,
  TaskFilterOptions,
  Priority,
  Habit,
} from './types';
import { StorageService } from './services/storage';
import { NotificationService } from './services/notifications';
import { AnalyticsService } from './services/analyticsService';
import { playCompleteSound } from './services/sound';

// Core Eager Components
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { TaskList } from './components/TaskList';
import { TaskModal } from './components/TaskModal';
import { TaskDetailDrawer } from './components/TaskDetailDrawer';
import { KanbanView } from './components/KanbanView';

// Services
import { FirebaseSyncService } from './services/firebaseSyncService';
import type { User } from './services/firebase';

// Lazy Loaded Secondary Components for Speed Optimization
const CalendarView = lazy(() => import('./components/CalendarView').then((m) => ({ default: m.CalendarView })));
const AnalyticsView = lazy(() => import('./components/AnalyticsView').then((m) => ({ default: m.AnalyticsView })));
const CloudSyncModal = lazy(() => import('./components/CloudSyncModal').then((m) => ({ default: m.CloudSyncModal })));
const ExportModal = lazy(() => import('./components/ExportModal').then((m) => ({ default: m.ExportModal })));
const NotificationCenterModal = lazy(() => import('./components/NotificationCenterModal').then((m) => ({ default: m.NotificationCenterModal })));
const CategoryModal = lazy(() => import('./components/CategoryModal').then((m) => ({ default: m.CategoryModal })));
const FirebaseAuthModal = lazy(() => import('./components/FirebaseAuthModal').then((m) => ({ default: m.FirebaseAuthModal })));

export default function App() {
  // Theme & Sound
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('taskflow_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const [soundEnabled, setSoundEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('taskflow_sound');
      return saved !== 'false';
    }
    return true;
  });

  // Apply dark mode class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('taskflow_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('taskflow_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const toggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('taskflow_sound', String(next));
      return next;
    });
  };

  // Main State
  const [tasks, setTasks] = useState<Task[]>(() => StorageService.loadTasks());
  const [categories, setCategories] = useState<Category[]>(() => StorageService.loadCategories());
  const [members, setMembers] = useState<TeamMember[]>(() => StorageService.loadMembers());
  const [habits, setHabits] = useState<Habit[]>(() => StorageService.loadHabits());
  const [logs, setLogs] = useState<ActivityLog[]>(() => StorageService.loadLogs());
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    StorageService.loadNotifications()
  );
  const [cloudSyncState, setCloudSyncState] = useState<CloudSyncState>(() =>
    StorageService.loadCloudSyncState()
  );

  // Navigation & Views
  const [activeTab, setActiveTab] = useState<ActiveTab>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filters
  const [filters, setFilters] = useState<TaskFilterOptions>({
    search: '',
    categoryId: 'all',
    priority: 'all',
    status: 'all',
    assignedMemberId: 'all',
    tag: 'all',
    sortBy: 'dueDate',
    sortOrder: 'asc',
  });

  // Modals & Drawers
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [selectedTaskForDetail, setSelectedTaskForDetail] = useState<Task | null>(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isCloudSyncModalOpen, setIsCloudSyncModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isFirebaseAuthModalOpen, setIsFirebaseAuthModalOpen] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('taskflow_user_profile');
        if (saved) return JSON.parse(saved);
      } catch {
        // ignore
      }
    }
    return null;
  });

  // Save firebaseUser profile to localStorage for instant load on refresh
  useEffect(() => {
    if (firebaseUser) {
      try {
        localStorage.setItem(
          'taskflow_user_profile',
          JSON.stringify({
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL,
          })
        );
      } catch {
        // ignore
      }
    } else {
      localStorage.removeItem('taskflow_user_profile');
    }
  }, [firebaseUser]);

  // Auto save to storage on change
  useEffect(() => {
    StorageService.saveTasks(tasks);
  }, [tasks]);

  useEffect(() => {
    StorageService.saveCategories(categories);
  }, [categories]);

  useEffect(() => {
    StorageService.saveMembers(members);
  }, [members]);

  useEffect(() => {
    StorageService.saveLogs(logs);
  }, [logs]);

  useEffect(() => {
    StorageService.saveNotifications(notifications);
  }, [notifications]);

  useEffect(() => {
    StorageService.saveCloudSyncState(cloudSyncState);
  }, [cloudSyncState]);

  // Ref to track if modal is open (prevent snapshot from interfering with modal typing)
  const isEditingRef = useRef(false);
  isEditingRef.current = isTaskModalOpen || isCategoryModalOpen || isFirebaseAuthModalOpen;

  // Real-time Cloud Sync for logged in Google Account (Laptop ↔ HP Mobile Sync)
  useEffect(() => {
    if (!firebaseUser?.uid) return;
    let unsubscribe: any = null;

    // Load initial data from cloud when logged in
    FirebaseSyncService.fetchUserDataFromCloud(firebaseUser.uid).then((cloudData) => {
      if (cloudData) {
        if (cloudData.tasks && Array.isArray(cloudData.tasks) && cloudData.tasks.length > 0) {
          setTasks(cloudData.tasks);
        }
        if (cloudData.categories && Array.isArray(cloudData.categories) && cloudData.categories.length > 0) {
          setCategories(cloudData.categories);
        }
        if (cloudData.habits && Array.isArray(cloudData.habits) && cloudData.habits.length > 0) {
          setHabits(cloudData.habits);
        }
      }
    });

    // Subscribe to live changes from Firestore Cloud (HP ↔ Laptop)
    FirebaseSyncService.subscribeUserData(firebaseUser.uid, (cloudData) => {
      if (cloudData && !isEditingRef.current) {
        if (cloudData.tasks && Array.isArray(cloudData.tasks)) {
          setTasks(cloudData.tasks);
        }
        if (cloudData.categories && Array.isArray(cloudData.categories)) {
          setCategories(cloudData.categories);
        }
        if (cloudData.habits && Array.isArray(cloudData.habits)) {
          setHabits(cloudData.habits);
        }
      }
    }).then((unsubFn) => {
      unsubscribe = unsubFn;
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [firebaseUser?.uid]);

  // Fast auto-push local changes to Cloud Firestore when logged in
  useEffect(() => {
    if (!firebaseUser?.uid) return;
    const timer = setTimeout(() => {
      FirebaseSyncService.saveUserDataToCloud(firebaseUser.uid, { tasks, categories, habits });
    }, 400);
    return () => clearTimeout(timer);
  }, [tasks, categories, habits, firebaseUser?.uid]);

  // Automatically sync logged-in Google / Firebase Account to Team Members List (Penanggung Jawab Utama)
  useEffect(() => {
    if (firebaseUser) {
      setMembers((prevMembers) => {
        const primaryUserIndex = prevMembers.findIndex(
          (m) => m.isCurrentUser || m.id === 'user-1' || m.email === firebaseUser.email
        );

        const realGoogleMember: TeamMember = {
          id: primaryUserIndex >= 0 ? prevMembers[primaryUserIndex].id : `google-${firebaseUser.uid}`,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Pengguna Google (Anda)',
          email: firebaseUser.email || 'google.account@taskflow.pro',
          avatar:
            firebaseUser.photoURL ||
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          role: 'admin',
          color: '#6366f1',
          isCurrentUser: true,
        };

        if (primaryUserIndex >= 0) {
          const updated = [...prevMembers];
          updated[primaryUserIndex] = realGoogleMember;
          return updated;
        }

        return [realGoogleMember, ...prevMembers];
      });
    }
  }, [firebaseUser]);

  // Periodic Reminder & Deadline Checker (every 30 seconds)
  useEffect(() => {
    const checkTimer = setInterval(() => {
      const newItems = NotificationService.checkDeadlines(tasks, notifications, soundEnabled);
      if (newItems.length > 0) {
        setNotifications((prev) => [...newItems, ...prev]);
      }
    }, 30000);

    // Initial check on mount
    const initialItems = NotificationService.checkDeadlines(tasks, notifications, soundEnabled);
    if (initialItems.length > 0) {
      setNotifications((prev) => [...initialItems, ...prev]);
    }

    return () => clearInterval(checkTimer);
  }, [tasks, soundEnabled]);

  // Auto Cloud Sync Trigger
  const triggerAutoCloudSync = useCallback(() => {
    if (cloudSyncState.isAutoSync) {
      setCloudSyncState((prev) => ({
        ...prev,
        status: 'synced',
        lastSyncedAt: new Date().toISOString(),
      }));
    }
  }, [cloudSyncState.isAutoSync]);

  // Task Actions
  const handleSaveTask = (taskData: Partial<Task>) => {
    const nowIso = new Date().toISOString();

    if (taskToEdit) {
      // Update existing task
      const updatedTasks = tasks.map((t) =>
        t.id === taskToEdit.id
          ? {
            ...t,
            ...taskData,
            updatedAt: nowIso,
          }
          : t
      );
      setTasks(updatedTasks);

      // Add log
      const newLog: ActivityLog = {
        id: `log-${Date.now()}`,
        taskId: taskToEdit.id,
        taskTitle: taskData.title || taskToEdit.title,
        action: 'update',
        actorName: 'Saya (Anda)',
        actorAvatar: members.find((m) => m.isCurrentUser)?.avatar || '',
        timestamp: nowIso,
        details: 'Memperbarui rincian tugas',
      };
      setLogs((prev) => [newLog, ...prev]);

      // Update detail drawer if open
      if (selectedTaskForDetail?.id === taskToEdit.id) {
        setSelectedTaskForDetail({
          ...selectedTaskForDetail,
          ...taskData,
          updatedAt: nowIso,
        } as Task);
      }
    } else {
      // Create new task
      const newTask: Task = {
        id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        title: taskData.title || 'Tugas Baru',
        description: taskData.description || '',
        categoryId: taskData.categoryId || categories[0]?.id || 'cat-work',
        priority: taskData.priority || 'medium',
        dueDate: taskData.dueDate || new Date().toISOString().split('T')[0],
        dueTime: taskData.dueTime || '18:00',
        reminderMinutesBefore: taskData.reminderMinutesBefore ?? 30,
        isCompleted: false,
        subtasks: taskData.subtasks || [],
        assignedMemberIds: taskData.assignedMemberIds || ['user-1'],
        tags: taskData.tags || [],
        comments: [],
        recurrence: taskData.recurrence || 'none',
        estimatedMinutes: taskData.estimatedMinutes || 60,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      setTasks((prev) => [newTask, ...prev]);

      const newLog: ActivityLog = {
        id: `log-${Date.now()}`,
        taskId: newTask.id,
        taskTitle: newTask.title,
        action: 'create',
        actorName: 'Saya (Anda)',
        actorAvatar: members.find((m) => m.isCurrentUser)?.avatar || '',
        timestamp: nowIso,
        details: 'Membuat tugas baru',
      };
      setLogs((prev) => [newLog, ...prev]);
    }

    triggerAutoCloudSync();
    setTaskToEdit(null);
  };

  const handleQuickAddTask = (title: string, categoryId: string, priority: Priority) => {
    const nowIso = new Date().toISOString();
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title,
      description: '',
      categoryId,
      priority,
      dueDate: new Date().toISOString().split('T')[0],
      dueTime: '18:00',
      reminderMinutesBefore: 30,
      isCompleted: false,
      subtasks: [],
      assignedMemberIds: ['user-1'],
      tags: [],
      comments: [],
      recurrence: 'none',
      estimatedMinutes: 30,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    setTasks((prev) => [newTask, ...prev]);
    triggerAutoCloudSync();
  };

  const handleToggleComplete = (taskId: string) => {
    const nowIso = new Date().toISOString();

    setTasks((prev) => {
      const targetTask = prev.find((t) => t.id === taskId);
      if (!targetTask) return prev;

      const nextCompleted = !targetTask.isCompleted;
      if (nextCompleted && soundEnabled) {
        playCompleteSound();
      }

      let newRecurrentTask: Task | null = null;
      if (nextCompleted && targetTask.recurrence !== 'none') {
        const nextDue = new Date(`${targetTask.dueDate}T00:00:00`);
        if (targetTask.recurrence === 'daily') nextDue.setDate(nextDue.getDate() + 1);
        if (targetTask.recurrence === 'weekly') nextDue.setDate(nextDue.getDate() + 7);
        if (targetTask.recurrence === 'monthly') nextDue.setMonth(nextDue.getMonth() + 1);

        newRecurrentTask = {
          ...targetTask,
          id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          dueDate: nextDue.toISOString().split('T')[0],
          isCompleted: false,
          completedAt: undefined,
          subtasks: targetTask.subtasks.map((s) => ({ ...s, isCompleted: false })),
          createdAt: nowIso,
          updatedAt: nowIso,
        };
      }

      const updatedList = prev.map((t) =>
        t.id === taskId
          ? {
            ...t,
            isCompleted: nextCompleted,
            completedAt: nextCompleted ? nowIso : undefined,
            updatedAt: nowIso,
          }
          : t
      );

      if (newRecurrentTask) {
        return [newRecurrentTask, ...updatedList];
      }
      return updatedList;
    });

    // Update drawer item if open
    if (selectedTaskForDetail?.id === taskId) {
      setSelectedTaskForDetail((prev) =>
        prev
          ? {
            ...prev,
            isCompleted: !prev.isCompleted,
            completedAt: !prev.isCompleted ? nowIso : undefined,
          }
          : null
      );
    }

    triggerAutoCloudSync();
  };

  const handleUpdateTaskStatus = (taskId: string, newStatus: 'todo' | 'in_progress' | 'completed') => {
    const nowIso = new Date().toISOString();
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const isComp = newStatus === 'completed';
          if (isComp && soundEnabled && !t.isCompleted) {
            playCompleteSound();
          }
          return {
            ...t,
            isCompleted: isComp,
            kanbanStatus: newStatus,
            completedAt: isComp ? (t.completedAt || nowIso) : undefined,
            updatedAt: nowIso,
          };
        }
        return t;
      })
    );

    if (selectedTaskForDetail?.id === taskId) {
      const isComp = newStatus === 'completed';
      setSelectedTaskForDetail((prev) =>
        prev
          ? {
            ...prev,
            isCompleted: isComp,
            kanbanStatus: newStatus,
            completedAt: isComp ? (prev.completedAt || nowIso) : undefined,
            updatedAt: nowIso,
          }
          : null
      );
    }

    triggerAutoCloudSync();
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const updatedSubs = t.subtasks.map((s) =>
            s.id === subtaskId ? { ...s, isCompleted: !s.isCompleted } : s
          );
          // Check if all subtasks completed
          const allDone = updatedSubs.length > 0 && updatedSubs.every((s) => s.isCompleted);
          return {
            ...t,
            subtasks: updatedSubs,
            isCompleted: allDone ? true : t.isCompleted,
            updatedAt: new Date().toISOString(),
          };
        }
        return t;
      })
    );

    // Update drawer item if open
    if (selectedTaskForDetail?.id === taskId) {
      setSelectedTaskForDetail((prev) =>
        prev
          ? {
            ...prev,
            subtasks: prev.subtasks.map((s) =>
              s.id === subtaskId ? { ...s, isCompleted: !s.isCompleted } : s
            ),
          }
          : null
      );
    }
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    if (selectedTaskForDetail?.id === taskId) {
      setSelectedTaskForDetail(null);
    }
    triggerAutoCloudSync();
  };

  const handleDuplicateTask = (task: Task) => {
    const nowIso = new Date().toISOString();
    const duplicated: Task = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: `${task.title} (Salinan)`,
      isCompleted: false,
      completedAt: undefined,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    setTasks((prev) => [duplicated, ...prev]);
    triggerAutoCloudSync();
  };

  const handleAddComment = (taskId: string, text: string) => {
    const nowIso = new Date().toISOString();
    const user = members.find((m) => m.isCurrentUser) || members[0];
    const newComment = {
      id: `comm-${Date.now()}`,
      author: user.name,
      avatar: user.avatar,
      text,
      createdAt: nowIso,
    };

    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === taskId) {
          const comments = t.comments ? [...t.comments, newComment] : [newComment];
          return { ...t, comments, updatedAt: nowIso };
        }
        return t;
      })
    );

    if (selectedTaskForDetail?.id === taskId) {
      setSelectedTaskForDetail((prev) =>
        prev
          ? {
            ...prev,
            comments: prev.comments ? [...prev.comments, newComment] : [newComment],
          }
          : null
      );
    }

    triggerAutoCloudSync();
  };

  const handleAddCategory = (catData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...catData,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCat]);
    triggerAutoCloudSync();
  };

  const handleAddMember = (memberData: Omit<TeamMember, 'id'>) => {
    const newMember: TeamMember = {
      ...memberData,
      id: `user-${Date.now()}`,
    };
    setMembers((prev) => [...prev, newMember]);
    triggerAutoCloudSync();
  };

  const handleRemoveMember = (id: string) => {
    setMembers((prev) => prev.filter((m) => m.id !== id));
  };

  // Cloud Sync Handlers
  const handleManualSync = async () => {
    setCloudSyncState((prev) => ({ ...prev, status: 'syncing' }));
    const res = await StorageService.performCloudSync(
      tasks,
      categories,
      members,
      logs,
      cloudSyncState.cloudKey,
      habits
    );
    setCloudSyncState((prev) => ({
      ...prev,
      status: res.success ? 'synced' : 'error',
      lastSyncedAt: res.syncedAt,
    }));
  };

  const handleRestoreCloud = async (key: string) => {
    const res = await StorageService.restoreFromCloud(key);
    if (res.success && res.data) {
      setTasks(res.data.tasks);
      if (res.data.categories?.length) setCategories(res.data.categories);
      if (res.data.members?.length) setMembers(res.data.members);
      if (res.data.logs?.length) setLogs(res.data.logs);
      if (res.data.habits?.length) setHabits(res.data.habits);
      setCloudSyncState((prev) => ({
        ...prev,
        cloudKey: key,
        lastSyncedAt: new Date().toISOString(),
        status: 'synced',
      }));
    }
    return res;
  };

  const handleImportJSON = (data: { tasks: Task[]; categories?: Category[]; members?: TeamMember[] }) => {
    if (data.tasks) setTasks(data.tasks);
    if (data.categories) setCategories(data.categories);
    if (data.members) setMembers(data.members);
    triggerAutoCloudSync();
  };

  // Notification handlers
  const handleMarkAllNotifsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearAllNotifs = () => {
    setNotifications([]);
  };

  // Productivity Summary for Sidebar
  const productivitySummary = useMemo(() => {
    return AnalyticsService.calculateSummary(tasks, categories);
  }, [tasks, categories]);

  // Filter and Sort Tasks
  const filteredTasks = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];

    return tasks.filter((task) => {
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesDesc = task.description?.toLowerCase().includes(q);
        const matchesTag = task.tags?.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesDesc && !matchesTag) return false;
      }

      // Active Tab Filter
      if (activeTab === 'today') {
        if (task.dueDate !== todayStr) return false;
      } else if (activeTab === 'upcoming') {
        if (task.dueDate <= todayStr) return false;
      } else if (activeTab === 'completed') {
        if (!task.isCompleted) return false;
      } else if (activeTab === 'category') {
        if (selectedCategoryId !== 'all' && task.categoryId !== selectedCategoryId) {
          return false;
        }
      }

      // Explicit Filters Bar
      if (filters.priority !== 'all' && task.priority !== filters.priority) {
        return false;
      }

      if (filters.status === 'pending' && task.isCompleted) return false;
      if (filters.status === 'completed' && !task.isCompleted) return false;
      if (filters.status === 'overdue' && (task.isCompleted || task.dueDate >= todayStr)) {
        return false;
      }
      if (filters.status === 'today' && task.dueDate !== todayStr) return false;

      if (
        filters.assignedMemberId !== 'all' &&
        !task.assignedMemberIds.includes(filters.assignedMemberId)
      ) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      // Sort logic
      if (filters.sortBy === 'dueDate') {
        return (a.dueDate || '').localeCompare(b.dueDate || '');
      }
      if (filters.sortBy === 'priority') {
        const priorityOrder: Record<Priority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      if (filters.sortBy === 'createdAt') {
        return b.createdAt.localeCompare(a.createdAt);
      }
      if (filters.sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [tasks, searchQuery, activeTab, selectedCategoryId, filters]);

  // Page titles
  const getTabTitle = () => {
    if (activeTab === 'today') return 'Tugas Hari Ini';
    if (activeTab === 'upcoming') return 'Tugas Mendatang';
    if (activeTab === 'completed') return 'Arsip Tugas Selesai';
    if (activeTab === 'category') {
      const cat = categories.find((c) => c.id === selectedCategoryId);
      return cat ? `Folder: ${cat.name}` : 'Semua Tugas';
    }
    return 'Semua Tugas';
  };

  const getTabSubtitle = () => {
    if (activeTab === 'today') return 'Fokus pada target yang harus selesai sebelum hari ini berakhir.';
    if (activeTab === 'upcoming') return 'Persiapkan langkah kerja untuk hari-hari ke depan.';
    if (activeTab === 'completed') return 'Riwayat pencapaian dan tugas yang telah diselesaikan.';
    return `Menampilkan ${filteredTasks.length} tugas aktif`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Sticky Header */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenNewTaskModal={() => {
          setTaskToEdit(null);
          setIsTaskModalOpen(true);
        }}
        onOpenNotifications={() => setIsNotificationModalOpen(true)}
        onOpenCloudSync={() => setIsCloudSyncModalOpen(true)}
        onOpenExport={() => setIsExportModalOpen(true)}
        onOpenTeam={() => setIsTeamModalOpen(true)}
        notifications={notifications}
        cloudSyncState={cloudSyncState}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setSelectedCategoryId('all');
        }}
        viewMode={viewMode}
        onSelectViewMode={setViewMode}
        onOpenFirebaseAuth={() => setIsFirebaseAuthModalOpen(true)}
        firebaseUser={firebaseUser}
      />

      {/* Main Container */}
      <div className="flex-1 max-w-[1700px] w-full mx-auto flex flex-col md:flex-row">
        {/* Sidebar */}
        <Sidebar
          categories={categories}
          tasks={tasks}
          activeTab={activeTab}
          selectedCategoryId={selectedCategoryId}
          onSelectTab={(tab) => {
            setActiveTab(tab);
            setSelectedCategoryId('all');
          }}
          onSelectCategory={(catId) => {
            setSelectedCategoryId(catId);
            setActiveTab('category');
          }}
          onOpenNewCategoryModal={() => setIsCategoryModalOpen(true)}
          onOpenCloudSync={() => setIsCloudSyncModalOpen(true)}
          productivityScore={productivitySummary.productivityScore}
          currentStreak={productivitySummary.currentStreak}
        />

        {/* Content Area */}
        <main className="flex-1 p-3 sm:p-4 lg:p-5 min-w-0 overflow-y-auto">
          <Suspense fallback={
            <div className="flex items-center justify-center p-12 text-slate-400 text-xs font-medium">
              Memuat tampilan...
            </div>
          }>
            {activeTab === 'calendar' ? (
              <CalendarView
                tasks={tasks}
                categories={categories}
                members={members}
                onOpenNewTaskModalWithDate={(dateStr) => {
                  setTaskToEdit({
                    id: '',
                    title: '',
                    description: '',
                    categoryId: categories[0]?.id || 'cat-work',
                    priority: 'medium',
                    dueDate: dateStr,
                    dueTime: '18:00',
                    reminderMinutesBefore: 30,
                    isCompleted: false,
                    subtasks: [],
                    assignedMemberIds: ['user-1'],
                    tags: [],
                    comments: [],
                    recurrence: 'none',
                    createdAt: '',
                    updatedAt: '',
                  });
                  setIsTaskModalOpen(true);
                }}
                onOpenDetails={(task) => setSelectedTaskForDetail(task)}
                onToggleComplete={handleToggleComplete}
              />
            ) : activeTab === 'kanban' ? (
              <KanbanView
                tasks={tasks}
                categories={categories}
                members={members}
                onToggleCompleteTask={handleToggleComplete}
                onUpdateTaskStatus={handleUpdateTaskStatus}
                onSelectTask={(task) => setSelectedTaskForDetail(task)}
                onEditTask={(task) => {
                  setTaskToEdit(task);
                  setIsTaskModalOpen(true);
                }}
                onDeleteTask={handleDeleteTask}
                onOpenNewTaskModal={() => {
                  setTaskToEdit(null);
                  setIsTaskModalOpen(true);
                }}
              />
            ) : activeTab === 'analytics' ? (
              <AnalyticsView
                tasks={tasks}
                categories={categories}
                members={members}
              />
            ) : (
              <TaskList
                tasks={filteredTasks}
                categories={categories}
                members={members}
                title={getTabTitle()}
                subtitle={getTabSubtitle()}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                filters={filters}
                onFiltersChange={setFilters}
                onToggleComplete={handleToggleComplete}
                onToggleSubtask={handleToggleSubtask}
                onEdit={(task) => {
                  setTaskToEdit(task);
                  setIsTaskModalOpen(true);
                }}
                onDelete={handleDeleteTask}
                onDuplicate={handleDuplicateTask}
                onOpenDetails={(task) => setSelectedTaskForDetail(task)}
                onQuickAddTask={handleQuickAddTask}
                onOpenNewTaskModal={() => {
                  setTaskToEdit(null);
                  setIsTaskModalOpen(true);
                }}
              />
            )}
          </Suspense>
        </main>
      </div>

      {/* Task Creation & Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
        categories={categories}
        members={members}
      />

      {/* Task Detail & Discussions Drawer */}
      <TaskDetailDrawer
        task={selectedTaskForDetail}
        category={
          selectedTaskForDetail
            ? categories.find((c) => c.id === selectedTaskForDetail.categoryId)
            : undefined
        }
        members={members}
        onClose={() => setSelectedTaskForDetail(null)}
        onToggleComplete={handleToggleComplete}
        onToggleSubtask={handleToggleSubtask}
        onAddComment={handleAddComment}
        onEdit={(task) => {
          setSelectedTaskForDetail(null);
          setTaskToEdit(task);
          setIsTaskModalOpen(true);
        }}
        onDelete={handleDeleteTask}
      />

      <Suspense fallback={null}>
        {/* Cloud Sync Modal */}
        <CloudSyncModal
          isOpen={isCloudSyncModalOpen}
          onClose={() => setIsCloudSyncModalOpen(false)}
          cloudSyncState={cloudSyncState}
          onManualSync={handleManualSync}
          onRestoreCloud={handleRestoreCloud}
          onToggleAutoSync={(enabled) =>
            setCloudSyncState((prev) => ({ ...prev, isAutoSync: enabled }))
          }
        />

        {/* Export CSV / PDF / JSON Modal */}
        <ExportModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          tasks={tasks}
          categories={categories}
          members={members}
          onImportJSON={handleImportJSON}
        />

        {/* Notification Center Modal */}
        <NotificationCenterModal
          isOpen={isNotificationModalOpen}
          onClose={() => setIsNotificationModalOpen(false)}
          notifications={notifications}
          onMarkAllAsRead={handleMarkAllNotifsRead}
          onClearAll={handleClearAllNotifs}
          onSelectTask={(taskId) => {
            const t = tasks.find((item) => item.id === taskId);
            if (t) setSelectedTaskForDetail(t);
          }}
        />

        {/* Category Creation Modal */}
        <CategoryModal
          isOpen={isCategoryModalOpen}
          onClose={() => setIsCategoryModalOpen(false)}
          onAddCategory={handleAddCategory}
        />

        {/* Firebase Auth & Sync Modal */}
        <FirebaseAuthModal
          isOpen={isFirebaseAuthModalOpen}
          onClose={() => setIsFirebaseAuthModalOpen(false)}
          currentUser={firebaseUser}
          setCurrentUser={setFirebaseUser}
          onSyncToCloud={async () => {
            if (firebaseUser) {
              await FirebaseSyncService.saveUserDataToCloud(firebaseUser.uid, {
                tasks,
                categories,
                habits,
              });
            }
          }}
          onSyncFromCloud={async () => {
            if (firebaseUser) {
              const data = await FirebaseSyncService.fetchUserDataFromCloud(firebaseUser.uid);
              if (data) {
                if (data.tasks) setTasks(data.tasks);
                if (data.categories) setCategories(data.categories);
                if (data.habits) setHabits(data.habits);
              }
            }
          }}
        />
      </Suspense>
    </div>
  );
}
