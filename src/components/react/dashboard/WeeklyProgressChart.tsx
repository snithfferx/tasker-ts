import React from 'react';
import { BarChart } from './charts/BarChart';
import { ChartContainer } from './ChartContainer';

interface WeeklyProgressChartProps {
  data: Array<{
    day: string;
    total: number;
    completed: number;
  }>;
  loading?: boolean;
}

export const WeeklyProgressChart: React.FC<WeeklyProgressChartProps> = ({ 
  data, 
  loading = false 
}) => {
  if (loading) {
    return <ChartContainer title="This Week's Progress" loading />;
  }

  return (
    <ChartContainer title="This Week's Progress">
      <div className="h-64">
        <BarChart
          data={data}
          xKey="day"
          yKeys={[
            { key: 'completed', name: 'Completed Tasks', color: '#10B981' },
            { key: 'total', name: 'Total Tasks', color: '#E5E7EB' },
          ]}
        />
      </div>
    </ChartContainer>
  );
};
