#!/bin/bash

# 构建所有组件

set -e

echo "🏗️  构建宋韵照片生成项目"
echo "========================="
echo ""

# 构建前端
echo "📦 构建前端..."
npm run build
echo "✅ 前端构建完成"
echo ""

# 构建后端
echo "📦 构建后端..."
cd backend
npm run build
cd ..
echo "✅ 后端构建完成"
echo ""

# 创建部署包
echo "📦 创建部署包..."
DEPLOY_DIR="songyun-deploy"
mkdir -p $DEPLOY_DIR

# 复制文件
cp docker-compose-nas.yml $DEPLOY_DIR/docker-compose.yml
cp .env.production $DEPLOY_DIR/.env
cp -r dist $DEPLOY_DIR/
cp -r backend/dist $DEPLOY_DIR/backend/
cp backend/package.json $DEPLOY_DIR/backend/
cp backend/Dockerfile $DEPLOY_DIR/backend/
mkdir -p $DEPLOY_DIR/nginx
cp nginx/nginx.conf $DEPLOY_DIR/nginx/
cp deploy-nas-tailscale.sh $DEPLOY_DIR/

# 打包
tar -czvf songyun-nas-deploy.tar.gz $DEPLOY_DIR

rm -rf $DEPLOY_DIR

echo "✅ 部署包创建完成: songyun-nas-deploy.tar.gz"
echo ""
echo "📚 上传到 NAS 后解压并运行:"
echo "   tar -xzvf songyun-nas-deploy.tar.gz"
echo "   cd songyun-deploy"
echo "   docker-compose up -d"