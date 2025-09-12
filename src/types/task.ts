export interface Task {
  id?: string;
  userId: string;
  title: string;
  description?: string;
  project: string;
  priority: 'low' | 'medium' | 'high';
  taskType: 'recurrent' | 'typical';
  dueDate?: string;
  timeSpent: number; // in seconds
  completed?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type Tasks = Task[];
