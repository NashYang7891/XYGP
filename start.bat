@echo off
echo 请按顺序启动以下服务：
echo.
echo 1. Python 行情服务 (新窗口)
echo    cd market-service
echo    pip install -r requirements.txt
echo    python app.py
echo.
echo 2. PHP 后端 (新窗口)
echo    php -S 127.0.0.1:8080 -t backend-php/public backend-php/public/router.php
echo.
echo 3. 前端 (新窗口)
echo    cd frontend
echo    npm install
echo    npm run dev
echo.
echo 然后访问 http://localhost:5173
echo 后台管理 http://localhost:5173/admin/login
pause
