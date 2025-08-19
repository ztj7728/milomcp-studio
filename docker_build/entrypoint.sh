#!/bin/sh
# 脚本将在容器启动时执行
# 确保脚本在出现错误时立即退出
set -e

# 定义配置文件在 Caddy 服务根目录下的路径
# 根据你的 Dockerfile，静态文件被复制到了 /opt/app
CONFIG_FILE="/opt/app/config.js"

# 读取 Docker 环境变量 VITE_MILOMCP_API_URL
# 如果环境变量不存在，则提供一个默认值，以防万一
: "${VITE_MILOMCP_API_URL:=http://localhost:3000}"

# 动态生成 config.js 文件
# 将环境变量的值写入一个全局的 JavaScript 对象 window.runtimeConfig
echo "window.runtimeConfig = {" > ${CONFIG_FILE}
echo "  VITE_MILOMCP_API_URL: '${VITE_MILOMCP_API_URL}'" >> ${CONFIG_FILE}
echo "};" >> ${CONFIG_FILE}

echo "Generated ${CONFIG_FILE} with API URL: ${VITE_MILOMCP_API_URL}"

# 执行 Docker CMD 中定义的原始命令 (即启动 caddy 服务)
# "$@" 会将传递给脚本的所有参数原封不动地传递给 exec
exec "$@"