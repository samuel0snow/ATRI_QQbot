# 🚀 亚托莉QQ机器人 - NapCat集成指南

## 📋 概述

本指南详细说明如何将亚托莉QQ机器人与NapCat框架集成，实现真正的QQ连接功能。

## 🎯 集成方案

### 方案一：HTTP API模式（推荐）
**架构**: `QQ消息 → NapCat框架 → HTTP Webhook → 亚托莉AI → 回复消息`

**优势**:
- ✅ 架构清晰，易于维护
- ✅ NapCat和AI服务分离
- ✅ 支持热重载和独立部署
- ✅ 易于调试和监控

### 方案二：直接集成模式
**架构**: `QQ消息 → NapCat SDK → 亚托莉AI → 回复消息`

**优势**:
- ✅ 延迟更低
- ✅ 集成更紧密

## 🛠️ 立即开始集成

### 步骤1：下载NapCat框架

#### Windows用户（推荐）
1. 访问 [NapCatQQ Releases页面](https://github.com/NapNeko/NapCatQQ/releases)
2. 下载 `NapCat.Framerwork.Windows.Once.zip`
3. 解压到不含中文或空格的目录
4. 运行 `NapCatWinBootMain.exe`

#### Docker用户
```bash
# 使用官方Docker镜像
docker run -d --name napcat napcat/framework
```

#### Linux用户
```bash
# 使用一键安装脚本
curl -o napcat.sh https://nclatest.znin.net/NapNeko/NapCat-Installer/main/script/install.framework.sh
bash napcat.sh
```

### 步骤2：配置NapCat Webhook

在NapCat配置文件中设置Webhook地址：

```yaml
# NapCat配置文件示例
webhook:
  enabled: true
  url: "http://localhost:3000/webhook/napcat"
  secret: "your-secret-key"
  events:
    - "message"
    - "notice"
    - "request"
```

### 步骤3：启动亚托莉HTTP服务

#### 使用Docker（推荐）
```bash
cd V2

# 构建镜像
docker build -t atri-bot-napcat .

# 运行HTTP服务
docker run -d -p 3000:3000 -v ${PWD}/data:/app/data --env-file .env --name atri-bot-http atri-bot-napcat node src/main-http.js
```

#### 直接运行
```bash
cd V2

# 安装依赖（如果Node.js环境可用）
npm install

# 启动HTTP服务
node src/main-http.js
```

### 步骤4：验证连接

1. **检查HTTP服务状态**
   ```bash
   curl http://localhost:3000/health
   ```

2. **测试消息处理**
   ```bash
   curl -X POST http://localhost:3000/test/message \
     -H "Content-Type: application/json" \
     -d '{"content": "你好，亚托莉", "type": "private"}'
   ```

3. **检查NapCat连接**
   - 确保NapCat框架正常运行
   - 查看NapCat日志确认Webhook配置正确

## 🔧 配置说明

### 环境变量配置 (.env)

```bash
# HTTP服务器配置
HTTP_PORT=3000

# QQ账号配置（用于NapCat）
QQ_ACCOUNT=你的QQ号
QQ_PASSWORD=你的QQ密码

# AI模型配置
DEEPSEEK_API_KEY=sk-your-deepseek-api-key
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1

# 机器人配置
BOT_NAME=ATRI
NICKNAME=萝卜子
ACTIVATION_KEYWORDS=@ATRI,@萝卜子,@atri,螃蟹

# 日志配置
LOG_LEVEL=info
```

### NapCat消息格式

亚托莉机器人支持标准的OneBot消息格式：

```json
{
  "post_type": "message",
  "message_type": "private",
  "user_id": 123456789,
  "message": "你好，亚托莉",
  "time": 1640995200,
  "sender": {
    "user_id": 123456789,
    "nickname": "用户昵称"
  }
}
```

## 🎮 功能验证

### 测试私聊功能
1. 使用测试QQ号发送消息给机器人
2. 观察亚托莉的回复
3. 验证角色一致性

### 测试群聊功能
1. 将机器人拉入测试群
2. 使用@机器人或关键词激活
3. 验证群聊回复功能

### 测试螃蟹检测
1. 发送包含"螃蟹"的消息
2. 验证特殊反应功能

## 🔍 故障排除

### 常见问题

#### 1. Webhook连接失败
- **症状**: NapCat无法连接到HTTP服务
- **解决**: 检查防火墙设置，确保端口3000可访问

#### 2. 消息处理异常
- **症状**: 收到消息但无回复
- **解决**: 查看HTTP服务日志，检查AI配置

#### 3. NapCat登录失败
- **症状**: NapCat无法登录QQ
- **解决**: 检查QQ账号密码，确认网络连接

### 日志查看

#### HTTP服务日志
```bash
docker logs atri-bot-http
```

#### NapCat日志
查看NapCat框架的输出日志

## 🚀 生产部署

### Docker Compose部署
创建 `docker-compose.yml`:

```yaml
version: '3.8'
services:
  atri-bot:
    image: atri-bot-napcat
    container_name: atri-bot-http
    ports:
      - "3000:3000"
    volumes:
      - ./data:/app/data
    env_file:
      - .env
    restart: unless-stopped
    command: node src/main-http.js
```

启动服务:
```bash
docker-compose up -d
```

### 反向代理配置（可选）
使用Nginx作为反向代理：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📊 监控和运维

### 健康检查
```bash
curl http://localhost:3000/health
```

### 性能监控
- 监控HTTP请求响应时间
- 监控AI API调用成功率
- 监控内存和CPU使用率

### 日志管理
- 配置日志轮转
- 设置日志级别
- 监控异常日志

## 🔄 更新和维护

### 更新亚托莉机器人
```bash
cd V2
git pull
docker build -t atri-bot-napcat .
docker-compose down
docker-compose up -d
```

### 更新NapCat框架
按照NapCat官方文档进行更新

## 💡 最佳实践

### 安全建议
1. 使用HTTPS加密通信
2. 设置Webhook密钥验证
3. 定期更新API密钥
4. 监控异常登录行为

### 性能优化
1. 启用消息缓存
2. 优化AI调用频率
3. 使用CDN加速静态资源
4. 配置数据库索引

### 备份策略
1. 定期备份数据库
2. 备份配置文件
3. 设置自动备份任务

## 🎉 成功标志

当以下条件满足时，表示集成成功：

- ✅ NapCat框架正常运行
- ✅ HTTP服务响应正常
- ✅ 亚托莉AI回复正确
- ✅ 私聊和群聊功能正常
- ✅ 螃蟹检测功能正常
- ✅ 记忆系统正常工作

---

**祝您集成顺利！如有问题，请参考本文档或查看日志信息。**