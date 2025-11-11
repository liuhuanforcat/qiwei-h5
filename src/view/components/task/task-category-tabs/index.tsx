import type { TaskCategoryKey, TaskCategoryTab } from '../types';
import './index.less';

type TaskCategoryTabsProps = {
  categories: TaskCategoryTab[];
  activeKey: TaskCategoryKey;
  onChange?: (key: TaskCategoryKey) => void;
};

const TaskCategoryTabs = ({ categories, activeKey, onChange }: TaskCategoryTabsProps) => {
  return (
    <div className="task-category-tabs">
      {categories.map((item) => (
        <button
          type="button"
          key={item.key}
          className={`task-category-tabs__item${item.key === activeKey ? ' active' : ''}`}
          onClick={() => onChange?.(item.key)}
        >
          <span className="task-category-tabs__label">{item.label}</span>
          <span className="task-category-tabs__count">{item.count}</span>
        </button>
      ))}
    </div>
  );
};

export default TaskCategoryTabs;

