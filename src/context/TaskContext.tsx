import { createContext, useContext, useState, useMemo, useEffect, useRef, type ReactNode } from 'react';
import type { Task, TaskCategoryKey, TaskPriorityKey } from '@/components/task';
import { useIndexedDB } from '@/hooks/useIndexedDB';

// 获取今日日期字符串用于初始化任务
// const getTodayDateStringForInit = () => {
//   const date = new Date();
//   const year = date.getFullYear();
//   const month = `${date.getMonth() + 1}`.padStart(2, '0');
//   const day = `${date.getDate()}`.padStart(2, '0');
//   return `${year}-${month}-${day}`;
// };

// 默认任务数据（仅在首次初始化 IndexedDB 为空时使用）
const DEFAULT_TASKS: Task[] = [
  // // 今日待办 - 工作类
  // {
  //   id: 'task-1',
  //   title: '完成H5项目设计',
  //   description: '设计移动端项目前端UI和核心功能',
  //   category: 'work',
  //   priority: 'high',
  //   dueDate: getTodayDateStringForInit(),
  //   completed: false,
  // },
  // {
  //   id: 'task-2',
  //   title: '参加项目评审会议',
  //   description: '下午2点参加产品评审，准备演示材料',
  //   category: 'work',
  //   priority: 'high',
  //   dueDate: getTodayDateStringForInit(),
  //   completed: false,
  // },
  // {
  //   id: 'task-3',
  //   title: '回复客户邮件',
  //   description: '处理客户咨询和反馈邮件',
  //   category: 'work',
  //   priority: 'medium',
  //   dueDate: getTodayDateStringForInit(),
  //   completed: false,
  // },
  // // 今日待办 - 学习类
  // {
  //   id: 'task-4',
  //   title: '学习React Hooks',
  //   description: '完成React Hooks进阶教程第3章',
  //   category: 'study',
  //   priority: 'medium',
  //   dueDate: getTodayDateStringForInit(),
  //   completed: false,
  // },
  // {
  //   id: 'task-5',
  //   title: '完成英语阅读练习',
  //   description: '阅读一篇技术文章并做笔记',
  //   category: 'study',
  //   priority: 'low',
  //   dueDate: getTodayDateStringForInit(),
  //   completed: false,
  // },
  // // 今日待办 - 生活类
  // {
  //   id: 'task-6',
  //   title: '购买生活用品',
  //   description: '去超市购买本周需要的食材和日用品',
  //   category: 'life',
  //   priority: 'medium',
  //   dueDate: getTodayDateStringForInit(),
  //   completed: false,
  // },
  // {
  //   id: 'task-7',
  //   title: '运动30分钟',
  //   description: '完成今天的运动计划，保持健康',
  //   category: 'life',
  //   priority: 'low',
  //   dueDate: getTodayDateStringForInit(),
  //   completed: false,
  // },
  // // 其他日期的任务
  // {
  //   id: 'task-8',
  //   title: '准备下周的会议',
  //   description: '整理会议资料和议程',
  //   category: 'work',
  //   priority: 'medium',
  //   dueDate: '2025-11-15',
  //   completed: false,
  // },
];

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleTaskComplete: (taskId: string) => Promise<void>;
  clearCompletedTasks: () => Promise<void>;
  
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

// IndexedDB 配置（提取为常量，避免每次渲染创建新对象）
const DB_CONFIG = {
  dbName: 'task-manager-db',
  storeName: 'tasks',
  version: 1,
  storeConfig: { keyPath: 'id' } as const,
};

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true); // 添加加载状态
  const [selectedCategory, setSelectedCategory] = useState<TaskCategoryKey>('all');
  const [selectedPriority, setSelectedPriority] = useState<TaskPriorityKey>('all');
  
  // 初始化 IndexedDB
  const {
    ready,
    error: dbError,
    supported,
    addItem,
    putItem,
    getAllItems,
    deleteItem,
    updateItem,
  } = useIndexedDB<Task>(DB_CONFIG);

  // 监控 IndexedDB 状态（仅在 ready 状态变化时打印）
  const lastReadyRef = useRef<boolean>(false);
  
  useEffect(() => {
    // 只在 ready 状态变化时打印
    if (ready !== lastReadyRef.current) {
      console.log('IndexedDB 状态:', { 
        ready, 
        supported, 
        error: dbError?.message 
      });
      
      if (ready) {
        console.log('✅ IndexedDB 已就绪');
      }
      
      lastReadyRef.current = ready;
    }
  }, [ready]);

  // 检查浏览器支持和错误（只在首次加载时）
  useEffect(() => {
    if (!supported) {
      console.error('❌ 当前浏览器不支持 IndexedDB');
    }
  }, [supported]);

  useEffect(() => {
    if (dbError) {
      console.error('❌ IndexedDB 初始化错误:', dbError);
    }
  }, [dbError?.message]); // 只依赖错误消息字符串

  // 从 IndexedDB 加载任务（完全依赖数据库，仅首次为空时初始化）
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // 只在 ready 变为 true 且还未加载过时执行
    if (!ready || hasLoadedRef.current) return;

    let cancelled = false;

    const loadTasks = async () => {
      setIsLoading(true);
      
      // 再次检查 ready 状态，防止异步执行时状态变化
      if (!ready) {
        console.warn('⚠️ IndexedDB 尚未就绪，跳过加载');
        setIsLoading(false);
        return;
      }

      try {
        const storedTasks = await getAllItems();
        if (cancelled) return;
        
        // 标记已加载，防止重复加载
        hasLoadedRef.current = true;
        
        if (storedTasks.length > 0) {
          // ✅ 从数据库加载任务数据
          console.log(`✅ 从 IndexedDB 加载了 ${storedTasks.length} 个任务`);
          setTasks(storedTasks);
        } else {
          // 🔧 首次安装：数据库为空，初始化默认任务
          console.log('🔧 IndexedDB 为空，首次初始化默认任务');
          setTasks(DEFAULT_TASKS);
          
          // 将默认任务保存到数据库
          for (const task of DEFAULT_TASKS) {
            if (cancelled) return;
            try {
              await putItem(task);
            } catch (err) {
              console.error('❌ 保存默认任务到 IndexedDB 失败:', err);
            }
          }
          console.log(`✅ 已将 ${DEFAULT_TASKS.length} 个默认任务保存到 IndexedDB`);
        }
      } catch (error) {
        if (cancelled) return;
        console.error('❌ 加载任务失败:', error);
        // 加载失败时显示空列表，不使用假数据
        setTasks([]);
        // 标记为已加载，避免无限重试
        hasLoadedRef.current = true;
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadTasks();

    return () => {
      cancelled = true;
    };
  }, [ready]); // 只依赖 ready 状态

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

  const addTask = async (taskData: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      completed: false, // 确保默认为未完成
    };
    
    // 先更新本地状态（立即显示给用户）
    setTasks((prev) => [newTask, ...prev]);
    
    // 如果数据库已准备好，保存到 IndexedDB
    if (ready) {
      try {
        await addItem(newTask);
      } catch (error) {
        console.warn('添加任务到 IndexedDB 失败，任务已保存到本地状态:', error);
        // 不移除本地状态，让用户可以继续使用
        // 下次刷新时如果数据库正常，任务会丢失，但这是可以接受的
      }
    } else {
      console.warn('IndexedDB 尚未就绪，任务仅保存到本地状态');
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    // 先更新本地状态
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, ...updates } : task))
    );
    
    // 如果数据库已准备好，更新 IndexedDB
    if (ready) {
      try {
        await updateItem(taskId, updates);
      } catch (error) {
        console.error('更新任务到 IndexedDB 失败:', error);
        // 任务已在本地状态中更新，不影响用户使用
      }
    }
  };

  const deleteTask = async (taskId: string) => {
    // 先更新本地状态
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
    
    // 如果数据库已准备好，从 IndexedDB 删除
    if (ready) {
      try {
        await deleteItem(taskId);
      } catch (error) {
        console.error('从 IndexedDB 删除任务失败:', error);
        // 任务已从本地状态中删除，不影响用户使用
      }
    }
  };

  const toggleTaskComplete = async (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const newCompleted = !task.completed;
    
    // 先更新本地状态
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed: newCompleted } : task
      )
    );
    
    // 如果数据库已准备好，同步到 IndexedDB
    if (ready) {
      try {
        await updateItem(taskId, { completed: newCompleted });
      } catch (error) {
        console.error('切换任务完成状态到 IndexedDB 失败:', error);
        // 任务已在本地状态中更新，不影响用户使用
      }
    }
  };

  const clearCompletedTasks = async () => {
    // 获取所有已完成的任务
    const completedTaskIds = tasks.filter((task) => task.completed).map((task) => task.id);
    
    // 先更新本地状态
    setTasks((prev) => prev.filter((task) => !task.completed));
    
    // 如果数据库已准备好，从 IndexedDB 删除
    if (ready && completedTaskIds.length > 0) {
      try {
        for (const taskId of completedTaskIds) {
          await deleteItem(taskId);
        }
      } catch (error) {
        console.error('从 IndexedDB 清空已完成任务失败:', error);
        // 如果删除失败，任务已从本地状态中删除，用户可见
      }
    }
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

  // 数据加载中时显示加载状态
  if (isLoading) {
    return (
      <TaskContext.Provider value={value}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          fontSize: '16px',
          color: '#999'
        }}>
          加载中...
        </div>
      </TaskContext.Provider>
    );
  }

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTaskContext must be used within TaskProvider');
  }
  return context;
};

