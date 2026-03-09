<?php
class StockController {
    public function search($params, $user) {
        $keyword = $_GET['q'] ?? '';
        if (strlen($keyword) < 1) {
            jsonResponse(['code' => 0, 'data' => []]);
        }
        $list = Stock::search($keyword, 20);
        jsonResponse(['code' => 0, 'data' => $list]);
    }

    public function popular($params, $user) {
        $list = Stock::getPopular(20);
        if (empty($list)) {
            // 日本热门股票：丰田、软银、索尼、任天堂、优衣库等
            $symbols = [
                ['7203', 'トヨタ自動車'], ['9984', 'ソフトバンクG'], ['6758', 'ソニーG'],
                ['7974', '任天堂'], ['9983', 'ファーストリテイリング'], ['6861', 'キーエンス'],
                ['8306', '三菱UFJ'], ['9432', '日本電信電話'], ['9433', 'KDDI'],
                ['7267', '本田技研工業'],
            ];
            $pdo = Database::get();
            foreach ($symbols as $item) {
                $s = is_array($item) ? $item[0] : $item;
                $n = is_array($item) ? $item[1] : $item;
                $stmt = $pdo->prepare("INSERT IGNORE INTO stocks (symbol, name) VALUES (?, ?)");
                $stmt->execute([$s, $n]);
            }
            $list = Stock::getPopular(20);
        }
        jsonResponse(['code' => 0, 'data' => $list]);
    }

    public function detail($params, $user) {
        $symbol = $params[0] ?? '';
        if (!$symbol) {
            jsonResponse(['code' => 400, 'msg' => '缺少股票代码']);
        }
        $stock = Stock::findBySymbol($symbol);
        if (!$stock) {
            $stockId = Stock::getOrCreate($symbol, $symbol);
            $stock = Stock::findById($stockId);
        }
        $inWatchlist = $user ? Watchlist::isInWatchlist($user['id'], $stock['id']) : false;
        unset($stock['created_at']);
        $stock['in_watchlist'] = $inWatchlist;
        jsonResponse(['code' => 0, 'data' => $stock]);
    }

    public function kline($params, $user) {
        $symbol = $params[0] ?? '';
        $period = $_GET['period'] ?? '1mo';
        if (!$symbol) {
            jsonResponse(['code' => 400, 'msg' => '缺少股票代码']);
        }
        $stock = Stock::findBySymbol($symbol);
        if (!$stock) {
            $stockId = Stock::getOrCreate($symbol, $symbol);
            $stock = Stock::findById($stockId);
        }
        $url = rtrim(config('app.python_service_url'), '/') . "/kline?symbol=" . urlencode($symbol) . "&period=" . urlencode($period) . "&region=JP";
        $ctx = stream_context_create(['http' => ['timeout' => 15]]);
        $resp = @file_get_contents($url, false, $ctx);
        if ($resp === false) {
            $data = $this->fallbackKline($stock['id']);
        } else {
            $decoded = json_decode($resp, true);
            $data = $decoded['data'] ?? $decoded ?? [];
        }
        jsonResponse(['code' => 0, 'data' => $data]);
    }

    private function fallbackKline($stockId) {
        $pdo = Database::get();
        $stmt = $pdo->prepare("SELECT trade_date as date, open_price as open, high_price as high, low_price as low, close_price as close, volume FROM stock_kline_daily WHERE stock_id = ? ORDER BY trade_date");
        $stmt->execute([$stockId]);
        return $stmt->fetchAll();
    }
}
