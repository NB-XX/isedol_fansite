# 代理配置指南

如果你在访问 Naver Cafe API 时遇到网络问题（如 HTTP 400、403 等错误），可以配置代理来解决。

## 配置方法

### 1. 编辑 .env 文件

```env
# 启用代理
USE_PROXY=true

# 代理地址（根据你的代理软件修改）
PROXY_URL=http://127.0.0.1:7890
```

### 2. 常见代理软件配置

#### Clash

默认端口：7890

```env
USE_PROXY=true
PROXY_URL=http://127.0.0.1:7890
```

#### V2Ray

默认端口：10809

```env
USE_PROXY=true
PROXY_URL=http://127.0.0.1:10809
```

#### Shadowsocks

默认端口：1080

```env
USE_PROXY=true
PROXY_URL=http://127.0.0.1:1080
```

#### 自定义代理

```env
USE_PROXY=true
PROXY_URL=http://your-proxy-host:port
```

### 3. HTTPS 代理

如果你的代理使用 HTTPS：

```env
USE_PROXY=true
PROXY_URL=https://127.0.0.1:7890
```

### 4. 带认证的代理

如果代理需要用户名和密码：

```env
USE_PROXY=true
PROXY_URL=http://username:password@127.0.0.1:7890
```

## 测试代理

### 方法 1: 运行测试

```bash
npm test
```

如果看到类似输出，说明代理工作正常：

```
[INFO] [CafeScraper] 已启用代理: http://127.0.0.1:7890
✅ 通过
```

### 方法 2: 启动爬虫

```bash
npm run cafe
```

查看日志输出：

```
[INFO] [CafeScraper] 已启用代理: http://127.0.0.1:7890
[INFO] [CafeScraper] 开始爬取文章
[INFO] [CafeScraper] 获取到 15 篇文章
```

## 禁用代理

如果不需要代理，设置为 false：

```env
USE_PROXY=false
```

或者直接注释掉：

```env
# USE_PROXY=true
# PROXY_URL=http://127.0.0.1:7890
```

## 常见问题

### Q: 如何知道我的代理端口？

A: 查看你的代理软件设置：
- **Clash**: 设置 → 端口设置 → HTTP 端口
- **V2Ray**: 配置文件中的 `port` 字段
- **Shadowsocks**: 本地端口设置

### Q: 代理配置后仍然失败？

A: 检查以下几点：
1. 代理软件是否正在运行
2. 端口号是否正确
3. 代理是否支持 HTTP/HTTPS
4. 防火墙是否允许连接

### Q: 如何测试代理是否可用？

A: 在命令行测试：

```bash
# Windows (PowerShell)
$env:HTTP_PROXY="http://127.0.0.1:7890"
curl https://www.google.com

# Linux/Mac
export HTTP_PROXY=http://127.0.0.1:7890
curl https://www.google.com
```

### Q: 代理会影响性能吗？

A: 会有轻微影响，但通常可以忽略。如果代理服务器在本地，影响很小。

### Q: 可以使用 SOCKS5 代理吗？

A: 当前版本仅支持 HTTP/HTTPS 代理。如需 SOCKS5 支持，请提交 Issue。

## 错误排查

### 错误: HTTP 400

可能原因：
- API 请求格式错误
- 需要特定的请求头
- IP 被限制

解决方案：
1. 启用代理
2. 检查 Cafe ID 和 Menu ID 是否正确

### 错误: HTTP 403

可能原因：
- IP 被封禁
- 缺少必要的请求头
- 需要登录

解决方案：
1. 启用代理更换 IP
2. 检查请求头配置

### 错误: ECONNREFUSED

可能原因：
- 代理服务器未运行
- 端口号错误

解决方案：
1. 启动代理软件
2. 检查端口配置

### 错误: ETIMEDOUT

可能原因：
- 网络连接超时
- 代理服务器响应慢

解决方案：
1. 检查网络连接
2. 更换代理节点
3. 增加超时时间

## 高级配置

### 自定义请求头

如需修改请求头，编辑 `src/modules/cafe-scraper.js`：

```javascript
headers: {
    'User-Agent': 'Your Custom User Agent',
    'Accept': 'application/json',
    'Accept-Language': 'ko-KR,ko;q=0.9',
    'Referer': 'https://cafe.naver.com/steamindiegame',
    // 添加其他请求头
}
```

### 超时设置

在 fetch 请求中添加超时：

```javascript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 10000); // 10秒超时

const response = await fetch(url, {
    ...fetchOptions,
    signal: controller.signal
});

clearTimeout(timeout);
```

## 推荐配置

### 国内用户

```env
USE_PROXY=true
PROXY_URL=http://127.0.0.1:7890
```

### 国外用户

```env
USE_PROXY=false
```

### 企业网络

如果在企业网络环境：

```env
USE_PROXY=true
PROXY_URL=http://proxy.company.com:8080
```

## 安全提示

1. 不要在公共代码仓库中提交包含代理密码的 `.env` 文件
2. 使用可信的代理服务
3. 定期更换代理密码
4. 避免使用免费公共代理

## 获取帮助

如果遇到问题：
1. 查看 `logs/app.log` 日志文件
2. 运行 `npm test` 测试系统
3. 提交 Issue 并附上错误日志
