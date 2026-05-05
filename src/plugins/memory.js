import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 记忆插件
 * 负责存储和检索对话记忆，实现长期记忆功能
 */
export default class MemoryPlugin {
  constructor(config) {
    this.config = config;
    this.isInitialized = false;
    this.db = null;
    this.dataDir = path.join(process.cwd(), 'data');
  }

  /**
   * 初始化记忆插件
   */
  async initialize() {
    try {
      console.log('🧠 初始化记忆插件...');
      
      // 确保数据目录存在
      if (!fs.existsSync(this.dataDir)) {
        fs.mkdirSync(this.dataDir, { recursive: true });
      }
      
      // 初始化数据库
      await this.initializeDatabase();
      
      this.isInitialized = true;
      console.log('✅ 记忆插件初始化完成');
      
    } catch (error) {
      console.error('❌ 记忆插件初始化失败:', error);
      throw error;
    }
  }

  /**
   * 初始化数据库
   */
  async initializeDatabase() {
    return new Promise((resolve, reject) => {
      const dbPath = path.join(this.dataDir, 'bot.db');
      
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          reject(err);
          return;
        }
        
        console.log('📊 连接SQLite数据库成功');
        
        // 创建记忆表
        this.db.run(`
          CREATE TABLE IF NOT EXISTS memories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            user_name TEXT,
            message_content TEXT NOT NULL,
            bot_response TEXT NOT NULL,
            message_type TEXT NOT NULL,
            timestamp INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
          )
        `, (err) => {
          if (err) {
            reject(err);
            return;
          }
          
          console.log('✅ 记忆表创建/检查完成');
          resolve();
        });
      });
    });
  }

  /**
   * 处理消息（记忆插件主要作为存储，不直接处理消息）
   */
  async process(message) {
    // 记忆插件不直接生成回复，只负责存储
    return null;
  }

  /**
   * 更新记忆
   */
  async updateMemory(message, response) {
    try {
      if (!this.isInitialized || !response) {
        return;
      }
      
      // 只存储有意义的对话
      if (response.trim() === '' || message.content.trim() === '') {
        return;
      }
      
      // 插入记忆记录
      const stmt = this.db.prepare(`
        INSERT INTO memories (user_id, user_name, message_content, bot_response, message_type, timestamp)
        VALUES (?, ?, ?, ?, ?, ?)
      `);
      
      await new Promise((resolve, reject) => {
        stmt.run([
          message.userId,
          message.userName,
          message.content,
          response,
          message.type,
          message.timestamp || Date.now()
        ], function(err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
      
      stmt.finalize();
      
      console.log('💾 记忆已保存');
      
    } catch (error) {
      console.error('❌ 保存记忆失败:', error);
    }
  }

  /**
   * 获取用户记忆
   */
  async getUserMemories(userId, limit = 5) {
    try {
      if (!this.isInitialized) {
        return [];
      }
      
      return new Promise((resolve, reject) => {
        this.db.all(
          `SELECT message_content, bot_response, timestamp 
           FROM memories 
           WHERE user_id = ? 
           ORDER BY timestamp DESC 
           LIMIT ?`,
          [userId, limit],
          (err, rows) => {
            if (err) {
              reject(err);
            } else {
              resolve(rows || []);
            }
          }
        );
      });
      
    } catch (error) {
      console.error('❌ 获取用户记忆失败:', error);
      return [];
    }
  }

  /**
   * 清空用户记忆
   */
  async clearUserMemories(userId) {
    try {
      if (!this.isInitialized) {
        return;
      }
      
      await new Promise((resolve, reject) => {
        this.db.run(
          'DELETE FROM memories WHERE user_id = ?',
          [userId],
          function(err) {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          }
        );
      });
      
      console.log(`🗑️ 用户 ${userId} 的记忆已清空`);
      
    } catch (error) {
      console.error('❌ 清空用户记忆失败:', error);
    }
  }

  /**
   * 获取记忆统计
   */
  async getMemoryStats() {
    try {
      if (!this.isInitialized) {
        return {};
      }
      
      const stats = await new Promise((resolve, reject) => {
        this.db.get(
          'SELECT COUNT(*) as total, COUNT(DISTINCT user_id) as unique_users FROM memories',
          (err, row) => {
            if (err) {
              reject(err);
            } else {
              resolve(row || { total: 0, unique_users: 0 });
            }
          }
        );
      });
      
      return stats;
      
    } catch (error) {
      console.error('❌ 获取记忆统计失败:', error);
      return { total: 0, unique_users: 0 };
    }
  }

  /**
   * 获取插件状态
   */
  async getStatus() {
    const stats = await this.getMemoryStats();
    
    return {
      isInitialized: this.isInitialized,
      totalMemories: stats.total,
      uniqueUsers: stats.unique_users,
      dataDir: this.dataDir
    };
  }

  /**
   * 停止插件
   */
  async stop() {
    try {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error('❌ 关闭数据库失败:', err);
          } else {
            console.log('✅ 数据库连接已关闭');
          }
        });
      }
      
      this.isInitialized = false;
      console.log('✅ 记忆插件已停止');
      
    } catch (error) {
      console.error('❌ 停止记忆插件失败:', error);
    }
  }
}