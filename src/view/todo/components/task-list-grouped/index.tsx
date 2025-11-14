import { useMemo } from 'react';
import { TaskCard, TaskCategoryTabs, type Task, type TaskCategoryKey, type TaskCategoryTab } from '@/components/task';
import './index.less';

type TaskListGroupedProps = {
  tasks: Task[];
  categoryTabs: TaskCategoryTab[];
  selectedCategory: TaskCategoryKey;
  onCategoryChange: (category: TaskCategoryKey) => void;
  onToggleComplete: (taskId: string) => void;
  onEdit?: (task: Task) => void;
  onDelete: (taskId: string) => void;
};

// 获取今日日期字符串 (YYYY-MM-DD)
const getTodayDateString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 格式化日期显示 (用于分组标题)
const formatDateForDisplay = (dateString: string) => {
  const date = new Date(dateString);
  const weekMap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const week = weekMap[date.getDay()];
  const month = `${date.getMonth() + 1}`.toString().padStart(2, '0');
  const day = `${date.getDate()}`.toString().padStart(2, '0');
  const year = date.getFullYear();
  const today = getTodayDateString();
  
  // 计算明天的日期字符串
  const tomorrowDate = new Date(today);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowYear = tomorrowDate.getFullYear();
  const tomorrowMonth = `${tomorrowDate.getMonth() + 1}`.padStart(2, '0');
  const tomorrowDay = `${tomorrowDate.getDate()}`.padStart(2, '0');
  const tomorrowStr = `${tomorrowYear}-${tomorrowMonth}-${tomorrowDay}`;
  
  if (dateString === today) {
    return `今天 ${month}月${day}日 ${week}`;
  } else if (dateString === tomorrowStr) {
    return `明天 ${month}月${day}日 ${week}`;
  } else {
    return `${year}年${month}月${day}日 ${week}`;
  }
};

// 按日期分组任务
const groupTasksByDate = (tasks: Task[]) => {
  const groups: Record<string, Task[]> = {};
  
  tasks.forEach((task) => {
    const dateKey = task.dueDate || '无日期';
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(task);
  });
  
  // 排序：无日期放在最后，有日期的按日期排序
  const sortedKeys = Object.keys(groups).sort((a, b) => {
    if (a === '无日期') return 1;
    if (b === '无日期') return -1;
    return a.localeCompare(b);
  });
  
  return sortedKeys.map((key) => ({
    date: key,
    tasks: groups[key],
  }));
};

const TaskListGrouped = ({
  tasks,
  categoryTabs,
  selectedCategory,
  onCategoryChange,
  onToggleComplete,
  onEdit,
  onDelete,
}: TaskListGroupedProps) => {
  // 根据分类过滤任务
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      return selectedCategory === 'all' || task.category === selectedCategory;
    });
  }, [tasks, selectedCategory]);

  // 按日期分组
  const groupedTasks = useMemo(() => {
    return groupTasksByDate(filteredTasks);
  }, [filteredTasks]);

  return (
    <div className="task-list-grouped">
      <TaskCategoryTabs
        categories={categoryTabs}
        activeKey={selectedCategory}
        onChange={onCategoryChange}
      />

      <div className="task-list-grouped__content">
        {groupedTasks.length === 0 ? (
          <div className="task-empty">
            <div className="task-empty__title">暂无任务</div>
            <div className="task-empty__desc">点击右下角 + 开始创建第一个任务吧</div>
          </div>
        ) : (
          groupedTasks.map((group) => (
            <div key={group.date} className="task-date-group">
              <div className="task-date-group__header">
                {group.date === '无日期' ? '无日期' : formatDateForDisplay(group.date)}
              </div>
              <div className="task-date-group__content">
                {group.tasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggleComplete={onToggleComplete}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskListGrouped;

