#!/bin/bash

# 本地开发启动脚本
# 同时启动前端和后端

echo "🚀 启动宋韵照片生成本地开发环境"
echo "=================================="
echo ""

# 检查依赖
echo "📦 检查依赖..."
if [ ! -d "node_modules" ]; then
    echo "   安装前端依赖..."
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo "   安装后端依赖..."
    cd backend && npm install && cd ..
fi

echo "✅ 依赖已安装"
echo ""

# 加载环境变量
if [ -f ".env" ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "✅ 环境变量已加载"
else
    echo "⚠️  未找到 .env 文件，使用 .env.production"
    export $(cat .env.production | grep -v '^#' | xargs)
fi
echo ""

# 启动后端
echo "🔧 启动后端服务..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..
echo "   后端 PID: $BACKEND_PID"
echo "   后端地址: http://localhost:3001"
echo ""

# 等待后端启动
sleep 3

# 启动前端
echo "🎨 启动前端服务..."
npm run dev &
FRONTEND_PID=$!
echo "   前端 PID: $FRONTEND_PID"
echo "   前端地址: http://localhost:3000"
echo ""

echo "✅ 开发环境已启动"
echo ""
echo "📍 访问地址:"
echo "   手机端: http://localhost:3000"
echo "   大屏端: http://localhost:3000/display"
echo "   API:    http://localhost:3001/api"
echo ""
echo "📚 停止服务: ./stop-dev.sh 或 kill $BACKEND_PID $FRONTEND_PID"
echo ""

# 保存 PID 到文件
echo "$BACKEND_PID $FRONTEND_PID" > .dev-pids

# 等待用户中断
wait