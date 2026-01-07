<!-- src\routes\+page.svelte -->
<!-- TimeFlow - 时间记录应用主页 -->
<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import "$lib/styles/theme.css";
    import {
        taskStore,
        calculateTaskDuration,
    } from "$lib/stores/taskStore.svelte";
    import type { Task } from "$lib/types/task";
    import TaskList from "$lib/components/TaskList.svelte";
    import TaskInput from "$lib/components/TaskInput.svelte";
    import ConfirmDialog from "$lib/components/ConfirmDialog.svelte";
    import ShortcutsHelp from "$lib/components/ShortcutsHelp.svelte";
    import { formatDate, isSameDay, isToday } from "$lib/utils/time";
    import { exportToMarkdown, copyToClipboard } from "$lib/utils/export";
    import infa from "infa-s5";

    let showExportToast = $state(false);
    let checkDateInterval: ReturnType<typeof setInterval> | null = null;
    let lastCheckedDate = new Date();

    // 快捷键帮助面板状态
    let showShortcutsHelp = $state(false);

    // 删除确认弹窗状态
    let showDeleteConfirm = $state(false);
    let taskToDelete = $state<Task | null>(null);
    let deleteConfirmMessage = $state("");

    /** 判断删除任务是否需要二次确认 */
    function shouldConfirmDelete(task: Task): boolean {
        // 有 Checkpoint
        const hasCheckpoints = task.sessions.some(
            (s) => s.checkpoints.length > 0,
        );
        // 总时长超过 5 分钟
        const totalMs = calculateTaskDuration(task);
        const hasSignificantTime = totalMs > 5 * 60 * 1000;
        return hasCheckpoints || hasSignificantTime;
    }

    /** 生成删除确认消息 */
    function getDeleteConfirmMessage(task: Task): string {
        const checkpointCount = task.sessions.reduce(
            (sum, s) => sum + s.checkpoints.length,
            0,
        );
        const totalMs = calculateTaskDuration(task);
        const minutes = Math.floor(totalMs / (1000 * 60));

        const parts: string[] = [];
        if (checkpointCount > 0) parts.push(`${checkpointCount} 个检查点`);
        if (minutes > 0) parts.push(`用时 ${minutes} 分钟`);

        return `此任务包含 ${parts.join("，")}，确定要删除吗？`;
    }

    /** 处理删除任务（带确认逻辑） */
    function handleDeleteTask(task: Task) {
        if (shouldConfirmDelete(task)) {
            taskToDelete = task;
            deleteConfirmMessage = getDeleteConfirmMessage(task);
            showDeleteConfirm = true;
        } else {
            taskStore.deleteTask(task.id);
            infa.Tip.success("已删除任务");
        }
    }

    /** 确认删除 */
    function confirmDelete() {
        if (taskToDelete) {
            taskStore.deleteTask(taskToDelete.id);
            infa.Tip.success("已删除任务");
        }
        showDeleteConfirm = false;
        taskToDelete = null;
    }

    /** 取消删除 */
    function cancelDelete() {
        showDeleteConfirm = false;
        taskToDelete = null;
    }

    onMount(() => {
        taskStore.init();

        // 每分钟检查是否跨日，跨日时自动切换到新的一天
        checkDateInterval = setInterval(() => {
            const now = new Date();
            if (!isSameDay(now, lastCheckedDate)) {
                // 跨日了，如果当前显示的是昨天（之前的"今天"），自动切换到新的今天
                if (isSameDay(taskStore.selectedDate, lastCheckedDate)) {
                    taskStore.resetToToday();
                }
                lastCheckedDate = now;
            }
        }, 60 * 1000); // 每分钟检查一次
    });

    onDestroy(() => {
        if (checkDateInterval) {
            clearInterval(checkDateInterval);
        }
    });

    /** 计算选中日期的总工作时长（毫秒） */
    const selectedDateTotalMs = $derived.by(() => {
        const selected = taskStore.selectedDate;
        return taskStore.tasks
            .filter((task) => {
                // 只统计该日期创建的已完成任务
                if (task.status !== "completed") return false;
                const taskDate = task.createdAt;
                return (
                    taskDate.getFullYear() === selected.getFullYear() &&
                    taskDate.getMonth() === selected.getMonth() &&
                    taskDate.getDate() === selected.getDate()
                );
            })
            .reduce((sum, task) => {
                // 累加所有时段的时长
                return (
                    sum +
                    task.sessions.reduce((sessionSum, session) => {
                        if (!session.endTime) return sessionSum;
                        return (
                            sessionSum +
                            (session.endTime.getTime() -
                                session.startTime.getTime())
                        );
                    }, 0)
                );
            }, 0);
    });

    /** 格式化总时长 */
    const formattedTotalTime = $derived.by(() => {
        if (selectedDateTotalMs === 0) return null;

        const hours = Math.floor(selectedDateTotalMs / (1000 * 60 * 60));
        const minutes = Math.floor(
            (selectedDateTotalMs % (1000 * 60 * 60)) / (1000 * 60),
        );

        const parts: string[] = [];
        if (hours > 0) parts.push(`${hours}小时`);
        if (minutes > 0) parts.push(`${minutes}分钟`);

        return parts.join("") || "不到1分钟";
    });

    /** 是否显示今天 */
    const isShowingToday = $derived(isToday(taskStore.selectedDate));

    async function handleExport() {
        const markdown = exportToMarkdown(taskStore.tasks);
        const success = await copyToClipboard(markdown);

        if (success) {
            infa.Tip.success("已复制到剪贴板！");
        } else {
            infa.Tip.error("复制失败，请手动复制");
            console.log(markdown);
        }
    }

    /** 辅助：暂停任务并提示结果 */
    function pauseAndNotify(taskId: string) {
        const { discarded, durationSeconds } = taskStore.pauseTask(taskId);
        if (discarded) {
            infa.Tip.info(
                `仅记录了 ${durationSeconds} 秒，未达到 10 秒阈值，已忽略`,
            );
        } else {
            infa.Tip.success("已暂停任务");
        }
    }

    /** 辅助：根据当前状态切换任务（开始/暂停） */
    function toggleTaskState(task: any) {
        if (task.status === "active") {
            pauseAndNotify(task.id);
        } else if (task.status === "pending" || task.status === "paused") {
            taskStore.startTask(task.id);
            infa.Tip.success("已开始/继续任务");
        }
    }

    /** 处理全局键盘事件 */
    function handleGlobalKeydown(e: KeyboardEvent) {
        // 如果焦点在输入框内，不处理
        const target = e.target as HTMLElement;
        if (
            target.tagName === "INPUT" ||
            target.tagName === "TEXTAREA" ||
            target.isContentEditable
        ) {
            return;
        }

        // 空格键：智能切换任务状态
        if (e.key === " " || e.code === "Space") {
            e.preventDefault();

            // 1. 优先处理被悬停的任务
            if (taskStore.hoveredTaskId) {
                const hoveredTask = taskStore.tasks.find(
                    (t) => t.id === taskStore.hoveredTaskId,
                );
                if (hoveredTask) {
                    toggleTaskState(hoveredTask);
                    return;
                }
            }

            // 2. 其次处理被选中的任务
            if (taskStore.selectedTaskId) {
                const selectedTask = taskStore.tasks.find(
                    (t) => t.id === taskStore.selectedTaskId,
                );
                if (selectedTask) {
                    toggleTaskState(selectedTask);
                    return;
                }
            }

            // 3. 没有悬停和选中时，如果当前有进行中的任务，则暂停它
            const activeTask = taskStore.getActiveTask();
            if (activeTask) {
                pauseAndNotify(activeTask.id);
                return;
            }

            // 4. 最后，开始当前视图（日期）下最后创建的一个未开始/已暂停任务
            const selected = taskStore.selectedDate;
            const currentViewTasks = taskStore.tasks.filter((t) => {
                const d = t.createdAt;
                return (
                    d.getFullYear() === selected.getFullYear() &&
                    d.getMonth() === selected.getMonth() &&
                    d.getDate() === selected.getDate()
                );
            });

            // 找到最后一个非已完成的任务（倒序找最新的）
            const latestTask = currentViewTasks.find(
                (t) => t.status === "pending" || t.status === "paused",
            );

            if (latestTask) {
                taskStore.startTask(latestTask.id);
                infa.Tip.success("已自动开始最新任务");
            }
        }

        // 处理回车键：快速添加 Checkpoint
        if (e.key === "Enter") {
            const activeTask = taskStore.getActiveTask();
            if (activeTask) {
                e.preventDefault();
                taskStore.triggerCheckpointFocus(activeTask.id);
            }
        }

        // Delete 或 Backspace 键：删除悬浮或选中的任务
        if (e.key === "Delete" || e.key === "Backspace") {
            // 1. 优先删除悬浮的任务
            if (taskStore.hoveredTaskId) {
                const hoveredTask = taskStore.tasks.find(
                    (t) => t.id === taskStore.hoveredTaskId,
                );
                if (hoveredTask) {
                    e.preventDefault();
                    handleDeleteTask(hoveredTask);
                    return;
                }
            }

            // 2. 其次删除选中的任务
            if (taskStore.selectedTaskId) {
                const selectedTask = taskStore.tasks.find(
                    (t) => t.id === taskStore.selectedTaskId,
                );
                if (selectedTask) {
                    e.preventDefault();
                    handleDeleteTask(selectedTask);
                    return;
                }
            }
        }

        // ? 键：打开快捷键帮助面板
        if (e.key === "?" || (e.shiftKey && e.key === "/")) {
            e.preventDefault();
            showShortcutsHelp = true;
        }
    }
</script>

<svelte:window onkeydown={handleGlobalKeydown} />

<svelte:head>
    <title>TimeFlow - 时间记录</title>
    <meta name="description" content="记录你的工作时间，追踪每一刻的效率" />
</svelte:head>

<div class="app-container">
    <!-- 头部 -->
    <header class="app-header">
        <div class="header-content">
            <div class="header-top">
                <h1 class="app-title">
                    <span class="title-icon">⏱️</span>
                    TimeFlow
                </h1>
                <div class="header-actions">
                    <button
                        class="help-btn"
                        onclick={() => (showShortcutsHelp = true)}
                        title="快捷键帮助"
                    >
                        <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                            <path d="M12 17h.01" />
                        </svg>
                    </button>
                    <button
                        class="export-btn"
                        onclick={handleExport}
                        title="导出今日记录为 Markdown"
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
                                d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"
                            />
                        </svg>
                        导出
                    </button>
                </div>
            </div>
            <div class="header-info">
                <div class="date-nav">
                    <button
                        class="date-nav-btn"
                        onclick={() => taskStore.goToPreviousDay()}
                        title="前一天"
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                        >
                            <path d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>
                    <div class="date-display">
                        <span class="app-subtitle"
                            >{formatDate(taskStore.selectedDate)}</span
                        >
                        {#if !isShowingToday}
                            <button
                                class="today-btn"
                                onclick={() => taskStore.resetToToday()}
                            >
                                回到今天
                            </button>
                        {/if}
                    </div>
                    <button
                        class="date-nav-btn"
                        onclick={() => taskStore.goToNextDay()}
                        title="后一天"
                    >
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                        >
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                    </button>
                </div>
                {#if formattedTotalTime}
                    <div class="total-time">
                        <span class="total-time-icon">🔥</span>
                        <span class="total-time-label"
                            >{isShowingToday ? "今日投入" : "当日投入"}</span
                        >
                        <span class="total-time-value"
                            >{formattedTotalTime}</span
                        >
                    </div>
                {/if}
            </div>
        </div>
    </header>

    <!-- 主内容区 -->
    <main class="app-main">
        {#if taskStore.initialized}
            <TaskList />
        {:else}
            <div class="loading">
                <div class="loading-spinner"></div>
                <p>加载中...</p>
            </div>
        {/if}
    </main>

    <!-- 任务输入 -->
    <TaskInput />
</div>

<!-- 删除确认弹窗 -->
<ConfirmDialog
    open={showDeleteConfirm}
    title="删除任务"
    message={deleteConfirmMessage}
    confirmText="确认删除"
    cancelText="取消"
    onConfirm={confirmDelete}
    onCancel={cancelDelete}
/>

<!-- 快捷键帮助面板 -->
<ShortcutsHelp
    open={showShortcutsHelp}
    onClose={() => (showShortcutsHelp = false)}
/>

<style>
    .app-container {
        min-height: 100vh;
        background: var(--tf-bg-secondary);
    }

    .app-header {
        background: var(--tf-bg);
        box-shadow: var(--tf-shadow-sm);
        position: sticky;
        top: 0;
        z-index: 50;
    }

    .header-content {
        max-width: 800px;
        margin: 0 auto;
        padding: var(--tf-spacing-lg) var(--tf-spacing-xl);
    }

    .app-title {
        display: flex;
        align-items: center;
        gap: var(--tf-spacing-sm);
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--tf-text);
        margin: 0;
    }

    .title-icon {
        font-size: 1.75rem;
    }

    .app-subtitle {
        font-size: 0.875rem;
        color: var(--tf-text-secondary);
        margin: var(--tf-spacing-xs) 0 0;
    }

    .header-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .header-actions {
        display: flex;
        align-items: center;
        gap: var(--tf-spacing-sm);
    }

    .help-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--tf-bg-secondary);
        color: var(--tf-text-secondary);
        border: 1px solid var(--tf-border);
        border-radius: var(--tf-radius-md);
        /* 方形按钮，宽高相等 */
        width: 38px;
        height: 38px;
        padding: 0;
        cursor: pointer;
        transition: all var(--tf-transition-fast);
    }

    .help-btn:hover {
        background: var(--tf-primary-light);
        color: var(--tf-primary-dark);
        border-color: var(--tf-primary);
        transform: translateY(-1px);
        box-shadow: var(--tf-shadow-sm);
    }

    .export-btn {
        display: flex;
        align-items: center;
        gap: var(--tf-spacing-xs);
        background: var(--tf-primary);
        color: white;
        border: none;
        border-radius: var(--tf-radius-md);
        padding: var(--tf-spacing-sm) var(--tf-spacing-md);
        font-weight: 600;
        cursor: pointer;
        transition: all var(--tf-transition-fast);
        box-shadow: var(--tf-shadow-btn-primary);
    }

    .export-btn:hover {
        background: var(--tf-primary-dark);
        transform: translateY(-1px);
        box-shadow: var(--tf-shadow-lg);
    }

    .header-info {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: var(--tf-spacing-sm);
        margin-top: var(--tf-spacing-sm);
    }

    .date-nav {
        display: flex;
        align-items: center;
        gap: var(--tf-spacing-xs);
    }

    .date-nav-btn {
        background: var(--tf-bg-card);
        border: 1px solid var(--tf-border);
        border-radius: var(--tf-radius-md);
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: var(--tf-text-secondary);
        transition: all var(--tf-transition-fast);
        box-shadow: var(--tf-shadow-sm);
    }

    .date-nav-btn:hover {
        border-color: var(--tf-primary);
        color: var(--tf-primary);
        transform: translateY(-1px);
        box-shadow: var(--tf-shadow-md);
    }

    .date-display {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 2px;
        min-width: 140px;
        text-align: center;
    }

    .date-display .app-subtitle {
        margin: 0;
    }

    .today-btn {
        background: var(--tf-accent-orange);
        color: #b7791f;
        border: none;
        border-radius: var(--tf-radius-full);
        padding: var(--tf-spacing-xs) var(--tf-spacing-md);
        font-size: 0.75rem;
        font-weight: 600;
        cursor: pointer;
        transition: all var(--tf-transition-fast);
        box-shadow: var(--tf-shadow-btn-warning);
    }

    .today-btn:hover {
        background: #fbd38d;
        transform: scale(1.05);
        box-shadow: 0 4px 12px rgba(251, 211, 141, 0.4);
    }

    .total-time {
        display: flex;
        align-items: center;
        gap: var(--tf-spacing-xs);
        background: linear-gradient(
            135deg,
            var(--tf-accent-orange),
            var(--tf-accent-yellow)
        );
        padding: var(--tf-spacing-xs) var(--tf-spacing-md);
        border-radius: var(--tf-radius-full);
        font-size: 0.8rem;
    }

    .total-time-icon {
        font-size: 0.9rem;
    }

    .total-time-label {
        color: #92400e;
        font-weight: 500;
    }

    .total-time-value {
        color: #78350f;
        font-weight: 700;
    }

    .app-main {
        max-width: 800px;
        margin: 0 auto;
        padding: var(--tf-spacing-lg) var(--tf-spacing-xl);
    }

    .loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--tf-spacing-2xl);
        color: var(--tf-text-secondary);
    }

    .loading-spinner {
        width: 32px;
        height: 32px;
        border: 3px solid var(--tf-border);
        border-top-color: var(--tf-primary);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin-bottom: var(--tf-spacing-md);
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
</style>
