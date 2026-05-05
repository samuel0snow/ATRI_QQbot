# 🚀 NapCat HTTP适配器配置指南

## 📋 概述

NapCat使用OneBot协议的HTTP适配器来实现Webhook功能。你需要配置HTTP适配器而不是传统的"Webhook"选项。

## 🎯 配置步骤

### 步骤1：访问NapCat WebUI
打开浏览器访问：`http://127.0.0.1:6099/webui?token=baffecace121`

### 步骤2：找到适配器配置
在WebUI界面中，按照以下路径查找：

**路径1：设置 → 适配器配置**
- 查找"HTTP适配器"或"OneBot HTTP"
- 或者查找"协议适配器"相关设置

**路径2：插件管理**
- 查找"OneBot11"插件或"HTTP适配器"插件
- 启用并配置相关设置

**路径3：连接设置**
- 查找"外部连接"或"API配置"
- 配置HTTP回调地址

### 步骤3：配置HTTP适配器参数

找到HTTP适配器配置后，设置以下参数：

```yaml
# HTTP适配器配置示例
http:
  enabled: true
  host: "0.0.0.0"
  port: 5700
  secret: "atri-bot-secret-key"
  post_url: "http://localhost:3000/webhook/napcat"
  post_message_format: "array"
  event_filter:
    - "message"
    - "notice"
    - "request"
```

**关键配置项：**
- `post_url`: 设置为你亚托莉服务的Webhook地址
- `event_filter`: 选择需要转发的事件类型
- `secret`: 设置密钥（可选，增强安全性）

### 步骤4：替代方案 - 使用反向Webhook

如果找不到HTTP适配器配置，可以尝试使用反向Webhook模式：

1. **在亚托莉服务中配置主动拉取**
2. **使用WebSocket连接**（如果NapCat支持）
3. **配置NapCat的HTTP API调用**

## 🔧 详细配置说明

### 方案A：HTTP回调模式（推荐）

在NapCat配置中设置：

```json
{
  "http": {
    "enabled": true,
    "host": "0.0.0.0",
    "port": 5700,
    "post": [
      {
        "url": "http://localhost:3000/webhook/napcat",
        "secret": "atri-bot-secret-key"
      }
    ]
  }
}
```

### 方案B：WebSocket模式

如果NapCat支持WebSocket：

```json
{
  "ws": {
    "enabled": true,
    "host": "0.0.0.0", 
    "port": 6700
  }
}
```

然后在亚托莉服务中连接WebSocket。

### 方案C：反向HTTP模式

让亚托莉服务主动从NapCat拉取消息：

```javascript
// 在亚托莉服务中添加NapCat API调用
const getMessages = async () => {
  const response = await fetch('http://127.0.0.1:5700/get_latest_messages');
  return response.json();
};
```

## 🎮 界面操作指南

### 在NapCat WebUI中查找配置

1. **登录WebUI后，查看左侧菜单栏**：
   - 查找"设置"、"配置"、"适配器"等选项
   - 或者查找"插件"、"扩展"相关菜单

2. **常见配置位置**：
   - **设置** → **协议适配器** → **HTTP适配器**
   - **插件** → **OneBot11** → **HTTP设置**
   - **连接** → **外部服务** → **Webhook配置**

3. **如果找不到，尝试搜索功能**：
   - 在界面中搜索"HTTP"、"webhook"、"回调"等关键词

### 配置参数说明

找到配置界面后，设置以下关键参数：

- **启用状态**: 开启HTTP适配器
- **回调URL**: `http://localhost:3000/webhook/napcat`
- **事件类型**: 选择"消息"、"通知"、"请求"
- **密钥**: 设置安全密钥（可选）
- **端口**: 通常使用5700（OneBot标准端口）

## 🔍 故障排除

### 问题1：找不到HTTP适配器配置
**解决**：
- 检查NapCat版本是否支持HTTP适配器
- 查看NapCat文档或GitHub页面
- 尝试使用WebSocket或反向HTTP模式

### 问题2：配置后无法连接
**解决**：
- 确认亚托莉服务正常运行：`http://localhost:3000/health`
- 检查防火墙设置，确保端口可访问
- 查看NapCat日志中的错误信息

### 问题3：消息无法转发
**解决**：
- 确认事件类型配置正确
- 检查Webhook URL是否正确
- 查看亚托莉服务日志

## 💡 备用方案

如果确实找不到HTTP适配器配置，我们可以：

1. **修改亚托莉服务使用NapCat的API**
2. **实现WebSocket客户端连接NapCat**
3. **使用NapCat的插件系统扩展功能**

## 🎯 下一步操作

请先尝试在NapCat WebUI中查找HTTP适配器配置。如果找不到，请告诉我：

1. **WebUI的具体界面截图或描述**
2. **你看到的菜单选项**
3. **可用的配置选项**

我可以根据具体界面为你提供更精确的配置指导！

---

**关键是要找到NapCat的HTTP适配器或OneBot协议配置界面！** 🚀