# 亚托莉QQ机器人 - 启动和关闭指南

## 🚀 启动机器人

### 步骤1：启动NapCat框架
```bash
# 打开NapCat目录
start "D:\Program Files\NapCat\NapCat.44498.Shell"

# 运行NapCat启动程序
start "D:\Program Files\NapCat\NapCat.44498.Shell\NapCatWinBootMain.exe"
```
3. 在NapCat WebUI中确保WebSocket服务器已启用
4. 扫描二维码登录QQ

### 步骤2：启动亚托莉机器人
```bash
# 进入V2目录
cd V2

# 启动Docker容器
docker run -d --network=host --env-file .env --name atri-bot-websocket atri-bot-napcat node src/main-websocket.js
```

### 步骤3：验证启动
```bash
# 查看日志
docker logs -f atri-bot-websocket
```

## 🛑 关闭机器人

### 方法1：停止Docker容器
```bash
docker stop atri-bot-websocket
docker rm atri-bot-websocket
```

### 方法2：关闭NapCat
1. 关闭NapCat控制台
2. 停止NapCat服务

## 📊 查看状态

### 查看Docker容器状态
```bash
docker ps
```

### 查看机器人日志
```bash
docker logs atri-bot-websocket
```

## 🎯 使用方法

### 私聊测试
1. 打开手机QQ
2. 搜索机器人QQ号：3957901050
3. 发送消息："你好，亚托莉"

### 群聊测试
1. 将机器人拉入测试群
2. @机器人："@ATRI 你好"
3. 发送消息："螃蟹" 或 "カニ"

## 🎊 特色功能

- **聊天功能**：与亚托莉进行AI聊天
- **螃蟹检测**：发送"螃蟹"或"カニ"触发特殊回复
- **记忆功能**：多次聊天测试记忆系统
- **群聊@指令**：支持群聊@机器人

## 📝 配置文件

### .env文件
```env
# DeepSeek配置
DEEPSEEK_API_KEY=your_api_key
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions

# NapCat WebSocket配置
NAPCAT_HOST=host.docker.internal
NAPCAT_PORT=3001
NAPCAT_TOKEN=
```

## 🎉 恭喜！

亚托莉机器人已成功集成NapCat框架！现在可以尽情享受与亚托莉的聊天了！