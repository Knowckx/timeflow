<!-- CheckpointItem.svelte - Checkpoint 条目组件 -->
<script lang="ts">
    import type { Checkpoint } from "$lib/types/task";
    import { formatTime } from "$lib/utils/time";

    interface Props {
        checkpoint: Checkpoint;
        onDelete?: (id: string) => void;
    }

    let { checkpoint, onDelete }: Props = $props();
</script>

<div class="tf-checkpoint-item">
    <span class="checkpoint-time tf-time">{formatTime(checkpoint.time)}</span>
    <span class="checkpoint-note">{checkpoint.note}</span>
    {#if onDelete}
        <button
            class="checkpoint-delete"
            onclick={() => onDelete?.(checkpoint.id)}
            aria-label="删除记录点"
        >
            ×
        </button>
    {/if}
</div>

<style>
    .tf-checkpoint-item {
        display: flex;
        align-items: center;
        gap: var(--tf-spacing-sm);
        padding: var(--tf-spacing-xs) 0;
    }

    .checkpoint-time {
        flex-shrink: 0;
        font-size: 0.8rem;
        color: var(--tf-text-muted);
    }

    .checkpoint-note {
        flex: 1;
        font-size: 0.875rem;
        color: var(--tf-text-secondary);
    }

    .checkpoint-delete {
        opacity: 0;
        background: none;
        border: none;
        color: var(--tf-accent-pink);
        font-size: 1rem;
        cursor: pointer;
        padding: 0 var(--tf-spacing-xs);
        transition: opacity var(--tf-transition-fast);
    }

    .tf-checkpoint-item:hover .checkpoint-delete {
        opacity: 1;
    }
</style>
