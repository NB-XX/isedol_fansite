# Cloudflare 部署脚本 (PowerShell)
# 使用方法: .\scripts\deploy-cloudflare.ps1

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Cloudflare 部署脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查 wrangler 是否安装
Write-Host "检查 Wrangler CLI..." -ForegroundColor Yellow
try {
    $null = Get-Command wrangler -ErrorAction Stop
    Write-Host "[OK] Wrangler CLI 已安装" -ForegroundColor Green
} catch {
    Write-Host "[错误] Wrangler CLI 未安装" -ForegroundColor Red
    Write-Host "请运行: npm install -g wrangler" -ForegroundColor Yellow
    exit 1
}
Write-Host ""

# 步骤 1: 生成迁移 SQL
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "步骤 1/5: 生成数据库迁移 SQL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
if (Test-Path "data\database.db") {
    node scripts\migrate-to-d1.js
    Write-Host "[OK] 迁移 SQL 已生成" -ForegroundColor Green
} else {
    Write-Host "[警告] 本地数据库不存在，跳过迁移" -ForegroundColor Yellow
}
Write-Host ""

# 步骤 2: 提示创建 D1 数据库
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "步骤 2/5: D1 数据库" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "如果还没有创建 D1 数据库，请运行:" -ForegroundColor Yellow
Write-Host "  wrangler d1 create isedol-fansite-db" -ForegroundColor White
Write-Host "然后将 database_id 填入 wrangler.toml" -ForegroundColor Yellow
Write-Host ""
Write-Host "按任意键继续..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
Write-Host ""

# 步骤 3: 执行数据库迁移
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "步骤 3/5: 执行数据库迁移" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
if (Test-Path "workers\d1-schema.sql") {
    Write-Host "创建表结构..." -ForegroundColor Yellow
    wrangler d1 execute isedol-fansite-db --file=workers\d1-schema.sql
    Write-Host "[OK] 表结构创建完成" -ForegroundColor Green
    
    if (Test-Path "workers\d1-migration.sql") {
        Write-Host "导入数据..." -ForegroundColor Yellow
        wrangler d1 execute isedol-fansite-db --file=workers\d1-migration.sql
        Write-Host "[OK] 数据导入完成" -ForegroundColor Green
    }
} else {
    Write-Host "[警告] 迁移文件不存在，跳过" -ForegroundColor Yellow
}
Write-Host ""

# 步骤 4: 部署 Workers
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "步骤 4/5: 部署 Workers API" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
wrangler deploy
Write-Host "[OK] Workers 部署完成" -ForegroundColor Green
Write-Host ""

# 步骤 5: 构建并部署前端
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "步骤 5/5: 构建并部署前端" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Push-Location web

# 检查是否需要安装依赖
if (-not (Test-Path "node_modules")) {
    Write-Host "安装前端依赖..." -ForegroundColor Yellow
    npm install
}

Write-Host "构建前端..." -ForegroundColor Yellow
npm run build

Write-Host "部署到 Pages..." -ForegroundColor Yellow
wrangler pages deploy dist --project-name=isedol-fansite

Pop-Location
Write-Host "[OK] 前端部署完成" -ForegroundColor Green
Write-Host ""

# 完成
Write-Host "========================================" -ForegroundColor Green
Write-Host "   部署完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "下一步操作：" -ForegroundColor Cyan
Write-Host "1. 在 Cloudflare Dashboard 中配置 Workers 环境变量：" -ForegroundColor White
Write-Host "   - VPS_API_URL" -ForegroundColor Gray
Write-Host "   - VPS_API_KEY" -ForegroundColor Gray
Write-Host ""
Write-Host "2. 在 VPS 上部署后端服务（参考 DEPLOYMENT.md）" -ForegroundColor White
Write-Host ""
Write-Host "3. 访问你的网站：" -ForegroundColor White
Write-Host "   - Workers API: https://isedol-fansite-api.你的域名.workers.dev" -ForegroundColor Gray
Write-Host "   - Pages 前端: https://isedol-fansite.pages.dev" -ForegroundColor Gray
Write-Host ""
Write-Host "详细文档: DEPLOYMENT.md" -ForegroundColor Cyan
Write-Host ""
Write-Host "按任意键退出..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
