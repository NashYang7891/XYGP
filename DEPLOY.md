# 部署到 Vercel（GitHub + Vercel）

## 一、准备

### 1. 创建 Neon 数据库（免费）

1. 打开 https://neon.tech 注册
2. 创建新项目，选择区域（如 Singapore）
3. 复制连接字符串 `DATABASE_URL`（格式：`postgresql://user:pass@host/db?sslmode=require`）

### 2. 获取 iTick API Token

1. 打开 https://docs.itick.org 注册
2. 获取 API Token

---

## 二、部署步骤

### 1. 推送到 GitHub

```bash
cd XYGP
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/你的用户名/仓库名.git
git push -u origin main
```

### 2. 在 Vercel 导入项目

1. 打开 https://vercel.com 登录（可用 GitHub 账号）
2. 点击 **Add New** → **Project**
3. 选择刚推送的 GitHub 仓库，点击 **Import**
4. 配置环境变量（Settings → Environment Variables）：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `DATABASE_URL` | `postgresql://...` | Neon 连接字符串 |
| `ITICK_TOKEN` | 你的 Token | iTick API 密钥 |
| `JWT_SECRET` | 随机字符串 | JWT 签名密钥（可选，有默认值） |

5. 点击 **Deploy**

### 3. 初始化数据库

1. 在 Neon 控制台 **SQL Editor** 中执行 `docs/schema-postgres.sql` 创建表结构
2. 本地运行（需配置 DATABASE_URL）：

```bash
npm install
DATABASE_URL="你的Neon连接串" node scripts/init-db.js
```

会创建管理员 (admin/admin123456/安全码test66) 和测试用户 (test/123456)。

---

## 三、访问

部署完成后，Vercel 会给出一个地址，例如：

- 前端：`https://xxx.vercel.app`
- 后台：`https://xxx.vercel.app/admin/login`

### 默认账号

| 类型 | 账号 | 密码 | 安全码/邀请码 |
|------|------|------|---------------|
| 前端用户 | test / test@qq.com | 123456 | 888888 |
| 后台管理 | admin | admin123456 | test66 |

---

## 四、常见问题

1. **登录接口 404**：在 Vercel 项目 **Settings → General → Root Directory** 必须为 **空** 或 **`.`**（项目根目录）。若设为 `frontend`，则 `api/` 不会被部署，导致 `/api/auth/login` 等接口 404。
2. **K 线不显示**：检查 `ITICK_TOKEN` 是否配置正确
3. **登录失败（非 404）**：确认已运行 `init-db.js` 创建管理员和测试用户
4. **数据库连接失败**：检查 `DATABASE_URL` 格式和 Neon 项目是否已启动
