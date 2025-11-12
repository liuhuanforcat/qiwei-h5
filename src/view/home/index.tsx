import { useMemo, useState, type ReactNode } from 'react';
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
  FilterOutline,
  CalendarOutline,
} from 'antd-mobile-icons';
import {
  TaskCard,
  TaskCategoryTabs,
  TaskFilterSheet,
  TaskListGrouped,
  type Task,
  type TaskCategoryKey,
  type TaskCategoryTab,
  type TaskPriorityKey,
  type TaskFilterOption,
  TASK_CATEGORY_LABELS,
} from '../components/task';
import './index.less';

type TabItem = {
  key: string;
  title: string;
  icon: ReactNode;
};

const bottomTabs: TabItem[] = [
  { key: 'home', title: '首页', icon: <AppOutline /> },
  { key: 'task', title: '我的待办', icon: <UnorderedListOutline /> },
  { key: 'message', title: '我的消息', icon: <MessageOutline /> },
  { key: 'profile', title: '个人中心', icon: <UserOutline /> },
];

const CATEGORY_DEFINITIONS: Array<Pick<TaskCategoryTab, 'key' | 'label'>> = [
  { key: 'all', label: '全部' },
  { key: 'work', label: '工作' },
  { key: 'study', label: '学习' },
  { key: 'life', label: '生活' },
];

const PRIORITY_OPTIONS: TaskFilterOption[] = [
  { value: 'all', label: '全部' },
  { value: 'high', label: '高优先级' },
  { value: 'medium', label: '中优先级' },
  { value: 'low', label: '低优先级' },
];

// 获取今日日期字符串用于初始化任务
const getTodayDateStringForInit = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const INITIAL_TASKS: Task[] = [
  // 今日待办 - 工作类
  {
    id: 'task-1',
    title: '完成H5项目设计',
    description: '设计移动端项目前端UI和核心功能',
    category: 'work',
    priority: 'high',
    dueDate: getTodayDateStringForInit(),
    completed: false,
  },
  {
    id: 'task-2',
    title: '参加项目评审会议',
    description: '下午2点参加产品评审，准备演示材料',
    category: 'work',
    priority: 'high',
    dueDate: getTodayDateStringForInit(),
    completed: false,
  },
  {
    id: 'task-3',
    title: '回复客户邮件',
    description: '处理客户咨询和反馈邮件',
    category: 'work',
    priority: 'medium',
    dueDate: getTodayDateStringForInit(),
    completed: false,
  },
  // 今日待办 - 学习类
  {
    id: 'task-4',
    title: '学习React Hooks',
    description: '完成React Hooks进阶教程第3章',
    category: 'study',
    priority: 'medium',
    dueDate: getTodayDateStringForInit(),
    completed: false,
  },
  {
    id: 'task-5',
    title: '完成英语阅读练习',
    description: '阅读一篇技术文章并做笔记',
    category: 'study',
    priority: 'low',
    dueDate: getTodayDateStringForInit(),
    completed: false,
  },
  // 今日待办 - 生活类
  {
    id: 'task-6',
    title: '购买生活用品',
    description: '去超市购买本周需要的食材和日用品',
    category: 'life',
    priority: 'medium',
    dueDate: getTodayDateStringForInit(),
    completed: false,
  },
  {
    id: 'task-7',
    title: '运动30分钟',
    description: '完成今天的运动计划，保持健康',
    category: 'life',
    priority: 'low',
    dueDate: getTodayDateStringForInit(),
    completed: false,
  },
  // 其他日期的任务
  {
    id: 'task-8',
    title: '准备下周的会议',
    description: '整理会议资料和议程',
    category: 'work',
    priority: 'medium',
    dueDate: '2025-11-15',
    completed: false,
  },
];

const formatPickerDisplay = (value?: Date | null) => {
  if (!value) return '年/月/日';
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, '0');
  const day = `${value.getDate()}`.padStart(2, '0');
  return `${year}/${month}/${day}`;
};

const formatDateForStorage = (value?: Date | null) => {
  if (!value) return undefined;
  const year = value.getFullYear();
  const month = `${value.getMonth() + 1}`.padStart(2, '0');
  const day = `${value.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// 获取今日日期字符串 (YYYY-MM-DD)
const getTodayDateString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const Home = () => {
  const [activeTabKey, setActiveTabKey] = useState('home');
  const [showTaskPopup, setShowTaskPopup] = useState(false);
  const [form] = Form.useForm();
  const [deadlinePickerVisible, setDeadlinePickerVisible] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [filterVisible, setFilterVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<TaskCategoryKey>('all');
  const [selectedPriority, setSelectedPriority] = useState<TaskPriorityKey>('all');

  const today = useMemo(() => {
    const date = new Date();
    const weekMap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const week = weekMap[date.getDay()];
    const month = `${date.getMonth() + 1}`.toString().padStart(2, '0');
    const day = `${date.getDate()}`.toString().padStart(2, '0');
    return `${month}月${day}日 ${week}`;
  }, []);

  // 获取今日待办任务
  const todayTasks = useMemo(() => {
    const today = getTodayDateString();
    return tasks.filter((task) => task.dueDate === today);
  }, [tasks]);

  // 首页的过滤任务（只显示今日待办）
  const homeFilteredTasks = useMemo(() => {
    return todayTasks.filter((task) => {
      const matchCategory = selectedCategory === 'all' || task.category === selectedCategory;
      const matchPriority = selectedPriority === 'all' || task.priority === selectedPriority;
      return matchCategory && matchPriority;
    });
  }, [todayTasks, selectedCategory, selectedPriority]);

  // 我的待办的所有任务（只按优先级筛选，分类筛选由组件内部处理）
  const allTasksFiltered = useMemo(() => {
    return tasks.filter((task) => {
      const matchPriority = selectedPriority === 'all' || task.priority === selectedPriority;
      return matchPriority;
    });
  }, [tasks, selectedPriority]);

  const categoryTabs = useMemo<TaskCategoryTab[]>(() => {
    const taskList = activeTabKey === 'home' ? todayTasks : tasks;
    return CATEGORY_DEFINITIONS.map((item) => ({
      ...item,
      count:
        item.key === 'all'
          ? taskList.length
          : taskList.filter((task) => task.category === item.key).length,
    }));
  }, [tasks, todayTasks, activeTabKey]);

  const handleToggleTask = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  const handleSubmit = () => {
    const values = form.getFieldsValue();
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: values.title,
      description: values.description ?? '',
      category: (values.category?.[0] ?? 'work') as Task['category'],
      priority: (values.priority?.[0] ?? 'medium') as Task['priority'],
      dueDate: formatDateForStorage(values.deadline ?? null),
      completed: false,
    };

    setTasks((prev) => [newTask, ...prev]);
    setShowTaskPopup(false);
    form.resetFields();
  };

  const handleCancel = () => {
    setShowTaskPopup(false);
    form.resetFields();
  };

  const unfinishedCount = useMemo(() => {
    if (activeTabKey === 'home') {
      return todayTasks.filter((task) => !task.completed).length;
    }
    return tasks.filter((task) => !task.completed).length;
  }, [tasks, todayTasks, activeTabKey]);

  // 根据当前 tab 渲染内容
  const renderContent = () => {
    if (activeTabKey === 'home') {
      // 首页：显示今日待办
      return (
        <div className="home-body">
          <TaskCategoryTabs
            categories={categoryTabs}
            activeKey={selectedCategory}
            onChange={setSelectedCategory}
          />

          <div className="task-list">
            {homeFilteredTasks.length === 0 ? (
              <div className="task-empty">
                <div className="task-empty__title">暂无任务</div>
                <div className="task-empty__desc">点击右下角 + 开始创建第一个任务吧</div>
              </div>
            ) : (
              homeFilteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleComplete={handleToggleTask}
                  onDelete={handleDeleteTask}
                />
              ))
            )}
          </div>
        </div>
      );
    } else if (activeTabKey === 'task') {
      // 我的待办：按日期分组显示所有任务
      return (
        <div className="home-body">
          <TaskListGrouped
            tasks={allTasksFiltered}
            categoryTabs={categoryTabs}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            onToggleComplete={handleToggleTask}
            onDelete={handleDeleteTask}
          />
        </div>
      );
    } else {
      // 其他 tab（消息、个人中心）显示占位符
      return (
        <div className="home-body home-body--placeholder">
          <div className="tab-placeholder">
            <div className="tab-placeholder__icon">
              {activeTabKey === 'message' ? <MessageOutline /> : <UserOutline />}
            </div>
            <div className="tab-placeholder__title">
              {activeTabKey === 'message' ? '我的消息' : '个人中心'}
            </div>
            <div className="tab-placeholder__desc">功能开发中...</div>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="home-page">
      <div className="home-header">
        <div className="home-header__info">
          <div className="home-header__title">
            {activeTabKey === 'home' ? '今日待办' : activeTabKey === 'task' ? '我的待办' : '首页'}
          </div>
          <div className="home-header__subtitle">
            {activeTabKey === 'home' && (
              <>
                {today} · 还有 {unfinishedCount} 个任务待完成
              </>
            )}
            {activeTabKey === 'task' && (
              <>
                共 {tasks.length} 个任务 · 还有 {unfinishedCount} 个待完成
              </>
            )}
          </div>
        </div>
        {(activeTabKey === 'home' || activeTabKey === 'task') && (
          <button
            type="button"
            className="home-header__filter"
            onClick={() => setFilterVisible(true)}
          >
            <FilterOutline fontSize={20} />
          </button>
        )}
      </div>

      {renderContent()}

      <TaskFilterSheet
        visible={filterVisible}
        onClose={() => setFilterVisible(false)}
        categoryOptions={categoryTabs}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
        priorityOptions={PRIORITY_OPTIONS}
        selectedPriority={selectedPriority}
        onPrioritySelect={setSelectedPriority}
        onReset={() => {
          setSelectedCategory('all');
          setSelectedPriority('all');
        }}
      />

      <div className="fab-button" onClick={() => setShowTaskPopup(true)}>
        <AddOutline fontSize={28} />
      </div>

      <Popup
        visible={showTaskPopup}
        onMaskClick={() => setShowTaskPopup(false)}
        position="bottom"
        bodyStyle={{
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
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
              priority: ['medium'],
              category: ['work'],
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
                  { label: '高优先级', value: 'high' },
                  { label: '中优先级', value: 'medium' },
                  { label: '低优先级', value: 'low' },
                ]}
                multiple={false}
                columns={3}
              />
            </Form.Item>

            <Form.Item name="category" label="分类" className="selector-field">
              <Selector
                options={Object.entries(TASK_CATEGORY_LABELS).map(([value, label]) => ({
                  label,
                  value,
                }))}
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
                        {formatPickerDisplay(value)}
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
        activeKey={activeTabKey}
        onChange={setActiveTabKey}
        className="home-tab-bar"
        safeArea
      >
        {bottomTabs.map((item) => (
          <TabBar.Item key={item.key} title={item.title} icon={item.icon} />
        ))}
      </TabBar>
    </div>
  );
};

export default Home;
