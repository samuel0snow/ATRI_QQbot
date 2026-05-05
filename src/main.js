import dotenv from 'dotenv';
import BotCore from './core/BotCore.js';
import NapCatAdapter from './services/napcat-adapter.js';
import readline from 'readline';

// 加载环境变量
dotenv.config();

/**
 * 亚托莉QQ机器人 - NapCat版本
 * 主程序入口
 */
class AtriBotV2 {
  constructor() {
    this.bot = null;
    this.adapter = null;
    this.isRunning = false;
    
    // 优雅关闭处理
    this.setupGracefulShutdown();
  }

  /**
   * 初始化机器人
   */
  async initialize() {
    try {
      console.log('🤖 初始化亚托莉机器人V2...');
      
      // 创建核心AI
      this.bot = new BotCore();
      await this.bot.initialize();
      
      // 创建NapCat适配器
      this.adapter = new NapCatAdapter(this.bot);
      
      console.log('✅ 机器人初始化完成');
      return true;
      
    } catch (error) {
      console.error('❌ 机器人初始化失败:', error);
      return false;
    }
  }

  /**
   * 启动机器人
   */
  async start() {
    try {
      console.log('🚀 启动亚托莉机器人V2...');
      
      // 初始化
      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error('初始化失败');
      }

      // 启动NapCat适配器
      const started = await this.adapter.start();
      if (!started) {
        throw new Error('NapCat适配器启动失败');
      }

      this.isRunning = true;
      
      console.log('🎉 亚托莉机器人V2启动成功！');
      console.log('💡 机器人信息:');
      console.log('   - 平台: NapCat');
      console.log('   - AI: DeepSeek');
      console.log('   - 角色: 亚托莉/萝卜子');
      console.log('   - 功能: 聊天、记忆、螃蟹检测');
      console.log('');
      console.log('📱 现在可以通过QQ与亚托莉聊天了！');
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
      console.log('🛑 停止亚托莉机器人V2...');
      
      if (this.adapter) {
        await this.adapter.stop();
      }
      
      this.isRunning = false;
      console.log('✅ 机器人已停止');
      
    } catch (error) {
      console.error('❌ 停止机器人失败:', error);
    }
  }

  /**
   * 设置优雅关闭处理
   */
  setupGracefulShutdown() {
    // SIGINT (Ctrl+C)
    process.on('SIGINT', async () => {
      console.log('\n🛑 收到停止信号，正在优雅关闭...');
      await this.stop();
      process.exit(0);
    });

    // SIGTERM
    process.on('SIGTERM', async () => {
      console.log('🛑 收到终止信号，正在优雅关闭...');
      await this.stop();
      process.exit(0);
    });

    // 未捕获异常
    process.on('uncaughtException', async (error) => {
      console.error('💥 未捕获异常:', error);
      await this.stop();
      process.exit(1);
    });

    // 未处理的Promise拒绝
    process.on('unhandledRejection', async (reason, promise) => {
      console.error('💥 未处理的Promise拒绝:', reason);
      await this.stop();
      process.exit(1);
    });
  }

  /**
   * 启动交互式测试模式
   */
  startInteractiveTest() {
    console.log('\n🎮 启动交互式测试模式');
    console.log('💡 输入消息与亚托莉聊天，输入 "exit" 退出');
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const askQuestion = () => {
      rl.question('\n💬 你的消息: ', async (input) => {
        if (input.toLowerCase() === 'exit') {
          console.log('👋 退出测试模式');
          rl.close();
          await this.stop();
          process.exit(0);
          return;
        }

        try {
          // 模拟接收消息
          await this.adapter.simulateMessage(input, 'private');
        } catch (error) {
          console.error('❌ 测试失败:', error);
        }

        // 继续询问
        askQuestion();
      });
    };

    askQuestion();
  }

  /**
   * 获取机器人状态
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      version: '2.0.0',
      platform: 'NapCat',
      botStatus: this.bot ? this.bot.getStatus() : null,
      adapterStatus: this.adapter ? this.adapter.getStatus() : null
    };
  }
}

/**
 * 主函数
 */
async function main() {
  const bot = new AtriBotV2();
  
  try {
    // 检查命令行参数
    const args = process.argv.slice(2);
    const isTestMode = args.includes('--test') || args.includes('-t');
    
    // 启动机器人
    const success = await bot.start();
    
    if (!success) {
      console.error('❌ 机器人启动失败，程序退出');
      process.exit(1);
    }
    
    if (isTestMode) {
      // 交互式测试模式
      console.log('🎯 进入交互式测试模式');
      bot.startInteractiveTest();
    } else {
      // 正常模式
      console.log('🎯 进入正常模式（需要真正的NapCat才能连接QQ）');
      console.log('💡 提示：使用 --test 参数启动交互式测试模式');
      
      // 定期检查状态（可选）
      setInterval(() => {
        const status = bot.getStatus();
        if (status.isRunning) {
          console.log('💚 机器人运行正常');
        }
      }, 60000); // 每分钟检查一次
    }
    
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

export default AtriBotV2;