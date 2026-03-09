<?php
class Watchlist {
    public static function getDefaultByUser($userId) {
        $pdo = Database::get();
        $stmt = $pdo->prepare("SELECT * FROM watchlists WHERE user_id = ? ORDER BY id LIMIT 1");
        $stmt->execute([$userId]);
        $row = $stmt->fetch();
        if ($row) return $row;
        $stmt = $pdo->prepare("INSERT INTO watchlists (user_id, name) VALUES (?, '默认自选')");
        $stmt->execute([$userId]);
        return ['id' => $pdo->lastInsertId(), 'user_id' => $userId, 'name' => '默认自选'];
    }

    public static function addStock($watchlistId, $stockId, $userId) {
        $pdo = Database::get();
        $stmt = $pdo->prepare("SELECT user_id FROM watchlists WHERE id = ?");
        $stmt->execute([$watchlistId]);
        $wl = $stmt->fetch();
        if (!$wl || $wl['user_id'] != $userId) return false;
        try {
            $stmt = $pdo->prepare("INSERT INTO watchlist_items (watchlist_id, stock_id) VALUES (?, ?)");
            $stmt->execute([$watchlistId, $stockId]);
            return true;
        } catch (PDOException $e) {
            if ($e->getCode() == 23000) return true; // 已存在
            throw $e;
        }
    }

    public static function removeStock($watchlistId, $stockId, $userId) {
        $pdo = Database::get();
        $stmt = $pdo->prepare("DELETE wi FROM watchlist_items wi JOIN watchlists w ON wi.watchlist_id = w.id WHERE wi.watchlist_id = ? AND wi.stock_id = ? AND w.user_id = ?");
        return $stmt->execute([$watchlistId, $stockId, $userId]);
    }

    public static function getItems($watchlistId, $userId) {
        $pdo = Database::get();
        $stmt = $pdo->prepare("
            SELECT s.id, s.symbol, s.name, wi.id as item_id
            FROM watchlist_items wi
            JOIN stocks s ON wi.stock_id = s.id
            JOIN watchlists w ON wi.watchlist_id = w.id
            WHERE wi.watchlist_id = ? AND w.user_id = ?
            ORDER BY wi.sort_order, wi.id
        ");
        $stmt->execute([$watchlistId, $userId]);
        return $stmt->fetchAll();
    }

    public static function isInWatchlist($userId, $stockId) {
        $pdo = Database::get();
        $stmt = $pdo->prepare("
            SELECT 1 FROM watchlist_items wi
            JOIN watchlists w ON wi.watchlist_id = w.id
            WHERE w.user_id = ? AND wi.stock_id = ?
        ");
        $stmt->execute([$userId, $stockId]);
        return (bool)$stmt->fetch();
    }
}
