# 部署检查清单

## 📋 部署前准备

### VPS 准备
- [ ] VPS 已购买并可以 SSH 连接
- [ ] 记录 VPS IP 地址: `_______________`
- [ ] 记录 SSH 用户名: `_______________`
- [ ] 已安装 Node.js 20+
- [ ] 已安装 Git
- [ ] 已安装 PM2

### Cloudflare 准备
- [ ] 已注册 Cloudflare 账号
- [ ] 已添加域名到 Cloudflare
- [ ] 域名 DNS 已指向 Cloudflare
- [ ] 记录域名: `_______________`

### 代码准备
- [ ] 代码已推送到 GitHub
- [ ] 记录 GitHub 仓库地址: `_______________`
- [ ] 已配置 `.env` 文件
- [ ] 已测试本地运行正常

## 🚀 部署步骤

### 第一步：VPS 环境配置

```bash
# 1. SSH 连接到 VPS
ssh user@your-vps-ip

# 2. 更新系统
sudo apt update && sudo apt upgrade -y

# 3. 安装 Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 4. 验证安装
node --version  # 应该显示 v20.x.x
npm --version

# 5. 安装 PM2
sudo npm install -g pm2

# 6. 安装 Git
sudo apt install -y git
```

**完成状态**: [ ]

---

### 第二步：部署后端

```bash
# 1. 创建项目目录
mkdir -p ~/apps
cd ~/apps

# 2. 克隆项目
git clone https://github.com/your-username/isedol-fansite.git
cd isedol-fansite

# 3. 安装依赖
npm install

# 4. 创建 .env 文件
nano .env
```

**`.env` 配置内容**:
```env
NODE_ENV=production
PORT=3000

# CORS（重要！替换为你的域名）
ALLOWED_ORIGINS=https://your-domain.pages.dev,https://yourdomain.com

# Naver Cafe
CAFE_ID=27842958
MENU_ID=1171

# 代理（如果需要）
USE_PROXY=false
PROXY_URL=

# DeepSeek API
TRANSLATION_ENABLED=true
TRANSLATION_API_KEY=your_deepseek_api_key
TRANSLATION_API_URL=https://api.deepseek.com/v1/chat/completions
TRANSLATION_MODEL=deepseek-chat

# Firebase（如果使用）
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email

# 管理员密码
ADMIN_PASSWORD=your_secure_password
```

```bash
# 5. 启动服务
pm2 start ecosystem.production.config.cjs

# 6. 设置开机自启
pm2 startup
pm2 save

# 7. 查看状态
pm2 status
pm2 logs isedol-api --lines 50
```

**完成状态**: [ ]

---

### 第三步：配置 Cloudflare Tunnel

```bash
# 1. 下载 cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# 2. 登录 Cloudflare
cloudflared tunnel login
# 会打开浏览器，选择你的域名授权

# 3. 创建隧道
cloudflared tunnel create isedol-api
# 记录 Tunnel ID: _______________

# 4. 创建配置文件
mkdir -p ~/.cloudflared
nano ~/.cloudflared/config.yml
```

**`config.yml` 内容**（替换你的域名和 Tunnel ID）:
```yaml
tunnel: 你的tunnel-id
credentials-file: /home/你的用户名/.cloudflared/你的tunnel-id.json

ingress:
  - hostname: api.yourdomain.com
    service: http://localhost:3000
  - service: http_status:404
```

```bash
# 5. 测试运行
cloudflared tunnel run isedol-api
# 按 Ctrl+C 停止

# 6. 安装为系统服务
sudo cloudflared service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared

# 7. 检查状态
sudo systemctl status cloudflared
```

**完成状态**: [ ]

---

### 第四步：配置 Cloudflare DNS

1. 登录 Cloudflare Dashboard
2. 选择你的域名
3. 进入 DNS 设置
4. 添加 CNAME 记录:
   - Type: `CNAME`
   - Name: `api`
   - Target: `你的tunnel-id.cfargd.com`
   - Proxy status: `Proxied` (橙色云朵)

**完成状态**: [ ]

---

### 第五步：部署前端到 Cloudflare Pages

#### 方法1：通过 GitHub（推荐）

1. 推送代码到 GitHub:
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

2. 在 Cloudflare Dashboard:
   - Pages → Create a project
   - Connect to Git → 选择你的仓库
   - 配置构建:
     - Framework preset: `Vue`
     - Build command: `cd web && npm install && npm run build`
     - Build output directory: `web/dist`
     - Root directory: `/`
   
3. 环境变量:
   - `VITE_API_BASE_URL` = `https://api.yourdomain.com`

4. 点击 Deploy

**完成状态**: [ ]

#### 方法2：手动部署

```bash
# 1. 在本地构建
cd web
npm install
npm run build

# 2. 安装 Wrangler
npm install -g wrangler

# 3. 登录
wrangler login

# 4. 部署
wrangler pages deploy dist --project-name=isedol-fansite
```

**完成状态**: [ ]

---

### 第六步：配置自定义域名

1. 在 Cloudflare Pages:
   - 进入你的项目
   - Custom domains → Add a custom domain
   - 添加: `yourdomain.com` 和 `www.yourdomain.com`

2. Cloudflare 会自动配置 DNS

**完成状态**: [ ]

---

### 第七步：安全配置

```bash
# 1. 配置防火墙
sudo apt install ufw
sudo ufw allow 22/tcp  # SSH
sudo ufw enable

# 2. 设置文件权限
cd ~/apps/isedol-fansite
chmod 600 .env

# 3. 配置自动备份
chmod +x scripts/backup.sh
crontab -e
```

添加到 crontab:
```
0 3 * * * /home/你的用户名/apps/isedol-fansite/scripts/backup.sh >> /home/你的用户名/backup.log 2>&1
```

**完成状态**: [ ]

---

## ✅ 部署后测试

### 测试清单

- [ ] 前端可以访问: `https://yourdomain.com`
- [ ] API 可以访问: `https://api.yourdomain.com/api/health`
- [ ] 文章列表加载正常
- [ ] 主播状态显示正常
- [ ] 翻译功能正常
- [ ] 管理员控制台可以登录
- [ ] 爬虫正常运行（查看日志）
- [ ] 直播监控正常运行

### 测试命令

```bash
# 测试 API
curl https://api.yourdomain.com/api/health

# 查看后端日志
pm2 logs isedol-api --lines 100

# 查看 Tunnel 状态
sudo systemctl status cloudflared

# 查看资源使用
pm2 monit
```

---

## 🔧 常见问题

### 前端无法访问 API

**检查**:
1. CORS 配置是否正确
2. API 地址是否正确
3. Cloudflare Tunnel 是否运行

```bash
# 检查 Tunnel
sudo systemctl status cloudflared
sudo journalctl -u cloudflared -f

# 检查 API
pm2 logs isedol-api
curl http://localhost:3000/api/health
```

### 爬虫不工作

**检查**:
```bash
# 查看日志
pm2 logs isedol-api | grep SCRAPER

# 检查数据库
ls -lh ~/apps/isedol-fansite/data/

# 手动测试爬虫
cd ~/apps/isedol-fansite
node scripts/fetch-all-articles.js
```

### 服务器重启后服务未启动

**检查**:
```bash
# 检查 PM2 自启动
pm2 startup
pm2 save

# 检查 Cloudflared 自启动
sudo systemctl enable cloudflared
```

---

## 📊 监控和维护

### 日常检查

```bash
# 查看服务状态
pm2 status

# 查看资源使用
htop

# 查看磁盘空间
df -h

# 查看数据库大小
du -h ~/apps/isedol-fansite/data/
```

### 更新部署

```bash
# 使用部署脚本
cd ~/apps/isedol-fansite
chmod +x scripts/deploy-vps.sh
./scripts/deploy-vps.sh
```

### 备份

```bash
# 手动备份
cd ~/apps/isedol-fansite
./scripts/backup.sh

# 查看备份
ls -lh ~/backups/isedol-fansite/
```

---

## 📝 记录信息

### 服务器信息
- VPS IP: `_______________`
- SSH 用户: `_______________`
- SSH 端口: `_______________`

### 域名信息
- 主域名: `_______________`
- API 域名: `_______________`
- Tunnel ID: `_______________`

### 账号信息
- Cloudflare 邮箱: `_______________`
- GitHub 仓库: `_______________`
- 管理员密码: `_______________`（请妥善保管）

### 部署时间
- 开始时间: `_______________`
- 完成时间: `_______________`
- 部署人员: `_______________`

---

## 🎉 完成！

恭喜！你的异世界女团粉丝站已经成功部署！

**访问地址**:
- 前端: https://yourdomain.com
- API: https://api.yourdomain.com
- 管理后台: https://yourdomain.com/admin

**下一步**:
1. 分享给朋友们
2. 监控服务运行状态
3. 定期备份数据
4. 根据需要优化性能

祝你使用愉快！ 🎊
