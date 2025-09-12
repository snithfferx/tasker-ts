import React from 'react';
import { BarChart } from '@Components/react/dashboard/charts/BarChart';
import { ChartContainer } from '@Components/react/dashboard/ChartContainer';

interface TimeConsumingTasksChartProps {
  data: Array<{
    name: string;
    hours: number;
    value: number;
  }>;
  loading?: boolean;
}

export const TimeConsumingTasksChart: React.FC<TimeConsumingTasksChartProps> = ({
  data,
  loading = false
}) => {
  if (loading) {
    return <ChartContainer title="Most Time Consuming Tasks" loading />;
  }

  if (data.length === 0) {
    return (
      <ChartContainer title="Most Time Consuming Tasks">
        <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-500 dark:text-gray-400">No time tracking data available yet.</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Start tracking time on your tasks to see data here.
          </p>
        </div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer title="Most Time Consuming Tasks">
      <div className="h-80">
        <BarChart
          data={data}
          xKey="hours"
          yKeys={[
            { key: 'hours', name: 'Hours', color: '#8B5CF6' },
          ]}
          xAxisProps={{
            type: 'number',
            tickFormatter: (value) => `${value}h`,
            domain: [0, 'dataMax']
          }}
          yAxisProps={{
            type: 'category',
            width: 100,
            dataKey: 'name',
          }}
          showLegend={false}
        />
      </div>
    </ChartContainer>
  );
};
