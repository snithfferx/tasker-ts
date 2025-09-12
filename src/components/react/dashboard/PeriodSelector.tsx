import React from 'react';
import type { TimePeriod } from '@Components/react/dashboard/types';

interface PeriodSelectorProps {
  selectedPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
  className?: string;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  selectedPeriod,
  onPeriodChange,
  className = '',
}) => {
  const periods: Array<{ value: TimePeriod; label: string }> = [
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' },
  ];

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {periods.map((period) => (
        <button
          key={period.value}
          type="button"
          className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
            selectedPeriod === period.value
              ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-100'
              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
          }`}
          onClick={() => onPeriodChange(period.value)}
        >
          {period.label}
        </button>
      ))}
    </div>
  );
};
