<?php
/**
 * 创建测试用户 test / 123456
 * 运行: php backend-php/scripts/init_test_user.php
 */
require dirname(__DIR__) . '/bootstrap.php';

$pdo = Database::get();
$stmt = $pdo->prepare("SELECT id FROM users WHERE username = 'test' OR email = 'test@qq.com'");
$stmt->execute();
if ($stmt->fetch()) {
    echo "测试用户已存在。\n";
    exit;
}

$hash = password_hash('123456', PASSWORD_DEFAULT);
$stmt = $pdo->prepare("INSERT INTO users (username, email, password_hash, invite_code) VALUES ('test', 'test@qq.com', ?, '888888')");
$stmt->execute([$hash]);
echo "测试用户已创建。账号: test 或 test@qq.com, 密码: 123456\n";
