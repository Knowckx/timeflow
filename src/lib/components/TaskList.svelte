<!-- TaskList.svelte - 任务列表组件 -->
<script lang="ts">
    import { taskStore } from "$lib/stores/taskStore.svelte";
    import { formatDate, isSameDay } from "$lib/utils/time";
    import TaskItem from "./TaskItem.svelte";

    // 按日期分组任务
    function groupTasksByDate(tasks: typeof taskStore.tasks) {
        const groups: Map<string, typeof tasks> = new Map();

        for (const task of tasks) {
            const dateKey = formatDate(task.startTime);
            if (!groups.has(dateKey)) {
                groups.set(dateKey, []);
            }
            groups.get(dateKey)!.push(task);
        }

        return groups;
    }

    // 判断是否是今天
    function isToday(dateStr: string): boolean {
        const todayStr = formatDate(new Date());
        return dateStr === todayStr;
    }
</script>

<div class="task-list">
    {#if taskStore.tasks.length === 0}
        <div class="empty-state">
            <div class="empty-icon">📝</div>
            <h3 class="empty-title">还没有任务</h3>
            <p class="empty-desc">点击右下角的 + 按钮开始记录你的工作</p>
        </div>
    {:else}
        {#each [...groupTasksByDate(taskStore.tasks).entries()] as [dateStr, tasks]}
            <div class="date-group">
                <div class="date-header">
                    <span class="date-text">{dateStr}</span>
                    {#if isToday(dateStr)}
                        <span class="today-badge">今天</span>
                    {/if}
                </div>

                <div class="tf-timeline">
                    {#each tasks as task (task.id)}
                        <TaskItem {task} />
                    {/each}
                </div>
            </div>
        {/each}
    {/if}
</div>

<style>
    .task-list {
        padding-bottom: 100px; /* 为 FAB 按钮留出空间 */
    }

    .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--tf-spacing-2xl);
        text-align: center;
        min-height: 50vh;
    }

    .empty-icon {
        font-size: 4rem;
        margin-bottom: var(--tf-spacing-lg);
    }

    .empty-title {
        font-size: 1.25rem;
        font-weight: 600;
        color: var(--tf-text);
        margin: 0 0 var(--tf-spacing-sm);
    }

    .empty-desc {
        font-size: 0.875rem;
        color: var(--tf-text-secondary);
        margin: 0;
    }

    .date-group {
        margin-bottom: var(--tf-spacing-xl);
    }

    .date-header {
        display: flex;
        align-items: center;
        gap: var(--tf-spacing-sm);
        margin-bottom: var(--tf-spacing-md);
        padding-left: var(--tf-spacing-md);
    }

    .date-text {
        font-size: 0.875rem;
        font-weight: 600;
        color: var(--tf-text-secondary);
    }

    .today-badge {
        background: var(--tf-primary-light);
        color: var(--tf-primary-dark);
        font-size: 0.75rem;
        font-weight: 500;
        padding: 2px 8px;
        border-radius: var(--tf-radius-full);
    }

    .tf-timeline {
        position: relative;
        padding-left: var(--tf-spacing-xl);
    }

    .tf-timeline::before {
        content: "";
        position: absolute;
        left: 11px;
        top: 10px;
        bottom: 10px;
        width: 2px;
        background: linear-gradient(
            to bottom,
            var(--tf-primary-light),
            var(--tf-border)
        );
    }
</style>
