type TaskProfilePanelProps = {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  completionRate: number;
};

const TaskProfilePanel = ({
  totalTasks,
  completedTasks,
  inProgressTasks,
  completionRate,
}: TaskProfilePanelProps) => {
  const stats = [
    { key: 'total', label: '总任务', value: totalTasks, className: 'total' },
    { key: 'completed', label: '已完成', value: completedTasks, className: 'completed' },
    { key: 'progress', label: '进行中', value: inProgressTasks, className: 'progress' },
    {
      key: 'rate',
      label: '完成率',
      value: `${completionRate}%`,
      className: 'rate',
    },
  ];

  const actions = [
    { key: 'theme', label: '主题设置' },
    { key: 'remind', label: '提醒设置' },
    { key: 'clear', label: '清空已完成' },
  ];

  return (
    <div className="profile-panel">
      <section className="profile-card">
        <div className="profile-card__avatar">我</div>
        <div className="profile-card__info">
          <div className="profile-card__name">待办小助手</div>
          <div className="profile-card__desc">高效管理每一天</div>
        </div>
      </section>

      <section className="profile-stats">
        <div className="profile-stats__title">数据统计</div>
        <div className="profile-stats__grid">
          {stats.map((item) => (
            <div key={item.key} className={`profile-stats__item profile-stats__item--${item.className}`}>
              <div className="profile-stats__value">{item.value}</div>
              <div className="profile-stats__label">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="profile-actions">
        {actions.map((item) => (
          <button key={item.key} type="button" className="profile-actions__item">
            <span>{item.label}</span>
            <span className="profile-actions__arrow">›</span>
          </button>
        ))}
      </section>
    </div>
  );
};

export default TaskProfilePanel;
