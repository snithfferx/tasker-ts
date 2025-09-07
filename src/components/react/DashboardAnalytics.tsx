import { useState, useEffect } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { onTasksSnapshot, onCategoriesSnapshot, onTimeEntriesSnapshot } from '@Services/firestore';
import { getCurrentUserId } from '@Services/auth';
import { format, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

interface Task {
  id: string;
  title: string;
  project: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  timeSpent: number;
  createdAt: string;
}

interface TimeEntry {
  id: string;
  taskName: string;
  duration: number;
  startedAt: string;
  taskId?: string;
}

interface Category {
  id: string;
  name: string;
}

// Chart colors
const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#EF4444', '#6B7280'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
        <p className="font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
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
  const [categories, setCategories] = useState<Category[]>([]);
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
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, pending, completionRate };
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

      const completed = monthTasks.filter(task => task.completed).length;
      const total = monthTasks.length;

      months.push({
        month: format(date, 'MMM yyyy'),
        completed,
        total,
        pending: total - completed
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

      const completed = dayTasks.filter(task => task.completed).length;
      const total = dayTasks.length;

      return {
        day: format(day, 'EEE'),
        completed,
        total,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
      };
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-indigo-100 rounded-md flex items-center justify-center">
                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-semibold text-gray-900">{taskStats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">{taskStats.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-md flex items-center justify-center">
                <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">{taskStats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-semibold text-gray-900">{taskStats.completionRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 dashboard-grid">
        {/* Monthly Tasks Chart */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Tasks</h3>
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
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Time Spent by Month</h3>
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
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Priority Distribution</h3>
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
              <div key={index} className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2`} style={{ backgroundColor: entry.color }}></div>
                <span className="text-sm text-gray-600">{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Project Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Project Distribution</h3>
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
              <div key={index} className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2`} style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="text-sm text-gray-600 truncate">{entry.name}: {entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Most Time Spent Tasks */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Most Time Consuming Tasks</h3>
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
          <p className="text-gray-500 text-center py-8">No time tracking data available yet.</p>
        )}
      </div>

      {/* Weekly Progress */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">This Week's Progress</h3>
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
