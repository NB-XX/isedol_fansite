#!/bin/bash
# Cloudflare 一键部署脚本

set -e

echo "🚀 开始部署到 Cloudflare..."
echo ""

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查 wrangler 是否安装
if ! command -v wrangler &> /dev/null; then
    echo -e "${RED}❌ Wrangler CLI 未安装${NC}"
    echo "请运行: npm install -g wrangler"
    exit 1
fi

echo -e "${GREEN}✅ Wrangler CLI 已安装${NC}"

# 检查是否已登录
if ! wrangler whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  未登录 Cloudflare${NC}"
    echo "正在打开登录页面..."
    wrangler login
fi

echo -e "${GREEN}✅ 已登录 Cloudflare${NC}"
echo ""

# 步骤 1: 生成迁移 SQL
echo "📝 步骤 1/5: 生成数据库迁移 SQL..."
if [ -f "data/database.db" ]; then
    node scripts/migrate-to-d1.js
    echo -e "${GREEN}✅ 迁移 SQL 已生成${NC}"
else
    echo -e "${YELLOW}⚠️  本地数据库不存在，跳过迁移${NC}"
fi
echo ""

# 步骤 2: 检查 D1 数据库
echo "🗄️  步骤 2/5: 检查 D1 数据库..."
DB_NAME="isedol-fansite-db"

# 尝试列出数据库
if wrangler d1 list | grep -q "$DB_NAME"; then
    echo -e "${GREEN}✅ D1 数据库已存在${NC}"
else
    echo -e "${YELLOW}⚠️  D1 数据库不存在，正在创建...${NC}"
    wrangler d1 create "$DB_NAME"
    echo ""
    echo -e "${YELLOW}⚠️  请将上面输出的 database_id 填入 wrangler.toml${NC}"
    echo "按 Enter 继续..."
    read
fi
echo ""

# 步骤 3: 执行数据库迁移
echo "📊 步骤 3/5: 执行数据库迁移..."
if [ -f "workers/d1-schema.sql" ]; then
    echo "创建表结构..."
    wrangler d1 execute "$DB_NAME" --file=workers/d1-schema.sql
    echo -e "${GREEN}✅ 表结构创建完成${NC}"
    
    if [ -f "workers/d1-migration.sql" ]; then
        echo "导入数据..."
        wrangler d1 execute "$DB_NAME" --file=workers/d1-migration.sql
        echo -e "${GREEN}✅ 数据导入完成${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  迁移文件不存在，跳过${NC}"
fi
echo ""

# 步骤 4: 部署 Workers
echo "⚙️  步骤 4/5: 部署 Workers API..."
wrangler deploy
echo -e "${GREEN}✅ Workers 部署完成${NC}"
echo ""

# 步骤 5: 构建并部署前端
echo "🎨 步骤 5/5: 构建并部署前端..."
cd web

# 检查是否需要安装依赖
if [ ! -d "node_modules" ]; then
    echo "安装前端依赖..."
    npm install
fi

echo "构建前端..."
npm run build

echo "部署到 Pages..."
wrangler pages deploy dist --project-name=isedol-fansite

cd ..
echo -e "${GREEN}✅ 前端部署完成${NC}"
echo ""

# 完成
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}🎉 部署完成！${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 下一步操作："
echo "1. 在 Cloudflare Dashboard 中配置 Workers 环境变量："
echo "   - VPS_API_URL"
echo "   - VPS_API_KEY"
echo ""
echo "2. 在 VPS 上部署后端服务（参考 DEPLOYMENT.md）"
echo ""
echo "3. 访问你的网站："
echo "   - Workers API: https://isedol-fansite-api.你的域名.workers.dev"
echo "   - Pages 前端: https://isedol-fansite.pages.dev"
echo ""
echo "📚 详细文档: DEPLOYMENT.md"
echo ""
