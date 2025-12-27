
# 创建新项目

pnpm dlx degit Knowckx/timeflow yourAppName
cd yourAppName
pnpm install
pnpm dev

- 测试pwa模式
pnpm run build && pnpm preview --host


# 6. 初始化新的 git 仓库
git init
git add .
git commit -m "Initial commit from timeflow template"

# 7. 关联远程仓库并推送（可选）
git remote add origin your-repo-url
git push -u origin main



# svelte5 新项目创建过程
pnpm dlx sv create timeflow

安装对shadcn的依赖
pnpm dlx shadcn-svelte@latest init

配置对infa包组件css的集成
src\routes\layout.css 需要手动加一行
/* 手动添加这一行来扫描 infa-s5 的组件 */
@source "../../node_modules/infa-s5/dist";

# yalc

- 不要使用 pnpm-workspace
删掉pnpm-workspace.yaml

- 为什么拿不到`infa`的新值
经过三小时的验证，最后的结论

// 1. vite.config.ts里 这行配置一定要有
optimizeDeps: {
	exclude: ['infa-s5']
},

2. pnpm dev --force   一定需要force来启动服务