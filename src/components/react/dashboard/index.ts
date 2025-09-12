// Types
export type { DashboardData, TimePeriod, ChartDataPoint, TimeDataPoint, TaskStats } from '@Components/react/dashboard/types';

// Components
export { DashboardAnalytics } from '@Components/react/dashboard/DashboardAnalytics';
export { SummaryCards } from '@Components/react/dashboard/SummaryCards';
export { MonthlyTasksChart } from '@Components/react/dashboard/MonthlyTasksChart';
export { TimeSpentChart } from '@Components/react/dashboard/TimeSpentChart';
export { PriorityDistributionChart } from '@Components/react/dashboard/PriorityDistributionChart';
export { ProjectDistributionChart } from '@Components/react/dashboard/ProjectDistributionChart';
export { TimeConsumingTasksChart } from '@Components/react/dashboard/TimeConsumingTasksChart';
export { WeeklyProgressChart } from '@Components/react/dashboard/WeeklyProgressChart';
export { PeriodSelector } from '@Components/react/dashboard/PeriodSelector';
export { LoadingState } from '@Components/react/dashboard/LoadingState';
export { EmptyState } from '@Components/react/dashboard/EmptyState';

// Utils
export {
  calculateTaskStats,
  getMonthlyTasks,
  getTimeSpentByMonth,
  getWeeklyProgress,
  getPriorityDistribution,
  getProjectDistribution,
  getMostTimeSpentTasks,
  CHART_COLORS,
} from '@Components/react/dashboard/utils';
