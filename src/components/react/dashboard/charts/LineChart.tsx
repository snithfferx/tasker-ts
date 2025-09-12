import React from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BaseChart } from './BaseChart';
import { CustomTooltip } from './CustomTooltip';

interface LineChartProps {
  data: any[];
  xKey: string;
  yKeys: Array<{
    key: string;
    name: string;
    color: string;
    strokeWidth?: number;
    strokeDasharray?: string;
  }>;
  title?: string;
  className?: string;
  height?: number | string;
  showLegend?: boolean;
  xAxisProps?: any;
  yAxisProps?: any;
  tooltipFormatter?: (value: any, name: string, props: any) => [string, string];
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  xKey,
  yKeys,
  title,
  className = '',
  height = 300,
  showLegend = true,
  xAxisProps = {},
  yAxisProps = {},
  tooltipFormatter,
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
      <RechartsLineChart data={data}>
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
        <Tooltip 
          content={<CustomTooltip formatter={tooltipFormatter} />} 
        />
        {showLegend && <Legend />}
        {yKeys.map(({ key, name, color, strokeWidth = 2, strokeDasharray }) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            name={name}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            dot={false}
            activeDot={{ r: 6 }}
          />
        ))}
      </RechartsLineChart>
    </BaseChart>
  );
};
