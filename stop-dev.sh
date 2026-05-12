#!/bin/bash

# 停止本地开发服务

echo "🛑 停止开发服务..."

if [ -f ".dev-pids" ]; then
    PIDS=$(cat .dev-pids)
    for PID in $PIDS; do
        if kill -0 $PID 2>/dev/null; then
            kill $PID
            echo "   已停止进程: $PID"
        fi
    done
    rm .dev-pids
fi

echo "✅ 开发服务已停止"