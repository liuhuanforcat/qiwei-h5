import { useMemo, useState } from 'react';
import { FilterOutline } from 'antd-mobile-icons';
import { useTaskContext } from '../../context/TaskContext';
import { TaskFilterSheet, type TaskCategoryTab, type TaskFilterOption } from '@/components/task';
import { TaskListGrouped } from './components';
import './index.less';

const CATEGORY_DEFINITIONS: Array<Pick<TaskCategoryTab, 'key' | 'label'>> = [
  { key: 'all', label: '全部' },
  { key: 'work', label: '工作' },
  { key: 'study', label: '学习' },
  { key: 'life', label: '生活' },
];

const PRIORITY_OPTIONS: TaskFilterOption[] = [
  { value: 'all', label: '全部' },
  { value: 'high', label: '高优先级' },
  { value: 'medium', label: '中优先级' },
  { value: 'low', label: '低优先级' },
];

const TodoPage = () => {
  const [filterVisible, setFilterVisible] = useState(false);
  const {
    tasks,
    selectedCategory,
    setSelectedCategory,
    selectedPriority,
    setSelectedPriority,
    toggleTaskComplete,
    deleteTask,
  } = useTaskContext();

  // 我的待办的所有任务（只按优先级筛选，分类筛选由组件内部处理）
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchPriority = selectedPriority === 'all' || task.priority === selectedPriority;
      return matchPriority;
    });
  }, [tasks, selectedPriority]);

  const categoryTabs = useMemo<TaskCategoryTab[]>(() => {
    return CATEGORY_DEFINITIONS.map((item) => ({
      ...item,
      count:
        item.key === 'all'
          ? tasks.length
          : tasks.filter((task) => task.category === item.key).length,
    }));
  }, [tasks]);

  const unfinishedCount = useMemo(() => {
    return tasks.filter((task) => !task.completed).length;
  }, [tasks]);

  return (
    <div className="todo-page">
      <div className="todo-header">
        <div className="todo-header__info">
          <div className="todo-header__title">我的待办</div>
          <div className="todo-header__subtitle">
            共 {tasks.length} 个任务 · 还有 {unfinishedCount} 个待完成
          </div>
        </div>
        <button type="button" className="todo-header__filter" onClick={() => setFilterVisible(true)}>
          <FilterOutline fontSize={20} />
        </button>
      </div>

      <div className="todo-body">
        <TaskListGrouped
          tasks={filteredTasks}
          categoryTabs={categoryTabs}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          onToggleComplete={toggleTaskComplete}
          onDelete={deleteTask}
        />
      </div>

      <TaskFilterSheet
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        categoryOptions={categoryTabs}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
        priorityOptions={PRIORITY_OPTIONS}
        selectedPriority={selectedPriority}
        onPrioritySelect={setSelectedPriority}
        onReset={() => {
          setSelectedCategory('all');
          setSelectedPriority('all');
        }}
      />
    </div>
  );
};

export default TodoPage;

