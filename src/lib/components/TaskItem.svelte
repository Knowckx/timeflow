<!-- TaskItem.svelte - 任务卡片组件 -->
<script lang="ts">
    import type { Task } from "$lib/types/task";
    import {
        taskStore,
        calculateTaskDuration,
    } from "$lib/stores/taskStore.svelte";
    import { formatTime, formatDurationReadable } from "$lib/utils/time";
    import CheckpointItem from "./CheckpointItem.svelte";
    import SessionList from "./SessionList.svelte";
    import ConfirmDialog from "./ConfirmDialog.svelte";
    import infa from "infa-s5";

    interface Props {
        task: Task;
    }

    let { task }: Props = $props();

    let showCheckpointInput = $state(false);
    let checkpointNote = $state("");
    let showConfirmDialog = $state(false);

    // 卡片展开状态（简单的布尔值）
    let isExpanded = $state(false);

    // 是否处于悬浮状态
    const isHovered = $derived(taskStore.hoveredTaskId === task.id);
    // 是否处于选中状态
    const isSelected = $derived(taskStore.selectedTaskId === task.id);

    // 当选中状态变化时，自动设置展开状态
    $effect(() => {
        if (isSelected) {
            isExpanded = true;
        } else {
            // 只有未选中且任务是 pending/completed 时才收拢
            if (task.status === "pending" || task.status === "completed") {
                isExpanded = false;
            }
        }
    });

    // 进行中或已暂停的任务始终展开
    $effect(() => {
        if (task.status === "active" || task.status === "paused") {
            isExpanded = true;
        }
    });

    // 响应全局快捷键：显示 Checkpoint 输入框
    $effect(() => {
        const signal = taskStore.checkpointFocusSignal;
        if (signal && signal.taskId === task.id) {
            showCheckpointInput = true;
            // 因为 infa.Input 设置了 autoFocus={true}，这里只需负责展开即可
        }
    });

    // 状态显示文字
    const statusText = $derived.by(() => {
        switch (task.status) {
            case "pending":
                return "待开始";
            case "active":
                return "进行中";
            case "paused":
                return "已暂停";
            case "completed":
                return "已完成";
        }
    });

    // 状态样式类
    const statusClass = $derived.by(() => {
        switch (task.status) {
            case "pending":
                return "status-pending";
            case "active":
                return "status-active";
            case "paused":
                return "status-paused";
            case "completed":
                return "status-completed";
        }
    });

    // 计算总用时
    const totalDuration = $derived(calculateTaskDuration(task));
    const formattedDuration = $derived.by(() => {
        if (totalDuration === 0) return null;
        const hours = Math.floor(totalDuration / (1000 * 60 * 60));
        const minutes = Math.floor(
            (totalDuration % (1000 * 60 * 60)) / (1000 * 60),
        );
        const parts: string[] = [];
        if (hours > 0) parts.push(`${hours}小时`);
        if (minutes > 0) parts.push(`${minutes}分钟`);
        return parts.join("") || "不到1分钟";
    });

    // 获取所有 Checkpoints（从所有时段合并）
    const allCheckpoints = $derived(
        task.sessions
            .flatMap((s) => s.checkpoints)
            .sort((a, b) => a.time.getTime() - b.time.getTime()),
    );

    function handleStart() {
        const activeTask = taskStore.getActiveTask();
        if (activeTask && activeTask.id !== task.id) {
            // 有其他任务正在进行，显示确认弹窗
            showConfirmDialog = true;
        } else {
            taskStore.startTask(task.id);
        }
    }

    function handleConfirmStart() {
        const activeTask = taskStore.getActiveTask();
        if (activeTask) {
            taskStore.pauseTask(activeTask.id);
        }
        taskStore.startTask(task.id);
        showConfirmDialog = false;
    }

    function handleCancelStart() {
        showConfirmDialog = false;
    }

    function handlePause() {
        const { discarded, durationSeconds } = taskStore.pauseTask(task.id);
        if (discarded) {
            infa.Tip.info(
                `仅记录了 ${durationSeconds} 秒，未达到 10 秒阈值，已忽略`,
            );
        }
    }

    function handleResume() {
        handleStart(); // 复用相同逻辑
    }

    function handleComplete() {
        taskStore.completeTask(task.id);
    }

    function handleAddCheckpoint() {
        showCheckpointInput = true;
    }

    function handleSubmitCheckpoint() {
        const trimmed = checkpointNote.trim();
        if (!trimmed) {
            // 空输入时按 Enter 等于关闭输入框
            showCheckpointInput = false;
            return;
        }

        taskStore.addCheckpoint(task.id, { note: trimmed });
        checkpointNote = "";
        showCheckpointInput = false;
    }

    function handleDeleteCheckpoint(checkpointId: string) {
        taskStore.deleteCheckpoint(task.id, checkpointId);
    }

    function handleDeleteTask() {
        taskStore.deleteTask(task.id);
    }
</script>

<div
    class="task-item tf-card"
    class:completed={task.status === "completed"}
    class:active={task.status === "active"}
    class:selected={isSelected}
    class:expanded={isExpanded}
    onmouseenter={() => taskStore.setHoveredTaskId(task.id)}
    onmouseleave={() => taskStore.setHoveredTaskId(null)}
    onclick={() => {
        if (isSelected) {
            // 已选中时，切换展开状态
            isExpanded = !isExpanded;
        } else {
            // 未选中时，选中该卡片
            taskStore.setSelectedTaskId(task.id);
        }
    }}
    onkeydown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
            if (isSelected) {
                isExpanded = !isExpanded;
            } else {
                taskStore.setSelectedTaskId(task.id);
            }
        }
    }}
    tabindex="0"
    role="button"
    aria-pressed={isSelected}
    aria-expanded={isExpanded}
>
    <!-- 时间线指示点 -->
    <div
        class="tf-timeline-dot"
        class:completed={task.status === "completed"}
        class:active={task.status === "active"}
        class:paused={task.status === "paused"}
    ></div>

    <!-- 任务头部 -->
    <div class="task-header">
        <div class="task-info">
            <div class="task-title-row">
                <span class="tf-time">{formatTime(task.createdAt)}</span>
                <div
                    class="task-title"
                    class:completed={task.status === "completed"}
                >
                    {task.title}
                </div>
                <span class="tf-badge {statusClass}">{statusText}</span>
                {#if formattedDuration}
                    <span class="duration-badge">用时 {formattedDuration}</span>
                {/if}
            </div>
        </div>

        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div class="task-actions" onclick={(e) => e.stopPropagation()}>
            {#if task.status === "pending"}
                <button
                    class="tf-btn tf-btn-success"
                    onclick={(e) => {
                        e.stopPropagation();
                        handleStart();
                    }}
                    title="开始任务"
                >
                    ▶ 开始
                </button>
            {:else if task.status === "active"}
                <button
                    class="tf-btn tf-btn-ghost"
                    onclick={(e) => {
                        e.stopPropagation();
                        handleAddCheckpoint();
                    }}
                    title="添加记录点"
                >
                    📝
                </button>
                <button
                    class="tf-btn tf-btn-warning"
                    onclick={(e) => {
                        e.stopPropagation();
                        handlePause();
                    }}
                    title="暂停任务"
                >
                    ⏸ 暂停
                </button>
                <button
                    class="tf-btn tf-btn-primary"
                    onclick={(e) => {
                        e.stopPropagation();
                        handleComplete();
                    }}
                    title="完成任务"
                >
                    ✓ 完成
                </button>
            {:else if task.status === "paused"}
                <button
                    class="tf-btn tf-btn-success"
                    onclick={(e) => {
                        e.stopPropagation();
                        handleResume();
                    }}
                    title="继续任务"
                >
                    ▶ 继续
                </button>
                <button
                    class="tf-btn tf-btn-primary"
                    onclick={(e) => {
                        e.stopPropagation();
                        handleComplete();
                    }}
                    title="完成任务"
                >
                    ✓ 完成
                </button>
            {/if}
            <button
                class="tf-btn tf-btn-danger"
                onclick={(e) => {
                    e.stopPropagation();
                    handleDeleteTask();
                }}
                title="删除任务"
            >
                <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                >
                    <path
                        d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"
                    />
                </svg>
            </button>
        </div>
    </div>

    <!-- 展开状态下显示的内容 -->
    {#if isExpanded}
        <!-- 工作时段列表 -->
        <SessionList sessions={task.sessions} taskId={task.id} />

        <!-- Checkpoints 列表 -->
        {#if allCheckpoints.length > 0}
            <div class="tf-checkpoint">
                {#each allCheckpoints as checkpoint (checkpoint.id)}
                    <CheckpointItem
                        {checkpoint}
                        onDelete={handleDeleteCheckpoint}
                    />
                {/each}
            </div>
        {/if}
    {/if}

    <!-- Checkpoint 输入 -->
    {#if showCheckpointInput}
        <div class="checkpoint-input-wrapper">
            <infa.Input
                bind:value={checkpointNote}
                onCommit={handleSubmitCheckpoint}
                onEscape={() => {
                    showCheckpointInput = false;
                }}
                placeholder="记录当前进度..."
                autoFocus={true}
            />
        </div>
    {/if}
</div>

<!-- 切换任务确认弹窗 -->
<ConfirmDialog
    open={showConfirmDialog}
    title="切换任务"
    message="当前有任务正在进行中，是否暂停当前任务并开始此任务？"
    confirmText="确认切换"
    cancelText="取消"
    onConfirm={handleConfirmStart}
    onCancel={handleCancelStart}
/>

<style>
    .task-item {
        position: relative;
        margin-bottom: var(--tf-spacing-md);
        transition: all var(--tf-transition-normal);
        border: 2px solid transparent;
    }

    .task-item.completed {
        opacity: 0.7;
    }

    /* 悬浮状态：轻微上浮 + 淡阴影 */
    .task-item:hover:not(.selected) {
        background: var(--tf-bg-card);
        box-shadow: 0 6px 20px rgba(126, 200, 227, 0.15);
        transform: translateY(-2px);
    }

    /* 选中状态：主题色边框 + 强阴影 + 明显上浮 */
    .task-item.selected {
        background: var(--tf-bg-card);
        border-color: var(--tf-primary);
        box-shadow:
            0 8px 28px rgba(126, 200, 227, 0.3),
            0 4px 12px rgba(0, 0, 0, 0.08);
        transform: translateY(-4px);
    }

    .task-header {
        display: flex;
        align-items: flex-start;
        gap: var(--tf-spacing-md);
    }

    .task-info {
        flex: 1;
        min-width: 0;
    }

    .task-title-row {
        display: flex;
        align-items: center;
        gap: var(--tf-spacing-sm);
        flex-wrap: wrap;
    }

    .task-title-row .tf-time {
        flex-shrink: 0;
        font-size: 1rem;
    }

    .task-title {
        font-size: 1.15rem;
        font-weight: 600;
        color: var(--tf-text);
        word-break: break-word;
    }

    .task-title.completed {
        text-decoration: line-through;
        color: var(--tf-text-secondary);
    }

    .duration-badge {
        background: var(--tf-bg-secondary);
        color: var(--tf-text-secondary);
        font-size: 1rem;
        padding: 4px 10px;
        border-radius: var(--tf-radius-sm);
    }

    .tf-badge {
        font-size: 1rem;
        padding: 4px 10px;
        border-radius: var(--tf-radius-full);
        font-weight: 500;
    }

    .status-pending {
        background: var(--tf-bg-secondary);
        color: var(--tf-text-secondary);
    }

    .status-active {
        background: var(--tf-accent-green);
        color: #166534;
    }

    .status-paused {
        background: var(--tf-accent-yellow);
        color: #92400e;
    }

    .status-completed {
        background: var(--tf-primary-light);
        color: var(--tf-primary-dark);
    }

    .task-actions {
        display: flex;
        gap: var(--tf-spacing-xs);
        opacity: 0;
        transition: opacity var(--tf-transition-fast);
        flex-wrap: wrap;
    }

    /* 悬浮或选中时显示操作按钮 */
    .task-item:hover .task-actions,
    .task-item.selected .task-actions {
        opacity: 1;
    }

    /* 进行中任务的特殊样式 */
    .task-item.active {
        border-color: var(--tf-accent-green);
        box-shadow:
            0 0 0 1px rgba(34, 197, 94, 0.3),
            0 4px 16px rgba(34, 197, 94, 0.15);
        animation: active-glow 2s ease-in-out infinite;
    }

    @keyframes active-glow {
        0%,
        100% {
            box-shadow:
                0 0 0 1px rgba(34, 197, 94, 0.3),
                0 4px 16px rgba(34, 197, 94, 0.15);
        }
        50% {
            box-shadow:
                0 0 0 2px rgba(34, 197, 94, 0.4),
                0 4px 20px rgba(34, 197, 94, 0.25);
        }
    }

    .tf-timeline-dot.active {
        background: var(--tf-accent-green);
        box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.2);
        animation: dot-pulse 1.5s ease-in-out infinite;
    }

    @keyframes dot-pulse {
        0%,
        100% {
            transform: scale(1);
            box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.2);
        }
        50% {
            transform: scale(1.15);
            box-shadow: 0 0 0 6px rgba(34, 197, 94, 0.3);
        }
    }

    .tf-timeline-dot.paused {
        background: var(--tf-accent-yellow);
        box-shadow: 0 0 0 4px rgba(234, 179, 8, 0.2);
    }

    .tf-checkpoint {
        margin-top: 4px;
        padding-left: 0;
        border-left: none;
        margin-left: 0;
    }

    .checkpoint-input-wrapper {
        display: flex;
        gap: var(--tf-spacing-sm);
        margin-top: var(--tf-spacing-md);
        padding-left: var(--tf-spacing-xl);
    }

    .checkpoint-input {
        flex: 1;
        padding: var(--tf-spacing-sm) var(--tf-spacing-md);
        border: 2px solid var(--tf-border);
        border-radius: var(--tf-radius-md);
        font-size: 1rem;
        outline: none;
        transition: border-color var(--tf-transition-fast);
    }

    .checkpoint-input:focus {
        border-color: var(--tf-primary);
    }

    .checkpoint-submit {
        padding: var(--tf-spacing-sm) var(--tf-spacing-md);
        background: var(--tf-primary);
        color: white;
        border: none;
        border-radius: var(--tf-radius-md);
        font-size: 1rem;
        cursor: pointer;
        transition: background var(--tf-transition-fast);
    }

    .checkpoint-submit:hover {
        background: var(--tf-primary-dark);
    }
</style>
