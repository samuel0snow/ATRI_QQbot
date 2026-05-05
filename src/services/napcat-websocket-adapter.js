import WebSocket from 'ws';
import dotenv from 'dotenv';
import BotCore from '../core/BotCore.js';

// 加载环境变量
dotenv.config();

/**
 * NapCat WebSocket适配器
 * 通过WebSocket连接NapCat框架，接收和发送QQ消息
 */
export default class NapCatWebSocketAdapter {
  constructor() {
    this.ws = null;
    this.bot = null;
    this.connected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 3000;
    
    // 配置
    this.config = {
      host: process.env.NAPCAT_HOST || '127.0.0.1',
      port: process.env.NAPCAT_PORT || 6195,
      token: process.env.NAPCAT_TOKEN || '',
    };
  }

  /**
   * 初始化适配器
   */
  async initialize() {
    try {
      console.log('🤖 初始化NapCat WebSocket适配器...');
      
      // 初始化AI核心
      this.bot = new BotCore();
      await this.bot.initialize();
      
      console.log('✅ NapCat WebSocket适配器初始化完成');
      return true;
      
    } catch (error) {
      console.error('❌ NapCat WebSocket适配器初始化失败:', error);
      return false;
    }
  }

  /**
   * 连接WebSocket
   */
  async connect() {
    try {
      console.log(`🔌 连接到NapCat WebSocket服务器: ${this.config.host}:${this.config.port}...`);
      
      // 构建WebSocket URL
      let wsUrl = `ws://${this.config.host}:${this.config.port}`;
      
      // 创建WebSocket连接
      this.ws = new WebSocket(wsUrl);
      
      // 设置事件处理器
      this.setupEventHandlers();
      
      return new Promise((resolve, reject) => {
        this.ws.on('open', () => {
          console.log('✅ WebSocket连接成功！');
          this.connected = true;
          this.reconnectAttempts = 0;
          resolve(true);
        });
        
        this.ws.on('error', (error) => {
          console.error('❌ WebSocket连接错误:', error);
          reject(error);
        });
      });
      
    } catch (error) {
      console.error('❌ 连接WebSocket失败:', error);
      return false;
    }
  }

  /**
   * 设置事件处理器
   */
  setupEventHandlers() {
    // 打开连接
    this.ws.on('open', () => {
      console.log('🎯 WebSocket连接已建立');
      this.connected = true;
    });

    // 接收消息
    this.ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        console.log('📨 收到NapCat消息:', JSON.stringify(message, null, 2));
        
        // 处理消息
        await this.handleMessage(message);
        
      } catch (error) {
        console.error('❌ 处理消息失败:', error);
      }
    });

    // 关闭连接
    this.ws.on('close', (code, reason) => {
      console.log(`🔌 WebSocket连接关闭: ${code} - ${reason}`);
      this.connected = false;
      
      // 尝试重连
      this.attemptReconnect();
    });

    // 错误处理
    this.ws.on('error', (error) => {
      console.error('❌ WebSocket错误:', error);
    });
  }

  /**
   * 处理NapCat消息
   */
  async handleMessage(napcatMessage) {
    try {
      // 忽略机器人自己发送的消息
      if (napcatMessage.message_type === 'group' && napcatMessage.sender?.user_id === this.botConfig.qqAccount) {
        console.log('📋 忽略机器人自己发送的消息');
        return;
      }
      
      // 转换为内部消息格式
      const internalMessage = this.convertToInternalMessage(napcatMessage);
      
      if (!internalMessage) {
        console.log('📋 忽略非消息事件');
        return;
      }

      console.log(`💬 处理${internalMessage.type}消息:`, internalMessage.content);

      // 调用AI处理消息
      const response = await this.bot.processMessage(internalMessage);
      
      console.log('📤 发送回复:', response.substring(0, 50) + '...');

      // 发送回复消息
      await this.sendReply(napcatMessage, response);
      
    } catch (error) {
      console.error('❌ 处理消息失败:', error);
    }
  }

  /**
   * 转换NapCat消息格式为内部格式
   */
  convertToInternalMessage(napcatMessage) {
    try {
      // OneBot 11 协议格式
      if (napcatMessage.post_type === 'message') {
        let content = napcatMessage.raw_message || napcatMessage.message;
        
        // 处理群聊中的@指令
        if (napcatMessage.message_type === 'group') {
          // 检查是否有@行为（任何@都可以触发回复）
          const atRegex = /@\S+/g;
          const hasAt = atRegex.test(content);
          
          // 如果没有@任何人，忽略群聊消息
          if (!hasAt) {
            console.log('📋 忽略非@的群聊消息');
            return null;
          }
          
          // 移除所有@标记
          content = content.replace(atRegex, '').trim();
          
          // 如果消息为空，可能只是@了机器人，返回一个简单的问候
          if (!content) {
            content = '你好';
          }
        }

        const message = {
          userId: napcatMessage.user_id,
          userName: napcatMessage.sender?.nickname || '未知用户',
          content: content,
          type: napcatMessage.message_type,
          timestamp: napcatMessage.time || Date.now(),
          rawMessage: napcatMessage,
        };

        if (napcatMessage.message_type === 'group') {
          message.groupId = napcatMessage.group_id;
          message.groupName = napcatMessage.group_name || '未知群组';
        }

        return message;
      }

      // 忽略其他类型的事件
      return null;
      
    } catch (error) {
      console.error('❌ 转换消息格式失败:', error);
      return null;
    }
  }

  /**
   * 发送回复消息
   */
  async sendReply(originalMessage, responseContent) {
    try {
      let replyAction = {};

      // 根据消息类型构建回复
      if (originalMessage.message_type === 'private') {
        replyAction = {
          action: 'send_private_msg',
          params: {
            user_id: originalMessage.user_id,
            message: responseContent,
          },
        };
      } else if (originalMessage.message_type === 'group') {
        // 群聊回复需要@用户
        const replyMessage = `[CQ:at,qq=${originalMessage.user_id}] ${responseContent}`;
        
        replyAction = {
          action: 'send_group_msg',
          params: {
            group_id: originalMessage.group_id,
            message: replyMessage,
          },
        };
      }

      // 发送消息
      if (replyAction.action) {
        console.log('📤 发送NapCat动作:', JSON.stringify(replyAction));
        this.ws.send(JSON.stringify(replyAction));
      }

    } catch (error) {
      console.error('❌ 发送回复失败:', error);
    }
  }

  /**
   * 尝试重连
   */
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ 达到最大重连次数，放弃重连');
      return;
    }

    this.reconnectAttempts++;
    console.log(`🔄 尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);

    setTimeout(async () => {
      try {
        await this.connect();
      } catch (error) {
        console.error('❌ 重连失败:', error);
        this.attemptReconnect();
      }
    }, this.reconnectDelay);
  }

  /**
   * 启动适配器
   */
  async start() {
    try {
      console.log('🚀 启动NapCat WebSocket适配器...');
      
      // 初始化
      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error('初始化失败');
      }

      // 连接WebSocket
      const connected = await this.connect();
      if (!connected) {
        throw new Error('连接失败');
      }

      console.log('🎉 NapCat WebSocket适配器启动成功！');
      console.log('💡 现在可以通过QQ消息与亚托莉聊天了');
      
      return true;
      
    } catch (error) {
      console.error('❌ 启动NapCat WebSocket适配器失败:', error);
      return false;
    }
  }

  /**
   * 停止适配器
   */
  async stop() {
    try {
      console.log('🛑 停止NapCat WebSocket适配器...');
      
      if (this.ws) {
        this.ws.close();
        this.ws = null;
      }
      
      if (this.bot) {
        await this.bot.stop();
      }
      
      this.connected = false;
      console.log('✅ NapCat WebSocket适配器已停止');
      
    } catch (error) {
      console.error('❌ 停止适配器失败:', error);
    }
  }

  /**
   * 获取适配器状态
   */
  getStatus() {
    return {
      connected: this.connected,
      reconnectAttempts: this.reconnectAttempts,
      config: {
        host: this.config.host,
        port: this.config.port,
      },
    };
  }
}