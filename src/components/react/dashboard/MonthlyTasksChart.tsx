import React from 'react';
import { BarChart } from '@Components/react/dashboard/charts/BarChart';
import { ChartContainer } from '@Components/react/dashboard/ChartContainer';

interface MonthlyTasksChartProps {
  data: Array<{
    month: string;
    total: number;
    completed: number;
  }>;
  loading?: boolean;
}

export const MonthlyTasksChart: React.FC<MonthlyTasksChartProps> = ({ data, loading = false }) => {
  if (loading) {
    return <ChartContainer title="Monthly Tasks" loading />;
  }

  return (
    <ChartContainer title="Monthly Tasks">
      <BarChart
        data={data}
        xKey="month"
        yKeys={[
          { key: 'completed', name: 'Completed', color: '#10B981' },
          { key: 'total', name: 'Total', color: '#E5E7EB' },
        ]}
      />
    </ChartContainer>
  );
};
