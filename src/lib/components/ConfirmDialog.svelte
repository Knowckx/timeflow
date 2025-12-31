<!-- ConfirmDialog.svelte - 确认弹窗组件 -->
<script lang="ts">
    interface Props {
        open: boolean;
        title: string;
        message: string;
        confirmText?: string;
        cancelText?: string;
        onConfirm: () => void;
        onCancel: () => void;
    }

    let {
        open,
        title,
        message,
        confirmText = "确认",
        cancelText = "取消",
        onConfirm,
        onCancel,
    }: Props = $props();

    function handleConfirm() {
        onConfirm();
    }

    function handleCancel() {
        onCancel();
    }

    function handleBackdropClick(e: MouseEvent) {
        if (e.target === e.currentTarget) {
            handleCancel();
        }
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.key === "Escape") {
            handleCancel();
        }
    }
</script>

<svelte:window onkeydown={handleKeydown} />

{#if open}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="dialog-backdrop" onclick={handleBackdropClick}>
        <div class="dialog-content">
            <h3 class="dialog-title">{title}</h3>
            <p class="dialog-message">{message}</p>
            <div class="dialog-actions">
                <button
                    class="dialog-btn dialog-btn-cancel"
                    onclick={handleCancel}
                >
                    {cancelText}
                </button>
                <button
                    class="dialog-btn dialog-btn-confirm"
                    onclick={handleConfirm}
                >
                    {confirmText}
                </button>
            </div>
        </div>
    </div>
{/if}

<style>
    .dialog-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: fadeIn 0.15s ease-out;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    .dialog-content {
        background: var(--tf-bg);
        border-radius: var(--tf-radius-xl);
        padding: var(--tf-spacing-xl);
        max-width: 360px;
        width: 90%;
        box-shadow: var(--tf-shadow-lg);
        animation: scaleIn 0.15s ease-out;
    }

    @keyframes scaleIn {
        from {
            transform: scale(0.95);
            opacity: 0;
        }
        to {
            transform: scale(1);
            opacity: 1;
        }
    }

    .dialog-title {
        font-size: 1.125rem;
        font-weight: 600;
        color: var(--tf-text);
        margin: 0 0 var(--tf-spacing-sm);
    }

    .dialog-message {
        font-size: 0.875rem;
        color: var(--tf-text-secondary);
        margin: 0 0 var(--tf-spacing-lg);
        line-height: 1.5;
    }

    .dialog-actions {
        display: flex;
        gap: var(--tf-spacing-sm);
        justify-content: flex-end;
    }

    .dialog-btn {
        padding: var(--tf-spacing-sm) var(--tf-spacing-lg);
        border-radius: var(--tf-radius-lg);
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all var(--tf-transition-fast);
    }

    .dialog-btn-cancel {
        background: var(--tf-bg-secondary);
        border: 1px solid var(--tf-border);
        color: var(--tf-text-secondary);
    }

    .dialog-btn-cancel:hover {
        background: var(--tf-border);
    }

    .dialog-btn-confirm {
        background: var(--tf-primary);
        border: none;
        color: white;
    }

    .dialog-btn-confirm:hover {
        background: var(--tf-primary-dark);
    }
</style>
