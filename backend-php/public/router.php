<?php
$uri = $_SERVER['REQUEST_URI'] ?? '/';
if (strpos($uri, '/admin_api.php') === 0) {
    require __DIR__ . '/admin_api.php';
    return true;
}
if (strpos($uri, '/api.php') === 0) {
    require __DIR__ . '/api.php';
    return true;
}
return false;
