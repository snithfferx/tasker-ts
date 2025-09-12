import { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { 
  CategoryService, 
  TaskService, 
  TimeEntryService,
} from '@Services/database';
import type { Category, Task, TimeEntry, CreateCategoryInput, CreateTaskInput, UpdateCategoryInput, UpdateTaskInput } from '@Services/database';

// ===================
// CATEGORY HOOKS
// ===================

export const useCategories = (user: User | null) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userCategories = await CategoryService.getUserCategories(user.uid);
      setCategories(userCategories);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (data: CreateCategoryInput) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      await CategoryService.create(user, data);
      await fetchCategories(); // Refresh the list
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateCategory = async (categoryId: string, data: UpdateCategoryInput) => {
    try {
      await CategoryService.update(categoryId, data);
      await fetchCategories(); // Refresh the list
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteCategory = async (categoryId: string, deleteAssociatedTasks = false) => {
    try {
      await CategoryService.delete(categoryId, deleteAssociatedTasks);
      await fetchCategories(); // Refresh the list
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [user]);

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    refetch: fetchCategories
  };
};

// ===================
// TASK HOOKS
// ===================

export const useTasks = (user: User | null) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const userTasks = await TaskService.getUserTasks(user.uid);
      setTasks(userTasks);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (data: CreateTaskInput) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      await TaskService.create(user, data);
      await fetchTasks(); // Refresh the list
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const updateTask = async (taskId: string, data: UpdateTaskInput) => {
    try {
      await TaskService.update(taskId, data);
      await fetchTasks(); // Refresh the list
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const deleteTask = async (taskId: string, deleteTimeEntries = false) => {
    try {
      await TaskService.delete(taskId, deleteTimeEntries);
      await fetchTasks(); // Refresh the list
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [user]);

  return {
    tasks,
    loading,
    error,
    createTask,
    updateTask,
    deleteTask,
    refetch: fetchTasks
  };
};

// ===================
// ACTIVE TASKS HOOK
// ===================

export const useActiveTasks = (user: User | null) => {
  const [activeTasks, setActiveTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActiveTasks = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const tasks = await TaskService.getActiveTasks(user.uid);
      setActiveTasks(tasks);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveTasks();
  }, [user]);

  return {
    activeTasks,
    loading,
    error,
    refetch: fetchActiveTasks
  };
};

// ===================
// TIME ENTRY HOOKS
// ===================

export const useTimeEntries = (user: User | null) => {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTimeEntries = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { entries } = await TimeEntryService.getUserTimeEntries(user.uid);
      setTimeEntries(entries);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteTimeEntry = async (entryId: string) => {
    try {
      await TimeEntryService.delete(entryId);
      await fetchTimeEntries(); // Refresh the list
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  useEffect(() => {
    fetchTimeEntries();
  }, [user]);

  return {
    timeEntries,
    loading,
    error,
    deleteTimeEntry,
    refetch: fetchTimeEntries
  };
};

// ===================
// TIMER HOOK
// ===================

export const useTimer = (user: User | null) => {
  const [currentTimer, setCurrentTimer] = useState<TimeEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkRunningTimer = async () => {
    if (!user) return;
    
    try {
      const runningTimer = await TimeEntryService.getRunningTimer(user.uid);
      setCurrentTimer(runningTimer);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const startTimer = async (taskId: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      setLoading(true);
      await TimeEntryService.startTimer(user, taskId);
      await checkRunningTimer(); // Refresh current timer
      setError(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const stopTimer = async () => {
    if (!currentTimer) return;
    
    try {
      setLoading(true);
      await TimeEntryService.stopTimer(currentTimer.id);
      setCurrentTimer(null);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const stopAllTimers = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      await TimeEntryService.stopAllRunningTimers(user.uid);
      setCurrentTimer(null);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkRunningTimer();
  }, [user]);

  return {
    currentTimer,
    loading,
    error,
    startTimer,
    stopTimer,
    stopAllTimers,
    refetch: checkRunningTimer
  };
};

// ===================
// ANALYTICS HOOK
// ===================

export const useTimeAnalytics = (user: User | null) => {
  const [analytics, setAnalytics] = useState<{
    taskSummary: { taskId: string, totalTime: number }[],
    totalTime: number
  }>({
    taskSummary: [],
    totalTime: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAnalytics = async (startDate: Date, endDate: Date) => {
    if (!user) return;
    
    try {
      setLoading(true);
      const summary = await TimeEntryService.getTimeSummary(user.uid, startDate, endDate);
      const totalTime = summary.reduce((total, item) => total + item.totalTime, 0);
      
      setAnalytics({
        taskSummary: summary,
        totalTime
      });
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    analytics,
    loading,
    error,
    getAnalytics
  };
};