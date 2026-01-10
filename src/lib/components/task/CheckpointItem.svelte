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
    <!-- 子div 1: 专门存放小圆点 -->
    <div class="checkpoint-dot-cell">
        <div class="sub-dot"></div>
    </div>

    <!-- 子div 2: 存放时间、内容及删除按钮 -->
    <div class="checkpoint-content-cell">
        <span class="checkpoint-time">
            {formatTime(checkpoint.time)}
        </span>
        <div class="checkpoint-note">
            {checkpoint.note}
        </div>

        {#if onDelete}
            <button
                class="checkpoint-delete"
                onclick={(e) => {
                    e.stopPropagation();
                    onDelete(checkpoint.id);
                }}
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
</div>

<style>
    .tf-checkpoint-item {
        display: flex;
        align-items: stretch;
        margin: 6px 0;
        border-radius: var(--tf-radius-md);
        transition: all var(--tf-transition-fast);
        border: 1px solid transparent;
        margin-left: -24px; /* 抵消父内边距(12px) + 槽位半宽(12px)，使虚线完美压在点中心 */
    }

    .checkpoint-dot-cell {
        flex-shrink: 0;
        width: 24px;
        display: flex;
        justify-content: center;
        align-items: baseline; /* 或者用 center，取决于文字对齐方式 */
        padding-top: 1.1rem; /* 微调点的高度，使其对齐第一行文字基线 */
    }

    .sub-dot {
        width: 6px;
        height: 6px;
        background: var(--tf-primary-light);
        border-radius: 50%;
        border: 1px solid white;
        opacity: 0.6;
    }

    .checkpoint-content-cell {
        flex: 1;
        display: flex;
        align-items: baseline;
        gap: 12px;
    }

    .tf-checkpoint-item:hover {
        background: var(--tf-bg-secondary);
        border: 1px solid rgba(126, 200, 227, 0.15);
    }

    .checkpoint-time {
        padding-left: 0; /* 在新布局下不再需要 */
        flex-shrink: 0;
        width: 100px; /* 统一对齐宽度 */
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
            "Liberation Mono", "Courier New", monospace;
        font-size: 1.1rem;
        font-weight: 600;
        color: var(--tf-text-secondary);
        display: inline-flex;
        align-items: center;
        justify-content: flex-start;
    }

    .checkpoint-note {
        flex: 1;
        font-size: 1.1rem;
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
