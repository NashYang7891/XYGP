<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
date_default_timezone_set('Asia/Shanghai');

define('ROOT_PATH', dirname(__DIR__) ?: getcwd());
require ROOT_PATH . '/backend-php/helpers/functions.php';
require ROOT_PATH . '/backend-php/helpers/Database.php';

spl_autoload_register(function ($class) {
    if (strpos($class, 'Admin\\') === 0) {
        $name = str_replace('Admin\\', '', $class);
        $file = ROOT_PATH . '/backend-php/Controllers/Admin/' . $name . '.php';
        if (file_exists($file)) {
            require $file;
            return;
        }
    }
    $paths = ['backend-php/Models', 'backend-php/Controllers', 'backend-php/Services'];
    foreach ($paths as $path) {
        $file = ROOT_PATH . '/' . $path . '/' . $class . '.php';
        if (file_exists($file)) {
            require $file;
            return;
        }
    }
});
