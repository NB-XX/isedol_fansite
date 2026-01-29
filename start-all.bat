@echo off
chcp 65001 >nul
echo ========================================
echo   Isedol 粉丝站 - 一键启动
echo ========================================
echo.
echo 提示: 将打开 3 个窗口，请不要关闭它们
echo.
pause

echo [1/3] 启动数据采集系统...
start "数据采集系统" cmd /k "title 数据采集系统 && node index.js all"
timeout /t 3 >nul

echo [2/3] 启动 API 服务器...
start "API服务器" cmd /k "title API服务器 - http://localhost:8080 && cd api-server && node server.js"
timeout /t 3 >nul

echo [3/3] 启动前端网站...
start "前端网站" cmd /k "title 前端网站 - http://localhost:3000 && cd web && npm run dev"
timeout /t 5 >nul

echo.
echo ========================================
echo   ✅ 所有服务已启动！
echo ========================================
echo.
echo 📊 数据采集系统: 正在运行
echo 🔌 API 服务器: http://localhost:8080
echo 🌐 前端网站: http://localhost:3000
echo.
echo 等待 5 秒后自动打开浏览器...
timeout /t 5 >nul

start http://localhost:3000

echo.
echo ========================================
echo   使用说明
echo ========================================
echo.
echo 1. 保持 3 个窗口运行
echo 2. 浏览器访问: http://localhost:3000
echo 3. 关闭所有窗口即可停止服务
echo.
echo 按任意键关闭此窗口...
pause >nul
