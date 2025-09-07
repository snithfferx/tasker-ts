import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

// Mock data - in a real app, this would come from your API
const weeklyData = [
  { name: 'Mon', time: 2.5 },
  { name: 'Tue', time: 3.2 },
  { name: 'Wed', time: 4.1 },
  { name: 'Thu', time: 3.8 },
  { name: 'Fri', time: 2.9 },
  { name: 'Sat', time: 1.5 },
  { name: 'Sun', time: 0.8 },
];

const projectData = [
  { name: 'Work', time: 12.5 },
  { name: 'Personal', time: 5.2 },
  { name: 'Learning', time: 8.7 },
  { name: 'Other', time: 2.1 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
        <p className="font-medium">{label}</p>
        <p className="text-sm text-gray-600">
          {payload[0].value} hours
        </p>
      </div>
    );
  }
  return null;
};

export default function Charts() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">This Week's Activity</h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="time" 
                fill="#6366F1" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Time by Project</h3>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={projectData}
              layout="vertical"
              margin={{ left: 30 }}
            >
              <CartesianGrid horizontal={true} vertical={false} />
              <XAxis 
                type="number" 
                axisLine={false} 
                tickLine={false} 
                tickFormatter={(value) => `${value}h`}
              />
              <YAxis 
                dataKey="name" 
                type="category" 
                axisLine={false} 
                tickLine={false} 
                width={60}
              />
              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
              />
              <Bar 
                dataKey="time" 
                fill="#8B5CF6"
                radius={[0, 4, 4, 0]}
                barSize={12}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="pt-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Total time tracked this week</span>
          <span className="font-medium">
            {weeklyData.reduce((sum, day) => sum + day.time, 0).toFixed(1)} hours
          </span>
        </div>
        <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-indigo-600 h-2 rounded-full" 
            style={{ 
              width: `${Math.min(100, (weeklyData.reduce((sum, day) => sum + day.time, 0) / 40) * 100)}%` 
            }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1 text-right">
          {((weeklyData.reduce((sum, day) => sum + day.time, 0) / 40) * 100).toFixed(0)}% of 40h goal
        </p>
      </div>
    </div>
  );
}
