import { useMemo } from 'react';
import { FilterOutline } from 'antd-mobile-icons';
import { useTaskContext } from '../../context/TaskContext';
import {
  TaskCard,
  TaskCategoryTabs,
  type TaskCategoryTab,
} from '@/components/task';
import { getTodayFriendlyDisplay } from '../../utils/date';
import './index.less';

interface TodayPageProps {
  onFilterClick: () => void;
}

const CATEGORY_DEFINITIONS: Array<Pick<TaskCategoryTab, 'key' | 'label'>> = [
  { key: 'all', label: '全部' },
  { key: 'work', label: '工作' },
  { key: 'study', label: '学习' },
  { key: 'life', label: '生活' },
];

const TodayPage = ({ onFilterClick }: TodayPageProps) => {
  const {
    todayTasks,
    selectedCategory,
    setSelectedCategory,
    toggleTaskComplete,
    deleteTask,
  } = useTaskContext();

  const today = useMemo(() => getTodayFriendlyDisplay(), []);

  // 首页的过滤任务（只显示今日待办）
  const filteredTasks = useMemo(() => {
    return todayTasks.filter((task) => {
      const matchCategory = selectedCategory === 'all' || task.category === selectedCategory;
      return matchCategory;
    });
  }, [todayTasks, selectedCategory]);

  const categoryTabs = useMemo<TaskCategoryTab[]>(() => {
    return CATEGORY_DEFINITIONS.map((item) => ({
      ...item,
      count:
        item.key === 'all'
          ? todayTasks.length
          : todayTasks.filter((task) => task.category === item.key).length,
    }));
  }, [todayTasks]);

  const unfinishedCount = useMemo(() => {
    return todayTasks.filter((task) => !task.completed).length;
  }, [todayTasks]);

  return (
    <div className="today-page">
      <div className="today-header">
        <div className="today-header__info">
          <div className="today-header__title">今日待办</div>
          <div className="today-header__subtitle">
            {today} · 还有 {unfinishedCount} 个任务待完成
          </div>
        </div>
        <button type="button" className="today-header__filter" onClick={onFilterClick}>
          <FilterOutline fontSize={20} />
        </button>
      </div>

      <div className="today-body">
        <TaskCategoryTabs
          categories={categoryTabs}
          activeKey={selectedCategory}
          onChange={setSelectedCategory}
        />

        <div className="task-list">
          {filteredTasks.length === 0 ? (
            <div className="task-empty">
              <div className="task-empty__title">暂无任务</div>
              <div className="task-empty__desc">点击右下角 + 开始创建第一个任务吧</div>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleComplete={toggleTaskComplete}
                onDelete={deleteTask}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TodayPage;

