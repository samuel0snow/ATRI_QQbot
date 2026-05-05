import dotenv from 'dotenv';
import ChatPlugin from '../plugins/chat.js';
import MemoryPlugin from '../plugins/memory.js';
import CrabDetectorPlugin from '../plugins/crab-detector.js';

// 加载环境变量
dotenv.config();

/**
 * 亚托莉机器人核心AI
 * 负责消息处理、插件管理和AI交互
 */
export default class BotCore {
  constructor() {
    this.plugins = new Map();
    this.config = {};
    this.isInitialized = false;
    
    // 默认配置
    this.defaultConfig = {
      botName: process.env.BOT_NAME || 'ATRI',
      nickname: process.env.NICKNAME || '萝卜子',
      activationKeywords: process.env.ACTIVATION_KEYWORDS?.split(',') || [
        '@ATRI', '@萝卜子', '@atri', '螃蟹'
      ],
      autoReply: true,
      privateAutoReply: true
    };
  }

  /**
   * 初始化机器人核心
   */
  async initialize() {
    try {
      console.log('🤖 初始化亚托莉AI核心...');
      
      // 加载配置
      await this.loadConfig();
      
      // 初始化插件系统
      await this.initializePlugins();
      
      this.isInitialized = true;
      console.log('✅ 亚托莉AI核心初始化完成');
      
      return true;
      
    } catch (error) {
      console.error('❌ AI核心初始化失败:', error);
      return false;
    }
  }

  /**
   * 加载配置
   */
  async loadConfig() {
    try {
      // 合并默认配置和环境变量
      this.config = {
        ...this.defaultConfig,
        ai: {
          deepseek: {
            apiKey: process.env.DEEPSEEK_API_KEY,
            baseUrl: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
            model: 'deepseek-v4-flash',
            temperature: 0.7,
            maxTokens: 500
          }
        },
        plugins: {
          enabled: ['chat', 'memory', 'crab-detector'],
          activationKeywords: this.defaultConfig.activationKeywords,
          autoReply: this.defaultConfig.autoReply,
          privateAutoReply: this.defaultConfig.privateAutoReply
        }
      };
      
      console.log('📋 配置加载完成:', {
        botName: this.config.botName,
        plugins: this.config.plugins.enabled
      });
      
    } catch (error) {
      console.error('❌ 配置加载失败:', error);
      throw error;
    }
  }

  /**
   * 初始化插件系统
   */
  async initializePlugins() {
    try {
      console.log('🔌 初始化插件系统...');
      
      const enabledPlugins = this.config.plugins.enabled || [];
      
      // 初始化聊天插件
      if (enabledPlugins.includes('chat')) {
        const chatPlugin = new ChatPlugin(this.config);
        await chatPlugin.initialize();
        this.plugins.set('chat', chatPlugin);
        console.log('✅ 聊天插件加载完成');
      }
      
      // 初始化记忆插件
      if (enabledPlugins.includes('memory')) {
        const memoryPlugin = new MemoryPlugin(this.config);
        await memoryPlugin.initialize();
        this.plugins.set('memory', memoryPlugin);
        console.log('✅ 记忆插件加载完成');
      }
      
      // 初始化螃蟹检测插件
      if (enabledPlugins.includes('crab-detector')) {
        const crabPlugin = new CrabDetectorPlugin(this.config);
        await crabPlugin.initialize();
        this.plugins.set('crab-detector', crabPlugin);
        console.log('✅ 螃蟹检测插件加载完成');
      }
      
      console.log(`🎯 共加载 ${this.plugins.size} 个插件`);
      
    } catch (error) {
      console.error('❌ 插件初始化失败:', error);
      throw error;
    }
  }

  /**
   * 处理消息
   */
  async processMessage(message) {
    try {
      if (!this.isInitialized) {
        throw new Error('AI核心未初始化');
      }
      
      console.log('💬 处理消息:', {
        user: message.userName,
        type: message.type,
        content: message.content.substring(0, 50) + '...'
      });
      
      // 检查是否为激活消息
      if (!this.isActivationMessage(message)) {
        console.log('⏭️ 非激活消息，跳过处理');
        return '';
      }
      
      let response = '';
      
      // 优先处理螃蟹关键词
      if (this.plugins.has('crab-detector')) {
        const crabResponse = await this.plugins.get('crab-detector').process(message);
        if (crabResponse) {
          response = crabResponse;
        }
      }
      
      // 如果没有螃蟹响应，使用聊天插件
      if (!response && this.plugins.has('chat')) {
        response = await this.plugins.get('chat').process(message);
      }
      
      // 更新记忆
      if (this.plugins.has('memory')) {
        await this.plugins.get('memory').updateMemory(message, response);
      }
      
      console.log('📤 AI回复:', response.substring(0, 50) + '...');
      
      return response;
      
    } catch (error) {
      console.error('❌ 消息处理失败:', error);
      
      // 备用回复
      const fallbackReplies = [
        '哎呀，我好像出了点小问题呢～让我重新启动一下！(；´Д｀)',
        '主人稍等，我正在调整性能参数！',
        '高性能的我也需要休息一下呢～马上回来！',
        '让我重启一下AI模块，马上就好！'
      ];
      
      const randomIndex = Math.floor(Math.random() * fallbackReplies.length);
      return fallbackReplies[randomIndex];
    }
  }

  /**
   * 检查是否为激活消息
   */
  isActivationMessage(message) {
    // 私聊消息自动回复
    if (message.type === 'private' && this.config.plugins.privateAutoReply) {
      return true;
    }
    
    // 群聊消息需要激活关键词
    if (message.type === 'group') {
      const content = message.content.toLowerCase();
      return this.config.plugins.activationKeywords.some(keyword =>
        content.includes(keyword.toLowerCase())
      );
    }
    
    return false;
  }

  /**
   * 获取机器人状态
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      plugins: Array.from(this.plugins.keys()),
      config: {
        botName: this.config.botName,
        activationKeywords: this.config.plugins.activationKeywords
      }
    };
  }

  /**
   * 停止机器人核心
   */
  async stop() {
    try {
      console.log('🛑 停止AI核心...');
      
      // 停止所有插件
      for (const [name, plugin] of this.plugins) {
        if (typeof plugin.stop === 'function') {
          await plugin.stop();
        }
        console.log(`✅ 插件 ${name} 已停止`);
      }
      
      this.plugins.clear();
      this.isInitialized = false;
      
      console.log('✅ AI核心已停止');
      
    } catch (error) {
      console.error('❌ 停止AI核心失败:', error);
    }
  }
}