import { format, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import type { DashboardData, TaskStats, TimeDataPoint, ChartDataPoint } from './types';

// Chart colors
export const CHART_COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#EF4444', '#6B7280'];

export const calculateTaskStats = (tasks: any[]): TaskStats => {
  const now = new Date();
  return tasks.reduce((acc, task) => {
    acc.total++;
    if (task.status === 'completed') acc.completed++;
    if (task.status === 'inProgress') acc.active++;
    if (task.dueDate && new Date(task.dueDate) < now) acc.overdue++;
    return acc;
  }, { total: 0, completed: 0, active: 0, overdue: 0 });
};

export const getMonthlyTasks = (tasks: any[]) => {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(new Date(), i);
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    
    const monthTasks = tasks.filter(task => {
      const taskDate = new Date(task.createdAt);
      return taskDate >= monthStart && taskDate <= monthEnd;
    });

    months.push({
      month: format(date, 'MMM yyyy'),
      total: monthTasks.length,
      completed: monthTasks.filter(t => t.status === 'completed').length
    });
  }
  return months;
};

export const getTimeSpentByMonth = (timeEntries: any[]) => {
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(new Date(), i);
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    
    const monthTimeEntries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.startedAt);
      return entryDate >= monthStart && entryDate <= monthEnd;
    });

    const totalSeconds = monthTimeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
    const hours = Math.round((totalSeconds / 3600) * 10) / 10;

    months.push({
      month: format(date, 'MMM yyyy'),
      hours
    });
  }
  return months;
};

export const getWeeklyProgress = (tasks: any[]) => {
  const weekStart = startOfWeek(new Date());
  const weekEnd = endOfWeek(new Date());
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  return days.map(day => {
    const dayTasks = tasks.filter(task => {
      const taskDate = new Date(task.createdAt);
      return format(taskDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
    });

    return {
      day: format(day, 'EEE'),
      total: dayTasks.length,
      completed: dayTasks.filter(t => t.status === 'completed').length
    };
  });
};

export const getPriorityDistribution = (tasks: any[]): ChartDataPoint[] => {
  const priorityCounts = { high: 0, medium: 0, low: 0 };
  tasks.forEach(task => {
    if (task.priority) priorityCounts[task.priority]++;
  });

  return [
    { name: 'High Priority', value: priorityCounts.high, color: '#EF4444' },
    { name: 'Medium Priority', value: priorityCounts.medium, color: '#F59E0B' },
    { name: 'Low Priority', value: priorityCounts.low, color: '#10B981' }
  ].filter(item => item.value > 0);
};

export const getProjectDistribution = (tasks: any[]): ChartDataPoint[] => {
  const projectCounts: Record<string, number> = {};
  tasks.forEach(task => {
    const project = task.project || 'No Project';
    projectCounts[project] = (projectCounts[project] || 0) + 1;
  });

  return Object.entries(projectCounts).map(([name, value]) => ({
    name: name === '' ? 'No Project' : name,
    value
  }));
};

export const getMostTimeSpentTasks = (tasks: any[]): TimeDataPoint[] => {
  return tasks
    .filter(task => task.timeSpent > 0)
    .sort((a, b) => (b.timeSpent || 0) - (a.timeSpent || 0))
    .slice(0, 10)
    .map(task => ({
      name: task.title.length > 25 ? task.title.substring(0, 25) + '...' : task.title,
      value: task.timeSpent || 0,
      hours: Math.round(((task.timeSpent || 0) / 3600) * 10) / 10
    }));
};
