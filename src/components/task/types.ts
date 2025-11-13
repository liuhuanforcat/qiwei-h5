export type TaskCategoryKey = 'all' | 'work' | 'study' | 'life';

export type TaskPriorityKey = 'all' | 'high' | 'medium' | 'low';

export type Task = {
  id: string;
  title: string;
  description?: string;
  category: Exclude<TaskCategoryKey, 'all'>;
  priority: Exclude<TaskPriorityKey, 'all'>;
  dueDate?: string;
  completed: boolean;
};

export type TaskCategoryTab = {
  key: TaskCategoryKey;
  label: string;
  count: number;
};

export type TaskFilterOption = {
  value: TaskPriorityKey;
  label: string;
};

export const TASK_CATEGORY_LABELS: Record<Exclude<TaskCategoryKey, 'all'>, string> = {
  work: '工作',
  study: '学习',
  life: '生活',
};

export const TASK_PRIORITY_LABELS: Record<Exclude<TaskPriorityKey, 'all'>, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

