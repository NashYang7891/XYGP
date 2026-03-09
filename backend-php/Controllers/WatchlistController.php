<?php
class WatchlistController {
    public function list($params, $user) {
        $wl = Watchlist::getDefaultByUser($user['id']);
        $items = Watchlist::getItems($wl['id'], $user['id']);
        jsonResponse(['code' => 0, 'data' => ['watchlist' => $wl, 'items' => $items]]);
    }

    public function add($params, $user) {
        $input = getJsonInput();
        $stockId = (int)($input['stock_id'] ?? 0);
        if (!$stockId) {
            jsonResponse(['code' => 400, 'msg' => '缺少股票ID']);
        }
        $wl = Watchlist::getDefaultByUser($user['id']);
        if (!Stock::findById($stockId)) {
            jsonResponse(['code' => 400, 'msg' => '股票不存在']);
        }
        Watchlist::addStock($wl['id'], $stockId, $user['id']);
        jsonResponse(['code' => 0, 'msg' => '添加成功']);
    }

    public function remove($params, $user) {
        $input = getJsonInput();
        $stockId = (int)($input['stock_id'] ?? 0);
        if (!$stockId) {
            jsonResponse(['code' => 400, 'msg' => '缺少股票ID']);
        }
        $wl = Watchlist::getDefaultByUser($user['id']);
        Watchlist::removeStock($wl['id'], $stockId, $user['id']);
        jsonResponse(['code' => 0, 'msg' => '移除成功']);
    }

    public function check($params, $user) {
        $stockId = (int)($params[0] ?? 0);
        $in = Watchlist::isInWatchlist($user['id'], $stockId);
        jsonResponse(['code' => 0, 'data' => ['in_watchlist' => $in]]);
    }
}
