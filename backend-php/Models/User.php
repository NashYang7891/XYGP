<?php
class User {
    public static function findByUsernameOrEmail($login) {
        $pdo = Database::get();
        $stmt = $pdo->prepare("SELECT * FROM users WHERE (username = ? OR email = ?) AND status = 1");
        $stmt->execute([$login, $login]);
        return $stmt->fetch();
    }

    public static function findById($id) {
        $pdo = Database::get();
        $stmt = $pdo->prepare("SELECT id, username, email, role, created_at FROM users WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public static function create($data) {
        $pdo = Database::get();
        $stmt = $pdo->prepare("INSERT INTO users (username, email, password_hash, invite_code) VALUES (?, ?, ?, ?)");
        $stmt->execute([
            $data['username'],
            $data['email'] ?? null,
            password_hash($data['password'], PASSWORD_DEFAULT),
            $data['invite_code'] ?? null
        ]);
        return $pdo->lastInsertId();
    }
}
