export interface Task {
  id?: string;
  userId: string;
  title: string;
  description?: string;
  project: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  completed: boolean;
  timeSpent: number; // in seconds
  createdAt: string;
  updatedAt: string;
}

export type Tasks = Task[];
