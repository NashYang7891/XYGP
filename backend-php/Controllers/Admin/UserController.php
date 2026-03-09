<?php
namespace Admin;

class UserController {
    public function list($params, $admin) {
        $pdo = \Database::get();
        $page = max(1, (int)($_GET['page'] ?? 1));
        $size = min(50, max(10, (int)($_GET['size'] ?? 20)));
        $offset = ($page - 1) * $size;
        $stmt = $pdo->query("SELECT COUNT(*) FROM users");
        $total = $stmt->fetchColumn();
        $stmt = $pdo->prepare("SELECT id, username, email, invite_code, status, created_at FROM users ORDER BY id DESC LIMIT ? OFFSET ?");
        $stmt->execute([$size, $offset]);
        $list = $stmt->fetchAll();
        jsonResponse(['code' => 0, 'data' => ['list' => $list, 'total' => $total]]);
    }
}
