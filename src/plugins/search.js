import axios from 'axios';

/**
 * 联网搜索插件
 * 当AI内部知识无法回答时，自动搜索网络获取最新信息
 */
export default class SearchPlugin {
  constructor(config) {
    this.config = config;
    this.isInitialized = false;
  }

  async initialize() {
    try {
      console.log('🌐 初始化联网搜索插件...');
      this.isInitialized = true;
      console.log('✅ 联网搜索插件初始化完成');
    } catch (error) {
      console.error('❌ 联网搜索插件初始化失败:', error);
      throw error;
    }
  }

  /**
   * 插件主入口
   */
  async process(message) {
    return null;
  }

  /**
   * 执行联网搜索
   * @param {string} query - 搜索关键词
   * @returns {string} 搜索结果摘要
   */
  async search(query) {
    try {
      if (!this.isInitialized) return '';

      const searchConfig = this.config.plugins?.search || {};

      if (searchConfig.provider === 'duckduckgo' || !searchConfig.provider) {
        return await this.searchDuckDuckGo(query);
      }
      if (searchConfig.provider === 'serpapi') {
        return await this.searchSerpAPI(query, searchConfig.apiKey);
      }

      return await this.searchDuckDuckGo(query);
    } catch (error) {
      console.error('❌ 联网搜索失败:', error.message);
      return '';
    }
  }

  /**
   * DuckDuckGo 搜索（免费，无需API密钥）
   */
  async searchDuckDuckGo(query) {
    try {
      const response = await axios.get('https://lite.duckduckgo.com/lite/', {
        params: { q: query },
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        timeout: 10000
      });

      const html = response.data;
      const results = [];

      // 解析搜索结果：提取标题链接和摘要
      const linkRegex = /<a[^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/gi;
      const snippetRegex = /<td class="result-snippet">([^<]+)/gi;

      let linkMatch;
      const linkEntries = [];
      while ((linkMatch = linkRegex.exec(html)) !== null) {
        const url = linkMatch[1];
        const title = linkMatch[2].replace(/<\/?[^>]+>/g, '').trim();
        if (title && !url.startsWith('//duckduckgo.com') && !url.includes('duckduckgo.com/lite')) {
          linkEntries.push({ title, url });
        }
      }

      let snippetMatch;
      const snippets = [];
      while ((snippetMatch = snippetRegex.exec(html)) !== null) {
        snippets.push(snippetMatch[1].trim());
      }

      for (let i = 0; i < Math.min(linkEntries.length, snippets.length, 5); i++) {
        results.push(`${linkEntries[i].title}: ${snippets[i]}`);
      }

      if (results.length === 0) {
        return '';
      }

      console.log(`🌐 搜索完成，找到 ${results.length} 条结果`);

      return results
        .map((r, i) => `[${i + 1}] ${r}`)
        .join('\n');
    } catch (error) {
      console.error('❌ DuckDuckGo搜索失败:', error.message);
      return '';
    }
  }

  /**
   * SerpAPI 搜索（需要API密钥）
   */
  async searchSerpAPI(query, apiKey) {
    if (!apiKey) {
      console.log('📋 SerpAPI密钥未配置，跳过搜索');
      return '';
    }

    try {
      const response = await axios.get('https://serpapi.com/search', {
        params: {
          q: query,
          api_key: apiKey,
          engine: 'google',
          num: 5
        },
        timeout: 15000
      });

      const organic = response.data?.organic_results || [];
      if (organic.length === 0) return '';

      const results = organic.slice(0, 5).map((r, i) =>
        `[${i + 1}] ${r.title}: ${r.snippet || ''}`
      );

      console.log(`🌐 SerpAPI搜索完成，找到 ${results.length} 条结果`);
      return results.join('\n');
    } catch (error) {
      console.error('❌ SerpAPI搜索失败:', error.message);
      return '';
    }
  }

  /**
   * 判断AI回复是否表示"不知道"
   */
  static isDontKnowResponse(response) {
    if (!response) return true;

    const dontKnowPatterns = [
      '不知道', '不能', '无法', '没法', '没有这个能力',
      '暂时不能', '暂时无法', '还不能', '抱歉', '对不起',
      '无法回答', '无法提供', '无法获取', '没有相关信息',
      "don't know", 'cannot', 'unable to', 'no information',
      '我无法', '不支持', '暂不支持', '数据库里没有',
      '为数不多的遗憾', '遗憾之一',
      '暂时还没有联网', '暂时还不会', '还没有学会',
      '还没有联网', '不能联网', '暂时没有'
    ];

    const lowerResponse = response.toLowerCase();
    return dontKnowPatterns.some(pattern =>
      lowerResponse.includes(pattern.toLowerCase())
    );
  }

  /**
   * 检测消息是否需要实时信息
   */
  static needsSearch(message) {
    const timeSensitivePatterns = [
      '今天', '现在', '当前', '最新', '最近',
      '天气', '新闻', '热搜', '实时',
      '今天星期几', '今天几号', '几点了',
      '汇率', '股价', '股票', '直播',
      '发生什么', '有什么新'
    ];

    const lowerContent = message.toLowerCase();
    return timeSensitivePatterns.some(pattern =>
      lowerContent.includes(pattern.toLowerCase())
    );
  }

  /**
   * 从用户消息中提取搜索关键词
   */
  static extractSearchQuery(message) {
    // 去掉常见的前缀元问题
    let query = message
      .replace(/你试试你能不能/g, '')
      .replace(/你能不能/g, '')
      .replace(/你可以/g, '')
      .replace(/你可不可以/g, '')
      .replace(/帮我/g, '')
      .replace(/搜索一下/g, '')
      .replace(/查一下/g, '')
      .replace(/搜一下/g, '')
      .replace(/联网搜索/g, '')
      .replace(/联网搜/g, '')
      .trim();

    // 如果消息里有"比如""例如"，优先取后半部分
    const exampleMatch = query.match(/[比像]如(.+)/);
    if (exampleMatch) {
      query = exampleMatch[1].trim();
    }

    // 去掉首尾的问号和多余标点
    query = query.replace(/[?？?！!。，,、]+$/, '').trim();

    // 如果处理后为空或太短，用原消息
    if (!query || query.length < 2) {
      query = message;
    }

    return query;
  }

  async getStatus() {
    return {
      isInitialized: this.isInitialized,
      provider: this.config.plugins?.search?.provider || 'duckduckgo'
    };
  }

  async stop() {
    this.isInitialized = false;
    console.log('✅ 联网搜索插件已停止');
  }
}
