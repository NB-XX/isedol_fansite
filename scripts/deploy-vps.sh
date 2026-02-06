#!/bin/bash

# 异世界女团粉丝站 - VPS 部署脚本
# 使用方法: ./deploy-vps.sh

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  异世界女团粉丝站 - VPS 部署${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# 检查是否在项目目录
if [ ! -f "package.json" ]; then
    echo -e "${RED}错误: 请在项目根目录运行此脚本${NC}"
    exit 1
fi

# 1. 拉取最新代码
echo -e "${YELLOW}[1/6] 拉取最新代码...${NC}"
git pull origin main
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 代码更新成功${NC}"
else
    echo -e "${RED}✗ 代码更新失败${NC}"
    exit 1
fi
echo ""

# 2. 安装依赖
echo -e "${YELLOW}[2/6] 安装依赖...${NC}"
npm install --production
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 依赖安装成功${NC}"
else
    echo -e "${RED}✗ 依赖安装失败${NC}"
    exit 1
fi
echo ""

# 3. 备份数据库
echo -e "${YELLOW}[3/6] 备份数据库...${NC}"
if [ -f "./scripts/backup.sh" ]; then
    chmod +x ./scripts/backup.sh
    ./scripts/backup.sh
else
    echo -e "${YELLOW}⚠ 备份脚本不存在，跳过备份${NC}"
fi
echo ""

# 4. 运行数据库迁移（如果有）
echo -e "${YELLOW}[4/6] 检查数据库迁移...${NC}"
if [ -f "./scripts/migrate.js" ]; then
    node ./scripts/migrate.js
    echo -e "${GREEN}✓ 数据库迁移完成${NC}"
else
    echo -e "${GREEN}✓ 无需迁移${NC}"
fi
echo ""

# 5. 重启服务
echo -e "${YELLOW}[5/6] 重启服务...${NC}"
pm2 restart isedol-api
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 服务重启成功${NC}"
else
    echo -e "${RED}✗ 服务重启失败${NC}"
    exit 1
fi
echo ""

# 6. 检查服务状态
echo -e "${YELLOW}[6/6] 检查服务状态...${NC}"
sleep 3
pm2 status isedol-api

# 显示最近日志
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  最近日志 (最后20行)${NC}"
echo -e "${BLUE}========================================${NC}"
pm2 logs isedol-api --lines 20 --nostream

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  部署完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}提示:${NC}"
echo -e "  - 查看日志: ${BLUE}pm2 logs isedol-api${NC}"
echo -e "  - 查看状态: ${BLUE}pm2 status${NC}"
echo -e "  - 重启服务: ${BLUE}pm2 restart isedol-api${NC}"
echo ""
