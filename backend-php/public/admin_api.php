<?php
require dirname(__DIR__, 2) . '/backend-php/bootstrap.php';

corsHeaders();
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = preg_replace('#^/admin_api\.php#', '', $uri) ?: '/';
$method = $_SERVER['REQUEST_METHOD'];

$adminRoutes = [
    'POST /auth/login' => 'Admin\AuthController@login',
    'GET /auth/me' => 'Admin\AuthController@me',
    'GET /users' => 'Admin\UserController@list',
    'GET /stocks' => 'Admin\StockController@list',
    'POST /stocks' => 'Admin\StockController@create',
    'GET /announcements' => 'Admin\AnnouncementController@list',
    'POST /announcements' => 'Admin\AnnouncementController@create',
    'PUT /announcements/:id' => 'Admin\AnnouncementController@update',
    'DELETE /announcements/:id' => 'Admin\AnnouncementController@delete',
    'GET /invite_codes' => 'Admin\InviteCodeController@list',
];

$authAdminRoutes = ['GET /auth/me', 'GET /users', 'GET /stocks', 'POST /stocks', 'GET /announcements', 'POST /announcements', 'PUT /announcements/:id', 'DELETE /announcements/:id', 'GET /invite_codes'];
$needAuth = false;
$matched = null;
$params = [];

foreach ($adminRoutes as $pattern => $handler) {
    $parts = explode(' ', $pattern, 2);
    $routeMethod = $parts[0];
    $pathPattern = $parts[1];
    $regex = '#^' . preg_replace('#:(\w+)#', '([^/]+)', $pathPattern) . '$#';
    if (preg_match($regex, $uri, $m) && $method === $routeMethod) {
        $matched = $handler;
        $params = array_slice($m, 1);
        $needAuth = in_array($pattern, $authAdminRoutes);
        break;
    }
}

if (!$matched) {
    jsonResponse(['code' => 404, 'msg' => 'Not Found'], 404);
}

$admin = null;
if ($needAuth) {
    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!preg_match('/Bearer\s+(.+)/', $auth, $m)) {
        jsonResponse(['code' => 401, 'msg' => '未登录'], 401);
    }
    $payload = Jwt::decode(trim($m[1]));
    if (!$payload || empty($payload['admin_id'])) {
        jsonResponse(['code' => 401, 'msg' => '登录已过期'], 401);
    }
    $admin = AdminUser::findByUsername($payload['username'] ?? '');
    if (!$admin) {
        jsonResponse(['code' => 401, 'msg' => '管理员不存在'], 401);
    }
}

list($controller, $action) = explode('@', $matched);
$ctrl = new $controller();
$ctrl->$action($params, $admin);
