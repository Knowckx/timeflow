# TimeFlow 项目代码结构

> 此文件由 AI 维护，记录项目代码文件和说明

## 项目概述

TimeFlow 是一个时间记录应用，用于追踪用户工作时间花费。

**技术栈**: Svelte 5 / TypeScript / Vite / TailwindCSS / PWA

---

## 目录结构

```
src/
├── app.html              # HTML 模板
├── app.d.ts              # 全局类型声明
├── lib/                  # 核心库
│   ├── components/       # UI 组件
│   ├── stores/           # 状态管理
│   ├── styles/           # 样式文件
│   ├── types/            # 类型定义
│   └── utils/            # 工具函数
└── routes/               # 页面路由
```

---

## 核心数据模型

```typescript
type TaskStatus = 'pending' | 'active' | 'paused' | 'completed';

interface Task {
    id: string;
    title: string;
    status: TaskStatus;
    createdAt: Date;
    completedAt?: Date;
    sessions: WorkSession[];
}

interface WorkSession {
    id: string;
    startTime: Date;
    endTime?: Date;
    checkpoints: Checkpoint[];
}
```

---

## 核心文件说明

### 状态管理 (`src/lib/stores/`)

| 文件 | 说明 |
|------|------|
| `taskStore.svelte.ts` | 任务状态管理，使用 Svelte 5 runes。包含 `startTask`/`pauseTask`/`resumeTask`/`completeTask` 方法，localStorage 持久化 |

### 工具函数 (`src/lib/utils/`)

| 文件 | 说明 |
|------|------|
| `time.ts` | 时间格式化、日期操作（`formatDate`, `isSameDay`, `addDays`, `isToday`） |
| `export.ts` | Markdown 导出（`exportToMarkdown`, `copyToClipboard`） |

### 配置 (`src/lib/`)

| 文件 | 说明 |
|------|------|
| `config.ts` | 全局配置（`MIN_SESSION_DURATION_MS` 最短时段阈值 10秒） |

### UI 组件 (`src/lib/components/`)

| 文件 | 说明 |
|------|------|
| `TaskList.svelte` | 任务列表，按选中日期筛选 |
| `TaskItem.svelte` | 任务卡片，状态按钮（开始/暂停/继续/完成）、工作时段展示 |
| `TaskInput.svelte` | FAB 悬浮按钮 + 展开式输入框 |
| `CheckpointItem.svelte` | Checkpoint 条目 |
| `ConfirmDialog.svelte` | 确认弹窗组件 |

### 页面 (`src/routes/`)

| 文件 | 说明 |
|------|------|
| `+page.svelte` | 主页面，日期导航、任务统计、导出按钮 |

---

*最后更新: 2026-01-01*
