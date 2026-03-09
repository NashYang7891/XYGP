<?php
namespace Admin;

class InviteCodeController {
    public function list($params, $admin) {
        $pdo = \Database::get();
        $stmt = $pdo->query("SELECT * FROM invite_codes ORDER BY id DESC");
        $list = $stmt->fetchAll();
        jsonResponse(['code' => 0, 'data' => $list]);
    }
}
