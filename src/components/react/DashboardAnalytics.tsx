import { useState, useEffect } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { onTasksSnapshot, onCategoriesSnapshot, onTimeEntriesSnapshot } from '@Services/firestore';
import { getCurrentUserId } from '@Services/auth';
import { format, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';
import type { Categories } from '@Types/category';
import type { Task } from '@Types/task';
import type { TimeEntry } from '@Types/timer';

// Chart colors
const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#EF4444', '#6B7280'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900 dark:text-white">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm text-gray-600 dark:text-gray-300" style={{ color: entry.color }}>
            {entry.name}: {entry.value} {entry.name.includes('Time') ? 'hours' : ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardAnalytics() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [categories, setCategories] = useState<Categories>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    const uid = getCurrentUserId();
    let unsubscribeCount = 0;
    const totalSubscriptions = 3;

    const checkComplete = () => {
      unsubscribeCount++;
      if (unsubscribeCount === totalSubscriptions) {
        setLoading(false);
      }
    };

    const unsubTasks = onTasksSnapshot(uid, (items) => {
      setTasks(items);
      checkComplete();
    });

    // Real-time time entries subscription
    const unsubTimeEntries = onTimeEntriesSnapshot(uid, (items) => {
      setTimeEntries(items);
      checkComplete();
    });

	  const unsubCategories = onCategoriesSnapshot(uid, (items) => {
		// check if categories exist, if not, return error
		if (!items) {
			console.error('No categories found for user:', uid);
			return;
		}
      setCategories(items);
      checkComplete();
    });

    return () => {
      unsubTasks();
      unsubTimeEntries();
      unsubCategories();
    };
  }, []);

  // Analytics calculations
  const getTaskStats = () => {
    const total = tasks.length;

    return { total };
  };

  const getMonthlyTasks = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const monthTasks = tasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return taskDate >= monthStart && taskDate <= monthEnd;
      });

      const total = monthTasks.length;

      months.push({
        month: format(date, 'MMM yyyy'),
        total
      });
    }
    return months;
  };

  const getTimeSpentByMonth = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = subMonths(new Date(), i);
      const monthStart = startOfMonth(date);
      const monthEnd = endOfMonth(date);
      
      const monthTimeEntries = timeEntries.filter(entry => {
        const entryDate = new Date(entry.startedAt);
        return entryDate >= monthStart && entryDate <= monthEnd;
      });

      const totalSeconds = monthTimeEntries.reduce((sum, entry) => sum + entry.duration, 0);
      const hours = Math.round((totalSeconds / 3600) * 10) / 10;

      months.push({
        month: format(date, 'MMM yyyy'),
        hours
      });
    }
    return months;
  };

  const getMostTimeSpentTasks = () => {
    return tasks
      .filter(task => task.timeSpent > 0)
      .sort((a, b) => b.timeSpent - a.timeSpent)
      .slice(0, 10)
      .map(task => ({
        name: task.title.length > 25 ? task.title.substring(0, 25) + '...' : task.title,
        hours: Math.round((task.timeSpent / 3600) * 10) / 10,
        priority: task.priority
      }));
  };

  const getProjectDistribution = () => {
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

  const getPriorityDistribution = () => {
    const priorityCounts = { low: 0, medium: 0, high: 0 };
    tasks.forEach(task => {
      priorityCounts[task.priority]++;
    });

    return [
      { name: 'High Priority', value: priorityCounts.high, color: '#EF4444' },
      { name: 'Medium Priority', value: priorityCounts.medium, color: '#F59E0B' },
      { name: 'Low Priority', value: priorityCounts.low, color: '#10B981' }
    ].filter(item => item.value > 0);
  };

  const getWeeklyProgress = () => {
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return days.map(day => {
      const dayTasks = tasks.filter(task => {
        const taskDate = new Date(task.createdAt);
        return format(taskDate, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd');
      });

      const total = dayTasks.length;

      return {
        day: format(day, 'EEE'),
        total
      };
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="loading-spinner h-8 w-8"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">Loading analytics...</span>
      </div>
    );
  }

  const taskStats = getTaskStats();
  const monthlyTasks = getMonthlyTasks();
  const timeSpentByMonth = getTimeSpentByMonth();
  const mostTimeSpentTasks = getMostTimeSpentTasks();
  const projectDistribution = getProjectDistribution();
  const priorityDistribution = getPriorityDistribution();
  const weeklyProgress = getWeeklyProgress();

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in">
        <div className="card group">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{taskStats.total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 dashboard-grid animate-slide-up">
        {/* Monthly Tasks Chart */}
        <div className="chart-container">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
            Monthly Tasks
          </h3>
          <div className="h-48 sm:h-56 lg:h-64 chart-mobile sm:chart-tablet lg:chart-desktop">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTasks}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="completed" fill="#10B981" name="Completed" />
                <Bar dataKey="pending" fill="#F59E0B" name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Time Spent by Month */}
        <div className="chart-container">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
            Time Spent by Month
          </h3>
          <div className="h-48 sm:h-56 lg:h-64 chart-mobile sm:chart-tablet lg:chart-desktop">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSpentByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="hours" stroke="#6366F1" strokeWidth={3} name="Hours" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="chart-container">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Priority Distribution
          </h3>
          <div className="h-48 sm:h-56 lg:h-64 chart-mobile sm:chart-tablet lg:chart-desktop">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {priorityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {priorityDistribution.map((entry, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700 transition-colors">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3`} style={{ backgroundColor: entry.color }}></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{entry.name}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Project Distribution */}
        <div className="chart-container">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
            Project Distribution
          </h3>
          <div className="h-48 sm:h-56 lg:h-64 chart-mobile sm:chart-tablet lg:chart-desktop">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                >
                  {projectDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {projectDistribution.map((entry, index) => (
              <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700 transition-colors">
                <div className="flex items-center min-w-0">
                  <div className={`w-3 h-3 rounded-full mr-3 flex-shrink-0`} style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{entry.name}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white ml-2">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Most Time Spent Tasks */}
      <div className="chart-container animate-scale-in">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
          Most Time Consuming Tasks
        </h3>
        {mostTimeSpentTasks.length > 0 ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mostTimeSpentTasks} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" axisLine={false} tickLine={false} tickFormatter={(value) => `${value}h`} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="hours" fill="#8B5CF6" name="Hours" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-500 dark:text-gray-400">No time tracking data available yet.</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Start tracking time on your tasks to see data here.</p>
          </div>
        )}
      </div>

      {/* Weekly Progress */}
      <div className="chart-container animate-slide-up">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
          This Week's Progress
        </h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyProgress}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="completed" fill="#10B981" name="Completed Tasks" />
              <Bar dataKey="total" fill="#E5E7EB" name="Total Tasks" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
