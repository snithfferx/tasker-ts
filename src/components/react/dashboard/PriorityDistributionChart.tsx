import React from 'react';
import { PieChartComponent } from '@Components/react/dashboard/charts/PieChart';
import { ChartContainer } from '@Components/react/dashboard/ChartContainer';

interface PriorityDistributionChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  loading?: boolean;
}

export const PriorityDistributionChart: React.FC<PriorityDistributionChartProps> = ({ 
  data, 
  loading = false 
}) => {
  if (loading) {
    return (
      <ChartContainer title="Priority Distribution" loading>
        <div className="h-48" />
      </ChartContainer>
    );
  }

  if (data.length === 0) {
    return (
      <ChartContainer title="Priority Distribution">
        <div className="flex items-center justify-center h-48 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">No priority data available</p>
        </div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer title="Priority Distribution">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/2 h-48">
          <PieChartComponent 
            data={data}
            innerRadius="60%"
            outerRadius="100%"
            showLegend={false}
          />
        </div>
        <div className="w-full md:w-1/2 space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-3" 
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {item.name}
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </ChartContainer>
  );
};
