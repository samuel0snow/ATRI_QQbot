/**
 * 螃蟹检测插件
 * 亚托莉的特殊功能：检测到"螃蟹"关键词时触发特殊反应
 */
export default class CrabDetectorPlugin {
  constructor(config) {
    this.config = config;
    this.isInitialized = false;
    this.crabKeywords = ['螃蟹', 'crab', 'かに', 'カニ'];
    this.crabReactions = [
      '螃蟹螃蟹！重要的事情说三遍！(๑˃̵ᴗ˂̵)و',
      '哇！是螃蟹！我最喜欢螃蟹了！٩(◕‿◕｡)۶',
      '螃蟹螃蟹螃蟹！看到螃蟹我就兴奋！(*´▽｀*)',
      '主人提到螃蟹了！我也想吃螃蟹呢～(｡♥‿♥｡)',
      '螃蟹！高性能的我也抵挡不住螃蟹的诱惑！(≧▽≦)'
    ];
  }

  /**
   * 初始化螃蟹检测插件
   */
  async initialize() {
    try {
      console.log('🦀 初始化螃蟹检测插件...');
      
      this.isInitialized = true;
      console.log('✅ 螃蟹检测插件初始化完成');
      
    } catch (error) {
      console.error('❌ 螃蟹检测插件初始化失败:', error);
      throw error;
    }
  }

  /**
   * 处理消息，检测螃蟹关键词
   */
  async process(message) {
    try {
      if (!this.isInitialized) {
        return null;
      }
      
      const content = message.content.toLowerCase();
      
      // 检测螃蟹关键词
      const hasCrab = this.crabKeywords.some(keyword => 
        content.includes(keyword.toLowerCase())
      );
      
      if (hasCrab) {
        console.log('🦀 检测到螃蟹关键词！');
        
        // 随机选择螃蟹反应
        const randomIndex = Math.floor(Math.random() * this.crabReactions.length);
        const reaction = this.crabReactions[randomIndex];
        
        // 添加额外的螃蟹表情
        const crabEmojis = ['🦀', '🦀', '🦀'];
        const emojiString = crabEmojis.join('');
        
        return `${reaction} ${emojiString}`;
      }
      
      return null;
      
    } catch (error) {
      console.error('❌ 螃蟹检测失败:', error);
      return null;
    }
  }

  /**
   * 添加自定义螃蟹关键词
   */
  addCrabKeyword(keyword) {
    if (!this.crabKeywords.includes(keyword)) {
      this.crabKeywords.push(keyword);
      console.log(`✅ 添加螃蟹关键词: ${keyword}`);
    }
  }

  /**
   * 添加自定义螃蟹反应
   */
  addCrabReaction(reaction) {
    if (!this.crabReactions.includes(reaction)) {
      this.crabReactions.push(reaction);
      console.log(`✅ 添加螃蟹反应: ${reaction}`);
    }
  }

  /**
   * 获取螃蟹检测统计
   */
  getStats() {
    return {
      keywords: this.crabKeywords.length,
      reactions: this.crabReactions.length,
      isActive: this.isInitialized
    };
  }

  /**
   * 获取插件状态
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      keywords: this.crabKeywords,
      reactionCount: this.crabReactions.length
    };
  }

  /**
   * 停止插件
   */
  async stop() {
    this.isInitialized = false;
    console.log('✅ 螃蟹检测插件已停止');
  }
}