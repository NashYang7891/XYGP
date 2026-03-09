#!/usr/bin/env node
/**
 * 初始化数据库：创建管理员和测试用户
 * 需要 DATABASE_URL 或 POSTGRES_URL 环境变量
 * 运行: node scripts/init-db.js
 */
import { neon } from '@neondatabase/serverless'
import bcrypt from 'bcryptjs'

const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL)
if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
  console.error('请设置 DATABASE_URL 或 POSTGRES_URL')
  process.exit(1)
}

async function main() {
  // 创建管理员
  const adminRows = await sql`SELECT id FROM admin_users WHERE username = 'admin' LIMIT 1`
  const pwHash = bcrypt.hashSync('admin123456', 10)
  const secHash = bcrypt.hashSync('test66', 10)
  if (!adminRows.length) {
    await sql`INSERT INTO admin_users (username, password_hash, security_code_hash, role, status)
      VALUES ('admin', ${pwHash}, ${secHash}, 'super', 1)`
    console.log('管理员已创建: admin / admin123456 / 安全码 test66')
  } else {
    await sql`UPDATE admin_users SET password_hash = ${pwHash}, security_code_hash = ${secHash} WHERE username = 'admin'`
    console.log('管理员密码已更新')
  }

  // 创建测试用户
  const userRows = await sql`SELECT id FROM users WHERE username = 'test' LIMIT 1`
  const userHash = bcrypt.hashSync('123456', 10)
  if (!userRows.length) {
    await sql`INSERT INTO users (username, email, password_hash, invite_code) VALUES ('test', 'test@qq.com', ${userHash}, '888888')`
    console.log('测试用户已创建: test 或 test@qq.com / 123456')
  } else {
    console.log('测试用户已存在')
  }
}

main().catch(e => { console.error(e); process.exit(1) })
