import React from 'react';

export const CustomTooltip = ({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: any; color: string; payload: any }>;
  label?: string;
  formatter?: (value: any, name: string, props: any) => [string, string];
}) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      {label && <p className="font-medium text-gray-900 dark:text-white mb-2">{label}</p>}
      <div className="space-y-1">
        {payload.map((entry, index) => {
          let displayValue = entry.value;
          let displayName = entry.name;
          
          if (formatter) {
            [displayValue, displayName] = formatter(entry.value, entry.name, entry.payload);
          }
          
          return (
            <div key={`tooltip-item-${index}`} className="flex items-center justify-between">
              <div className="flex items-center">
                <div 
                  className="w-2 h-2 rounded-full mr-2" 
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {displayName}:
                </span>
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white ml-2">
                {displayValue}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
