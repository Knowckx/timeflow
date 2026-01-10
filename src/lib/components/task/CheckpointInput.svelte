<script lang="ts">
    import infa from "infa-s5";

    interface Props {
        value: string;
        onCommit: () => void;
        onEscape: () => void;
    }

    let { value = $bindable(), onCommit, onEscape }: Props = $props();
</script>

<div class="checkpoint-input-wrapper">
    <infa.Input
        bind:value
        {onCommit}
        {onEscape}
        placeholder="记录当前进度..."
        autoFocus={true}
    />
</div>

<style>
    .checkpoint-input-wrapper {
        display: flex;
        gap: var(--tf-spacing-sm);
        margin-top: var(--tf-spacing-md);
        padding-left: var(--tf-spacing-xl);
    }
</style>
