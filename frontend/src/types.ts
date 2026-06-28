export type TaskStatus = 'pending' | 'in-progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskCategory = 'work' | 'personal' | 'urgent' | 'learning' | 'health' | 'others';

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFormState {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  dueDate: string;
}

export interface Filters {
  search: string;
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
  category: TaskCategory | 'all';
  sortBy: 'createdAt' | 'dueDate';
  order: 'asc' | 'desc';
}

export interface TaskStats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
}
