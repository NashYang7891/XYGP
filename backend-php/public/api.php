<?php
require dirname(__DIR__, 2) . '/backend-php/bootstrap.php';

corsHeaders();
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = preg_replace('#^/api\.php#', '', $uri) ?: '/';
$method = $_SERVER['REQUEST_METHOD'];

$routes = [
    'POST /auth/login' => 'AuthController@login',
    'POST /auth/register' => 'AuthController@register',
    'GET /auth/me' => 'AuthController@me',
    'GET /stocks/search' => 'StockController@search',
    'GET /stocks/popular' => 'StockController@popular',
    'GET /stocks/:symbol' => 'StockController@detail',
    'GET /stocks/:symbol/kline' => 'StockController@kline',
    'GET /watchlist' => 'WatchlistController@list',
    'POST /watchlist/add' => 'WatchlistController@add',
    'POST /watchlist/remove' => 'WatchlistController@remove',
    'GET /watchlist/check/:stockId' => 'WatchlistController@check',
    'GET /announcements' => 'AnnouncementController@list',
];

$authRoutes = ['GET /auth/me', 'GET /watchlist', 'POST /watchlist/add', 'POST /watchlist/remove', 'GET /watchlist/check/:stockId'];
$needAuth = false;
$matched = null;
$params = [];

foreach ($routes as $pattern => $handler) {
    $parts = explode(' ', $pattern, 2);
    $routeMethod = $parts[0];
    $pathPattern = $parts[1];
    $regex = '#^' . preg_replace('#:(\w+)#', '([^/]+)', $pathPattern) . '$#';
    if (preg_match($regex, $uri, $m) && $method === $routeMethod) {
        $matched = $handler;
        $params = array_slice($m, 1);
        $needAuth = in_array($pattern, $authRoutes);
        break;
    }
}

if (!$matched) {
    jsonResponse(['code' => 404, 'msg' => 'Not Found'], 404);
}

$user = null;
if ($needAuth) {
    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!preg_match('/Bearer\s+(.+)/', $auth, $m)) {
        jsonResponse(['code' => 401, 'msg' => '未登录'], 401);
    }
    $payload = Jwt::decode(trim($m[1]));
    if (!$payload || empty($payload['user_id'])) {
        jsonResponse(['code' => 401, 'msg' => '登录已过期'], 401);
    }
    $user = User::findById($payload['user_id']);
    if (!$user) {
        jsonResponse(['code' => 401, 'msg' => '用户不存在'], 401);
    }
}

list($controller, $action) = explode('@', $matched);
$ctrl = new $controller();
$ctrl->$action($params, $user);
