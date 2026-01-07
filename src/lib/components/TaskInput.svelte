<!-- TaskInput.svelte - 任务输入组件 -->
<script lang="ts">
    import "$lib/styles/theme.css";
    import { taskStore } from "$lib/stores/taskStore.svelte";
    import infa from "infa-s5";

    let inputValue = $state("");
    let inputRef: HTMLInputElement | undefined = $state();
    let isExpanded = $state(false);

    function handleSubmit() {
        const trimmed = inputValue.trim();
        if (!trimmed) {
            // 空输入时按 Enter 等于关闭输入框
            isExpanded = false;
            return;
        }

        taskStore.addTask({ title: trimmed });
        inputValue = "";
        isExpanded = false;
    }

    function handleFabClick() {
        isExpanded = true;
        // 等待 DOM 更新后聚焦
        setTimeout(() => inputRef?.focus(), 50);
    }

    /** 全局快捷键处理 */
    function handleGlobalKeydown(e: KeyboardEvent) {
        // 如果已经在输入状态，不处理
        if (isExpanded) return;

        // 如果焦点在其他输入框中，不处理
        const activeElement = document.activeElement;
        if (
            activeElement instanceof HTMLInputElement ||
            activeElement instanceof HTMLTextAreaElement
        ) {
            return;
        }

        // Enter 键：仅在没有运行中的任务时展开新任务输入
        if (e.key === "Enter" && !e.shiftKey) {
            const activeTask = taskStore.getActiveTask();
            if (!activeTask) {
                e.preventDefault();
                handleFabClick();
            }
        }

        // Shift + Enter：强制展开新任务输入
        if (e.key === "Enter" && e.shiftKey) {
            e.preventDefault();
            handleFabClick();
        }
    }
</script>

<!-- 全局键盘监听 -->
<svelte:window onkeydown={handleGlobalKeydown} />

<!-- 输入区域 -->
{#if isExpanded}
    <div class="task-input-wrapper">
        <div class="task-input-card">
            <infa.Input
                bind:value={inputValue}
                onCommit={handleSubmit}
                onEscape={() => {
                    isExpanded = false;
                }}
                placeholder="输入新任务，按 Enter 确认..."
                autoFocus={true}
            />
            <div class="task-input-actions">
                <button
                    class="tf-btn tf-btn-secondary"
                    onclick={() => {
                        isExpanded = false;
                        inputValue = "";
                    }}
                >
                    取消
                </button>
                <button
                    class="tf-btn tf-btn-primary"
                    onclick={handleSubmit}
                    disabled={!inputValue.trim()}
                >
                    添加任务
                </button>
            </div>
        </div>
    </div>
{/if}

<!-- FAB 悬浮按钮 -->
{#if !isExpanded}
    <button class="tf-fab" onclick={handleFabClick} aria-label="添加新任务">
        <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
        >
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
    </button>
{/if}

<style>
    .task-input-wrapper {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        padding: var(--tf-spacing-lg);
        background: linear-gradient(to top, var(--tf-bg) 80%, transparent);
        z-index: 100;
    }

    .task-input-card {
        max-width: 600px;
        margin: 0 auto;
        background: var(--tf-bg-card);
        border-radius: var(--tf-radius-xl);
        padding: var(--tf-spacing-lg);
        box-shadow: var(--tf-shadow-lg);
    }

    .task-input-actions {
        display: flex;
        justify-content: flex-end;
        gap: var(--tf-spacing-sm);
        margin-top: var(--tf-spacing-md);
    }
</style>
