# Task 共享组件

此目录包含所有任务相关的共享组件，可在多个页面中复用。

## 📦 组件列表

### TaskCard
**任务卡片组件** - 展示单个任务的信息  
使用页面：首页、我的待办

### TaskCategoryTabs
**任务分类标签页组件** - 提供分类切换功能  
使用页面：首页、我的待办

### TaskFilterSheet
**任务筛选面板组件** - 提供分类和优先级筛选功能  
使用页面：首页、我的待办

### TaskTag
**任务标签组件** - 展示任务的优先级、分类等标签  
使用位置：在 TaskCard 组件中使用

### types.ts
**类型定义文件** - 包含所有任务相关的 TypeScript 类型定义  
使用范围：所有使用任务数据的页面和组件

## 🚀 使用方式

```typescript
import {
  TaskCard,
  TaskCategoryTabs,
  TaskTag,
  type Task,
  type TaskCategoryKey,
  type TaskCategoryTab,
  type TaskFilterOption,
  type TaskPriorityKey,
} from '@/components/task';
```

## 📝 组件分类说明

### ✅ 共享组件（保留在此目录）
被多个页面使用的通用组件：
- `TaskCard` - 任务卡片（home、todo 使用）
- `TaskCategoryTabs` - 分类标签（home、todo 使用）
- `TaskFilterSheet` - 筛选面板（home、todo 使用）
- `TaskTag` - 任务标签
- `types.ts` - 类型定义

### 📂 专属组件（已移至各页面）
为了更好的代码组织，以下组件已按 Tab 页面分类抽离：

| 组件 | 移至位置 | 使用页面 |
|------|---------|---------|
| `TaskListGrouped` | `view/todo/components` | 我的待办 |
| `TaskOverdueList` | `view/message/components` | 我的消息 |

## 🎯 设计原则

1. **单一职责**：每个组件只负责一个明确的功能
2. **高内聚低耦合**：组件内部逻辑紧密，对外依赖最小
3. **可复用性**：只有被多个页面使用的组件才放在此目录
4. **类型安全**：所有组件都有完整的 TypeScript 类型定义

## 📌 注意事项

- 所有共享组件统一从 `@/components/task` 导入
- 页面专属组件应放在各自页面的 `components` 目录下
- 如果组件只在一个页面使用，应该移至该页面的 `components` 目录
- 如果组件被多个页面使用，应该提升到此共享组件目录

