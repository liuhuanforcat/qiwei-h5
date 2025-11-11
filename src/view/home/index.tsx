import { useState, type ReactNode } from 'react';
import { TabBar } from 'antd-mobile';
import {
  AppOutline,
  UnorderedListOutline,
  MessageOutline,
  UserOutline,
} from 'antd-mobile-icons';
import './index.less';

type TabItem = {
  key: string;
  title: string;
  icon: ReactNode;
  badge?: ReactNode;
  description: string;
};

const tabItems: TabItem[] = [
  {
    key: 'home',
    title: '首页',
    icon: <AppOutline />,
    description: '这里是首页，可以放置概览、数据看板等核心内容。',
  },
  {
    key: 'task',
    title: '我的待办',
    icon: <UnorderedListOutline />,
    description: '待办事项列表，展示需要处理的任务。',
  },
  {
    key: 'message',
    title: '我的消息',
    icon: <MessageOutline />,
    description: '消息通知区域，用于及时查看系统提醒与互动信息。',
  },
  {
    key: 'profile',
    title: '个人中心',
    icon: <UserOutline />,
    description: '个人资料、账户设置等内容可以放在这里。',
  },
];

const Home = () => {
  const [activeKey, setActiveKey] = useState('home');
  const activeTab = tabItems.find((item) => item.key === activeKey);

  return (
    <div className="home-page">
      <div className="home-header">
        <h1>Tabs</h1>
      </div>
      <div className="home-content">
        <h2>{activeTab?.title}</h2>
        <p>{activeTab?.description}</p>
      </div>
      <TabBar
        activeKey={activeKey}
        onChange={setActiveKey}
        className="home-tab-bar"
        safeArea
      >
        {tabItems.map((item) => (
          <TabBar.Item
            key={item.key}
            title={item.title}
            icon={item.icon}
            badge={item.badge}
          />
        ))}
      </TabBar>
    </div>
  );
};

export default Home;
