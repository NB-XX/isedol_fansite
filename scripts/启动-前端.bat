@echo off
chcp 65001 >nul
title 前端网站 - http://localhost:3000
echo ========================================
echo   启动前端网站
echo ========================================
echo.

cd ..\web
echo 正在启动 Vite 开发服务器...
echo.
npm run dev

pause
