<?php
class Stock {
    public static function findBySymbol($symbol) {
        $pdo = Database::get();
        $stmt = $pdo->prepare("SELECT * FROM stocks WHERE symbol = ?");
        $stmt->execute([$symbol]);
        return $stmt->fetch();
    }

    public static function findById($id) {
        $pdo = Database::get();
        $stmt = $pdo->prepare("SELECT * FROM stocks WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public static function getOrCreate($symbol, $name = null) {
        $row = self::findBySymbol($symbol);
        if ($row) return $row['id'];
        $pdo = Database::get();
        $stmt = $pdo->prepare("INSERT INTO stocks (symbol, name) VALUES (?, ?)");
        $stmt->execute([$symbol, $name ?? $symbol]);
        return $pdo->lastInsertId();
    }

    public static function search($keyword, $limit = 20) {
        $pdo = Database::get();
        $kw = "%$keyword%";
        $stmt = $pdo->prepare("SELECT * FROM stocks WHERE symbol LIKE ? OR name LIKE ? LIMIT ?");
        $stmt->execute([$kw, $kw, $limit]);
        return $stmt->fetchAll();
    }

    public static function getPopular($limit = 10) {
        $pdo = Database::get();
        $stmt = $pdo->query("SELECT * FROM stocks ORDER BY id LIMIT " . (int)$limit);
        return $stmt->fetchAll();
    }
}
