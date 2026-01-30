@echo off
chcp 65001 >nul
title API服务器 - http://localhost:8080
echo ========================================
echo   启动 API 服务器
echo ========================================
echo.

cd ..\api-server
echo 正在启动 Express 服务器...
echo.
npm start

pause
