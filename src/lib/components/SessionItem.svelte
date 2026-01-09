<!-- SessionItem.svelte - 单个工作时段行组件 -->
<script lang="ts">
    import type { WorkSession } from "$lib/types/task";
    import { formatTime } from "$lib/utils/time";

    interface Props {
        session: WorkSession;
        index: number;
        onDelete?: (sessionId: string) => void;
    }

    let { session, index, onDelete }: Props = $props();

    /** 格式化时段用时 */
    function formatSessionDuration(session: WorkSession): string {
        const endTime = session.endTime || new Date();
        const durationMs = endTime.getTime() - session.startTime.getTime();
        const minutes = Math.floor(durationMs / (1000 * 60));
        if (minutes < 1) return "不到1分钟";
        if (minutes < 60) return `${minutes}分钟`;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return remainingMinutes > 0
            ? `${hours}小时${remainingMinutes}分钟`
            : `${hours}小时`;
    }
</script>

<div class="session-item">
    <span class="session-label">时段 {index + 1}</span>
    <span class="session-time">
        {formatTime(session.startTime)}
        {#if session.endTime}
            → {formatTime(session.endTime)}
        {/if}
    </span>
    <span class="session-duration">{formatSessionDuration(session)}</span>
    {#if onDelete}
        <button
            class="session-delete"
            onclick={(e) => {
                e.stopPropagation();
                onDelete?.(session.id);
            }}
            aria-label="删除时段"
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
    .session-item {
        display: flex;
        gap: var(--tf-spacing-sm);
        font-size: 1rem;
        color: var(--tf-text-secondary);
        padding: 1px 8px;
        margin: 0 -8px;
        border-radius: var(--tf-radius-sm);
        transition: background var(--tf-transition-fast);
    }

    .session-item:hover {
        background: var(--tf-bg-secondary);
    }

    .session-label {
        color: var(--tf-text-muted);
    }

    .session-time {
        color: var(--tf-text-secondary);
    }

    .session-duration {
        color: var(--tf-primary);
        font-weight: 500;
    }

    .session-delete {
        opacity: 0;
        background: none;
        border: none;
        color: var(--tf-accent-pink);
        font-size: 1.25rem;
        cursor: pointer;
        padding: 0 var(--tf-spacing-xs);
        transition: all var(--tf-transition-fast);
        margin-left: auto;
        display: flex;
        align-items: center;
    }

    .session-item:hover .session-delete {
        opacity: 1;
    }

    .session-delete:hover {
        color: #e53e3e;
        transform: scale(1.2);
    }
</style>
