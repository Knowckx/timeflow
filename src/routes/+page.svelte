<!-- src\routes\+page.svelte -->
<!-- TimeFlow - 时间记录应用主页 -->
<script lang="ts">
    import { onMount, onDestroy } from "svelte";
    import "$lib/styles/theme.css";
    import { taskStore } from "$lib/stores/taskStore.svelte";
    import TaskList from "$lib/components/TaskList.svelte";
    import TaskInput from "$lib/components/TaskInput.svelte";
    import { formatDate, isSameDay, isToday } from "$lib/utils/time";
    import { exportToMarkdown, copyToClipboard } from "$lib/utils/export";
    import infa from "infa-s5";

    let showExportToast = $state(false);
    let checkDateInterval: ReturnType<typeof setInterval> | null = null;
    let lastCheckedDate = new Date();

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

        // 空格键：切换当前任务状态（暂停/继续）
        if (e.key === " " || e.code === "Space") {
            e.preventDefault();
            const activeTask = taskStore.getActiveTask();
            if (activeTask) {
                // 有进行中的任务，暂停它
                const { discarded } = taskStore.pauseTask(activeTask.id);
                if (discarded) {
                    infa.Tip.info("时段太短，已忽略");
                } else {
                    infa.Tip.success("已暂停任务");
                }
            } else {
                // 没有进行中的任务，继续最近暂停的任务
                const pausedTask = taskStore.tasks.find(
                    (t) => t.status === "paused",
                );
                if (pausedTask) {
                    taskStore.startTask(pausedTask.id);
                    infa.Tip.success("已继续任务");
                }
            }
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
                                class="today-link"
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

    .export-btn {
        display: flex;
        align-items: center;
        gap: var(--tf-spacing-xs);
        padding: var(--tf-spacing-sm) var(--tf-spacing-md);
        background: var(--tf-primary-light);
        color: var(--tf-primary-dark);
        border: none;
        border-radius: var(--tf-radius-lg);
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all var(--tf-transition-fast);
    }

    .export-btn:hover {
        background: var(--tf-primary);
        color: white;
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
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        padding: 0;
        background: var(--tf-bg-secondary);
        border: 1px solid var(--tf-border);
        border-radius: var(--tf-radius-full);
        color: var(--tf-text-secondary);
        cursor: pointer;
        transition: all var(--tf-transition-fast);
    }

    .date-nav-btn:hover {
        background: var(--tf-primary-light);
        color: var(--tf-primary-dark);
        border-color: var(--tf-primary-light);
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

    .today-link {
        padding: 2px 8px;
        background: var(--tf-primary-light);
        color: var(--tf-primary);
        border: none;
        border-radius: var(--tf-radius-sm);
        font-size: 0.7rem;
        font-weight: 500;
        cursor: pointer;
        transition: all var(--tf-transition-fast);
    }

    .today-link:hover {
        background: var(--tf-primary);
        color: white;
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
