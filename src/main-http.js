import dotenv from 'dotenv';
import NapCatHttpAdapter from './services/napcat-http-adapter.js';

// 加载环境变量
dotenv.config();

/**
 * 亚托莉QQ机器人 - NapCat HTTP版本
 * 通过HTTP API与NapCat框架通信
 */
class AtriBotHttp {
  constructor() {
    this.adapter = new NapCatHttpAdapter();
    this.isRunning = false;
  }

  /**
   * 启动机器人
   */
  async start() {
    try {
      console.log('🚀 启动亚托莉机器人HTTP版本...');
      
      // 启动HTTP适配器
      const success = await this.adapter.start();
      
      if (!success) {
        throw new Error('HTTP适配器启动失败');
      }

      this.isRunning = true;
      
      console.log('🎉 亚托莉机器人HTTP版本启动成功！');
      console.log('💡 机器人信息:');
      console.log('   - 平台: NapCat HTTP API');
      console.log('   - AI: DeepSeek');
      console.log('   - 角色: 亚托莉/萝卜子');
      console.log('   - 功能: 聊天、记忆、螃蟹检测');
      console.log('');
      console.log('📱 配置NapCat的Webhook地址即可开始使用！');
      console.log('🛑 按 Ctrl+C 停止机器人');
      
      return true;
      
    } catch (error) {
      console.error('❌ 机器人启动失败:', error);
      return false;
    }
  }

  /**
   * 停止机器人
   */
  async stop() {
    try {
      console.log('🛑 停止亚托莉机器人HTTP版本...');
      
      await this.adapter.stop();
      this.isRunning = false;
      
      console.log('✅ 机器人已停止');
      
    } catch (error) {
      console.error('❌ 停止机器人失败:', error);
    }
  }

  /**
   * 获取机器人状态
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      version: '2.0.0',
      platform: 'NapCat HTTP',
      adapterStatus: this.adapter.getStatus()
    };
  }
}

/**
 * 主函数
 */
async function main() {
  const bot = new AtriBotHttp();
  
  try {
    // 启动机器人
    const success = await bot.start();
    
    if (!success) {
      console.error('❌ 机器人启动失败，程序退出');
      process.exit(1);
    }
    
    // 定期检查状态
    setInterval(() => {
      const status = bot.getStatus();
      if (status.isRunning) {
        console.log('💚 机器人运行正常');
      }
    }, 60000);
    
  } catch (error) {
    console.error('💥 主程序异常:', error);
    await bot.stop();
    process.exit(1);
  }
}

// 启动主程序
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export default AtriBotHttp;