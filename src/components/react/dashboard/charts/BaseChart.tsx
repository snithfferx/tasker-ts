import React, { ReactNode } from 'react';
import { ResponsiveContainer } from 'recharts';

interface BaseChartProps {
  children: ReactNode;
  className?: string;
  height?: number | string;
  containerClassName?: string;
}

export const BaseChart: React.FC<BaseChartProps> = ({
  children,
  className = '',
  height = 300,
  containerClassName = 'h-48 sm:h-56 lg:h-64',
}) => {
  return (
    <div className={`chart-container ${className}`}>
      <div className={containerClassName}>
        <ResponsiveContainer width="100%" height={height}>
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
