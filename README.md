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
配置 Supabase 项目后，在 `.env.local` 中填写：
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

不要将真实密钥提交到 Git。浏览器端只使用 anon/publishable key，并依赖 RLS 控制数据权限；`service_role` key 只能放在受保护的服务端环境，当前应用不需要将它暴露给浏览器。

## Supabase 初始化（新项目）
在 Supabase Dashboard → SQL Editor 中，按顺序执行以下脚本：

1. `supabase/migrations/20261030000000_initial_schema.sql`：创建业务表、知识图谱表、基础 RLS 策略和索引。
2. `supabase/migrations/202610310001_auth_and_storage.sql`：创建用户资料触发器、更新时间触发器、头像存储桶和存储策略。
3. `supabase/migrations/202610310002_seed_knowledge_graph.sql`：写入知识图谱演示节点与关系。

也可以执行 `supabase/schema.sql` 作为基础结构脚本，再执行第 2、3 步。不要在已经执行完整迁移后再重复执行旧版非迁移脚本；当前 schema 中的策略已加入重复执行保护。

迁移脚本可重复执行。若数据库已有业务数据，执行前仍建议先备份。执行后可在 Supabase Table Editor 检查表结构和种子数据。仓库 CI 只验证代码类型和生产构建，不会连接或修改你的 Supabase 项目。

## 当前交付边界
当前版本先建立可运行的前端工程底座与主要页面交互。页面展示数据为明确的演示数据；未配置 Supabase 时不会伪装成真实云端账号或数据库。配置 Supabase 环境变量并完成 SQL 初始化后，再逐步启用真实认证、数据读写和文件存储。

## UI 还原约定
保留原设计稿的顶部导航、左侧七项菜单、白色背景、紫色强调色、浅色边框、卡片/表格布局、就业趋向气泡图、作品瀑布流与知识图谱双视图。
