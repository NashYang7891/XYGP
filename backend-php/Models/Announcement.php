<?php
class Announcement {
    public static function getActive($limit = 10) {
        $pdo = Database::get();
        $stmt = $pdo->prepare("SELECT id, title, content, created_at FROM announcements WHERE is_active = 1 ORDER BY sort_order DESC, id DESC LIMIT ?");
        $stmt->execute([$limit]);
        return $stmt->fetchAll();
    }
}
