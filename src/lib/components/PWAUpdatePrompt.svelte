<script lang="ts">
	import { onMount } from "svelte";
	import { useRegisterSW } from "virtual:pwa-register/svelte";

	// 使用 prompt 模式的 SW 注册
	const {
		needRefresh, // 当有新 SW 可用时变为 true
		updateServiceWorker, // 调用此函数来激活新 SW
	} = useRegisterSW({
		// SW 注册成功时的回调
		onRegisteredSW(swUrl, registration) {
			console.log("[PWA] SW registered:", swUrl);
			// 定期检查更新 (每 60 秒)
			if (registration) {
				setInterval(() => {
					console.log("[PWA] Checking for updates...");
					registration.update();
				}, 60 * 1000);
			}
		},
		// SW 注册失败
		onRegisterError(error) {
			console.error("[PWA] SW registration error:", error);
		},
	});

	// 关闭提示
	function closePrompt() {
		needRefresh.set(false);
	}

	// 键盘快捷键：Esc 关闭
	function handleKeydown(e: KeyboardEvent) {
		if (e.key === "Escape" && $needRefresh) {
			closePrompt();
		}
	}

	// 用户确认更新
	async function handleUpdate() {
		await updateServiceWorker(true); // true 表示立即 reload 页面
	}
</script>

<svelte:window onkeydown={handleKeydown} />

{#if $needRefresh}
	<div class="pwa-toast">
		<div class="pwa-message">
			<span>🚀 发现新版本！</span>
			<p>点击更新按钮获取最新内容</p>
		</div>
		<div class="pwa-buttons">
			<button class="pwa-btn pwa-btn-update" onclick={handleUpdate}
				>立即更新</button
			>
			<button class="pwa-btn pwa-btn-close" onclick={closePrompt}
				>稍后再说</button
			>
		</div>
	</div>
{/if}

<style>
	.pwa-toast {
		position: fixed;
		bottom: 20px;
		right: 20px;
		z-index: 9999;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		padding: 16px 20px;
		border-radius: 12px;
		box-shadow: 0 10px 40px rgba(102, 126, 234, 0.4);
		display: flex;
		flex-direction: column;
		gap: 12px;
		max-width: 320px;
		animation: slideIn 0.3s ease-out;
	}

	@keyframes slideIn {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	.pwa-message span {
		font-size: 16px;
		font-weight: 600;
	}

	.pwa-message p {
		margin: 4px 0 0 0;
		font-size: 14px;
		opacity: 0.9;
	}

	.pwa-buttons {
		display: flex;
		gap: 8px;
	}

	.pwa-btn {
		padding: 8px 16px;
		border: none;
		border-radius: 8px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.pwa-btn-update {
		background: white;
		color: #667eea;
	}

	.pwa-btn-update:hover {
		background: #f0f0f0;
		transform: scale(1.02);
	}

	.pwa-btn-close {
		background: rgba(255, 255, 255, 0.2);
		color: white;
	}

	.pwa-btn-close:hover {
		background: rgba(255, 255, 255, 0.3);
	}
</style>
