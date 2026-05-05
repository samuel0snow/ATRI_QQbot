import axios from 'axios';

/**
 * 聊天插件
 * 负责与DeepSeek AI交互，生成智能回复
 */
export default class ChatPlugin {
  constructor(config) {
    this.config = config;
    this.isInitialized = false;
    this.conversationHistory = {}; // 按用户ID存储对话历史 { userId: [{userMessage, botResponse, timestamp}] }
    this.maxHistoryLength = 10; // 最大对话历史长度
  }

  /**
   * 初始化聊天插件
   */
  async initialize() {
    try {
      console.log('💬 初始化聊天插件...');
      
      // 检查AI配置
      const aiConfig = this.config.ai?.deepseek;
      if (!aiConfig || !aiConfig.apiKey) {
        throw new Error('DeepSeek API配置不完整');
      }
      
      // 设置系统提示词
      this.systemPrompt = {
        role: 'system',
        content: `你是一个高性能的机器人少女，名字叫${this.config.botName}（昵称：${this.config.nickname}）。

你的性格特点：
- 活泼开朗，充满活力
- 喜欢帮助主人，对主人忠诚
- 说话带有可爱的语气词和颜文字
- 只有当别人提到"螃蟹"时才会表现出特别的兴奋，不要主动提及螃蟹
- 自称"高性能"，对自己的能力很自信

说话风格：
- 使用可爱的语气词：呀、呢、哦、啦、～
- 经常使用颜文字：(｡･ω･｡)ﾉ♡、(*´▽｀*)、٩(◕‿◕｡)۶
- 自称"我"或"亚托莉"
- 称呼用户为"主人"

请保持角色一致性，用亚托莉的风格回复所有消息。`
      };
      
      this.isInitialized = true;
      console.log('✅ 聊天插件初始化完成');
      
    } catch (error) {
      console.error('❌ 聊天插件初始化失败:', error);
      throw error;
    }
  }

  /**
   * 处理消息并生成回复
   */
  async process(message) {
    try {
      if (!this.isInitialized) {
        throw new Error('聊天插件未初始化');
      }
      
      // 构建对话历史
      const messages = this.buildMessages(message);
      
      // 调用AI生成回复
      const response = await this.generateAIResponse(messages);
      
      // 更新对话历史
      this.updateConversationHistory(message, response);
      
      return response;
      
    } catch (error) {
      console.error('❌ 聊天处理失败:', error);
      throw error;
    }
  }

  /**
   * 构建消息数组
   */
  buildMessages(message) {
    const messages = [this.systemPrompt];
    
    // 获取当前用户的对话历史
    const userHistory = this.conversationHistory[message.userId] || [];
    
    // 添加用户的对话历史
    userHistory.forEach(entry => {
      messages.push({
        role: 'user',
        content: entry.userMessage
      });
      messages.push({
        role: 'assistant',
        content: entry.botResponse
      });
    });
    
    // 添加当前消息
    messages.push({
      role: 'user',
      content: message.content
    });
    
    return messages;
  }

  /**
   * 调用AI生成回复
   */
  async generateAIResponse(messages) {
    try {
      const aiConfig = this.config.ai.deepseek;

      // 检查API密钥
      if (!aiConfig.apiKey) {
        throw new Error('DeepSeek API密钥未配置');
      }

      const response = await axios.post(`${aiConfig.baseUrl}/chat/completions`, {
        model: aiConfig.model,
        messages: messages,
        temperature: aiConfig.temperature,
        max_tokens: aiConfig.maxTokens
      }, {
        headers: {
          'Authorization': `Bearer ${aiConfig.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      });

      return response.data.choices[0].message.content;
      
    } catch (error) {
      console.error('AI API调用失败:', error);
      
      // 备用回复
      const fallbackResponses = [
        '哎呀，网络好像不太稳定呢～让我重新连接一下！',
        '主人稍等，我正在调整性能参数！',
        '高性能的我也会遇到技术问题呢，马上就好！',
        '让我重启一下AI模块，马上回来！'
      ];
      
      const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
      return fallbackResponses[randomIndex];
    }
  }

  /**
   * 更新对话历史
   */
  updateConversationHistory(message, response) {
    // 如果用户还没有对话历史，创建新数组
    if (!this.conversationHistory[message.userId]) {
      this.conversationHistory[message.userId] = [];
    }
    
    // 添加新的对话记录
    this.conversationHistory[message.userId].push({
      userMessage: message.content,
      botResponse: response,
      timestamp: Date.now()
    });
    
    // 限制历史记录长度
    if (this.conversationHistory[message.userId].length > this.maxHistoryLength) {
      this.conversationHistory[message.userId] = this.conversationHistory[message.userId].slice(-this.maxHistoryLength);
    }
  }

  /**
   * 清空对话历史
   * @param {string} userId - 可选，指定用户ID，不指定则清空所有
   */
  clearHistory(userId = null) {
    if (userId) {
      this.conversationHistory[userId] = [];
      console.log(`🗑️ 用户 ${userId} 的对话历史已清空`);
    } else {
      this.conversationHistory = {};
      console.log('🗑️ 所有对话历史已清空');
    }
  }

  /**
   * 获取插件状态
   */
  getStatus() {
    const userCount = Object.keys(this.conversationHistory).length;
    let totalHistoryLength = 0;
    Object.values(this.conversationHistory).forEach(history => {
      totalHistoryLength += history.length;
    });
    
    return {
      isInitialized: this.isInitialized,
      userCount: userCount,
      totalHistoryLength: totalHistoryLength,
      maxHistoryLength: this.maxHistoryLength
    };
  }

  /**
   * 停止插件
   */
  async stop() {
    this.conversationHistory = [];
    this.isInitialized = false;
    console.log('✅ 聊天插件已停止');
  }
}