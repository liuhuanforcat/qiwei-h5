import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTaskContext } from '../../context/TaskContext';
import { TaskOverdueList } from './components';
import './index.less';

const MessagePage = () => {
  const { tasks } = useTaskContext();
  const navigate = useNavigate();

  const overdueTasks = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];

    return tasks.filter((task) => {
      if (!task.dueDate) return false;
      return task.dueDate < todayStr && !task.completed;
    });
  }, [tasks]);

  const handleGoHandle = () => {
    navigate('/todo');
  };

  return (
    <div className="message-page">
      <div className="message-header">
        <div className="message-header__info">
          <div className="message-header__title">我的消息</div>
          <div className="message-header__subtitle">已逾期 {overdueTasks.length} 个任务待处理</div>
        </div>
      </div>

      <div className="message-body">
        <TaskOverdueList tasks={tasks} onGoHandle={handleGoHandle} />
      </div>
    </div>
  );
};

export default MessagePage;

