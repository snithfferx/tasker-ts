export interface TimeEntry {
  id?: string;
  userId: string;
  taskId?: string;
  taskName: string;
  duration: number; // in seconds
  startedAt: string;
  endedAt: string;
  notes?: string;
}

export type TimeEntries = TimeEntry[];
