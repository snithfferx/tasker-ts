import { useState, useEffect } from 'react';
import { createTimeEntry, updateTask, onTasksSnapshot } from '@Services/firestore';
import { getCurrentUserId, initAuth, getCurrentUser } from '@Services/auth';
import type { Task } from '@Types/task';

interface TimerProps {
  taskId?: string;
}

export default function Timer({ taskId }: TimerProps) {
  const [time, setTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [tasks, setTasks] = useState<(Task & { id: string })[]>([]);
  const [selectedTaskId, setSelectedTaskId] = useState<string | undefined>(taskId);
  const [uid, setUid] = useState<string | null>(null);

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

  // Initialize auth and capture a stable UID
  useEffect(() => {
    let mounted = true;
    (async () => {
      await initAuth();
      const user = getCurrentUser();
      const nextUid = user?.uid || getCurrentUserId();
      if (mounted) setUid(nextUid);
    })();
    return () => { mounted = false; };
  }, []);

  // Subscribe to task list for current user once UID is known
  useEffect(() => {
    if (!uid || uid === 'demo-user') return;
    const unsubscribe = onTasksSnapshot(uid, (items) => {
      setTasks(items);
      if (!selectedTaskId && items.length > 0) {
        setSelectedTaskId(items[0].id);
      }
    });
    return unsubscribe;
  }, [uid]);

  const handleStart = () => {
    if (selectedTaskId) setIsRunning(true);
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleStop = async () => {
    if (time === 0 || !selectedTaskId || !uid || uid === 'demo-user') return;

    try {
      const startedAt = new Date(Date.now() - time * 1000).toISOString();
      const endedAt = new Date().toISOString();
      const selectedTask = tasks.find(t => t.id === selectedTaskId);
      const selectedTaskName = selectedTask?.title || 'Untitled Task';

      await createTimeEntry(uid, {
        userId: uid,
        taskId: selectedTaskId,
        taskName: selectedTaskName,
        duration: time,
        startedAt,
        endedAt,
      });

      // Optionally update the task's timeSpent with the session duration
      await updateTask(uid, selectedTaskId, {
        timeSpent: (selectedTask as any)?.timeSpent ? (selectedTask as any).timeSpent + time : time,
      });

      // Reset the timer after saving
      setIsRunning(false);
      setTime(0);
    } catch (error) {
      console.error('Error saving time entry:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-4xl font-mono text-center py-4 bg-gray-50 dark:bg-gray-800 dark:text-gray-100 rounded">
        {formatTime(time)}
      </div>

      <div className="flex flex-col space-y-2">
        <select
          value={selectedTaskId}
          onChange={(e) => setSelectedTaskId(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
        >
          {!selectedTaskId && <option value="">Selecciona una tarea</option>}
          {tasks.map((t) => (
            <option key={t.id} value={t.id}>{t.title}</option>
          ))}
        </select>

        <div className="flex space-x-2">
          <button
            onClick={handleStart}
            disabled={isRunning || !selectedTaskId}
            className="flex-1 py-2 px-4 rounded-md text-white font-medium bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 lg:mr-2"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M6 4v16a1 1 0 0 0 1.524 .852l13 -8a1 1 0 0 0 0 -1.704l-13 -8a1 1 0 0 0 -1.524 .852z" /></svg>
            <span className='hidden sr-only lg:block'>Inicio</span>
          </button>

          <button
            onClick={handlePause}
            disabled={!isRunning}
            className="flex-1 py-2 px-4 rounded-md text-white font-medium bg-yellow-500 hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 lg:mr-2"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M9 4h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2z" /><path d="M17 4h-2a2 2 0 0 0 -2 2v12a2 2 0 0 0 2 2h2a2 2 0 0 0 2 -2v-12a2 2 0 0 0 -2 -2z" /></svg>
            <span className='hidden sr-only lg:block'>Pausa</span>
          </button>

          <button
            onClick={handleStop}
            disabled={time === 0 || !selectedTaskId}
            className="flex-1 py-2 px-4 rounded-md text-white font-medium bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 lg:mr-2"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M17 4h-10a3 3 0 0 0 -3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3 -3v-10a3 3 0 0 0 -3 -3z" /></svg>
            <span className='hidden sr-only lg:block'>Detener</span>
          </button>
        </div>
      </div>
    </div>
  );
}
