import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import type { Task, TaskCategoryKey, TaskPriorityKey } from '@/components/task';

// 获取今日日期字符串用于初始化任务
const getTodayDateStringForInit = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const INITIAL_TASKS: Task[] = [
  // 今日待办 - 工作类
  {
    id: 'task-1',
    title: '完成H5项目设计',
    description: '设计移动端项目前端UI和核心功能',
    category: 'work',
    priority: 'high',
    dueDate: getTodayDateStringForInit(),
    completed: false,
  },
  {
    id: 'task-2',
    title: '参加项目评审会议',
    description: '下午2点参加产品评审，准备演示材料',
    category: 'work',
    priority: 'high',
    dueDate: getTodayDateStringForInit(),
    completed: false,
  },
  {
    id: 'task-3',
    title: '回复客户邮件',
    description: '处理客户咨询和反馈邮件',
    category: 'work',
    priority: 'medium',
    dueDate: getTodayDateStringForInit(),
    completed: false,
  },
  // 今日待办 - 学习类
  {
    id: 'task-4',
    title: '学习React Hooks',
    description: '完成React Hooks进阶教程第3章',
    category: 'study',
    priority: 'medium',
    dueDate: getTodayDateStringForInit(),
    completed: false,
  },
  {
    id: 'task-5',
    title: '完成英语阅读练习',
    description: '阅读一篇技术文章并做笔记',
    category: 'study',
    priority: 'low',
    dueDate: getTodayDateStringForInit(),
    completed: false,
  },
  // 今日待办 - 生活类
  {
    id: 'task-6',
    title: '购买生活用品',
    description: '去超市购买本周需要的食材和日用品',
    category: 'life',
    priority: 'medium',
    dueDate: getTodayDateStringForInit(),
    completed: false,
  },
  {
    id: 'task-7',
    title: '运动30分钟',
    description: '完成今天的运动计划，保持健康',
    category: 'life',
    priority: 'low',
    dueDate: getTodayDateStringForInit(),
    completed: false,
  },
  // 其他日期的任务
  {
    id: 'task-8',
    title: '准备下周的会议',
    description: '整理会议资料和议程',
    category: 'work',
    priority: 'medium',
    dueDate: '2025-11-15',
    completed: false,
  },
];

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskComplete: (taskId: string) => void;
  clearCompletedTasks: () => void;
  
  // 筛选条件
  selectedCategory: TaskCategoryKey;
  setSelectedCategory: (category: TaskCategoryKey) => void;
  selectedPriority: TaskPriorityKey;
  setSelectedPriority: (priority: TaskPriorityKey) => void;
  
  // 计算属性
  todayTasks: Task[];
  overdueTasks: Task[];
  completedTasks: Task[];
  inProgressTasks: Task[];
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [selectedCategory, setSelectedCategory] = useState<TaskCategoryKey>('all');
  const [selectedPriority, setSelectedPriority] = useState<TaskPriorityKey>('all');

  // 获取今日日期字符串 (YYYY-MM-DD)
  const getTodayDateString = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 获取今日待办任务
  const todayTasks = useMemo(() => {
    const today = getTodayDateString();
    return tasks.filter((task) => task.dueDate === today);
  }, [tasks]);

  // 获取逾期任务
  const overdueTasks = useMemo(() => {
    const todayStr = getTodayDateString();
    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      return task.dueDate < todayStr && !task.completed;
    });
  }, [tasks]);

  // 已完成任务
  const completedTasks = useMemo(() => {
    return tasks.filter((task) => task.completed);
  }, [tasks]);

  // 进行中任务
  const inProgressTasks = useMemo(() => {
    return tasks.filter((task) => !task.completed);
  }, [tasks]);

  const addTask = (taskData: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
    };
    setTasks((prev) => [newTask, ...prev]);
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, ...updates } : task))
    );
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  const toggleTaskComplete = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const clearCompletedTasks = () => {
    setTasks((prev) => prev.filter((task) => !task.completed));
  };

  const value: TaskContextType = {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskComplete,
    clearCompletedTasks,
    selectedCategory,
    setSelectedCategory,
    selectedPriority,
    setSelectedPriority,
    todayTasks,
    overdueTasks,
    completedTasks,
    inProgressTasks,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within TaskProvider');
  }
  return context;
};

