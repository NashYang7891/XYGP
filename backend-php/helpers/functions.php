<?php
function config($key, $default = null) {
    static $configs = [];
    $parts = explode('.', $key);
    $file = $parts[0];
    if (!isset($configs[$file])) {
        $path = ROOT_PATH . '/backend-php/config/' . $file . '.php';
        $configs[$file] = file_exists($path) ? require $path : [];
    }
    $value = $configs[$file];
    for ($i = 1; $i < count($parts); $i++) {
        $value = $value[$parts[$i]] ?? $default;
    }
    return $value ?? $default;
}

function jsonResponse($data, $code = 200) {
    header('Content-Type: application/json; charset=utf-8');
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function getJsonInput() {
    $input = file_get_contents('php://input');
    return $input ? json_decode($input, true) : [];
}

function corsHeaders() {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowed = config('app.cors_origins', []);
    if (in_array($origin, $allowed)) {
        header("Access-Control-Allow-Origin: $origin");
    }
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Access-Control-Allow-Credentials: true');
}
