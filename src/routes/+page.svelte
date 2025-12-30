<!-- src\routes\+page.svelte -->
<!-- TimeFlow - 时间记录应用主页 -->
<script lang="ts">
    import { onMount } from "svelte";
    import "$lib/styles/theme.css";
    import { taskStore } from "$lib/stores/taskStore.svelte";
    import TaskList from "$lib/components/TaskList.svelte";
    import TaskInput from "$lib/components/TaskInput.svelte";
    import { formatDate } from "$lib/utils/time";
    import { exportToMarkdown, copyToClipboard } from "$lib/utils/export";
    import infa from "infa-s5";

    let showExportToast = $state(false);

    onMount(() => {
        taskStore.init();
    });

    async function handleExport() {
        const markdown = exportToMarkdown(taskStore.tasks);
        const success = await copyToClipboard(markdown);

        if (success) {
            infa.Tip.success("已复制到剪贴板！");
        } else {
            infa.Tip.error("复制失败，请手动复制");
            console.log(markdown);
        }
    }
</script>

<svelte:head>
    <title>TimeFlow - 时间记录</title>
    <meta name="description" content="记录你的工作时间，追踪每一刻的效率" />
</svelte:head>

<div class="app-container">
    <!-- 头部 -->
    <header class="app-header">
        <div class="header-content">
            <div class="header-top">
                <h1 class="app-title">
                    <span class="title-icon">⏱️</span>
                    TimeFlow
                </h1>
                <button
                    class="export-btn"
                    onclick={handleExport}
                    title="导出今日记录为 Markdown"
                >
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                    >
                        <path
                            d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"
                        />
                    </svg>
                    导出
                </button>
            </div>
            <p class="app-subtitle">{formatDate(new Date())}</p>
        </div>
    </header>

    <!-- 主内容区 -->
    <main class="app-main">
        {#if taskStore.initialized}
            <TaskList />
        {:else}
            <div class="loading">
                <div class="loading-spinner"></div>
                <p>加载中...</p>
            </div>
        {/if}
    </main>

    <!-- 任务输入 -->
    <TaskInput />
</div>

<style>
    .app-container {
        min-height: 100vh;
        background: var(--tf-bg-secondary);
    }

    .app-header {
        background: var(--tf-bg);
        box-shadow: var(--tf-shadow-sm);
        position: sticky;
        top: 0;
        z-index: 50;
    }

    .header-content {
        max-width: 800px;
        margin: 0 auto;
        padding: var(--tf-spacing-lg) var(--tf-spacing-xl);
    }

    .app-title {
        display: flex;
        align-items: center;
        gap: var(--tf-spacing-sm);
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--tf-text);
        margin: 0;
    }

    .title-icon {
        font-size: 1.75rem;
    }

    .app-subtitle {
        font-size: 0.875rem;
        color: var(--tf-text-secondary);
        margin: var(--tf-spacing-xs) 0 0;
    }

    .header-top {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .export-btn {
        display: flex;
        align-items: center;
        gap: var(--tf-spacing-xs);
        padding: var(--tf-spacing-sm) var(--tf-spacing-md);
        background: var(--tf-primary-light);
        color: var(--tf-primary-dark);
        border: none;
        border-radius: var(--tf-radius-lg);
        font-size: 0.875rem;
        font-weight: 500;
        cursor: pointer;
        transition: all var(--tf-transition-fast);
    }

    .export-btn:hover {
        background: var(--tf-primary);
        color: white;
    }

    .app-main {
        max-width: 800px;
        margin: 0 auto;
        padding: var(--tf-spacing-lg) var(--tf-spacing-xl);
    }

    .loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: var(--tf-spacing-2xl);
        color: var(--tf-text-secondary);
    }

    .loading-spinner {
        width: 32px;
        height: 32px;
        border: 3px solid var(--tf-border);
        border-top-color: var(--tf-primary);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
        margin-bottom: var(--tf-spacing-md);
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }
</style>
