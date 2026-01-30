@echo off
REM 跨平台启动脚本 (Windows)

cd /d "%~dp0\.."
node service-manager.js %*
