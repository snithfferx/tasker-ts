import type { Categories } from '@Types/category';
import type { Task } from '@Types/task';
import type { TimeEntry } from '@Types/timer';

export interface DashboardData {
  tasks: Task[];
  timeEntries: TimeEntry[];
  categories: Categories;
  loading: boolean;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  color?: string;
}

export interface TimeDataPoint extends ChartDataPoint {
  hours: number;
}

export interface TaskStats {
  total: number;
  completed: number;
  active: number;
  overdue: number;
}

export type TimePeriod = 'week' | 'month' | 'year';
