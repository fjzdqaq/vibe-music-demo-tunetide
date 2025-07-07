# TuneTide 🎵

> 网页端音乐播放器，支持情绪时间胶囊功能

## 功能特性

- 🎵 音乐搜索与播放
- 📋 播放列表管理
- 💭 情绪时间胶囊：为歌曲写下心情，设定解封时间
- 🔓 到期解封，回顾当时的心情
- 👤 用户登录/注册
- 🐳 Docker 容器化部署

## 技术栈

### 前端
- React + Vite
- TailwindCSS
- React Router
- Axios

### 后端
- Node.js + Express
- MongoDB + Mongoose
- JWT 认证

### 部署
- Docker + Docker Compose

## 开发环境启动

```bash
# 使用 Docker Compose
docker-compose up --build

# 或者分别启动
cd backend && npm install && npm start
cd frontend && npm install && npm dev
```

## 项目结构

```
tune-tide/
├── backend/          # 后端 Node.js 应用
├── frontend/         # 前端 React 应用
├── docker-compose.yml
└── README.md
``` 