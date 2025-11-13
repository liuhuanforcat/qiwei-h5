import { useMemo, useState } from 'react';
import { Button, Form, Input, DatePicker, TextArea, Selector, Popup } from 'antd-mobile';
import { AddOutline, FilterOutline, CalendarOutline } from 'antd-mobile-icons';
import { useTaskContext } from '../../context/TaskContext';
import {
  TaskCard,
  TaskCategoryTabs,
  TaskFilterSheet,
  type TaskCategoryTab,
  type TaskFilterOption,
  TASK_CATEGORY_LABELS,
} from '@/components/task';
import './index.less';

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

const getTodayDateString = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const HomePage = () => {
  const [showTaskPopup, setShowTaskPopup] = useState(false);
  const [form] = Form.useForm();
  const [deadlinePickerVisible, setDeadlinePickerVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  
  const {
    tasks,
    selectedCategory,
    setSelectedCategory,
    selectedPriority,
    setSelectedPriority,
    toggleTaskComplete,
    deleteTask,
    addTask,
  } = useTaskContext();

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

  const categoryTabs = useMemo<TaskCategoryTab[]>(() => {
    return CATEGORY_DEFINITIONS.map((item) => ({
      ...item,
      count:
        item.key === 'all'
          ? todayTasks.length
          : todayTasks.filter((task) => task.category === item.key).length,
    }));
  }, [todayTasks]);

  const unfinishedCount = useMemo(() => {
    return todayTasks.filter((task) => !task.completed).length;
  }, [todayTasks]);

  const handleSubmit = () => {
    const values = form.getFieldsValue();
    addTask({
      title: values.title,
      description: values.description ?? '',
      category: (values.category?.[0] ?? 'work') as any,
      priority: (values.priority?.[0] ?? 'medium') as any,
      dueDate: formatDateForStorage(values.deadline ?? null),
    });

    setShowTaskPopup(false);
    form.resetFields();
  };

  const handleCancel = () => {
    setShowTaskPopup(false);
    form.resetFields();
  };

  return (
    <div className="home-page">
      <div className="home-header">
        <div className="home-header__info">
          <div className="home-header__title">今日待办</div>
          <div className="home-header__subtitle">
            {today} · 还有 {unfinishedCount} 个任务待完成
          </div>
        </div>
        <button
          type="button"
          className="home-header__filter"
          onClick={() => setFilterVisible(true)}
        >
          <FilterOutline fontSize={20} />
        </button>
      </div>

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
                onToggleComplete={toggleTaskComplete}
                onDelete={deleteTask}
              />
            ))
          )}
        </div>
      </div>

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
    </div>
  );
};

export default HomePage;

