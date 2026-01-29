@echo off
chcp 65001 >nul
title 数据采集系统
echo ========================================
echo   启动数据采集系统
echo ========================================
echo.

echo 正在启动爬虫和监控...
echo.
npm start

pause
