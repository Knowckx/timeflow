<!-- src\routes\+page.svelte -->
<script lang="ts">
    import infa from "infa-s5";
    console.log(infa.version)
</script>

<div class="p-8">
    <h1>Infa 版本 {infa.version}</h1>
    <infa.Button
        txt="点击提示"
        onclick={() => {
            infa.Tip.success(`Infa 版本 ${infa.version}`);
        }}
    />

    <infa.Button
        txt="错误提示"
        variant="destructive"
        class="ml-4"
        onclick={() => {
            infa.Tip.error("出错了！");
        }}
    />

    <infa.Button
        txt="普通提示"
        variant="outline"
        class="ml-4"
        onclick={() => {
            infa.Tip.info("这是一条消息");
        }}
    />
</div>
