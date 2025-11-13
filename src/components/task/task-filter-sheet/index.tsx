import { Popup } from 'antd-mobile';
import { CloseOutline } from 'antd-mobile-icons';
import type {
  TaskCategoryKey,
  TaskCategoryTab,
  TaskFilterOption,
  TaskPriorityKey,
} from '../types';
import './index.less';

type TaskFilterSheetProps = {
  visible: boolean;
  onClose: () => void;
  categoryOptions: TaskCategoryTab[];
  selectedCategory: TaskCategoryKey;
  onCategorySelect: (key: TaskCategoryKey) => void;
  priorityOptions: TaskFilterOption[];
  selectedPriority: TaskPriorityKey;
  onPrioritySelect: (value: TaskPriorityKey) => void;
  onReset: () => void;
};

const TaskFilterSheet = ({
  visible,
  onClose,
  categoryOptions,
  selectedCategory,
  onCategorySelect,
  priorityOptions,
  selectedPriority,
  onPrioritySelect,
  onReset,
}: TaskFilterSheetProps) => {
  return (
    <Popup
      visible={visible}
      onMaskClick={onClose}
      position="bottom"
      bodyStyle={{
        borderTopLeftRadius: '20px',
        borderTopRightRadius: '20px',
        padding: '20px 20px 24px',
        background: '#ffffff',
      }}
    >
      <div className="task-filter-sheet">
        <div className="task-filter-sheet__header">
          <div className="task-filter-sheet__title">筛选任务</div>
          <button type="button" onClick={onClose} aria-label="关闭筛选">
            <CloseOutline />
          </button>
        </div>

        <div className="task-filter-sheet__section">
          <div className="task-filter-sheet__section-title">按分类</div>
          <div className="task-filter-sheet__chips">
            {categoryOptions.map((item) => (
              <button
                type="button"
                key={item.key}
                className={`task-filter-sheet__chip${
                  item.key === selectedCategory ? ' active' : ''
                }`}
                onClick={() => onCategorySelect(item.key)}
              >
                <span>{item.label}</span>
                <span className="count">{item.count}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="task-filter-sheet__section">
          <div className="task-filter-sheet__section-title">按优先级</div>
          <div className="task-filter-sheet__chips">
            {priorityOptions.map((item) => (
              <button
                type="button"
                key={item.value}
                className={`task-filter-sheet__chip${
                  item.value === selectedPriority ? ' active' : ''
                } priority-${item.value}`}
                onClick={() => onPrioritySelect(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <button type="button" className="task-filter-sheet__reset" onClick={onReset}>
          重置筛选
        </button>
      </div>
    </Popup>
  );
};

export default TaskFilterSheet;

