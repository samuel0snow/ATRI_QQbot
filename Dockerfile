# 亚托莉QQ机器人 - NapCat版本
# 使用Node.js 18作为基础镜像

# 支持构建参数配置
ARG NPM_REGISTRY=https://registry.npmjs.org
ARG NODE_IMAGE=node:18

FROM ${NODE_IMAGE}

# 设置工作目录
WORKDIR /app

# 设置npm镜像源（支持构建参数）
RUN npm config set registry ${NPM_REGISTRY}

# 复制package.json和安装依赖
COPY package*.json ./
RUN npm install --only=production

# 复制源代码
COPY src/ ./src/
COPY config/ ./config/

# 创建数据目录
RUN mkdir -p data logs

# 设置环境变量
ENV NODE_ENV=production
ENV LOG_LEVEL=info

# 暴露端口（如果需要）
# EXPOSE 3000

# 启动命令
CMD ["node", "src/main.js"]