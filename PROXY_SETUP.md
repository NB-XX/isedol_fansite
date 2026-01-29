# 代理快速配置

如果你遇到 `HTTP 400` 或 `HTTP 403` 错误，按照以下步骤配置代理。

## 🚀 快速配置（3步）

### 1. 启动你的代理软件

确保代理软件正在运行（Clash、V2Ray、Shadowsocks 等）

### 2. 编辑 .env 文件

```env
USE_PROXY=true
PROXY_URL=http://127.0.0.1:7890
```

**端口对照表:**

| 代理软件 | 默认端口 | 配置示例 |
|---------|---------|---------|
| Clash | 7890 | `http://127.0.0.1:7890` |
| V2Ray | 10809 | `http://127.0.0.1:10809` |
| Shadowsocks | 1080 | `http://127.0.0.1:1080` |

### 3. 重启系统

```bash
npm start
```

## ✅ 验证配置

启动后应该看到：

```
[INFO] [CafeScraper] 已启用代理: http://127.0.0.1:7890
[INFO] [CafeScraper] 开始爬取文章
[INFO] [CafeScraper] 获取到 15 篇文章  ← 成功！
```

## ❌ 如果还是失败

### 检查清单

- [ ] 代理软件是否正在运行？
- [ ] 端口号是否正确？
- [ ] 代理是否支持 HTTP 协议？
- [ ] 防火墙是否允许？

### 测试代理

在命令行测试代理是否可用：

```bash
# Windows PowerShell
$env:HTTP_PROXY="http://127.0.0.1:7890"
curl https://www.google.com

# 如果能访问 Google，说明代理正常
```

## 📖 详细文档

查看完整的代理配置指南：[docs/PROXY.md](docs/PROXY.md)

## 💡 常见问题

**Q: 我不知道我的代理端口是多少？**

A: 打开你的代理软件设置，查找 "HTTP 端口" 或 "本地端口"。

**Q: 配置后还是 HTTP 400？**

A: 尝试更换代理节点，或者检查 Cafe ID 和 Menu ID 是否正确。

**Q: 不想用代理可以吗？**

A: 如果你的网络可以直接访问 Naver，设置 `USE_PROXY=false` 即可。

---

**需要帮助？** 查看 [故障排除文档](docs/PROXY.md#错误排查)
