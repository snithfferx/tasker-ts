import React from 'react';
import { LineChart } from '@Components/react/dashboard/charts/LineChart';
import { ChartContainer } from '@Components/react/dashboard/ChartContainer';

interface TimeSpentChartProps {
  data: Array<{
    month: string;
    hours: number;
  }>;
  loading?: boolean;
}

export const TimeSpentChart: React.FC<TimeSpentChartProps> = ({ data, loading = false }) => {
  if (loading) {
    return <ChartContainer title="Time Spent by Month" loading />;
  }

  return (
    <ChartContainer title="Time Spent by Month">
      <LineChart
        data={data}
        xKey="month"
        yKeys={[
          { 
            key: 'hours', 
            name: 'Hours', 
            color: '#6366F1',
            strokeWidth: 3
          },
        ]}
        tooltipFormatter={(value) => [`${value} hours`, 'Hours']}
        yAxisProps={{
          tickFormatter: (value) => `${value}h`
        }}
      />
    </ChartContainer>
  );
};
