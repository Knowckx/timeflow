<!-- TaskItem.svelte - 任务卡片组件 -->
<script lang="ts">
    import type { Task } from "$lib/types/task";
    import { taskStore } from "$lib/stores/taskStore.svelte";
    import {
        formatTime,
        calculateDuration,
        formatDurationReadable,
    } from "$lib/utils/time";
    import CheckpointItem from "./CheckpointItem.svelte";

    interface Props {
        task: Task;
    }

    let { task }: Props = $props();

    let showCheckpointInput = $state(false);
    let checkpointNote = $state("");
    let checkpointInputRef: HTMLInputElement | undefined = $state();

    function handleToggleComplete() {
        if (task.completed) {
            taskStore.uncompleteTask(task.id);
        } else {
            taskStore.completeTask(task.id);
        }
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
</script>

<div class="task-item tf-card" class:completed={task.completed}>
    <!-- 时间线指示点 -->
    <div
        class="tf-timeline-dot"
        class:completed={task.completed}
        class:active={!task.completed}
    ></div>

    <!-- 任务头部 -->
    <div class="task-header">
        <input
            type="checkbox"
            class="tf-checkbox"
            checked={task.completed}
            onchange={handleToggleComplete}
            aria-label={task.completed ? "标记为未完成" : "标记为已完成"}
        />

        <div class="task-info">
            <div class="task-title" class:completed={task.completed}>
                {task.title}
            </div>
            <div class="task-time-info">
                <span class="tf-time">{formatTime(task.startTime)}</span>
                {#if task.completed && task.endTime}
                    <span class="time-arrow">→</span>
                    <span class="tf-time">{formatTime(task.endTime)}</span>
                    <span class="tf-badge tf-badge-completed">
                        用时 {calculateDuration(task.startTime, task.endTime)}
                    </span>
                {:else}
                    <span class="tf-badge tf-badge-progress">进行中</span>
                {/if}
            </div>
        </div>

        <div class="task-actions">
            {#if !task.completed}
                <button
                    class="action-btn"
                    onclick={handleAddCheckpoint}
                    title="添加记录点"
                >
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <path d="M12 20V10M18 20V4M6 20v-4" />
                    </svg>
                </button>
            {/if}
            <button
                class="action-btn action-btn-delete"
                onclick={handleDeleteTask}
                title="删除任务"
            >
                <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                >
                    <path
                        d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2"
                    />
                </svg>
            </button>
        </div>
    </div>

    <!-- Checkpoints 列表 -->
    {#if task.checkpoints.length > 0}
        <div class="tf-checkpoint">
            {#each task.checkpoints as checkpoint (checkpoint.id)}
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

<style>
    .task-item {
        position: relative;
        margin-bottom: var(--tf-spacing-md);
        transition: all var(--tf-transition-normal);
    }

    .task-item.completed {
        opacity: 0.8;
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

    .task-title {
        font-size: 1rem;
        font-weight: 500;
        color: var(--tf-text);
        margin-bottom: var(--tf-spacing-xs);
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
    }

    .time-arrow {
        color: var(--tf-text-muted);
        font-size: 0.875rem;
    }

    .task-actions {
        display: flex;
        gap: var(--tf-spacing-xs);
        opacity: 0;
        transition: opacity var(--tf-transition-fast);
    }

    .task-item:hover .task-actions {
        opacity: 1;
    }

    .action-btn {
        background: var(--tf-bg-secondary);
        border: none;
        border-radius: var(--tf-radius-md);
        padding: var(--tf-spacing-sm);
        cursor: pointer;
        color: var(--tf-text-secondary);
        transition: all var(--tf-transition-fast);
    }

    .action-btn:hover {
        background: var(--tf-primary-light);
        color: var(--tf-primary-dark);
    }

    .action-btn-delete:hover {
        background: var(--tf-accent-pink);
        color: #9b2c2c;
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
