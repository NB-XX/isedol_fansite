# 混合部署指南 - Cloudflare Pages + VPS

## 架构设计

```
用户请求
    │
    ▼
┌─────────────────────────────────────────┐
│   Cloudflare (全球CDN + DDoS防护)        │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────────┐                  │
│  │  Pages (前端)     │                  │
│  │  - Vue.js SPA    │                  │
│  │  - 静态资源       │                  │
│  │  - 全球缓存       │                  │
│  └────────┬─────────┘                  │
│           │                            │
│           │ API 请求                    │
│           ▼                            │
│  ┌──────────────────┐                  │
│  │  Cloudflare Tunnel│                 │
│  │  (安全隧道)        │                 │
│  └────────┬─────────┘                  │
└───────────┼─────────────────────────────┘
            │ 加密连接
            ▼
┌─────────────────────────────────────────┐
│         你的 VPS (后端)                   │
├─────────────────────────────────────────┤
│  ┌──────────────────┐                  │
│  │  Node.js API     │                  │
│  │  - Express       │                  │
│  │  - 只监听本地     │                  │
│  └──────────────────┘                  │
│                                         │
│  ┌──────────────────┐                  │
│  │  爬虫服务         │                  │
│  │  - Naver Cafe    │                  │
│  │  - SOOP          │                  │
│  └──────────────────┘                  │
│                                         │
│  ┌──────────────────┐                  │
│  │  直播监控         │                  │
│  │  - Firebase      │                  │
│  └──────────────────┘                  │
│                                         │
│  ┌──────────────────┐                  │
│  │  SQLite 数据库    │                  │
│  └──────────────────┘                  │
└─────────────────────────────────────────┘
```

## 优势分析

### ✅ 解决你的所有顾虑

1. **性能弱** → Cloudflare 承担所有静态资源和缓存
2. **流量有限** → 前端流量走 Cloudflare（无限）
3. **怕被攻击** → Cloudflare DDoS 防护 + Tunnel 隐藏真实 IP
4. **响应慢** → 前端全球 CDN，API 可以加缓存

### 📊 流量分析

**前端资源**（走 Cloudflare，不占用 VPS）:
- HTML/CSS/JS 文件
- 图片、字体等静态资源
- 约占总流量的 90%

**API 请求**（走 VPS）:
- 文章列表、详情
- 翻译请求
- 管理员操作
- 约占总流量的 10%

**预计 VPS 流量**: 每月 < 10GB（完全够用）

## 部署步骤

### 第一步：准备 VPS 环境

```bash
# SSH 连接到 VPS
ssh user@your-vps-ip

# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装 Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 PM2（进程管理器）
sudo npm install -g pm2

# 安装 Git
sudo apt install -y git

# 创建项目目录
mkdir -p ~/apps
cd ~/apps
```

### 第二步：部署后端到 VPS

```bash
# 克隆项目（或上传代码）
git clone https://github.com/your-username/isedol-fansite.git
cd isedol-fansite

# 安装依赖
npm install

# 创建 .env 文件
nano .env
```

**VPS 的 .env 配置**:
```env
# API 配置
PORT=3000
NODE_ENV=production

# 数据库
DATABASE_PATH=./data/database.db

# Naver Cafe
NAVER_CAFE_ID=27842958
NAVER_CAFE_MENU_ID=1171

# 代理（如果需要）
PROXY_ENABLED=false
PROXY_URL=

# DeepSeek API
DEEPSEEK_API_KEY=your_api_key
DEEPSEEK_BASE_URL=https://api.deepseek.com

# Firebase（如果使用）
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_CLIENT_EMAIL=your_client_email

# 管理员密码
ADMIN_PASSWORD=your_secure_password

# CORS 配置（重要！）
ALLOWED_ORIGINS=https://your-domain.pages.dev,https://yourdomain.com
```

**启动服务**:
```bash
# 使用 PM2 启动
pm2 start start-all.js --name isedol-api

# 设置开机自启
pm2 startup
pm2 save

# 查看日志
pm2 logs isedol-api

# 查看状态
pm2 status
```

### 第三步：配置 Cloudflare Tunnel（推荐）

**为什么用 Tunnel？**
- ✅ 隐藏 VPS 真实 IP
- ✅ 自动 HTTPS
- ✅ 不需要开放端口
- ✅ 免费

**安装 Cloudflared**:
```bash
# 下载 cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
sudo dpkg -i cloudflared-linux-amd64.deb

# 登录 Cloudflare
cloudflared tunnel login

# 创建隧道
cloudflared tunnel create isedol-api

# 记录 Tunnel ID（输出中会显示）
```

**配置隧道**:
```bash
# 创建配置文件
nano ~/.cloudflared/config.yml
```

```yaml
tunnel: isedol-api
credentials-file: /home/your-user/.cloudflared/你的tunnel-id.json

ingress:
  - hostname: api.yourdomain.com
    service: http://localhost:3000
  - service: http_status:404
```

**启动隧道**:
```bash
# 测试运行
cloudflared tunnel run isedol-api

# 如果正常，设置为服务
sudo cloudflared service install
sudo systemctl start cloudflared
sudo systemctl enable cloudflared
```

**在 Cloudflare Dashboard 配置 DNS**:
1. 进入 Cloudflare Dashboard
2. 选择你的域名
3. DNS → Add record
4. Type: CNAME
5. Name: api
6. Target: `你的tunnel-id.cfargd.com`
7. Proxy status: Proxied（橙色云朵）

### 第四步：部署前端到 Cloudflare Pages

**方法1：通过 Git（推荐）**

1. 推送代码到 GitHub:
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

2. 在 Cloudflare Dashboard:
   - Pages → Create a project
   - Connect to Git → 选择你的仓库
   - 配置构建设置:
     - Build command: `cd web && npm install && npm run build`
     - Build output directory: `web/dist`
     - Root directory: `/`
   - 环境变量:
     - `VITE_API_BASE_URL` = `https://api.yourdomain.com`

3. 点击 Deploy

**方法2：手动部署**

```bash
# 在本地构建
cd web
npm install
npm run build

# 安装 Wrangler
npm install -g wrangler

# 登录
wrangler login

# 部署
wrangler pages deploy dist --project-name=isedol-fansite
```

### 第五步：配置前端 API 地址

**修改 `web/src/api/index.js`**:
```javascript
import axios from 'axios'

const api = axios.create({
  // 生产环境使用环境变量，开发环境使用本地
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000
})

export default api
```

**创建 `web/.env.production`**:
```env
VITE_API_BASE_URL=https://api.yourdomain.com
```

**创建 `web/.env.development`**:
```env
VITE_API_BASE_URL=http://localhost:8080
```

### 第六步：配置 CORS

**修改 `start-all.js`**，添加 CORS 中间件:

```javascript
// 在 setupAPI() 方法中，express 初始化后添加
setupAPI() {
  this.app = express();
  
  // CORS 配置
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5173', 'http://localhost:3000'];
  
  this.app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });
  
  this.app.use(express.json({ limit: '10mb' }));
  // ... 其他中间件
}
```

### 第七步：优化性能

#### 1. 启用 API 缓存

**在 Cloudflare Dashboard**:
- 进入你的域名
- Caching → Configuration
- Browser Cache TTL: 4 hours
- 创建 Page Rules:
  - `api.yourdomain.com/api/articles*` → Cache Level: Standard, Edge Cache TTL: 5 minutes
  - `api.yourdomain.com/api/streamers*` → Cache Level: Standard, Edge Cache TTL: 1 minute

#### 2. 添加响应缓存头

**修改 API 响应**:
```javascript
// 文章列表 API
this.app.get('/api/articles', (req, res) => {
  // 设置缓存头
  res.setHeader('Cache-Control', 'public, max-age=300'); // 5分钟
  
  // ... 返回数据
});

// 主播状态 API
this.app.get('/api/streamers', (req, res) => {
  res.setHeader('Cache-Control', 'public, max-age=60'); // 1分钟
  
  // ... 返回数据
});
```

#### 3. 压缩响应

```bash
npm install compression
```

```javascript
import compression from 'compression';

setupAPI() {
  this.app = express();
  this.app.use(compression()); // 添加压缩中间件
  // ...
}
```

### 第八步：配置自定义域名

**在 Cloudflare Pages**:
1. Pages → 你的项目 → Custom domains
2. 添加域名: `yourdomain.com` 和 `www.yourdomain.com`
3. Cloudflare 会自动配置 DNS

**API 域名已在 Tunnel 配置中设置**

### 第九步：监控和维护

**VPS 监控**:
```bash
# 查看 PM2 状态
pm2 status

# 查看日志
pm2 logs isedol-api --lines 100

# 重启服务
pm2 restart isedol-api

# 查看资源使用
pm2 monit
```

**设置日志轮转**:
```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

**Cloudflare 监控**:
- Dashboard → Analytics → 查看流量和性能
- Pages → 你的项目 → Analytics

## 安全加固

### 1. VPS 防火墙

```bash
# 安装 UFW
sudo apt install ufw

# 只允许 SSH（如果需要）
sudo ufw allow 22/tcp

# 不需要开放 3000 端口（因为用 Tunnel）

# 启用防火墙
sudo ufw enable
```

### 2. 限制 API 访问

**安装 rate-limit**:
```bash
npm install express-rate-limit
```

**添加限流**:
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 最多100个请求
  message: '请求过于频繁，请稍后再试'
});

this.app.use('/api/', limiter);
```

### 3. 环境变量安全

```bash
# 设置文件权限
chmod 600 .env

# 不要提交到 Git
echo ".env" >> .gitignore
```

## 成本分析

### Cloudflare
- Pages: **免费**
- Tunnel: **免费**
- CDN: **免费**
- DDoS 防护: **免费**

### VPS
- 你已有 VPS: **$0**

### 总成本
- **$0/月** 🎉

## 性能预期

### 前端（Cloudflare Pages）
- 全球加载时间: < 1秒
- 中国大陆: 2-3秒（取决于 Cloudflare 节点）
- 可用性: 99.99%

### API（VPS + Cloudflare）
- 响应时间: 100-300ms（取决于 VPS 位置）
- 缓存命中: < 50ms
- 可用性: 99.9%

## 故障排查

### 前端无法访问 API

1. 检查 CORS 配置
2. 检查 API 地址是否正确
3. 查看浏览器控制台错误

### Tunnel 连接失败

```bash
# 检查 cloudflared 状态
sudo systemctl status cloudflared

# 查看日志
sudo journalctl -u cloudflared -f

# 重启服务
sudo systemctl restart cloudflared
```

### API 响应慢

1. 检查 VPS 资源使用: `htop`
2. 检查数据库大小: `du -h data/database.db`
3. 添加数据库索引
4. 增加缓存时间

## 备份策略

### 自动备份脚本

创建 `backup.sh`:
```bash
#!/bin/bash

# 备份目录
BACKUP_DIR=~/backups
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p $BACKUP_DIR

# 备份数据库
cp ~/apps/isedol-fansite/data/database.db $BACKUP_DIR/database_$DATE.db

# 压缩备份
gzip $BACKUP_DIR/database_$DATE.db

# 删除30天前的备份
find $BACKUP_DIR -name "database_*.db.gz" -mtime +30 -delete

echo "备份完成: database_$DATE.db.gz"
```

**设置定时任务**:
```bash
chmod +x backup.sh

# 添加到 crontab（每天凌晨3点备份）
crontab -e
```

添加:
```
0 3 * * * /home/your-user/backup.sh >> /home/your-user/backup.log 2>&1
```

## 更新部署

### 更新前端
```bash
# 推送代码到 GitHub
git push origin main

# Cloudflare Pages 会自动构建和部署
```

### 更新后端
```bash
# SSH 到 VPS
ssh user@your-vps-ip

cd ~/apps/isedol-fansite

# 拉取最新代码
git pull origin main

# 安装新依赖（如果有）
npm install

# 重启服务
pm2 restart isedol-api

# 查看日志确认正常
pm2 logs isedol-api --lines 50
```

## 下一步

现在你可以开始部署了！按照以下顺序：

1. ✅ 准备 VPS 环境
2. ✅ 部署后端到 VPS
3. ✅ 配置 Cloudflare Tunnel
4. ✅ 部署前端到 Pages
5. ✅ 配置域名
6. ✅ 测试功能
7. ✅ 优化性能

需要我帮你完成哪一步？
