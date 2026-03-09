<?php
class AdminUser {
    public static function findByUsername($username) {
        $pdo = Database::get();
        $stmt = $pdo->prepare("SELECT * FROM admin_users WHERE username = ? AND status = 1");
        $stmt->execute([$username]);
        return $stmt->fetch();
    }
}
