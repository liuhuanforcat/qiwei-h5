import './index.less';

type ProfileOverviewProps = {
  userName?: string;
  slogan?: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  completionRate: number;
  onThemeSetting?: () => void;
  onReminderSetting?: () => void;
  onClearCompleted?: () => void;
};

const ProfileOverview = ({
  userName = '我',
  slogan = '高效管理每一天',
  totalTasks,
  completedTasks,
  inProgressTasks,
  completionRate,
  onThemeSetting,
  onReminderSetting,
  onClearCompleted,
}: ProfileOverviewProps) => {
  const stats = [
    { label: '总任务', value: totalTasks, theme: 'total' },
    { label: '已完成', value: completedTasks, theme: 'done' },
    { label: '进行中', value: inProgressTasks, theme: 'progress' },
    { label: '完成率', value: `${completionRate}%`, theme: 'rate' },
  ];

  const settings = [
    { label: '主题设置', onClick: onThemeSetting },
    { label: '提醒设置', onClick: onReminderSetting },
    { label: '清空已完成', onClick: onClearCompleted },
  ];

  return (
    <div className="profile-overview">
      <div className="profile-card">
        <div className="profile-avatar">{userName.slice(0, 1)}</div>
        <div className="profile-info">
          <div className="profile-name">待办小助手</div>
          <div className="profile-slogan">{slogan}</div>
        </div>
      </div>

      <div className="profile-section">
        <div className="profile-section__title">数据统计</div>
        <div className="profile-stats">
          {stats.map((item) => (
            <div key={item.label} className={`profile-stat profile-stat--${item.theme}`}>
              <div className="profile-stat__value">{item.value}</div>
              <div className="profile-stat__label">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="profile-section">
        <div className="profile-settings">
          {settings.map((item) => (
            <button
              key={item.label}
              type="button"
              className="profile-setting-item"
              onClick={item.onClick}
              disabled={!item.onClick}
            >
              <span>{item.label}</span>
              <span className="profile-setting-item__arrow">›</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileOverview;
