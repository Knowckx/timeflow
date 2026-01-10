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
        align-items: flex-start;
        gap: 12px;
        margin: 2px 0;
        border-radius: var(--tf-radius-md);
        transition: all var(--tf-transition-fast);
        border: 1px solid transparent;
    }

    .tf-checkpoint-item:hover {
        background: var(--tf-bg-secondary);
        border: 1px solid rgba(126, 200, 227, 0.15);
    }

    .checkpoint-time {
        flex-shrink: 0;
        width: 100px;
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
            "Liberation Mono", "Courier New", monospace;
        font-size: 0.95rem;
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
        margin-top: 0px;
    }

    .checkpoint-note {
        flex: 1;
        font-size: 1rem;
        color: var(--tf-text-secondary);
        line-height: 1.5;
        padding-top: 2px;
    }

    .checkpoint-delete {
        opacity: 0;
        background: none;
        border: none;
        color: var(--tf-accent-pink);
        cursor: pointer;
        padding: 4px;
        border-radius: var(--tf-radius-sm);
        transition: all var(--tf-transition-fast);
        margin-top: -2px;
    }

    .tf-checkpoint-item:hover .checkpoint-delete {
        opacity: 1;
    }

    .checkpoint-delete:hover {
        color: #e53e3e;
        transform: scale(1.2);
    }
</style>
