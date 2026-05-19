# 亚托莉QQ机器人 - NapCat版本 (V2)

**完全重构的亚托莉QQ机器人，基于NapCat框架，解决QQ开放平台限制**

##  项目特色

-  **无需域名备案**：使用NapCat框架，彻底绕过备案限制
-  **功能完整**：支持私聊、群聊、文件传输等完整QQ功能
-  **高性能AI**：集成DeepSeek V4 Flash模型
-  **角色扮演**：完整的亚托莉/萝卜子角色设定
-  **记忆系统**：长期对话记忆功能
-  **螃蟹检测**：亚托莉特色功能，对螃蟹关键词特殊反应
-  **Docker支持**：容器化部署，一键启动

##  项目结构

```
V2/
├── src/
│   ├── main.js              # 主程序入口
│   ├── core/
│   │   └── BotCore.js       # 核心AI逻辑
│   ├── plugins/            # 插件系统
│   │   ├── chat.js         # 聊天插件
│   │   ├── memory.js       # 记忆插件
│   │   └── crab-detector.js # 螃蟹检测
│   └── services/
│       └── napcat-adapter.js # NapCat消息适配器
├── config/
│   ├── bot-config.js       # 机器人配置
│   └── atri-profile.json   # 亚托莉角色配置
├── data/                   # 数据存储
├── package.json            # 项目依赖
├── .env                    # 环境变量
├── Dockerfile              # Docker配置
└── README.md              # 项目文档
```

## 快速开始

### 1. 环境准备

确保已安装：
- Node.js 18+
- npm 或 yarn
- (可选) Docker

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并修改配置：

```bash
# QQ账号配置
QQ_ACCOUNT=你的QQ号
QQ_PASSWORD=你的QQ密码

# AI模型配置
DEEPSEEK_API_KEY=密钥
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1

# 机器人配置
BOT_NAME=ATRI
NICKNAME=萝卜子
ACTIVATION_KEYWORDS=@ATRI,@萝卜子,@atri,螃蟹

# 日志配置
LOG_LEVEL=info
```

### 3. 安装依赖

```bash
cd V2
npm install
```

### 4. 启动机器人

```bash
# 开发模式（自动重启）
npm run dev

# 生产模式
npm start
```

### 5. Docker部署（推荐）

```bash
# 构建镜像
docker build -t atri-bot-napcat .

# 运行容器
docker run -d -v ${PWD}/data:/app/data --env-file .env --name atri-bot-napcat atri-bot-napcat
```

##  功能特性

### 亚托莉角色设定
- **名字**: ATRI / 萝卜子
- **性格**: 活泼开朗的机器人少女
- **说话风格**: 可爱语气词 + 颜文字
- **特色**: 高性能自称，螃蟹狂热爱好者

### 智能聊天
- **AI模型**: DeepSeek V4 Flash
- **上下文记忆**: 10轮对话历史
- **个性化回复**: 保持角色一致性
- **错误处理**: 友好的备用回复

### 螃蟹检测
检测到"螃蟹"关键词时触发特殊反应：
- 兴奋的螃蟹相关回复
- 随机螃蟹表情包
- 亚托莉特色反应

### 记忆系统
- **SQLite数据库**: 长期记忆存储
- **用户记忆**: 按用户ID分类存储
- **记忆统计**: 对话记录统计
- **记忆管理**: 支持清空用户记忆

## 配置说明

### NapCat配置
```javascript
{
  platform: 2,           // Android平台
  log_level: 'info',     // 日志级别
  auto_reconnect: true,  // 自动重连
  reconnect_interval: 5000 // 重连间隔
}
```

### AI配置
```javascript
{
  deepseek: {
    apiKey: 'your-api-key',
    baseUrl: 'https://api.deepseek.com/v1',
    model: 'deepseek-v4-flash',
    temperature: 0.7,     // 创造性
    maxTokens: 500        // 最大回复长度
  }
}
```

## 使用方式

### 私聊
- **自动回复**: 所有私聊消息自动回复
- **个性化**: 保持亚托莉角色设定

### 群聊
- **激活方式**: @机器人 或 包含关键词
- **关键词**: @ATRI, @萝卜子, @atri, 螃蟹
- **螃蟹检测**: 自动触发特殊反应

## 故障排除

### 常见问题

1. **登录失败**
   - 检查QQ账号密码是否正确
   - 确认网络连接正常
   - 查看NapCat日志输出

2. **AI无响应**
   - 检查DeepSeek API密钥
   - 确认API配额充足
   - 查看网络连接状态

3. **记忆功能异常**
   - 检查data目录权限
   - 确认SQLite数据库正常
   - 查看日志错误信息

### 日志查看

```bash
# 查看容器日志
docker logs atri-bot-napcat

# 实时查看日志
docker logs -f atri-bot-napcat
```

## 版本历史

### V2.0.0 (当前版本)
-  基于NapCat框架完全重构
-  彻底解决域名备案问题
-  完整的QQ功能支持
-  优化的架构设计

### V1.x.x (存档版本)
- QQ开放平台版本（已存档到V1文件夹）
- 受限于备案要求

##  致谢

- [NapCat](https://github.com/NapNeko/NapCat) - QQ协议实现框架
- [DeepSeek](https://www.deepseek.com/) - AI模型提供商
- 亚托莉角色原案 - 《ATRI -My Dear Moments-》

---

**让高性能的亚托莉为你服务吧！(｡･ω･｡)ﾉ♡**
