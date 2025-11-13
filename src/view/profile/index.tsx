import { useMemo } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import { ProfileOverview } from './components';
import './index.less';

const ProfilePage = () => {
  const { tasks, clearCompletedTasks } = useTaskContext();

  // 个人中心统计数据
  const profileStats = useMemo(() => {
    const completedTasks = tasks.filter((task) => task.completed).length;
    const inProgressTasks = tasks.filter((task) => !task.completed).length;
    const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
    return {
      totalTasks: tasks.length,
      completedTasks,
      inProgressTasks,
      completionRate,
    };
  }, [tasks]);

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-header__info">
          <div className="profile-header__title">个人中心</div>
        </div>
      </div>

      <div className="profile-body">
        <ProfileOverview
          userName="我"
          slogan="高效管理每一天"
          totalTasks={profileStats.totalTasks}
          completedTasks={profileStats.completedTasks}
          inProgressTasks={profileStats.inProgressTasks}
          completionRate={profileStats.completionRate}
          onClearCompleted={clearCompletedTasks}
        />
      </div>
    </div>
  );
};

export default ProfilePage;

