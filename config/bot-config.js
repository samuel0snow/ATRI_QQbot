/**
 * 亚托莉机器人配置
 * NapCat版本配置文件
 */

export default {
  // 机器人基本信息
  bot: {
    name: 'ATRI',
    nickname: '萝卜子',
    version: '2.0.0',
    platform: 'NapCat'
  },

  // NapCat配置
  napcat: {
    platform: 2, // Android平台
    log_level: 'info',
    auto_reconnect: true,
    reconnect_interval: 5000
  },

  // AI模型配置
  ai: {
    deepseek: {
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseUrl: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
      model: 'deepseek-v4-flash',
      temperature: 0.7,
      maxTokens: 500
    }
  },

  // 插件配置
  plugins: {
    enabled: ['chat', 'memory', 'crab-detector'],
    
    // 激活关键词
    activationKeywords: process.env.ACTIVATION_KEYWORDS?.split(',') || [
      '@ATRI', '@萝卜子', '@atri'
    ],
    
    // 自动回复设置
    autoReply: true,
    privateAutoReply: true,
    
    // 群聊关键词
    groupKeywords: ['@ATRI', '@萝卜子', '@atri'],
    
    // 记忆设置
    memory: {
      maxHistoryLength: 10,
      enableLongTermMemory: true
    },
    
    // 螃蟹检测设置
    crabDetector: {
      keywords: ['螃蟹', 'crab', 'かに', 'カニ'],
      enableSpecialReactions: true
    }
  },

  // 系统配置
  system: {
    logLevel: process.env.LOG_LEVEL || 'info',
    dataDir: './data',
    maxRetries: 3,
    retryDelay: 2000
  }
};