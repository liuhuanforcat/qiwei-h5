# 页面组件结构说明

本项目按照底部导航栏的4个Tab进行组件分类抽离，结构清晰、易于维护。

## 📁 目录结构

```
src/
├── components/          # 全局共享组件
│   ├── TabLayout/      # 底部导航布局
│   └── task/           # 任务相关共享组件 ⭐
│       ├── task-card/          # 任务卡片（home、todo 使用）
│       ├── task-category-tabs/ # 分类标签（home、todo 使用）
│       ├── task-filter-sheet/  # 筛选面板（home、todo 使用）
│       ├── task-tag/           # 任务标签（多页面共享）
│       ├── index.ts
│       ├── types.ts
│       └── README.md
│
└── view/               # 页面组件
    ├── home/          # 🏠 首页（今日待办）
    │   ├── components/    # 首页专属组件
    │   │   └── index.ts
    │   ├── index.tsx
    │   └── index.less
    │
    ├── todo/          # 📝 我的待办
    │   ├── components/             # 待办页专属组件
    │   │   ├── task-list-grouped/  # 分组任务列表
    │   │   └── index.ts
    │   ├── index.tsx
    │   └── index.less
    │
    ├── message/       # 💬 我的消息
    │   ├── components/             # 消息页专属组件
    │   │   ├── task-overdue-list/  # 逾期任务列表
    │   │   └── index.ts
    │   ├── index.tsx
    │   └── index.less
    │
    ├── profile/       # 👤 个人中心
    │   ├── components/             # 个人中心专属组件
    │   │   ├── profile-overview/   # 个人概览
    │   │   └── index.ts
    │   ├── index.tsx
    │   └── index.less
    │
    ├── login/         # 登录页
    └── 404/           # 404页面
```

## 📱 4个Tab页面

### 1. 🏠 首页 (`/home`)
- **功能**：展示今日待办任务
- **主要特性**：
  - 今日任务列表
  - 任务分类筛选
  - 优先级筛选
  - 快速创建任务
  - 任务统计信息
- **使用组件**：TaskCard, TaskCategoryTabs, TaskFilterSheet

### 2. 📝 我的待办 (`/todo`)
- **功能**：展示所有待办任务
- **主要特性**：
  - 全部任务列表
  - 分组展示（按日期）
  - 分类和优先级筛选
  - 任务完成度统计
- **专属组件**：TaskListGrouped
- **使用组件**：TaskFilterSheet, TaskCard, TaskCategoryTabs

### 3. 💬 我的消息 (`/message`)
- **功能**：展示逾期任务提醒
- **主要特性**：
  - 逾期任务列表
  - 任务提醒通知
  - 快速跳转到待办页
- **专属组件**：
  - `TaskOverdueList` - 逾期任务列表

### 4. 👤 个人中心 (`/profile`)
- **功能**：用户信息和数据统计
- **主要特性**：
  - 任务完成率统计
  - 任务数据概览
  - 清除已完成任务
- **专属组件**：
  - `ProfileOverview` - 个人概览面板

## 🎯 组件使用规范

### 共享组件导入
所有任务相关的共享组件从 `@/components/task` 导入：

```typescript
// 共享组件（被多个页面使用）
import {
  TaskCard,           // 任务卡片（home、todo 使用）
  TaskCategoryTabs,   // 分类标签（home、todo 使用）
  TaskFilterSheet,    // 筛选面板（home、todo 使用）
  TaskTag,            // 任务标签
  type Task,
  type TaskCategoryTab,
  type TaskFilterOption,
} from '@/components/task';
```

### 页面专属组件导入
每个页面的专属组件放在该页面的 `components` 目录下，从相对路径导入：

```typescript
// 待办页专属组件
import { TaskListGrouped } from './components';

// 消息页专属组件
import { TaskOverdueList } from './components';

// 个人中心专属组件
import { ProfileOverview } from './components';
```

## 🔄 组件分类原则

### ✅ 共享组件 (`src/components/task/`)
- 在多个页面中使用
- 功能通用、可复用
- 不包含页面特定的业务逻辑
- **当前共享组件**：
  - `TaskCard` - 任务卡片（home、todo 使用）
  - `TaskCategoryTabs` - 分类标签（home、todo 使用）
  - `TaskFilterSheet` - 筛选面板（home、todo 使用）
  - `TaskTag` - 任务标签（在 TaskCard 中使用）
  - `types.ts` - 类型定义（所有页面使用）

### ✅ 页面专属组件 (`src/view/[page]/components/`)
- 仅在单个页面中使用
- 包含页面特定的业务逻辑
- 与页面紧密耦合
- **当前专属组件**：
  - `TaskListGrouped` - 分组任务列表（仅 todo 使用）
  - `TaskOverdueList` - 逾期任务列表（仅 message 使用）
  - `ProfileOverview` - 个人概览（仅 profile 使用）

## 🚀 优势

1. **清晰的组件边界**：共享组件和专属组件分离
2. **统一的导入路径**：使用 `@` 别名，避免相对路径混乱
3. **易于维护**：组件职责明确，便于定位和修改
4. **可扩展性强**：新增页面或组件遵循统一规范
5. **Tree-shaking 友好**：模块化导出，打包优化

## 📝 开发建议

1. **新增组件时**：
   - 先确定是共享组件还是页面专属组件
   - 共享组件放在 `src/components/task/`
   - 专属组件放在对应页面的 `components/` 目录

2. **重构组件时**：
   - 如果组件被多个页面使用，提升为共享组件
   - 如果组件只在一个页面使用，降级为专属组件

3. **命名规范**：
   - 组件名使用 PascalCase
   - 目录名使用 kebab-case
   - 保持命名语义化

4. **组件设计**：
   - 单一职责原则
   - Props 类型定义完整
   - 添加必要的注释

