-- 股票管理系统 - MySQL 表结构
-- 执行前请先创建数据库: CREATE DATABASE stock_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; USE stock_db;

-- 1. 用户表
CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE,
  username VARCHAR(100) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  invite_code VARCHAR(50),
  role ENUM('user','admin') DEFAULT 'user',
  status TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. 邀请码表
CREATE TABLE IF NOT EXISTS invite_codes (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(50) UNIQUE NOT NULL,
  total_count INT DEFAULT 0,
  used_count INT DEFAULT 0,
  status TINYINT DEFAULT 1,
  remark VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. 管理员表
CREATE TABLE IF NOT EXISTS admin_users (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  security_code_hash VARCHAR(255) NOT NULL,
  role ENUM('super','admin','read_only') DEFAULT 'admin',
  status TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. 股票基础信息表
CREATE TABLE IF NOT EXISTS stocks (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  symbol VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  exchange VARCHAR(50),
  currency VARCHAR(10) DEFAULT 'USD',
  sector VARCHAR(100),
  industry VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_symbol (symbol)
);

-- 5. K线日线缓存表
CREATE TABLE IF NOT EXISTS stock_kline_daily (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  stock_id BIGINT UNSIGNED NOT NULL,
  trade_date DATE NOT NULL,
  open_price DECIMAL(18,4),
  high_price DECIMAL(18,4),
  low_price DECIMAL(18,4),
  close_price DECIMAL(18,4),
  volume BIGINT,
  adj_close DECIMAL(18,4),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_stock_date (stock_id, trade_date),
  KEY idx_trade_date (trade_date)
);

-- 6. 自选股列表
CREATE TABLE IF NOT EXISTS watchlists (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(100) NOT NULL DEFAULT '默认自选',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 7. 自选股明细
CREATE TABLE IF NOT EXISTS watchlist_items (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  watchlist_id BIGINT UNSIGNED NOT NULL,
  stock_id BIGINT UNSIGNED NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_watchlist_stock (watchlist_id, stock_id)
);

-- 8. 模拟持仓组合
CREATE TABLE IF NOT EXISTS portfolios (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(100) NOT NULL DEFAULT '默认组合',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 9. 模拟交易记录
CREATE TABLE IF NOT EXISTS portfolio_trades (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  portfolio_id BIGINT UNSIGNED NOT NULL,
  stock_id BIGINT UNSIGNED NOT NULL,
  trade_time DATETIME NOT NULL,
  side ENUM('buy','sell') NOT NULL,
  quantity DECIMAL(18,4) NOT NULL,
  price DECIMAL(18,4) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 10. 公告表
CREATE TABLE IF NOT EXISTS announcements (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_active TINYINT DEFAULT 1,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 11. 登录日志
CREATE TABLE IF NOT EXISTS login_logs (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT UNSIGNED,
  username VARCHAR(100),
  ip VARCHAR(50),
  is_admin TINYINT DEFAULT 0,
  status TINYINT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 初始化邀请码
INSERT INTO invite_codes (code, total_count, used_count, status, remark) VALUES ('888888', 0, 0, 1, '默认邀请码') ON DUPLICATE KEY UPDATE code=code;

-- 管理员需运行: php backend-php/scripts/init_admin.php 创建账号 admin / admin123456 / 安全码 test66
