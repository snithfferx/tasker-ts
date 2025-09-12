import { Timestamp } from 'firebase/firestore';

// Format seconds to human-readable time
export const formatDuration = (seconds: number): string => {
  if (seconds < 0) return '0s';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`;
  } else {
    return `${remainingSeconds}s`;
  }
};

// Format duration to compact format (e.g., "2h 30m")
export const formatDurationCompact = (seconds: number): string => {
  if (seconds < 0) return '0m';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  } else if (minutes > 0) {
    return `${minutes}m`;
  } else {
    return '< 1m';
  }
};

// Format duration for display in timers (HH:MM:SS)
export const formatTimerDisplay = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  return [hours, minutes, remainingSeconds]
    .map(val => val.toString().padStart(2, '0'))
    .join(':');
};

// Convert Firestore Timestamp to Date
export const timestampToDate = (timestamp: Timestamp): Date => {
  return timestamp.toDate();
};

// Get current running time for a timer
export const getCurrentRunningTime = (startTime: Timestamp): number => {
  const now = new Date();
  const start = timestampToDate(startTime);
  return Math.floor((now.getTime() - start.getTime()) / 1000);
};

// Calculate duration between two timestamps
export const calculateDuration = (startTime: Timestamp, endTime: Timestamp): number => {
  return Math.floor(endTime.seconds - startTime.seconds);
};

// Get start of day
export const getStartOfDay = (date: Date): Date => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

// Get end of day
export const getEndOfDay = (date: Date): Date => {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
};

// Get date ranges for common periods
export const getDateRanges = () => {
  const now = new Date();
  const today = getStartOfDay(now);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
  
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(lastWeekStart.getDate() - 7);
  const lastWeekEnd = new Date(thisWeekStart);
  lastWeekEnd.setDate(lastWeekEnd.getDate() - 1);
  
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  return {
    today: { start: today, end: getEndOfDay(now) },
    yesterday: { start: yesterday, end: getEndOfDay(yesterday) },
    thisWeek: { start: thisWeekStart, end: getEndOfDay(now) },
    lastWeek: { start: lastWeekStart, end: getEndOfDay(lastWeekEnd) },
    thisMonth: { start: thisMonthStart, end: getEndOfDay(now) },
    lastMonth: { start: lastMonthStart, end: getEndOfDay(lastMonthEnd) }
  };
};

// Parse time input (e.g., "2h 30m", "90m", "1.5h") to seconds
export const parseTimeInput = (input: string): number => {
  const cleaned = input.toLowerCase().trim();
  let totalSeconds = 0;

  // Match patterns like "2h", "30m", "45s"
  const hourMatch = cleaned.match(/(\d+(?:\.\d+)?)h/);
  const minuteMatch = cleaned.match(/(\d+(?:\.\d+)?)m/);
  const secondMatch = cleaned.match(/(\d+(?:\.\d+)?)s/);

  if (hourMatch) {
    totalSeconds += parseFloat(hourMatch[1]) * 3600;
  }
  if (minuteMatch) {
    totalSeconds += parseFloat(minuteMatch[1]) * 60;
  }
  if (secondMatch) {
    totalSeconds += parseFloat(secondMatch[1]);
  }

  // If no units found, assume minutes
  if (!hourMatch && !minuteMatch && !secondMatch) {
    const numericValue = parseFloat(cleaned);
    if (!isNaN(numericValue)) {
      totalSeconds = numericValue * 60; // Default to minutes
    }
  }

  return Math.round(totalSeconds);
};

// Validate time input string
export const isValidTimeInput = (input: string): boolean => {
  if (!input.trim()) return false;
  
  const timePattern = /^(\d+(?:\.\d+)?[hms]\s*)*\d+(?:\.\d+)?[hms]?$/;
  return timePattern.test(input.toLowerCase().trim()) || !isNaN(parseFloat(input.trim()));
};

// Get time ago string (e.g., "2 hours ago", "yesterday")
export const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return 'just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  } else if (diffDays === 1) {
    return 'yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString();
  }
};

// Format time for different contexts
export const formatTimeForContext = (seconds: number, context: 'short' | 'medium' | 'long' = 'medium'): string => {
  switch (context) {
    case 'short':
      return formatTimerDisplay(seconds);
    case 'long':
      return formatDuration(seconds);
    case 'medium':
    default:
      return formatDurationCompact(seconds);
  }
};