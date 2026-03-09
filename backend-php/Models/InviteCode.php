<?php
class InviteCode {
    public static function validate($code) {
        $pdo = Database::get();
        $stmt = $pdo->prepare("SELECT * FROM invite_codes WHERE code = ? AND status = 1");
        $stmt->execute([$code]);
        $row = $stmt->fetch();
        if (!$row) return false;
        if ($row['total_count'] > 0 && $row['used_count'] >= $row['total_count']) return false;
        return $row;
    }

    public static function incrementUsed($code) {
        $pdo = Database::get();
        $stmt = $pdo->prepare("UPDATE invite_codes SET used_count = used_count + 1 WHERE code = ?");
        return $stmt->execute([$code]);
    }
}
