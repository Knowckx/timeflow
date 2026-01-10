<script lang="ts">
    import type { Checkpoint } from "$lib/types/task";
    import CheckpointItem from "./CheckpointItem.svelte";

    interface Props {
        checkpoints: Checkpoint[];
        onDelete: (id: string) => void;
    }

    let { checkpoints, onDelete }: Props = $props();
</script>

{#if checkpoints.length > 0}
    <div class="tf-checkpoint">
        {#each checkpoints as checkpoint (checkpoint.id)}
            <CheckpointItem {checkpoint} {onDelete} />
        {/each}
    </div>
{/if}

<style>
    .tf-checkpoint {
        margin-top: 12px;
        margin-bottom: 8px;
        padding-left: 12px;
        border-left: 1px dashed rgba(126, 200, 227, 0.2);
        margin-left: 4px;
    }
</style>
