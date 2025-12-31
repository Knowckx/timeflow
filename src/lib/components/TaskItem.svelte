<!-- TaskItem.svelte - 任务卡片组件 -->
<script lang="ts">
    import type { Task, WorkSession } from "$lib/types/task";
    import {
        taskStore,
        calculateTaskDuration,
    } from "$lib/stores/taskStore.svelte";
    import { formatTime, formatDurationReadable } from "$lib/utils/time";
    import CheckpointItem from "./CheckpointItem.svelte";
    import ConfirmDialog from "./ConfirmDialog.svelte";
    import infa from "infa-s5";

    interface Props {
        task: Task;
    }

    let { task }: Props = $props();

    let showCheckpointInput = $state(false);
    let checkpointNote = $state("");
    let checkpointInputRef: HTMLInputElement | undefined = $state();
    let showSessions = $state(false);
    let showConfirmDialog = $state(false);

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
        const { discarded } = taskStore.pauseTask(task.id);
        if (discarded) {
            infa.Tip.info("时段太短，已忽略");
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
        setTimeout(() => checkpointInputRef?.focus(), 50);
    }

    function handleSubmitCheckpoint() {
        const trimmed = checkpointNote.trim();
        if (!trimmed) return;

        taskStore.addCheckpoint(task.id, { note: trimmed });
        checkpointNote = "";
        showCheckpointInput = false;
    }

    function handleCheckpointKeydown(e: KeyboardEvent) {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSubmitCheckpoint();
        }
        if (e.key === "Escape") {
            showCheckpointInput = false;
            checkpointNote = "";
        }
    }

    function handleDeleteCheckpoint(checkpointId: string) {
        taskStore.deleteCheckpoint(task.id, checkpointId);
    }

    function handleDeleteTask() {
        taskStore.deleteTask(task.id);
    }

    function toggleSessions() {
        showSessions = !showSessions;
    }

    function formatSessionDuration(session: WorkSession): string {
        if (!session.endTime) return "进行中";
        const ms = session.endTime.getTime() - session.startTime.getTime();
        const minutes = Math.floor(ms / (1000 * 60));
        if (minutes < 1) return "不到1分钟";
        if (minutes < 60) return `${minutes}分钟`;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0
            ? `${hours}小时${remainingMinutes}分钟`
            : `${hours}小时`;
    }
</script>

<div class="task-item tf-card" class:completed={task.status === "completed"}>
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
                <div
                    class="task-title"
                    class:completed={task.status === "completed"}
                >
                    {task.title}
                </div>
                <span class="tf-badge {statusClass}">{statusText}</span>
            </div>
            <div class="task-time-info">
                <span class="tf-time">{formatTime(task.createdAt)}</span>
                {#if task.status === "completed" && task.completedAt}
                    <span class="time-arrow">→</span>
                    <span class="tf-time">{formatTime(task.completedAt)}</span>
                {/if}
                {#if formattedDuration}
                    <span class="duration-badge">用时 {formattedDuration}</span>
                {/if}
            </div>
        </div>

        <div class="task-actions">
            {#if task.status === "pending"}
                <button
                    class="action-btn action-btn-start"
                    onclick={handleStart}
                    title="开始任务"
                >
                    ▶ 开始
                </button>
            {:else if task.status === "active"}
                <button
                    class="action-btn"
                    onclick={handleAddCheckpoint}
                    title="添加记录点"
                >
                    📝
                </button>
                <button
                    class="action-btn action-btn-pause"
                    onclick={handlePause}
                    title="暂停任务"
                >
                    ⏸ 暂停
                </button>
                <button
                    class="action-btn action-btn-complete"
                    onclick={handleComplete}
                    title="完成任务"
                >
                    ✓ 完成
                </button>
            {:else if task.status === "paused"}
                <button
                    class="action-btn action-btn-start"
                    onclick={handleResume}
                    title="继续任务"
                >
                    ▶ 继续
                </button>
                <button
                    class="action-btn action-btn-complete"
                    onclick={handleComplete}
                    title="完成任务"
                >
                    ✓ 完成
                </button>
            {/if}
            <button
                class="action-btn action-btn-delete"
                onclick={handleDeleteTask}
                title="删除任务"
            >
                🗑
            </button>
        </div>
    </div>

    <!-- 工作时段列表 -->
    {#if task.sessions.length > 0}
        <button class="sessions-toggle" onclick={toggleSessions}>
            {showSessions ? "▼" : "▶"}
            {task.sessions.length} 个工作时段
        </button>

        {#if showSessions}
            <div class="sessions-list">
                {#each task.sessions as session, i}
                    <div class="session-item">
                        <span class="session-label">时段 {i + 1}</span>
                        <span class="session-time">
                            {formatTime(session.startTime)}
                            {#if session.endTime}
                                → {formatTime(session.endTime)}
                            {/if}
                        </span>
                        <span class="session-duration"
                            >{formatSessionDuration(session)}</span
                        >
                    </div>
                {/each}
            </div>
        {/if}
    {/if}

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

    <!-- Checkpoint 输入 -->
    {#if showCheckpointInput}
        <div class="checkpoint-input-wrapper">
            <input
                bind:this={checkpointInputRef}
                bind:value={checkpointNote}
                onkeydown={handleCheckpointKeydown}
                class="checkpoint-input"
                placeholder="记录当前进度..."
            />
            <button class="checkpoint-submit" onclick={handleSubmitCheckpoint}>
                添加
            </button>
        </div>
    {/if}
</div>

<!-- 确认弹窗 -->
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
    }

    .task-item.completed {
        opacity: 0.7;
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

    .task-title {
        font-size: 1rem;
        font-weight: 500;
        color: var(--tf-text);
        word-break: break-word;
    }

    .task-title.completed {
        text-decoration: line-through;
        color: var(--tf-text-secondary);
    }

    .task-time-info {
        display: flex;
        align-items: center;
        gap: var(--tf-spacing-sm);
        flex-wrap: wrap;
        margin-top: var(--tf-spacing-xs);
    }

    .time-arrow {
        color: var(--tf-text-muted);
        font-size: 0.875rem;
    }

    .duration-badge {
        background: var(--tf-bg-secondary);
        color: var(--tf-text-secondary);
        font-size: 0.75rem;
        padding: 2px 8px;
        border-radius: var(--tf-radius-sm);
    }

    .tf-badge {
        font-size: 0.7rem;
        padding: 2px 8px;
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

    .task-item:hover .task-actions {
        opacity: 1;
    }

    .action-btn {
        background: var(--tf-bg-secondary);
        border: none;
        border-radius: var(--tf-radius-md);
        padding: var(--tf-spacing-xs) var(--tf-spacing-sm);
        cursor: pointer;
        color: var(--tf-text-secondary);
        transition: all var(--tf-transition-fast);
        font-size: 0.75rem;
        white-space: nowrap;
    }

    .action-btn:hover {
        background: var(--tf-primary-light);
        color: var(--tf-primary-dark);
    }

    .action-btn-start {
        background: var(--tf-accent-green);
        color: #166534;
    }

    .action-btn-start:hover {
        background: #86efac;
    }

    .action-btn-pause {
        background: var(--tf-accent-yellow);
        color: #92400e;
    }

    .action-btn-pause:hover {
        background: #fde047;
    }

    .action-btn-complete {
        background: var(--tf-primary-light);
        color: var(--tf-primary-dark);
    }

    .action-btn-complete:hover {
        background: var(--tf-primary);
        color: white;
    }

    .action-btn-delete:hover {
        background: var(--tf-accent-pink);
        color: #9b2c2c;
    }

    .sessions-toggle {
        background: none;
        border: none;
        color: var(--tf-text-secondary);
        font-size: 0.75rem;
        cursor: pointer;
        padding: var(--tf-spacing-xs) 0;
        margin-top: var(--tf-spacing-sm);
    }

    .sessions-toggle:hover {
        color: var(--tf-primary);
    }

    .sessions-list {
        margin-top: var(--tf-spacing-xs);
        padding-left: var(--tf-spacing-md);
    }

    .session-item {
        display: flex;
        gap: var(--tf-spacing-sm);
        font-size: 0.75rem;
        color: var(--tf-text-secondary);
        padding: 2px 0;
    }

    .session-label {
        color: var(--tf-text-muted);
    }

    .session-time {
        color: var(--tf-text-secondary);
    }

    .session-duration {
        color: var(--tf-primary);
        font-weight: 500;
    }

    .tf-timeline-dot.active {
        background: var(--tf-accent-green);
        box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.2);
    }

    .tf-timeline-dot.paused {
        background: var(--tf-accent-yellow);
        box-shadow: 0 0 0 4px rgba(234, 179, 8, 0.2);
    }

    .tf-checkpoint {
        margin-top: var(--tf-spacing-md);
        padding-left: var(--tf-spacing-xl);
        border-left: 2px dashed var(--tf-border);
        margin-left: 10px;
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
        font-size: 0.875rem;
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
        font-size: 0.875rem;
        cursor: pointer;
        transition: background var(--tf-transition-fast);
    }

    .checkpoint-submit:hover {
        background: var(--tf-primary-dark);
    }
</style>
