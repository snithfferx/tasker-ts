import { useState, useEffect } from 'react';
import { onAuthChange, getCurrentUserId } from '@Services/auth';
import { onTasksSnapshot, onCategoriesSnapshot, onTimeEntriesSnapshot } from '@Services/firestore';

interface RealTimeSyncProps {
  className?: string;
}

export default function RealTimeSync({ className = "" }: RealTimeSyncProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [activeConnections, setActiveConnections] = useState(0);

  useEffect(() => {
    let unsubscribers: (() => void)[] = [];
    
    const setupRealtimeListeners = (uid: string) => {
      let connectionCount = 0;
      
      // Track tasks
      const unsubTasks = onTasksSnapshot(uid, () => {
        setLastSync(new Date());
      });
      unsubscribers.push(unsubTasks);
      connectionCount++;
      
      // Track categories  
      const unsubCategories = onCategoriesSnapshot(uid, () => {
        setLastSync(new Date());
      });
      unsubscribers.push(unsubCategories);
      connectionCount++;
      
      // Track time entries
      const unsubTimeEntries = onTimeEntriesSnapshot(uid, () => {
        setLastSync(new Date());
      });
      unsubscribers.push(unsubTimeEntries);
      connectionCount++;
      
      setActiveConnections(connectionCount);
      setIsConnected(true);
    };

    // Set up auth listener
    const unsubAuth = onAuthChange((user) => {
      // Clean up existing listeners
      unsubscribers.forEach(unsub => unsub());
      unsubscribers = [];
      
      if (user) {
        setupRealtimeListeners(user.uid);
      } else {
        setIsConnected(false);
        setActiveConnections(0);
        setLastSync(null);
      }
    });

    return () => {
      unsubAuth();
      unsubscribers.forEach(unsub => unsub());
    };
  }, []);

  const getStatusColor = () => {
    if (!isConnected) return 'text-red-500';
    if (lastSync && Date.now() - lastSync.getTime() < 30000) {
      return 'text-green-500';
    }
    return 'text-yellow-500';
  };

  const getStatusText = () => {
    if (!isConnected) return 'Disconnected';
    if (!lastSync) return 'Connecting...';
    
    const timeDiff = Date.now() - lastSync.getTime();
    if (timeDiff < 1000) return 'Just synced';
    if (timeDiff < 60000) return `Synced ${Math.floor(timeDiff / 1000)}s ago`;
    if (timeDiff < 3600000) return `Synced ${Math.floor(timeDiff / 60000)}m ago`;
    return 'Last sync > 1h ago';
  };

  return (
    <div className={`flex items-center space-x-2 text-xs ${className}`}>
      {/* Status Indicator */}
      <div className="flex items-center space-x-1">
        <div className={`w-2 h-2 rounded-full ${getStatusColor().replace('text-', 'bg-')} ${
          isConnected ? 'animate-pulse' : ''
        }`}></div>
        <span className={`font-medium ${getStatusColor()}`}>
          {isConnected ? 'Live' : 'Offline'}
        </span>
      </div>

      {/* Sync Status */}
      <span className="text-gray-500">•</span>
      <span className="text-gray-600">{getStatusText()}</span>
      
      {/* Connection Count */}
      {isConnected && (
        <>
          <span className="text-gray-500">•</span>
          <span className="text-gray-600">{activeConnections} streams</span>
        </>
      )}
    </div>
  );
}
