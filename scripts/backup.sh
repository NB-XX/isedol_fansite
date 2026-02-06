#!/bin/bash

# 异世界女团粉丝站 - 数据库备份脚本
# 使用方法: ./backup.sh

# 配置
BACKUP_DIR=~/backups/isedol-fansite
PROJECT_DIR=~/apps/isedol-fansite
DATE=$(date +%Y%m%d_%H%M%S)
KEEP_DAYS=30

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  异世界女团粉丝站 - 数据库备份${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 创建备份目录
mkdir -p $BACKUP_DIR

# 检查数据库文件是否存在
if [ ! -f "$PROJECT_DIR/data/database.db" ]; then
    echo -e "${RED}错误: 数据库文件不存在${NC}"
    exit 1
fi

# 备份数据库
echo -e "${YELLOW}正在备份数据库...${NC}"
cp $PROJECT_DIR/data/database.db $BACKUP_DIR/database_$DATE.db

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 数据库复制成功${NC}"
else
    echo -e "${RED}✗ 数据库复制失败${NC}"
    exit 1
fi

# 压缩备份
echo -e "${YELLOW}正在压缩备份文件...${NC}"
gzip $BACKUP_DIR/database_$DATE.db

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 压缩成功${NC}"
    BACKUP_FILE="database_$DATE.db.gz"
    BACKUP_SIZE=$(du -h $BACKUP_DIR/$BACKUP_FILE | cut -f1)
    echo -e "${GREEN}  文件: $BACKUP_FILE${NC}"
    echo -e "${GREEN}  大小: $BACKUP_SIZE${NC}"
else
    echo -e "${RED}✗ 压缩失败${NC}"
    exit 1
fi

# 删除旧备份
echo -e "${YELLOW}正在清理旧备份...${NC}"
OLD_BACKUPS=$(find $BACKUP_DIR -name "database_*.db.gz" -mtime +$KEEP_DAYS)
if [ -n "$OLD_BACKUPS" ]; then
    echo "$OLD_BACKUPS" | while read file; do
        rm "$file"
        echo -e "${GREEN}✓ 已删除: $(basename $file)${NC}"
    done
else
    echo -e "${GREEN}✓ 没有需要清理的旧备份${NC}"
fi

# 显示备份列表
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  当前备份列表 (最近5个)${NC}"
echo -e "${GREEN}========================================${NC}"
ls -lht $BACKUP_DIR/database_*.db.gz | head -5 | awk '{print $9, "(" $5 ")"}'

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  备份完成！${NC}"
echo -e "${GREEN}========================================${NC}"
