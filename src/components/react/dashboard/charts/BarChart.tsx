import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BaseChart } from './BaseChart';
import { CustomTooltip } from './CustomTooltip';

interface BarChartProps {
  data: any[];
  xKey: string;
  yKeys: Array<{
    key: string;
    name: string;
    color: string;
  }>;
  title?: string;
  className?: string;
  height?: number | string;
  showLegend?: boolean;
  xAxisProps?: any;
  yAxisProps?: any;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  xKey,
  yKeys,
  title,
  className = '',
  height = 300,
  showLegend = true,
  xAxisProps = {},
  yAxisProps = {},
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-gray-500 dark:text-gray-400">No data available</p>
      </div>
    );
  }

  return (
    <BaseChart className={className} height={height}>
      <RechartsBarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
          dataKey={xKey} 
          axisLine={false} 
          tickLine={false}
          {...xAxisProps}
        />
        <YAxis 
          axisLine={false} 
          tickLine={false}
          {...yAxisProps}
        />
        <Tooltip content={<CustomTooltip />} />
        {showLegend && <Legend />}
        {yKeys.map(({ key, name, color }) => (
          <Bar 
            key={key}
            dataKey={key}
            name={name}
            fill={color}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </RechartsBarChart>
    </BaseChart>
  );
};
