# YUANCHUANG｜设计成长平台

面向设计类学生的学习与职业成长平台。以职业探索、成长路径、知识图谱、学习资源、项目实践和作品展示为核心，帮助学生建立可视化、可执行、可追踪的成长闭环。

## 技术栈
- Next.js 14 App Router + TypeScript
- Tailwind CSS
- Supabase：PostgreSQL / Auth / Storage（配置后启用）
- Recharts：数据可视化
- Vercel：部署

## 本地运行
```bash
npm install
cp .env.example .env.local
npm run dev
```
打开 http://localhost:3000。

## 环境变量
配置 Supabase 项目后，在 `.env.local` 中填写 `NEXT_PUBLIC_SUPABASE_URL` 与 `NEXT_PUBLIC_SUPABASE_ANON_KEY`。不要将密钥提交到 Git。

## 当前交付边界
当前版本先建立完整可运行的前端工程底座与主要页面交互。页面展示数据为明确的演示数据；未配置 Supabase 时不会伪装成真实云端账号或数据库。后续按模块接入真实认证、数据读写、文件存储和管理权限。

## UI 还原约定
保留原设计稿的顶部导航、左侧七项菜单、白色背景、紫色强调色、浅色边框、卡片/表格布局、就业趋向气泡图、作品瀑布流与知识图谱双视图。