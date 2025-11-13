import type { ReactNode } from 'react';
import './index.less';

export type TaskTagVariant =
  | 'priority-high'
  | 'priority-medium'
  | 'priority-low'
  | 'category'
  | 'deadline';

type TaskTagProps = {
  variant?: TaskTagVariant;
  icon?: ReactNode;
  children: ReactNode;
};

const TaskTag = ({ variant = 'category', icon, children }: TaskTagProps) => {
  return (
    <span className={`task-tag ${variant}`}>
      {icon ? <span className="task-tag__icon">{icon}</span> : null}
      <span className="task-tag__text">{children}</span>
    </span>
  );
};

export default TaskTag;

