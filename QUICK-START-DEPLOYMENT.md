# 🚀 快速部署指南（5分钟上线）

## 前提条件

✅ 你有一台 VPS（任何配置都可以）
✅ 你有一个域名（可以在 Cloudflare 注册）
✅ 你有 GitHub 账号

## 第一步：VPS 一键配置（2分钟）

SSH 连接到你的 VPS，复制粘贴以下命令：

```bash
# 一键安装所有依赖
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && \
sudo apt update && \
sudo apt install -y nodejs git && \
sudo npm install -g pm2 && \
echo "✅ 环境配置完成！"
```

## 第二步：部署后端（2分钟）

```bash
# 克隆项目
cd ~
mkdir -p apps && cd apps
git clone https://github.com/your-username/isedol-fansite.git
cd isedol-fansite

# 安装依赖
npm install

# 创建配置文件
cat > .env << 'EOF'
NODE_ENV=production
PORT=3000
ALLOWED_ORIGINS=https://your-domain.pages.dev,https://yourdomain.com
CAFE_ID=27842958
MENU_ID=1171
ADMIN_PASSWORD=change_this_password
EOF

# 启动服务
pm2 start ecosystem.production.config.cjs
pm2 startup
pm2 save

echo "✅ 后端部署完成！"
pm2 status
```

## 第三步：配置 Cloudflare Tunnel（1分钟）

```bash
# 安装 cloudflared
wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# 登录（会打开浏览器）
cloudflared tunnel login

# 创建隧道
cloudflared tunnel create isedol-api

# 配置隧道（替换你的域名和用户名）
mkdir -p ~/.cloudflared
cat > ~/.cloudflared/config.yml << 'EOF'
tunnel: 你的tunnel-id
credentials-file: /home/你的用户名/.cloudflared/你的tunnel-id.json

ingress:
  - hostname: api.yourdomain.com
    service: http://localhost:3000
  - service: http_status:404
EOF

# 启动隧道
sudo cloudflared service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared

echo "✅ Tunnel 配置完成！"
```

## 第四步：Cloudflare Pages 部署（在浏览器中操作）

1. 访问 https://dash.cloudflare.com
2. Pages → Create a project → Connect to Git
3. 选择你的 GitHub 仓库
4. 配置：
   - Build command: `cd web && npm install && npm run build`
   - Build output: `web/dist`
   - 环境变量: `VITE_API_BASE_URL` = `https://api.yourdomain.com`
5. 点击 Deploy

## 第五步：配置 DNS（在浏览器中操作）

1. Cloudflare Dashboard → 你的域名 → DNS
2. 添加记录：
   - Type: `CNAME`
   - Name: `api`
   - Target: `你的tunnel-id.cfargd.com`
   - Proxy: `Proxied`（橙色）

## 完成！🎉

访问你的网站：
- 前端: `https://yourdomain.com`
- API: `https://api.yourdomain.com/api/health`

## 快速测试

```bash
# 测试 API
curl https://api.yourdomain.com/api/health

# 查看日志
pm2 logs isedol-api
```

## 遇到问题？

查看详细文档：
- 完整部署指南: `HYBRID-DEPLOYMENT.md`
- 检查清单: `DEPLOYMENT-CHECKLIST.md`
- 故障排查: `HYBRID-DEPLOYMENT.md` 的故障排查部分
