#!/bin/bash
# 跨平台启动脚本 (Linux/macOS)

cd "$(dirname "$0")/.."
node service-manager.js "$@"
