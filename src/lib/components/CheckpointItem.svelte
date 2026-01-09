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
            <svg
                width="14"
                height="14"
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
    {/if}
</div>

<style>
    .tf-checkpoint-item {
        display: flex;
        align-items: center;
        gap: var(--tf-spacing-sm);
        padding: 1px 8px;
        margin: 0 -8px;
        border-radius: var(--tf-radius-sm);
        transition: background var(--tf-transition-fast);
    }

    .tf-checkpoint-item:hover {
        background: var(--tf-bg-secondary);
    }

    .checkpoint-time {
        flex-shrink: 0;
        font-size: 1rem;
        color: var(--tf-text-muted);
    }

    .checkpoint-note {
        flex: 1;
        font-size: 1rem;
        color: var(--tf-text-secondary);
    }

    .checkpoint-delete {
        opacity: 0;
        background: none;
        border: none;
        color: var(--tf-accent-pink);
        font-size: 1.25rem;
        cursor: pointer;
        padding: 0 var(--tf-spacing-xs);
        transition: all var(--tf-transition-fast);
    }

    .tf-checkpoint-item:hover .checkpoint-delete {
        opacity: 1;
    }

    .checkpoint-delete:hover {
        color: #e53e3e;
        transform: scale(1.2);
    }
</style>
