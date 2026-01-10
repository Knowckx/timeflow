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
        align-items: baseline;
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
        padding-left: var(--tf-spacing-xs);
        flex-shrink: 0;
        width: 90px; /* cp时间宽度 会影响和右侧文字的距离 */
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
            "Liberation Mono", "Courier New", monospace;
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--tf-text-secondary);
        display: inline-flex;
        align-items: center;
        justify-content: flex-start;
        justify-content: flex-start;
    }

    .checkpoint-note {
        flex: 1;
        font-size: 1.1rem;
        color: var(--tf-text);
        line-height: 1.5;
        color: var(--tf-text);
        line-height: 1.5;
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
