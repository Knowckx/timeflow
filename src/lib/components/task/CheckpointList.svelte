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
        margin-top: 4px;
    }
</style>
