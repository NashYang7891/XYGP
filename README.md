# 日本股票管理系统

Vue3 + Element Plus 前端 + Node.js API (Vercel) + Neon Postgres + iTick 行情

## 快速部署到 Vercel

1. **创建 Neon 数据库**：https://neon.tech 注册并创建项目，复制 `DATABASE_URL`
2. **获取 iTick Token**：https://docs.itick.org 注册获取
3. **推送到 GitHub**，在 Vercel 导入项目
4. **配置环境变量**：`DATABASE_URL`、`ITICK_TOKEN`、`JWT_SECRET`（可选）
5. **初始化数据库**：在 Neon 执行 `docs/schema-postgres.sql`，然后运行 `node scripts/init-db.js`

详见 [DEPLOY.md](./DEPLOY.md)

## 本地开发

```bash
# 安装依赖
npm install
cd frontend && npm install

# 配置 .env（根目录）
DATABASE_URL=postgresql://...
ITICK_TOKEN=你的Token

# 初始化数据库
node scripts/init-db.js

# 方式一：Vercel Dev（推荐，前后端一起跑）
npx vercel dev

# 方式二：仅前端
cd frontend && npm run dev
```

## 默认账号

| 类型 | 账号 | 密码 | 安全码/邀请码 |
|------|------|------|---------------|
| 前端用户 | test / test@qq.com | 123456 | 888888 |
| 后台管理 | admin | admin123456 | test66 |
