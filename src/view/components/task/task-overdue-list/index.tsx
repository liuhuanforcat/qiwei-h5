import { useMemo } from 'react';
import type { Task } from '..';
import { TASK_CATEGORY_LABELS } from '..';
import './index.less';

type TaskOverdueListProps = {
  tasks: Task[];
  onGoHandle?: () => void;
};

const getTodayDateString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const TaskOverdueList = ({ tasks, onGoHandle }: TaskOverdueListProps) => {
  const overdueTasks = useMemo(() => {
    const todayStr = getTodayDateString();
    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      return task.dueDate < todayStr && !task.completed;
    });
  }, [tasks]);

  return (
    <div className="overdue-list">
      <div className="overdue-section">
        <div className="overdue-section__title">已逾期（{overdueTasks.length}）</div>
        <div className="overdue-section__content">
          {overdueTasks.length === 0 ? (
            <div className="overdue-empty">
              <div className="overdue-empty__title">暂无逾期任务</div>
              <div className="overdue-empty__desc">保持良好进度，继续加油！</div>
            </div>
          ) : (
            overdueTasks.map((task) => (
              <div key={task.id} className="overdue-card">
                <div className="overdue-card__badge">已逾期</div>
                <div className="overdue-card__title">{task.title}</div>
                {task.description ? (
                  <div className="overdue-card__desc">{task.description}</div>
                ) : null}
                <div className="overdue-card__meta">
                  <span>截止时间：{task.dueDate}</span>
                  <span>分类：{TASK_CATEGORY_LABELS[task.category]}</span>
                </div>
                {onGoHandle ? (
                  <button type="button" className="overdue-card__action" onClick={onGoHandle}>
                    去处理
                  </button>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskOverdueList;
