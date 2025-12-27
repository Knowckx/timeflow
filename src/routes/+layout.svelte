<script lang="ts">
	import "./layout.css";
	import favicon from "$lib/assets/favicon.svg";
	import PWAUpdatePrompt from "$lib/components/PWAUpdatePrompt.svelte";
    import infa from "infa-s5";

	let { children } = $props();
</script>


<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<!-- PWA 更新提示 (仅生产环境生效) -->
<PWAUpdatePrompt />
<infa.Tip.UI />

{@render children()}
