-- Neon / Vercel Postgres 表结构 (日本股票管理系统)

-- 1. 用户表
CREATE TABLE IF NOT EXISTS users (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  username VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  invite_code VARCHAR(50),
  role VARCHAR(20) DEFAULT 'user',
  status SMALLINT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 邀请码表
CREATE TABLE IF NOT EXISTS invite_codes (
  id BIGSERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  total_count INT DEFAULT 0,
  used_count INT DEFAULT 0,
  status SMALLINT DEFAULT 1,
  remark VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 管理员表
CREATE TABLE IF NOT EXISTS admin_users (
  id BIGSERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  security_code_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'admin',
  status SMALLINT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 股票表
CREATE TABLE IF NOT EXISTS stocks (
  id BIGSERIAL PRIMARY KEY,
  symbol VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  exchange VARCHAR(50),
  currency VARCHAR(10) DEFAULT 'JPY',
  sector VARCHAR(100),
  industry VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. K线缓存 (可选)
CREATE TABLE IF NOT EXISTS stock_kline_daily (
  id BIGSERIAL PRIMARY KEY,
  stock_id BIGINT NOT NULL REFERENCES stocks(id),
  trade_date DATE NOT NULL,
  open_price DECIMAL(18,4),
  high_price DECIMAL(18,4),
  low_price DECIMAL(18,4),
  close_price DECIMAL(18,4),
  volume BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(stock_id, trade_date)
);

-- 6. 自选股列表
CREATE TABLE IF NOT EXISTS watchlists (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id),
  name VARCHAR(100) NOT NULL DEFAULT '默认自选',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. 自选股明细
CREATE TABLE IF NOT EXISTS watchlist_items (
  id BIGSERIAL PRIMARY KEY,
  watchlist_id BIGINT NOT NULL REFERENCES watchlists(id),
  stock_id BIGINT NOT NULL REFERENCES stocks(id),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(watchlist_id, stock_id)
);

-- 8. 公告表
CREATE TABLE IF NOT EXISTS announcements (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_active SMALLINT DEFAULT 1,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 初始化邀请码
INSERT INTO invite_codes (code, total_count, used_count, status, remark)
VALUES ('888888', 0, 0, 1, '默认邀请码')
ON CONFLICT (code) DO NOTHING;
