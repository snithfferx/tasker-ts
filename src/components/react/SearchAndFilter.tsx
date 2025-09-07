import { useState, useEffect } from 'react';
import { onTasksSnapshot, onCategoriesSnapshot } from '@Services/firestore';
import { getCurrentUserId } from '@Services/auth';
import { format } from 'date-fns';

interface Task {
  id: string;
  title: string;
  description?: string;
  project: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  timeSpent: number;
  createdAt: string;
  dueDate?: string;
}

interface Category {
  id: string;
  name: string;
}

interface FilterOptions {
  searchQuery: string;
  selectedCategory: string;
  selectedProject: string;
  priority: string;
  status: string;
  dateFrom: string;
  dateTo: string;
}

export default function SearchAndFilter() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    selectedCategory: '',
    selectedProject: '',
    priority: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  });

  // Get unique projects from tasks
  const getUniqueProjects = () => {
    const projects = [...new Set(tasks.map(task => task.project).filter(Boolean))];
    return projects;
  };

  useEffect(() => {
    const uid = getCurrentUserId();
    let unsubscribeCount = 0;
    const totalSubscriptions = 2;

    const checkComplete = () => {
      unsubscribeCount++;
      if (unsubscribeCount === totalSubscriptions) {
        setLoading(false);
      }
    };

    const unsubTasks = onTasksSnapshot(uid, (items) => {
      setTasks(items);
      setFilteredTasks(items);
      checkComplete();
    });

    const unsubCategories = onCategoriesSnapshot(uid, (items) => {
      setCategories(items);
      checkComplete();
    });

    return () => {
      unsubTasks();
      unsubCategories();
    };
  }, []);

  // Apply filters whenever tasks or filters change
  useEffect(() => {
    applyFilters();
  }, [tasks, filters]);

  const applyFilters = () => {
    let filtered = [...tasks];

    // Search by task name or description
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query))
      );
    }

    // Filter by category (using project field as category for now)
    if (filters.selectedCategory) {
      filtered = filtered.filter(task => task.project === filters.selectedCategory);
    }

    // Filter by project
    if (filters.selectedProject) {
      filtered = filtered.filter(task => task.project === filters.selectedProject);
    }

    // Filter by priority
    if (filters.priority) {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }

    // Filter by status
    if (filters.status) {
      if (filters.status === 'completed') {
        filtered = filtered.filter(task => task.completed);
      } else if (filters.status === 'pending') {
        filtered = filtered.filter(task => !task.completed);
      }
    }

    // Filter by date range
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(task => new Date(task.createdAt) >= fromDate);
    }
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      filtered = filtered.filter(task => new Date(task.createdAt) <= toDate);
    }

    setFilteredTasks(filtered);
  };

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      searchQuery: '',
      selectedCategory: '',
      selectedProject: '',
      priority: '',
      status: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  const generateReport = async () => {
    setIsGeneratingReport(true);
    
    try {
      // Calculate report data
      const reportData = {
        totalTasks: filteredTasks.length,
        completedTasks: filteredTasks.filter(task => task.completed).length,
        pendingTasks: filteredTasks.filter(task => !task.completed).length,
        totalTimeSpent: filteredTasks.reduce((sum, task) => sum + task.timeSpent, 0),
        averageTimePerTask: filteredTasks.length > 0 
          ? filteredTasks.reduce((sum, task) => sum + task.timeSpent, 0) / filteredTasks.length 
          : 0,
        priorityBreakdown: {
          high: filteredTasks.filter(task => task.priority === 'high').length,
          medium: filteredTasks.filter(task => task.priority === 'medium').length,
          low: filteredTasks.filter(task => task.priority === 'low').length,
        },
        projectBreakdown: getProjectBreakdown(),
        filterCriteria: filters
      };

      // Generate report content
      const reportContent = generateReportContent(reportData);
      
      // Create and download the report
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tasker-report-${format(new Date(), 'yyyy-MM-dd')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Error generating report. Please try again.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const getProjectBreakdown = () => {
    const breakdown: Record<string, number> = {};
    filteredTasks.forEach(task => {
      const project = task.project || 'No Project';
      breakdown[project] = (breakdown[project] || 0) + 1;
    });
    return breakdown;
  };

  const generateReportContent = (data: any) => {
    const { totalTasks, completedTasks, pendingTasks, totalTimeSpent, averageTimePerTask, priorityBreakdown, projectBreakdown, filterCriteria } = data;
    
    const totalHours = Math.round((totalTimeSpent / 3600) * 100) / 100;
    const avgHours = Math.round((averageTimePerTask / 3600) * 100) / 100;
    
    let content = `TASKER - TASK REPORT\n`;
    content += `Generated: ${format(new Date(), 'PPpp')}\n\n`;
    
    // Filter criteria
    content += `FILTER CRITERIA:\n`;
    content += `Search Query: ${filterCriteria.searchQuery || 'None'}\n`;
    content += `Category: ${filterCriteria.selectedCategory || 'All'}\n`;
    content += `Project: ${filterCriteria.selectedProject || 'All'}\n`;
    content += `Priority: ${filterCriteria.priority || 'All'}\n`;
    content += `Status: ${filterCriteria.status || 'All'}\n`;
    content += `Date From: ${filterCriteria.dateFrom || 'All time'}\n`;
    content += `Date To: ${filterCriteria.dateTo || 'All time'}\n\n`;
    
    // Summary statistics
    content += `SUMMARY:\n`;
    content += `Total Tasks: ${totalTasks}\n`;
    content += `Completed Tasks: ${completedTasks}\n`;
    content += `Pending Tasks: ${pendingTasks}\n`;
    content += `Completion Rate: ${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%\n`;
    content += `Total Time Spent: ${totalHours} hours\n`;
    content += `Average Time per Task: ${avgHours} hours\n\n`;
    
    // Priority breakdown
    content += `PRIORITY BREAKDOWN:\n`;
    content += `High Priority: ${priorityBreakdown.high}\n`;
    content += `Medium Priority: ${priorityBreakdown.medium}\n`;
    content += `Low Priority: ${priorityBreakdown.low}\n\n`;
    
    // Project breakdown
    content += `PROJECT BREAKDOWN:\n`;
    Object.entries(projectBreakdown).forEach(([project, count]) => {
      content += `${project}: ${count}\n`;
    });
    content += `\n`;
    
    // Task details
    content += `TASK DETAILS:\n`;
    content += `${'Title'.padEnd(30)} ${'Project'.padEnd(15)} ${'Priority'.padEnd(10)} ${'Status'.padEnd(10)} ${'Time (hrs)'.padEnd(12)}\n`;
    content += `${'-'.repeat(80)}\n`;
    
    filteredTasks.forEach(task => {
      const hours = Math.round((task.timeSpent / 3600) * 100) / 100;
      const title = task.title.length > 28 ? task.title.substring(0, 28) + '..' : task.title;
      const project = (task.project || 'None').length > 13 ? (task.project || 'None').substring(0, 13) + '..' : (task.project || 'None');
      
      content += `${title.padEnd(30)} ${project.padEnd(15)} ${task.priority.padEnd(10)} ${(task.completed ? 'Done' : 'Pending').padEnd(10)} ${hours.toString().padEnd(12)}\n`;
    });
    
    return content;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const uniqueProjects = getUniqueProjects();

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 form-mobile">
        {/* Search Input */}
        <div className="lg:col-span-2">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search Tasks
          </label>
          <input
            type="text"
            id="search"
            placeholder="Search by task name or description..."
            value={filters.searchQuery}
            onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        {/* Category Filter */}
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
            Category/Project
          </label>
          <select
            id="category"
            value={filters.selectedCategory}
            onChange={(e) => handleFilterChange('selectedCategory', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Categories</option>
            {uniqueProjects.map(project => (
              <option key={project} value={project}>{project}</option>
            ))}
          </select>
        </div>

        {/* Priority Filter */}
        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
            Priority
          </label>
          <select
            id="priority"
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Status Filter */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Date From */}
        <div>
          <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 mb-1">
            From Date
          </label>
          <input
            type="date"
            id="dateFrom"
            value={filters.dateFrom}
            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Date To */}
        <div>
          <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 mb-1">
            To Date
          </label>
          <input
            type="date"
            id="dateTo"
            value={filters.dateTo}
            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 touch-friendly">
        <button
          onClick={clearFilters}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
        >
          Clear Filters
        </button>
        
        <button
          onClick={generateReport}
          disabled={isGeneratingReport}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
        >
          {isGeneratingReport ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
              Generating...
            </>
          ) : (
            <>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Generate Report
            </>
          )}
        </button>
      </div>

      {/* Results Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex flex-wrap items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing <span className="font-medium">{filteredTasks.length}</span> of <span className="font-medium">{tasks.length}</span> tasks
          </div>
          <div className="text-sm text-gray-600">
            {filteredTasks.filter(task => task.completed).length} completed, {filteredTasks.filter(task => !task.completed).length} pending
          </div>
        </div>
        
        {filteredTasks.length > 0 && (
          <div className="mt-2 text-sm text-gray-600">
            Total time: {Math.round((filteredTasks.reduce((sum, task) => sum + task.timeSpent, 0) / 3600) * 100) / 100} hours
          </div>
        )}
      </div>
    </div>
  );
}
