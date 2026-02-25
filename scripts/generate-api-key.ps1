# 生成随机 API Key
# 使用方法: .\scripts\generate-api-key.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   生成 API Key" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 生成 32 字节的随机密钥
$bytes = New-Object byte[] 32
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$apiKey = [System.BitConverter]::ToString($bytes).Replace("-", "").ToLower()

Write-Host "生成的 API Key:" -ForegroundColor Yellow
Write-Host $apiKey -ForegroundColor Green
Write-Host ""

Write-Host "使用方法:" -ForegroundColor Cyan
Write-Host "1. 在 Cloudflare Workers 中设置环境变量:" -ForegroundColor White
Write-Host "   wrangler secret put VPS_API_KEY" -ForegroundColor Gray
Write-Host "   然后粘贴上面的密钥" -ForegroundColor Gray
Write-Host ""
Write-Host "2. 在 VPS 的 .env 文件中添加:" -ForegroundColor White
Write-Host "   VPS_API_KEY=$apiKey" -ForegroundColor Gray
Write-Host ""

Write-Host "⚠️  请妥善保管此密钥，不要泄露！" -ForegroundColor Yellow
Write-Host ""

# 复制到剪贴板（如果可用）
try {
    Set-Clipboard -Value $apiKey
    Write-Host "✅ 密钥已复制到剪贴板" -ForegroundColor Green
} catch {
    Write-Host "ℹ️  请手动复制上面的密钥" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "按任意键退出..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
