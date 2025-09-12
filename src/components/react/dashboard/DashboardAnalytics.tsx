import React, { useState, useEffect } from 'react';
import { onTasksSnapshot, onCategoriesSnapshot, onTimeEntriesSnapshot } from '@Services/firestore';
import { getCurrentUserId } from '@Services/auth';
import { format } from 'date-fns';
import type { Categories } from '@Types/category';
import type { Task } from '@Types/task';
import type { TimeEntry } from '@Types/timer';

// Components
import { LoadingState } from '@Components/react/dashboard/LoadingState';
import { SummaryCards } from '@Components/react/dashboard/SummaryCards';
import { MonthlyTasksChart } from '@Components/react/dashboard/MonthlyTasksChart';
import { TimeSpentChart } from '@Components/react/dashboard/TimeSpentChart';
import { PriorityDistributionChart } from '@Components/react/dashboard/PriorityDistributionChart';
import { ProjectDistributionChart } from '@Components/react/dashboard/ProjectDistributionChart';
import { TimeConsumingTasksChart } from '@Components/react/dashboard/TimeConsumingTasksChart';
import { WeeklyProgressChart } from '@Components/react/dashboard/WeeklyProgressChart';
import { PeriodSelector } from '@Components/react/dashboard/PeriodSelector';
import DateRange from '@Components/react/DateRangePicker';

// Utils
import {
  calculateTaskStats,
  getMonthlyTasks,
  getTimeSpentByMonth,
  getWeeklyProgress,
  getPriorityDistribution,
  getProjectDistribution,
  getMostTimeSpentTasks,
} from '@Components/react/dashboard/utils';

// Types
import type { DashboardData, TimePeriod } from '@Components/react/dashboard/types';

export const DashboardAnalytics: React.FC = () => {
  const [data, setData] = useState<DashboardData>({
    tasks: [],
    timeEntries: [],
    categories: [],
    loading: true,
  });

  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('month');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
  });
  const [showDateRangePicker, setShowDateRangePicker] = useState(false);

  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [filteredTimeEntries, setFilteredTimeEntries] = useState<TimeEntry[]>([]);

  useEffect(() => {
    const uid = getCurrentUserId();
    if (!uid) return;

    let unsubscribeCount = 0;
    const totalSubscriptions = 3;

    const checkComplete = () => {
      unsubscribeCount++;
      if (unsubscribeCount === totalSubscriptions) {
        setData(prev => ({ ...prev, loading: false }));
      }
    };

    const unsubTasks = onTasksSnapshot(uid, (items) => {
      setData(prev => ({ ...prev, tasks: items }));
      checkComplete();
    });

    const unsubTimeEntries = onTimeEntriesSnapshot(uid, (items) => {
      setData(prev => ({ ...prev, timeEntries: items }));
      checkComplete();
    });

    const unsubCategories = onCategoriesSnapshot(uid, (items) => {
      if (items) {
        setData(prev => ({ ...prev, categories: items }));
        checkComplete();
      } else {
        console.error('No categories found for user:', uid);
        checkComplete();
      }
    });

    return () => {
      unsubTasks();
      unsubTimeEntries();
      unsubCategories();
    };
  }, []);

  useEffect(() => {
    const filteredT = data.tasks.filter(task => {
      const taskDate = new Date(task.createdAt);
      return taskDate >= dateRange.startDate && taskDate <= dateRange.endDate;
    });
    setFilteredTasks(filteredT);

    const filteredTE = data.timeEntries.filter(entry => {
      const entryDate = new Date(entry.startedAt);
      return entryDate >= dateRange.startDate && entryDate <= dateRange.endDate;
    });
    setFilteredTimeEntries(filteredTE);
  }, [data.tasks, data.timeEntries, dateRange]);

  // Calculate derived data
  const taskStats = calculateTaskStats(filteredTasks);
  const monthlyTasks = getMonthlyTasks(filteredTasks);
  const timeSpentByMonth = getTimeSpentByMonth(filteredTimeEntries);
  const weeklyProgress = getWeeklyProgress(filteredTasks);
  const priorityDistribution = getPriorityDistribution(filteredTasks);
  const projectDistribution = getProjectDistribution(filteredTasks);
  const mostTimeSpentTasks = getMostTimeSpentTasks(filteredTasks);

  if (data.loading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      {/* Header with period selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <PeriodSelector 
          selectedPeriod={selectedPeriod}
          onPeriodChange={setSelectedPeriod}
        />
        <button onClick={() => setShowDateRangePicker(!showDateRangePicker)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded dark:bg-blue-700 dark:hover:bg-blue-900">
          {showDateRangePicker ? 'Close' : 'Select Date Range'}
        </button>
      </div>

      {showDateRangePicker && (
        <DateRange onRangeChange={(range) => setDateRange(range)} />
      )}

      {/* Summary Cards */}
      <SummaryCards stats={taskStats} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyTasksChart data={monthlyTasks} />
        <TimeSpentChart data={timeSpentByMonth} />
        <PriorityDistributionChart data={priorityDistribution} />
        <ProjectDistributionChart data={projectDistribution} />
      </div>

      {/* Full-width charts */}
      <TimeConsumingTasksChart data={mostTimeSpentTasks} />
      <WeeklyProgressChart data={weeklyProgress} />
    </div>
  );
};

export default DashboardAnalytics;
