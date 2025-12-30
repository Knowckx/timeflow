<!-- src\routes\+page.svelte -->
<!-- TimeFlow - 时间记录应用主页 -->
<script lang="ts">
    import { onMount } from "svelte";
    import "$lib/styles/theme.css";
    import { taskStore } from "$lib/stores/taskStore.svelte";
    import TaskList from "$lib/components/TaskList.svelte";
    import TaskInput from "$lib/components/TaskInput.svelte";
    import { formatDate } from "$lib/utils/time";

    onMount(() => {
        taskStore.init();
    });
</script>

<svelte:head>
    <title>TimeFlow - 时间记录</title>
    <meta name="description" content="记录你的工作时间，追踪每一刻的效率" />
</svelte:head>

<div class="app-container">
    <!-- 头部 -->
    <header class="app-header">
        <div class="header-content">
            <h1 class="app-title">
                <span class="title-icon">⏱️</span>
                TimeFlow
            </h1>
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
