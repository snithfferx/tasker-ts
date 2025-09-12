import React from 'react';
import { PieChartComponent } from '@Components/react/dashboard/charts/PieChart';
import { CHART_COLORS } from '@Components/react/dashboard/utils';
import { ChartContainer } from '@Components/react/dashboard/ChartContainer';
import type { ChartDataPoint } from '@Components/react/dashboard/types';

interface ProjectDistributionChartProps {
  data: ChartDataPoint[];
  loading?: boolean;
}

export const ProjectDistributionChart: React.FC<ProjectDistributionChartProps> = ({ 
  data, 
  loading = false 
}) => {
  if (loading) {
    return <ChartContainer title="Project Distribution" loading />;
  }

  if (data.length === 0) {
    return (
      <ChartContainer title="Project Distribution">
        <div className="flex items-center justify-center h-48 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">No project data available</p>
        </div>
      </ChartContainer>
    );
  }

  // Add colors to the data
  const chartData = data.map((item, index) => ({
    ...item,
    color: CHART_COLORS[index % CHART_COLORS.length]
  }));

  return (
    <ChartContainer title="Project Distribution">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-1/2 h-48">
          <PieChartComponent 
            data={chartData}
            innerRadius="60%"
            outerRadius="100%"
            showLegend={false}
          />
        </div>
        <div className="w-full lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-2">
          {chartData.map((item, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700"
            >
              <div className="flex items-center min-w-0">
                <div 
                  className="w-3 h-3 rounded-full mr-2 flex-shrink-0" 
                  style={{ backgroundColor: item.color || CHART_COLORS[index % CHART_COLORS.length] }}
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                  {item.name}
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white ml-2">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </ChartContainer>
  );
};
