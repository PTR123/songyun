# 宋韵照片生成 H5 应用

宋韵照片生成体验项目，用于线下活动互动展示。用户上传照片，选择宋韵风格，由 AI（通义万相）生成宋韵版照片。

## 快速开始

### 本地开发

```bash
# 安装依赖
npm install
cd backend && npm install && cd ..

# 配置环境变量
cp .env.example .env
# 编辑 .env，设置 TONGYI_API_KEY

# 启动开发环境（前端 + 后端）
./start-dev.sh

# 或分别启动
npm run dev          # 前端 (端口 3000)
cd backend && npm run dev  # 后端 (端口 3001)
```

访问：
- 手机端：http://localhost:3000
- 大屏端：http://localhost:3000/display
- API：http://localhost:3001/api

### 停止开发服务

```bash
./stop-dev.sh
```

## NAS + Tailscale 部署

### 一键部署

```bash
# 1. 构建
./build-all.sh

# 2. 部署到 NAS
./deploy-nas-tailscale.sh
```

### 手动部署

```bash
# 1. 构建
npm run build
cd backend && npm run build && cd ..

# 2. 打包
tar -czvf songyun-nas-deploy.tar.gz \
  docker-compose-nas.yml \
  .env.production \
  dist \
  backend/dist \
  backend/package.json \
  backend/Dockerfile \
  nginx/nginx.conf

# 3. 上传到 NAS
scp songyun-nas-deploy.tar.gz admin@100.84.59.9:/volume1/docker/

# 4. 在 NAS 解压并启动
ssh admin@100.84.59.9
cd /volume1/docker
tar -xzvf songyun-nas-deploy.tar.gz
mv docker-compose-nas.yml docker-compose.yml
mv .env.production .env
docker-compose up -d
```

### 访问地址

- H5 前端：http://100.84.59.9:3000
- 后端 API：http://100.84.59.9:3001/api

## 微信公众号使用

1. **直接扫码访问**
   - 打印二维码链接 `http://100.84.59.9:3000`
   - 用户微信扫码直接打开 H5

2. **公众号菜单**
   - 在公众号后台设置菜单链接

3. **公众号文章**
   - 在文章中插入 H5 链接

## 功能特点

- 四种宋韵风格：水墨风、工笔画、仕女图、山水意境
- 图片自动压缩（1MB、1024px）
- 实时排队状态显示
- 大屏实时同步展示（需用户授权）
- 一键下载到本地

## 技术栈

### 前端
- Vue 3 + TypeScript
- Vite 5
- Tailwind CSS（宋韵主题）
- Pinia 状态管理

### 后端
- Express + TypeScript
- 通义万相 API（图像生成）

## 项目结构

```
├── src/                # 前端源码
│   ├── modules/        # 功能模块
│   ├── screens/        # 页面组件
│   ├── shared/         # 共享组件
│   └── stores/         # 状态管理
│
├── backend/            # 后端服务
│   ├── src/            # 后端源码
│   ├── lib/            # AI 客户端
│   └── constants/      # 风格配置
│
├── nginx/              # Nginx 配置
│
├── dist/               # 前端构建产物
│
├── docker-compose-nas.yml  # NAS 部署配置
├── deploy-nas-tailscale.sh # 部署脚本
└── start-dev.sh        # 本地开发启动
```

## 环境变量

| 变量 | 说明 | 必需 |
|------|------|------|
| TONGYI_API_KEY | 通义万相 API Key | ✓ |
| CORS_ORIGIN | CORS 允许来源 | 可选 |
| PORT | 后端端口（默认 3001） | 可选 |

## 四种宋韵风格

| 风格 | 描述 |
|------|------|
| 水墨风 | 浓淡相宜，意境深远 |
| 工笔画 | 细腻精致，线条流畅 |
| 仕女图 | 古典美人，婉约动人 |
| 山水意境 | 空灵悠远，诗情画意 |

## 常见问题

### Q: 生成时间多久？
A: 约 24-30 秒

### Q: 需要微信公众号登录吗？
A: 不需要，直接扫码访问即可

### Q: NAS 部署需要什么？
A: 群晖 NAS + Docker + Tailscale

### Q: 如何获取通义万相 API Key？
A: 访问 https://dashscope.aliyuncs.com 注册获取

## License

MIT