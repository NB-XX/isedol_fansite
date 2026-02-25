# VPS 部署脚本

param(
    [Parameter(Mandatory=$true)]
    [string]$VpsHost,
    
    [Parameter(Mandatory=$false)]
    [int]$VpsPort = 443,
    
    [Parameter(Mandatory=$false)]
    [string]$VpsUser = "root",
    
    [Parameter(Mandatory=$false)]
    [string]$VpsPath = "/root/isedol"
)

Write-Host "🚀 开始部署到 VPS..." -ForegroundColor Green
Write-Host "目标: ${VpsUser}@${VpsHost}:${VpsPort}" -ForegroundColor Cyan

# 上传文件
Write-Host "`n📤 上传文件..." -ForegroundColor Cyan
$files = @(
    "vps-server.js",
    "package.json",
    ".env.vps",
    "src/modules/cafe-scraper.js",
    "src/modules/stream-monitor.js",
    "src/modules/translator.js",
    "src/database/index-simple.js",
    "src/config/index.js",
    "src/utils/logger.js"
)

foreach ($file in $files) {
    Write-Host "  上传 $file..." -ForegroundColor Gray
    $remoteDir = Split-Path -Parent $file
    if ($remoteDir) {
        ssh -p $VpsPort "${VpsUser}@${VpsHost}" "mkdir -p ${VpsPath}/${remoteDir}"
    }
    scp -P $VpsPort $file "${VpsUser}@${VpsHost}:${VpsPath}/${file}"
}

# 安装依赖并重启
Write-Host "`n📦 安装依赖..." -ForegroundColor Cyan
ssh -p $VpsPort "${VpsUser}@${VpsHost}" @"
cd $VpsPath
npm install --production
pm2 restart isedol-vps || pm2 start vps-server.js --name isedol-vps
pm2 save
"@

Write-Host "`n✅ VPS 部署完成！" -ForegroundColor Green
Write-Host "`n查看日志:" -ForegroundColor Yellow
Write-Host "ssh -p $VpsPort ${VpsUser}@${VpsHost} 'pm2 logs isedol-vps'" -ForegroundColor White
