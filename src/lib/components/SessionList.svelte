<!-- SessionList.svelte - 工作时段列表组件 -->
<script lang="ts">
    import type { WorkSession } from "$lib/types/task";
    import { taskStore } from "$lib/stores/taskStore.svelte";
    import SessionItem from "./SessionItem.svelte";
    import ConfirmDialog from "./ConfirmDialog.svelte";

    interface Props {
        sessions: WorkSession[];
        taskId: string;
    }

    let { sessions, taskId }: Props = $props();

    let showDeleteConfirm = $state(false);
    let sessionToDelete = $state<string | null>(null);

    /** 请求删除时段（显示确认弹窗） */
    function handleRequestDelete(sessionId: string) {
        sessionToDelete = sessionId;
        showDeleteConfirm = true;
    }

    /** 确认删除时段 */
    function confirmDelete() {
        if (sessionToDelete) {
            taskStore.deleteSession(taskId, sessionToDelete);
        }
        showDeleteConfirm = false;
        sessionToDelete = null;
    }

    /** 取消删除时段 */
    function cancelDelete() {
        showDeleteConfirm = false;
        sessionToDelete = null;
    }
</script>

{#if sessions.length > 0}
    <div class="sessions-header">
        {sessions.length} 个工作时段
    </div>

    <div class="sessions-list">
        {#each sessions as session, i}
            <SessionItem {session} index={i} onDelete={handleRequestDelete} />
        {/each}
    </div>
{/if}

<!-- 删除时段确认弹窗 -->
<ConfirmDialog
    open={showDeleteConfirm}
    title="删除时段"
    message="确定要删除这个工作时段吗？此操作不可撤销。"
    confirmText="确认删除"
    cancelText="取消"
    onConfirm={confirmDelete}
    onCancel={cancelDelete}
/>

<style>
    .sessions-header {
        color: var(--tf-text-muted);
        font-size: 0.9rem;
        padding: 4px 0;
        margin-top: 12px;
        font-weight: 500;
        /* 与时间标签对齐 */
        margin-left: calc(100px + 12px);
    }

    .sessions-list {
        margin-top: 4px;
        /* 与时间标签对齐 */
        margin-left: calc(100px + 12px);
    }
</style>
