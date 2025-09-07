import { useState, useEffect } from 'react';
import { createTimeEntry, updateTask } from '@Services/firestore';
import { getCurrentUserId } from '@Services/auth';

interface TimerProps {
  taskId?: string;
}

export default function Timer({ taskId }: TimerProps) {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [taskName, setTaskName] = useState('');
  
  // Format time as HH:MM:SS
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      remainingSeconds.toString().padStart(2, '0')
    ].join(':');
  };
  
  // Handle timer logic
  useEffect(() => {
    let interval: number | undefined; //NodeJS.Timeout;
    
    if (isRunning) {
      interval = window.setInterval(() => setTime((t) => t + 1), 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning]);
  
  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };
  
  const handleReset = () => {
    setIsRunning(false);
    setTime(0);
  };
  
  const handleSave = async () => {
    if (time === 0 || !taskName.trim()) return;
    
    try {
      const uid = getCurrentUserId();
      const startedAt = new Date(Date.now() - time * 1000).toISOString();
      const endedAt = new Date().toISOString();

      await createTimeEntry(uid, {
        userId: uid,
        taskId: taskId,
        taskName: taskName.trim(),
        duration: time,
        startedAt,
        endedAt,
      });

      if (taskId) {
        await updateTask(uid, taskId, {
          timeSpent: time, // For now, just set to current time (can be enhanced later to aggregate)
        });
      }
      
      // Reset the timer after saving
      handleReset();
      setTaskName('');
    } catch (error) {
      console.error('Error saving time entry:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-4xl font-mono text-center py-4 bg-gray-50 rounded">
        {formatTime(time)}
      </div>
      
      <div className="flex flex-col space-y-2">
        <input
          type="text"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          placeholder="What are you working on?"
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        
        <div className="flex space-x-2">
          <button
            onClick={handleStartPause}
            className={`flex-1 py-2 px-4 rounded-md text-white font-medium ${
              isRunning ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {isRunning ? 'Pause' : 'Start'}
          </button>
          
          <button
            onClick={handleReset}
            disabled={time === 0}
            className="py-2 px-4 bg-gray-200 text-gray-800 rounded-md font-medium hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reset
          </button>
          
          <button
            onClick={handleSave}
            disabled={time === 0 || !taskName.trim()}
            className="py-2 px-4 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
