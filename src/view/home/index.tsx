import { useState, type ReactNode } from 'react';
import {
  TabBar,
  Popup,
  Form,
  Input,
  Button,
  DatePicker,
  TextArea,
  Selector,
} from 'antd-mobile';
import {
  AppOutline,
  UnorderedListOutline,
  MessageOutline,
  UserOutline,
  AddOutline,
  CalendarOutline,
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
  const [showTaskPopup, setShowTaskPopup] = useState(false);
  const [form] = Form.useForm();
  const [deadlinePickerVisible, setDeadlinePickerVisible] = useState(false);
  const activeTab = tabItems.find((item) => item.key === activeKey);

  const formatDate = (value?: Date | null) => {
    if (!value) return '年/月/日';
    const year = value.getFullYear();
    const month = `${value.getMonth() + 1}`.padStart(2, '0');
    const day = `${value.getDate()}`.padStart(2, '0');
    return `${year}/${month}/${day}`;
  };

  // 处理表单提交
  const handleSubmit = () => {
    const values = form.getFieldsValue();
    const normalizedValues = {
      ...values,
      priority: values.priority?.[0] ?? '',
      category: values.category?.[0] ?? '',
    };

    console.log('新建任务:', normalizedValues);
    // 这里可以添加保存到 IndexedDB 的逻辑
    setShowTaskPopup(false);
    form.resetFields();
  };

  // 取消新建
  const handleCancel = () => {
    setShowTaskPopup(false);
    form.resetFields();
  };

  return (
    <div className="home-page">
      <div className="home-header">
        <h1>Tabs</h1>
      </div>
      <div className="home-content">
        <h2>{activeTab?.title}</h2>
        <p>{activeTab?.description}</p>
      </div>

      {/* 悬浮新建按钮 */}
      <div className="fab-button" onClick={() => setShowTaskPopup(true)}>
        <AddOutline fontSize={28} />
      </div>

      {/* 新建任务弹窗 */}
      <Popup
        visible={showTaskPopup}
        onMaskClick={() => setShowTaskPopup(false)}
        position="bottom"
        bodyStyle={{
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px',
          minHeight: '60vh',
        }}
      >
        <div className="task-popup">
          <div className="task-popup-header">
            <h2>新建任务</h2>
            <div className="close-btn" onClick={() => setShowTaskPopup(false)}>
              ✕
            </div>
          </div>

          <Form
            form={form}
            layout="vertical"
            className="task-form"
            initialValues={{
              priority: ['中'],
              category: ['工作'],
              deadline: null,
            }}
          >
            <Form.Item
              name="title"
              label="任务标题"
              rules={[{ required: true, message: '请输入任务标题' }]}
            >
              <Input placeholder="输入任务标题" />
            </Form.Item>

            <Form.Item name="description" label="任务描述">
              <TextArea
                placeholder="输入任务描述（可选）"
                rows={3}
                maxLength={200}
                showCount
              />
            </Form.Item>

            <Form.Item name="priority" label="优先级" className="selector-field">
              <Selector
                options={[
                  { label: '高', value: '高' },
                  { label: '中', value: '中' },
                  { label: '低', value: '低' },
                ]}
                multiple={false}
                columns={3}
              />
            </Form.Item>

            <Form.Item name="category" label="分类" className="selector-field">
              <Selector
                options={[
                  { label: '工作', value: '工作' },
                  { label: '学习', value: '学习' },
                  { label: '生活', value: '生活' },
                ]}
                multiple={false}
                columns={3}
              />
            </Form.Item>

            <Form.Item shouldUpdate label="截止日期" className="date-field">
              {() => {
                const value = form.getFieldValue('deadline') as Date | null | undefined;
                const isPlaceholder = !value;
                return (
                  <>
                    <div
                      className="date-trigger"
                      onClick={() => setDeadlinePickerVisible(true)}
                    >
                      <span className={`date-text${isPlaceholder ? ' placeholder' : ''}`}>
                        {formatDate(value)}
                      </span>
                      <CalendarOutline className="date-icon" />
                    </div>
                    <DatePicker
                      precision="day"
                      visible={deadlinePickerVisible}
                      onClose={() => setDeadlinePickerVisible(false)}
                      onCancel={() => setDeadlinePickerVisible(false)}
                      onConfirm={(val) => {
                        form.setFieldValue('deadline', val);
                        setDeadlinePickerVisible(false);
                      }}
                      value={value ?? null}
                    />
                  </>
                );
              }}
            </Form.Item>
          </Form>

          <div className="task-popup-footer">
            <Button
              block
              size="large"
              fill="outline"
              onClick={handleCancel}
              className="cancel-btn"
            >
              取消
            </Button>
            <Button
              block
              size="large"
              color="primary"
              onClick={handleSubmit}
              className="submit-btn"
            >
              保存
            </Button>
          </div>
        </div>
      </Popup>

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
