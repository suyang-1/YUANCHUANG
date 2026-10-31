# YUANCHUANG｜设计成长平台

面向设计类学生的学习与职业成长平台。以职业探索、成长路径、知识图谱、学习资源、项目实践和作品展示为核心，帮助学生建立可视化、可执行、可追踪的成长闭环。

## 技术栈
- Next.js 15 App Router + TypeScript
- Tailwind CSS
- Supabase：PostgreSQL / Auth / Storage（配置后启用）
- Recharts：数据可视化
- 腾讯云 EdgeOne Pages：全栈部署（Next.js SSR / App Router）
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
- 账号认证与个人资料：登录态、个人资料读取和编辑；个人主页能力雷达图读取知识图谱自评，成长趋势按学习记录累计时长生成，无数据时显示空状态。
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

## 腾讯云 EdgeOne Pages 部署与自定义域名

### 1. 部署前准备
- 一个腾讯云账号，并已开通 EdgeOne Pages / EdgeOne Makers。
- 一个 Supabase 项目，已按上方顺序执行 4 份迁移。
- GitHub 仓库访问授权。
- Supabase 公共环境变量：`NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`。
- 如需使用 `www.yuanchuang.ued.com`，还需要拥有 `ued.com` 的 DNS 管理权限，或请域名管理员代为添加记录。

### 2. 从 GitHub 导入项目
1. 打开 [EdgeOne Pages 控制台](https://edgeone.cloud.tencent.com/pages)。
2. 选择通过 Git 仓库创建项目，连接 GitHub，并授权访问 `suyang-1/YUANCHUANG`。
3. 选择仓库与 `main` 分支。项目根目录保持仓库根目录。
4. 框架选择 Next.js；构建命令使用 `npm run build`。当前项目是 Next.js 15 App Router 全栈应用，使用默认 Next.js 部署模式，不要添加 `output: "export"`，也不要将输出目录强行改为 `out`。
5. 在构建环境变量中添加：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. 开始部署，等待构建日志完成；通过 EdgeOne 分配的预览域名检查页面、登录回调和数据读写。

### 3. Supabase 回调地址
在 Supabase Dashboard → Authentication → URL Configuration 中设置：
- Site URL：先使用 EdgeOne 分配的正式站点域名。
- Redirect URLs：添加 `https://你的EdgeOne站点域名/auth/callback`。
- 本地开发可另加 `http://localhost:3000/auth/callback`。

### 4. 绑定正式域名
1. 在 EdgeOne Pages 项目设置中添加 `www.yuanchuang.ued.com`。
2. 按控制台为该域名实际生成的 DNS 记录，在 `ued.com` 域名 DNS 服务商处配置；不要猜测或套用其他项目的 CNAME / TXT 值。
3. 等待域名验证与 HTTPS 证书签发完成。
4. 将 Supabase Site URL 更新为 `https://www.yuanchuang.ued.com`，并添加 `https://www.yuanchuang.ued.com/auth/callback` 到 Redirect URLs。

### 5. 自动部署与上线验收
- GitHub `main` 分支有新提交时，EdgeOne Pages 应自动触发新部署。
- 验证注册、登录、退出和邮件回调。
- 验证个人资料、项目、成长路径、收藏与学习记录能在刷新后保持。
- 使用两个不同账号验证 RLS 隔离。
- 检查作品图片上传、移动端布局、浏览器控制台和 EdgeOne 构建日志。
- GitHub Actions 成功只代表代码通过自动化检查，不代表已经连接真实 Supabase 或完成线上验收。

### 6. 安全说明
浏览器端只使用 Supabase anon / publishable key，并依赖 RLS 控制数据权限。不要将 Supabase `service_role` key 放进 `NEXT_PUBLIC_*` 变量、EdgeOne 前端变量或 Git 仓库。当前项目不需要向浏览器暴露 service role key。

### 7. 备用部署平台
如 EdgeOne 实际构建日志出现当前项目使用的 Next.js 功能不兼容，可保留现有 Next.js 架构并评估支持 Node.js 的托管平台；不应为通过部署而未经评估地切换为静态导出模式。

## UI 还原约定
保留原设计稿的顶部导航、左侧七项菜单、白色背景、紫色强调色、浅色边框、卡片/表格布局、就业趋向气泡图、作品瀑布流与知识图谱双视图。
