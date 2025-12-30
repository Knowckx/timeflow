<!-- TaskInput.svelte - 任务输入组件 -->
<script lang="ts">
    import "$lib/styles/theme.css";
    import { taskStore } from "$lib/stores/taskStore.svelte";

    let inputValue = $state("");
    let inputRef: HTMLInputElement | undefined = $state();
    let isExpanded = $state(false);

    function handleSubmit() {
        const trimmed = inputValue.trim();
        if (!trimmed) return;

        taskStore.addTask({ title: trimmed });
        inputValue = "";
        isExpanded = false;
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
        if (e.key === "Escape") {
            isExpanded = false;
            inputValue = "";
        }
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

        // Enter 键展开输入框
        if (e.key === "Enter") {
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
            <input
                bind:this={inputRef}
                bind:value={inputValue}
                onkeydown={handleKeydown}
                class="tf-input"
                placeholder="输入新任务，按 Enter 确认..."
                autocomplete="off"
            />
            <div class="task-input-actions">
                <button
                    class="btn-cancel"
                    onclick={() => {
                        isExpanded = false;
                        inputValue = "";
                    }}
                >
                    取消
                </button>
                <button
                    class="btn-add"
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

    .btn-cancel,
    .btn-add {
        padding: var(--tf-spacing-sm) var(--tf-spacing-lg);
        border-radius: var(--tf-radius-lg);
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all var(--tf-transition-fast);
        border: none;
    }

    .btn-cancel {
        background: var(--tf-bg-secondary);
        color: var(--tf-text-secondary);
    }

    .btn-cancel:hover {
        background: var(--tf-border);
    }

    .btn-add {
        background: var(--tf-primary);
        color: white;
    }

    .btn-add:hover:not(:disabled) {
        background: var(--tf-primary-dark);
    }

    .btn-add:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
</style>
