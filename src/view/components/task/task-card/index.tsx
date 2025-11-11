import {
  CheckCircleFill,
  CheckCircleOutline,
  EditSOutline,
  DeleteOutline,
  ClockCircleOutline,
} from 'antd-mobile-icons';
import type { Task } from '../types';
import TaskTag from '../task-tag';
import { TASK_CATEGORY_LABELS, TASK_PRIORITY_LABELS } from '../types';
import './index.less';

type TaskCardProps = {
  task: Task;
  onToggleComplete?: (taskId: string) => void;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
};

const formatDueDate = (dueDate?: string) => {
  if (!dueDate) return '';
  return dueDate.replace(/\//g, '-');
};

const TaskCard = ({ task, onToggleComplete, onEdit, onDelete }: TaskCardProps) => {
  const priorityLabel = TASK_PRIORITY_LABELS[task.priority];
  const categoryLabel = TASK_CATEGORY_LABELS[task.category];
  const dueDateLabel = formatDueDate(task.dueDate);

  return (
    <div className={`task-card${task.completed ? ' completed' : ''}`}>
      <button
        type="button"
        className="task-card__checkbox"
        aria-label={task.completed ? '取消完成' : '标记完成'}
        onClick={() => onToggleComplete?.(task.id)}
      >
        {task.completed ? <CheckCircleFill /> : <CheckCircleOutline />}
      </button>

      <div className="task-card__content">
        <div className="task-card__header">
          <div className="task-card__title">{task.title}</div>
          <div className="task-card__actions">
            <button type="button" onClick={() => onEdit?.(task)} aria-label="编辑任务">
              <EditSOutline />
            </button>
            <button type="button" onClick={() => onDelete?.(task.id)} aria-label="删除任务">
              <DeleteOutline />
            </button>
          </div>
        </div>
        {task.description ? <div className="task-card__desc">{task.description}</div> : null}

        <div className="task-card__tags">
          <TaskTag variant={`priority-${task.priority}`}>
            {`P ${priorityLabel}`}
          </TaskTag>
          <TaskTag variant="category">{categoryLabel}</TaskTag>
          {dueDateLabel ? (
            <TaskTag variant="deadline" icon={<ClockCircleOutline />}>
              {dueDateLabel}
            </TaskTag>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;

