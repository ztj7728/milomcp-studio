# --- STAGE 1: Build ---
# 使用 Node.js 镜像来构建前端应用
FROM node:22-alpine AS build

# 设置工作目录
WORKDIR /opt/app

# 复制 package.json
COPY package.json ./

# 安装依赖
RUN npm install

# 复制所有源代码
COPY . .

# 运行构建命令
RUN npm run build

# --- STAGE 2: Production ---
# 使用一个非常轻量的 caddy 镜像作为最终的生产环境

FROM caddy:latest

# 将我们在项目docker_build目录创建的 Caddyfile 复制到容器的标准配置路径
COPY docker_build/Caddyfile /etc/caddy/Caddyfile

# 从构建阶段，将构建好的静态文件 (dist 目录下的内容) 复制到 Caddy 的默认网站根目录 /srv
COPY --from=build /opt/app/dist /opt/app

# Caddy 镜像会自动暴露 4173 端口并启动 Caddy 服务，我们无需额外操作。