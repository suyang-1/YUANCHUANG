# YUANCHUANG｜设计成长平台

面向设计类学生的学习与职业成长平台。以职业探索、成长路径、知识图谱、学习资源、项目实践和作品展示为核心，帮助学生建立可视化、可执行、可追踪的成长闭环。

## 技术栈
- Next.js 15 App Router + TypeScript
- Tailwind CSS
- Supabase：PostgreSQL / Auth / Storage（配置后启用）
- Recharts：数据可视化
- Vercel：部署
- npm lockfile：锁定依赖版本，CI 使用 `npm ci` 验证可复现安装

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

不要将真实密钥提交到 Git。浏览器端只使用 anon/publishable key，并依赖 RLS 控制数据权限；`service_role` key 只能放在受保护的服务端环境，当前应用不需要将它暴露给浏览器。个人资料表默认仅允许本人读取和修改。

## Supabase 初始化（新项目）
在 Supabase Dashboard → SQL Editor 中，按顺序执行以下脚本：

1. `supabase/migrations/20261030000000_initial_schema.sql`：创建业务表、知识图谱表、基础 RLS 策略和索引。
2. `supabase/migrations/202610310001_auth_and_storage.sql`：创建用户资料触发器、更新时间触发器、头像存储桶和存储策略。
3. `supabase/migrations/202610310002_seed_knowledge_graph.sql`：写入知识图谱演示节点与关系。
4. `supabase/migrations/202610310003_portfolio_storage.sql`：创建作品图片存储桶，并限制上传、更新和删除操作只能作用于当前用户自己的目录。

也可以执行 `supabase/schema.sql` 作为基础结构脚本，再执行第 2、3 步。不要在已经执行完整迁移后再重复执行旧版非迁移脚本；当前 schema 中的策略已加入重复执行保护。

迁移脚本可重复执行。若数据库已有业务数据，执行前仍建议先备份。执行后可在 Supabase Table Editor 检查表结构和种子数据。仓库 CI 只验证代码类型和生产构建，不会连接或修改你的 Supabase 项目。

## 当前功能与数据边界

已接入 Supabase 数据持久化的模块：
- 账号认证与个人资料：登录态、个人资料读取和编辑。
- 项目管理：个人项目的新建、编辑、删除和列表读取。
- 职业成长路径：成长规划、阶段任务读取与完成状态更新。
- 知识图谱：知识节点/关系读取，个人能力自评保存与回读。
- 学习资源：个人收藏、移除收藏。
- 学习记录：学习主题、类型、时长和备注记录。

仍以演示内容或静态内容为主的部分：
- 首页社区动态、推荐岗位及部分统计图表。
- 作品展示区的作品元数据 CRUD、图片上传、编辑与公开分享（Storage 权限迁移已准备，前端完整接入仍待完成）。
- 资源社区的真实用户投稿与互动。
- 部分页面中的推荐案例、图表样例和视觉占位内容。

未配置 Supabase 时，应用保留演示模式；演示模式中的本地状态不会跨设备持久化。GitHub Actions 负责依赖审计、TypeScript 类型检查和 Next.js 生产构建，不会代替真实 Supabase 项目验证。

## Vercel 部署与自定义域名

### 1. 部署前需要准备
- 一个 Supabase 项目。
- 一个 Vercel 账号，并授权访问本 GitHub 仓库。
- 两个 Supabase 公共环境变量：`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`。
- 如果使用自定义域名，准备好域名管理平台的 DNS 修改权限。

### 2. 初始化 Supabase
在 Supabase Dashboard → SQL Editor 中，按上方“Supabase 初始化”顺序执行三份迁移。然后在 Authentication → URL Configuration 中设置：
- Site URL：先填 Vercel 分配的正式域名，例如 `https://your-project.vercel.app`。
- Redirect URLs：添加 `https://your-project.vercel.app/auth/callback`，本地开发时可另加 `http://localhost:3000/auth/callback`。

### 3. 部署到 Vercel
1. 在 Vercel 中导入 `suyang-1/YUANCHUANG` 仓库。
2. Framework Preset 选择 Next.js，Build Command 使用 `npm run build`，其余保持默认。
3. 在 Project → Settings → Environment Variables 中配置上述两个 Supabase 环境变量，至少勾选 Production；建议 Preview 也配置测试环境变量。
4. 点击 Deploy。之后推送到 `main` 的提交会触发生产部署。

### 4. 绑定自定义域名
在 Vercel 项目 Settings → Domains 添加你的域名，按 Vercel 显示的记录到域名服务商配置 DNS。等待 Vercel 显示域名验证成功并启用 HTTPS 后，将 Supabase Authentication 的 Site URL 和 Redirect URLs 更新为最终域名。若计划使用 `www.yuanchuang.ued.com`，必须先确认你拥有 `ued.com` 的 DNS 管理权限；然后将该完整主机名添加到 Vercel Domains，并严格按 Vercel 页面给出的 DNS 记录配置，不能预先猜测 CNAME 目标。验证成功后再将 Supabase Site URL 设为 `https://www.yuanchuang.ued.com`，并添加 `https://www.yuanchuang.ued.com/auth/callback` 到 Redirect URLs。

### 5. 上线验收
- 注册、登录、退出与邮件回调正常。
- 两个账号之间无法读取或修改彼此的个人资料、项目、成长路径、收藏和学习记录。
- 创建/编辑/删除数据后刷新页面仍然存在。
- 知识图谱节点与种子数据正常显示，能力自评可保存并回读。
- 头像存储策略、移动端布局、浏览器控制台和 Vercel 部署日志无阻断错误。

注意：仓库 CI 成功只代表代码通过自动化检查，不代表已经连接真实 Supabase、完成生产环境安全验收或正式上线。不要把 Supabase service_role key 放进 `NEXT_PUBLIC_*` 变量或提交到 Git。

## UI 还原约定
保留原设计稿的顶部导航、左侧七项菜单、白色背景、紫色强调色、浅色边框、卡片/表格布局、就业趋向气泡图、作品瀑布流与知识图谱双视图。
