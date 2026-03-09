<?php
/**
 * 初始化管理员账号
 * 运行: php backend-php/scripts/init_admin.php
 */
require dirname(__DIR__) . '/bootstrap.php';

$pdo = Database::get();
$pwHash = password_hash('admin123456', PASSWORD_DEFAULT);
$secHash = password_hash('test66', PASSWORD_DEFAULT);

$stmt = $pdo->prepare("SELECT id FROM admin_users WHERE username = 'admin'");
$stmt->execute();
if ($stmt->fetch()) {
    $stmt = $pdo->prepare("UPDATE admin_users SET password_hash = ?, security_code_hash = ? WHERE username = 'admin'");
    $stmt->execute([$pwHash, $secHash]);
    echo "管理员密码已更新。\n";
} else {
    $stmt = $pdo->prepare("INSERT INTO admin_users (username, password_hash, security_code_hash, role, status) VALUES ('admin', ?, ?, 'super', 1)");
    $stmt->execute([$pwHash, $secHash]);
    echo "管理员已创建。账号: admin, 密码: admin123456, 安全码: test66\n";
}
