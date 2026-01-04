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
  type Task,
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

// 将日期字符串（YYYY-MM-DD）转换为 Date 对象
const parseDateString = (dateString?: string): Date | undefined => {
  if (!dateString) return undefined;
  
  // 手动解析 YYYY-MM-DD 格式，避免时区问题
  const parts = dateString.split('-');
  if (parts.length !== 3) return undefined;
  
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 月份从 0 开始
  const day = parseInt(parts[2], 10);
  
  // 检查日期是否有效
  if (isNaN(year) || isNaN(month) || isNaN(day)) return undefined;
  
  const date = new Date(year, month, day);
  
  // 验证日期是否有效（防止无效日期如 2025-02-30）
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day
  ) {
    return undefined;
  }
  
  return date;
};

const HomePage = () => {
  const [showTaskPopup, setShowTaskPopup] = useState(false);
  const [form] = Form.useForm();
  const [deadlinePickerVisible, setDeadlinePickerVisible] = useState(false);
  const [filterVisible, setFilterVisible] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  
  const {
    tasks,
    selectedCategory,
    setSelectedCategory,
    selectedPriority,
    setSelectedPriority,
    toggleTaskComplete,
    deleteTask,
    addTask,
    updateTask,
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

  // 处理编辑任务
  const handleEdit = (task: Task) => {
    // 将任务数据填充到表单
    form.setFieldsValue({
      title: task.title,
      description: task.description || '',
      category: [task.category],
      priority: [task.priority],
      deadline: parseDateString(task.dueDate) || new Date(),
    });
    
    // 设置编辑模式
    setEditingTaskId(task.id);
    // 打开弹窗
    setShowTaskPopup(true);
  };

  const handleSubmit = async () => {
    try {
      // 验证表单
      const values = await form.validateFields();

      console.log('values', values);
      
      
      // 如果用户没有选择日期，默认使用今天的日期
      const dueDate = values.deadline 
        ? formatDateForStorage(values.deadline) 
        : getTodayDateString(); // 默认今天
      
      if (editingTaskId) {
        // 编辑模式：更新任务
        await updateTask(editingTaskId, {
          title: values.title,
          description: values.description ?? '',
          category: (values.category?.[0] ?? 'work') as any,
          priority: (values.priority?.[0] ?? 'medium') as any,
          dueDate: dueDate,
        });
      } else {
        // 新建模式：添加任务
        await addTask({
          title: values.title,
          description: values.description ?? '',
          category: (values.category?.[0] ?? 'work') as any,
          priority: (values.priority?.[0] ?? 'medium') as any,
          dueDate: dueDate, // 确保总是有日期
          completed: false, // 确保默认为未完成
        });
      }

      setShowTaskPopup(false);
      setEditingTaskId(null);
      form.resetFields();
    } catch (error) {
      // 表单验证失败，不执行提交
      console.log('表单验证失败:', error);
    }
  };

  const handleCancel = () => {
    setShowTaskPopup(false);
    setEditingTaskId(null);
    form.resetFields();
    // 清除日期字段（重置时不保留日期）
    form.setFieldValue('deadline', undefined);
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
                onEdit={handleEdit}
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

      <div 
        className="fab-button" 
        onClick={() => {
          // 打开弹窗时，重置表单并设置默认日期为今天
          setEditingTaskId(null);
          form.resetFields();
          form.setFieldValue('deadline', new Date());
          setShowTaskPopup(true);
        }}
      >
        <AddOutline fontSize={28} />
      </div>

      <Popup
        visible={showTaskPopup}
        onMaskClick={handleCancel}
        position="bottom"
        bodyStyle={{
          borderTopLeftRadius: '16px',
          borderTopRightRadius: '16px',
          minHeight: '60vh',
        }}
      >
        <div className="task-popup">
          <div className="task-popup-header">
            <h2>{editingTaskId ? '编辑任务' : '新建任务'}</h2>
            <div className="close-btn" onClick={handleCancel}>
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
              deadline: new Date(), // 默认今天
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

            <Form.Item name="deadline" label="截止日期" className="date-field">
              <Form.Item noStyle shouldUpdate>
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

