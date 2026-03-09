<?php
namespace Admin;

class StockController {
    public function list($params, $admin) {
        $pdo = \Database::get();
        $keyword = $_GET['q'] ?? '';
        $page = max(1, (int)($_GET['page'] ?? 1));
        $size = min(50, max(10, (int)($_GET['size'] ?? 20)));
        $offset = ($page - 1) * $size;
        if ($keyword) {
            $kw = "%$keyword%";
            $stmt = $pdo->prepare("SELECT COUNT(*) FROM stocks WHERE symbol LIKE ? OR name LIKE ?");
            $stmt->execute([$kw, $kw]);
            $total = $stmt->fetchColumn();
            $stmt = $pdo->prepare("SELECT * FROM stocks WHERE symbol LIKE ? OR name LIKE ? ORDER BY id LIMIT ? OFFSET ?");
            $stmt->execute([$kw, $kw, $size, $offset]);
        } else {
            $stmt = $pdo->query("SELECT COUNT(*) FROM stocks");
            $total = $stmt->fetchColumn();
            $stmt = $pdo->prepare("SELECT * FROM stocks ORDER BY id LIMIT ? OFFSET ?");
            $stmt->execute([$size, $offset]);
        }
        $list = $stmt->fetchAll();
        jsonResponse(['code' => 0, 'data' => ['list' => $list, 'total' => $total]]);
    }

    public function create($params, $admin) {
        $input = getJsonInput();
        $symbol = trim($input['symbol'] ?? '');
        $name = trim($input['name'] ?? $symbol);
        if (!$symbol) {
            jsonResponse(['code' => 400, 'msg' => '缺少股票代码']);
        }
        if (\Stock::findBySymbol($symbol)) {
            jsonResponse(['code' => 400, 'msg' => '股票已存在']);
        }
        $id = \Stock::getOrCreate($symbol, $name);
        jsonResponse(['code' => 0, 'data' => ['id' => $id], 'msg' => '添加成功']);
    }
}
