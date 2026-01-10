import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import mkcert from 'vite-plugin-mkcert';

export default defineConfig({
    plugins: [
        sveltekit(),
        tailwindcss(),
        mkcert(),
        SvelteKitPWA({
            disable: process.env.NODE_ENV !== 'production', // 开发模式完全禁用 PWA
            devOptions: {
                enabled: false, // 开发模式不启用 service worker
                suppressWarnings: true, // 抑制警告
                type: 'module', // 使用 ES module 格式，便于调试
            },
            registerType: 'prompt', // prompt 模式：有新内容时触发事件，允许我们在 UI 上弹窗提示用户手动更新
            includeAssets: ['pwa-512x512.png'],
            strategies: 'generateSW', // 使用 generateSW 策略
            workbox: {
                // 仅在生产环境或特定需求下进行预缓存，避免开发环境下文件夹不存在的警告
                globPatterns: process.env.NODE_ENV === 'production' ? ['**/*.{js,css,ico,png,svg,webp,woff,woff2,ttf,eot,json}'] : [],
                // 关键：禁用 navigateFallback，避免 non-precached-url 错误
                navigateFallback: null,
                // 自动清理过期缓存。新版本部署后，自动删除旧版本的缓存
                cleanupOutdatedCaches: true,
                // 运行时缓存策略 - 离线优先
                runtimeCaching: [
                    {
                        // 页面导航请求 - 使用 StaleWhileRevalidate（立即返回缓存，后台更新）
                        urlPattern: ({ request }) => request.mode === 'navigate',
                        handler: 'StaleWhileRevalidate',
                        options: {
                            cacheName: 'pages-cache',
                            expiration: {
                                maxEntries: 50,
                                maxAgeSeconds: 365 * 24 * 60 * 60 * 99 // 99年
                            },
                            cacheableResponse: { // 允许缓存 200 响应
                                statuses: [0, 200]
                            }
                        }
                    },
                    {
                        // 静态资源 - 使用 CacheFirst（缓存优先，离线也能工作）
                        urlPattern: /\.(?:js|css|woff2?|ttf|eot|png|jpg|jpeg|gif|svg|ico|webp)$/,
                        handler: 'CacheFirst',
                        options: {
                            cacheName: 'static-resources-cache',
                            expiration: {
                                maxEntries: 200,
                                maxAgeSeconds: 365 * 24 * 60 * 60 * 99 // 99年
                            },
                            cacheableResponse: {
                                statuses: [0, 200]
                            }
                        }
                    }
                ]
            },
            kit: {
                includeVersionFile: true // 将 SvelteKit 生成的 _app/version.json 加入 precache，用于版本检测。
            },
            manifest: {
                name: 'TimeFlow - 优雅的时间记录',
                short_name: 'TimeFlow',
                description: '一款基于 Svelte 5 的极简主义时间记录工具，帮助您追踪每一分钟的价值。',
                theme_color: '#7EC8E3',
                background_color: '#FFFFFF',
                display: 'standalone', // 显示模式（无浏览器 UI，像原生 App）
                icons: [
                    {
                        src: 'pwa-512x512.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    }
                ],
                screenshots: [
                    {
                        src: 'screenshot-desktop.png',
                        sizes: '1024x1024',
                        type: 'image/png',
                        form_factor: 'wide',
                        label: 'TimeFlow Desktop View'
                    },
                    {
                        src: 'screenshot-mobile.png',
                        sizes: '1024x1024',
                        type: 'image/png',
                        label: 'TimeFlow Mobile View'
                    }
                ]
            },
        }),
    ],
    // ✅ 必须 - 禁用客户端预构建本地包的缓存
    optimizeDeps: {
        exclude: ['infa-s5']
    },
    // ✅ 必须 - 处理 SSR 时的本地包
    ssr: {
        noExternal: ['infa-s5']
    },
    server: {
        https: {},
        port: 23003,
        host: true,
    },
    preview: {
        port: 33003,
        host: true
    },
});
