<script lang="ts">
    import type { Task } from "$lib/types/task";
    import { formatTime } from "$lib/utils/time";
    import TaskStatusBadge from "./TaskStatusBadge.svelte";

    interface Props {
        task: Task;
        statusText: string;
        statusClass: string;
        formattedDuration: string | null;
        isEditingTitle: boolean;
        editedTitle: string;
        onStart: () => void;
        onPause: () => void;
        onResume: () => void;
        onComplete: () => void;
        onAddCheckpoint: () => void;
        onDeleteTask: () => void;
        onStartTitleEdit: (e: MouseEvent) => void;
        onSaveTitle: () => void;
        onKeyDownTitle: (e: KeyboardEvent) => void;
    }

    let {
        task,
        statusText,
        statusClass,
        formattedDuration,
        isEditingTitle,
        editedTitle = $bindable(),
        onStart,
        onPause,
        onResume,
        onComplete,
        onAddCheckpoint,
        onDeleteTask,
        onStartTitleEdit,
        onSaveTitle,
        onKeyDownTitle,
    }: Props = $props();

    function selectOnMount(node: HTMLInputElement) {
        node.focus();
        node.select();
    }
</script>

<div class="task-header">
    <!-- 第一行：基础信息 -->
    <div class="task-info-row">
        <span class="tf-time">{formatTime(task.createdAt)}</span>
        {#if isEditingTitle}
            <!-- svelte-ignore a11y_autofocus -->
            <input
                type="text"
                class="task-title-input"
                bind:value={editedTitle}
                onblur={onSaveTitle}
                onkeydown={onKeyDownTitle}
                onclick={(e: MouseEvent) => e.stopPropagation()}
                use:selectOnMount
            />
        {:else}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
                class="task-title"
                class:completed={task.status === "completed"}
                onclick={onStartTitleEdit}
                title="点击修改标题"
            >
                {task.title}
            </div>
        {/if}

        <TaskStatusBadge status={task.status} {statusText} {statusClass} />

        {#if formattedDuration}
            <span class="duration-badge">用时 {formattedDuration}</span>
        {/if}
    </div>

    <!-- 第二行：操作按钮 -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <div class="task-actions-row">
        {#if task.status === "pending"}
            <button
                class="tf-btn tf-btn-success"
                onclick={(e) => {
                    e.stopPropagation();
                    onStart();
                }}
                title="开始任务"
            >
                ▶ 开始
            </button>
        {:else if task.status === "active"}
            <button
                class="tf-btn tf-btn-warning"
                onclick={(e) => {
                    e.stopPropagation();
                    onPause();
                }}
                title="暂停任务"
            >
                ⏸ 暂停
            </button>
            <button
                class="tf-btn tf-btn-info"
                onclick={(e) => {
                    e.stopPropagation();
                    onAddCheckpoint();
                }}
                title="添加记录点"
            >
                📝 记录
            </button>
        {:else if task.status === "paused"}
            <button
                class="tf-btn tf-btn-success"
                onclick={(e) => {
                    e.stopPropagation();
                    onResume();
                }}
                title="继续任务"
            >
                ▶ 继续
            </button>
            <button
                class="tf-btn tf-btn-info"
                onclick={(e) => {
                    e.stopPropagation();
                    onAddCheckpoint();
                }}
                title="添加记录点"
            >
                📝 记录
            </button>
        {/if}

        <div class="spacer"></div>

        {#if task.status !== "pending"}
            <button
                class="tf-btn tf-btn-primary"
                onclick={(e) => {
                    e.stopPropagation();
                    onComplete();
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
                onDeleteTask();
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

<style>
    .task-header {
        display: flex;
        flex-direction: column;
        gap: 0;
    }

    .task-info-row {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
    }

    .task-info-row .tf-time {
        flex-shrink: 0;
        width: 100px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
            "Liberation Mono", "Courier New", monospace;
        font-size: 1.2rem;
        font-weight: 600;
        color: var(--tf-primary-dark);
        background: var(--tf-bg-secondary);
        padding: 4px 6px;
        border-radius: var(--tf-radius-md);
        border: 1px solid rgba(126, 200, 227, 0.2);
        display: inline-flex;
        align-items: center;
        justify-content: center;
        box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
    }

    .task-title {
        flex: 1;
        min-width: 100px;
        font-size: 1.2rem;
        font-weight: 600;
        color: var(--tf-text);
        word-break: break-word;
        padding: 2px 6px;
        margin: -2px -6px;
        border-radius: var(--tf-radius-sm);
        cursor: default;
        transition: background-color var(--tf-transition-fast);
    }

    .task-title.completed {
        text-decoration: line-through;
        color: var(--tf-text-secondary);
    }

    :global(.task-item.selected) .task-title {
        background: var(--tf-bg-secondary);
    }

    :global(.task-item.selected) .task-title:hover {
        background: rgba(126, 200, 227, 0.15);
        cursor: text;
    }

    .task-title-input {
        flex: 1;
        min-width: 100px;
        font-size: 1.2rem;
        font-weight: 600;
        color: var(--tf-text);
        border: none;
        background: var(--tf-bg-secondary);
        outline: 2px solid var(--tf-primary-light);
        border-radius: var(--tf-radius-sm);
        padding: 2px 6px;
        margin: -2px -6px;
        font-family: inherit;
    }

    .duration-badge {
        background: var(--tf-bg-secondary);
        color: var(--tf-text-secondary);
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
            "Liberation Mono", "Courier New", monospace;
        font-size: 0.9rem;
        font-weight: 600;
        padding: 4px 10px;
        border-radius: var(--tf-radius-md);
        white-space: nowrap;
        border: 1px solid rgba(0, 0, 0, 0.05);
    }

    .task-actions-row {
        display: flex;
        align-items: center;
        gap: var(--tf-spacing-sm);
        height: 0;
        opacity: 0;
        margin-top: 0;
        transition: all var(--tf-transition-normal);
        pointer-events: none;
        overflow: hidden;
    }

    .task-actions-row .spacer {
        flex: 1;
    }

    /* 选中、激活或暂停时显示操作按钮 */
    :global(.task-item.selected) .task-actions-row,
    :global(.task-item.active) .task-actions-row,
    :global(.task-item.paused) .task-actions-row {
        height: 40px;
        margin-top: var(--tf-spacing-sm);
        opacity: 1;
        pointer-events: auto;
        overflow: visible;
    }
</style>
