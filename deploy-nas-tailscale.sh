#!/bin/bash

# 宋韵照片生成 NAS 自动部署脚本 (通过 Tailscale)
# 使用方法: ./deploy-nas-tailscale.sh

set -e

# 配置参数（根据你的 NAS 信息调整）
NAS_IP="100.84.59.9"
NAS_USER="admin"
NAS_DEPLOY_PATH="/volume1/docker/songyun"
PROJECT_NAME="songyun-photo-generator"

echo "🚀 宋韵照片生成 NAS 自动部署 (Tailscale)"
echo "=========================================="
echo ""
echo "📍 NAS 信息:"
echo "   Tailscale IP: $NAS_IP"
echo "   SSH 用户名: $NAS_USER"
echo "   部署路径: $NAS_DEPLOY_PATH"
echo ""

# 检查 Tailscale 连接
echo "🔍 检查 Tailscale 连接..."
if ! ping -c 1 -W 2 $NAS_IP &>/dev/null; then
    echo "❌ 无法连接到 NAS，请检查:"
    echo "   1. NAS 是否已加入 Tailscale 网络"
    echo "   2. Tailscale IP 是否正确: $NAS_IP"
    echo "   3. 运行: tailscale status 查看网络状态"
    exit 1
fi
echo "✅ Tailscale 连接正常"
echo ""

# 检查本地项目文件
echo "📦 检查本地项目文件..."

REQUIRED_FILES=(
    "docker-compose-nas.yml"
    ".env"
    "backend/Dockerfile"
    "backend/package.json"
    "backend/src/index.ts"
    "dist/index.html"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ] && [ ! -d "$file" ]; then
        echo "❌ 缺少必要文件: $file"
        exit 1
    fi
done

echo "✅ 所有必要文件已就绪"
echo ""

# 准备部署包
echo "📦 准备部署文件..."
DEPLOY_TEMP_DIR=$(mktemp -d)
PROJECT_ROOT=$(pwd)

echo "   临时目录: $DEPLOY_TEMP_DIR"

# 复制必要文件到临时目录
echo "   复制项目文件..."
cp docker-compose-nas.yml "$DEPLOY_TEMP_DIR/docker-compose.yml"
cp .env "$DEPLOY_TEMP_DIR/"

# 复制后端代码
mkdir -p "$DEPLOY_TEMP_DIR/backend"
cp -r backend/* "$DEPLOY_TEMP_DIR/backend/"

# 复制前端构建产物
mkdir -p "$DEPLOY_TEMP_DIR/dist"
cp -r dist/* "$DEPLOY_TEMP_DIR/dist/"

# 复制 nginx 配置
mkdir -p "$DEPLOY_TEMP_DIR/nginx"
cp nginx/nginx.conf "$DEPLOY_TEMP_DIR/nginx/"

echo "✅ 文件准备完成"
echo ""

# 测试 SSH 连接
echo "🔐 测试 SSH 连接..."
echo "   提示: 请输入 NAS SSH 密码 (DSM 登录密码)"

if ! ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no $NAS_USER@$NAS_IP echo "SSH 连接测试" &>/dev/null; then
    echo "❌ SSH 连接失败，请检查:"
    echo "   1. SSH 用户名是否正确: $NAS_USER"
    echo "   2. SSH 密码是否正确 (DSM 登录密码)"
    echo "   3. NAS SSH 服务是否已启用"
    echo "      DSM 控制面板 → 终端机和 SNMP → 启用 SSH 服务"
    echo ""
    echo "   手动测试命令:"
    echo "   ssh $NAS_USER@$NAS_IP"
    exit 1
fi
echo "✅ SSH 连接成功"
echo ""

# 在 NAS 创建部署目录
echo "📁 在 NAS 创建部署目录..."
ssh $NAS_USER@$NAS_IP "mkdir -p $NAS_DEPLOY_PATH" || {
    echo "❌ 无法创建目录，请检查 NAS 权限"
    exit 1
}
echo "✅ 部署目录已创建: $NAS_DEPLOY_PATH"
echo ""

# 上传项目文件到 NAS
echo "📤 上传项目文件到 NAS..."
echo "   这可能需要几分钟..."

# 使用 rsync 上传（更高效）
if command -v rsync &>/dev/null; then
    echo "   使用 rsync 上传..."
    rsync -avz --progress \
        --exclude 'node_modules' \
        --exclude '.git' \
        --exclude 'src' \
        --exclude 'test-output' \
        --exclude '*.log' \
        --exclude '*.tar.gz' \
        "$DEPLOY_TEMP_DIR/" \
        "$NAS_USER@$NAS_IP:$NAS_DEPLOY_PATH/" || {
        echo "❌ rsync 上传失败"
        exit 1
    }
else
    echo "   使用 scp 上传..."
    scp -r "$DEPLOY_TEMP_DIR/"* "$NAS_USER@$NAS_IP:$NAS_DEPLOY_PATH/" || {
        echo "❌ scp 上传失败"
        exit 1
    }
fi

echo "✅ 文件上传完成"
echo ""

# 清理本地临时目录
echo "🧹 清理临时文件..."
rm -rf "$DEPLOY_TEMP_DIR"
echo "✅ 临时文件已清理"
echo ""

# 在 NAS 启动部署
echo "🚀 在 NAS 启动部署..."
echo ""

ssh $NAS_USER@$NAS_IP << 'REMOTE_SCRIPT'
set -e

cd /volume1/docker/songyun

echo "📦 检查 Docker 环境..."
if ! command -v docker &>/dev/null; then
    echo "❌ Docker 未安装"
    echo "请在 DSM 套件中心安装 Docker"
    exit 1
fi

echo "✅ Docker 已安装: $(docker --version)"
echo ""

echo "🔍 检查 docker-compose..."
if ! command -v docker-compose &>/dev/null; then
    if docker compose version &>/dev/null; then
        echo "✅ Docker Compose 可用 (docker compose 命令)"
        COMPOSE_CMD="docker compose"
    else
        echo "❌ Docker Compose 不可用"
        exit 1
    fi
else
    COMPOSE_CMD="docker-compose"
fi
echo ""

echo "📋 部署前检查..."
echo "   当前目录: $(pwd)"
echo "   文件列表:"
ls -la
echo ""

echo "⚠️  注意: 需要确保 .env 文件配置正确"
echo "   特别是 TONGYI_API_KEY"
echo ""

echo "🚀 开始部署..."

# 停止现有服务
if $COMPOSE_CMD ps 2>/dev/null | grep -q "running"; then
    echo "⏸️  停止现有服务..."
    $COMPOSE_CMD down
    echo "✅ 已停止现有服务"
fi

echo "🏗️  构建 Docker 镜像..."
$COMPOSE_CMD build || {
    echo "❌ 构建失败"
    exit 1
}

echo "🚀 启动服务..."
$COMPOSE_CMD up -d || {
    echo "❌ 启动失败"
    exit 1
}

echo "⏳ 等待服务启动 (30秒)..."
sleep 30

echo ""
echo "📊 服务状态:"
$COMPOSE_CMD ps

echo ""
echo "✅ 部署完成!"
echo ""

REMOTE_SCRIPT

echo ""
echo "🎉 NAS 部署完成!"
echo ""
echo "📍 通过 Tailscale 访问:"
echo "   H5 前端:  http://$NAS_IP:3000"
echo "   后端 API:  http://$NAS_IP:3001/api"
echo ""
echo "📍 扫码访问:"
echo "   打印二维码链接: http://$NAS_IP:3000"
echo ""
echo "📚 管理命令:"
echo "   查看日志:  ssh $NAS_USER@$NAS_IP 'cd $NAS_DEPLOY_PATH && docker-compose logs -f'"
echo "   重启服务:  ssh $NAS_USER@$NAS_IP 'cd $NAS_DEPLOY_PATH && docker-compose restart'"
echo "   停止服务:  ssh $NAS_USER@$NAS_IP 'cd $NAS_DEPLOY_PATH && docker-compose down'"
echo ""