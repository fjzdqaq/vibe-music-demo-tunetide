# TuneTide 🎵

> 全功能网页端音乐播放器，集成AI音乐生成、情绪时间胶囊、智能播放队列等创新功能

## ✨ 功能特性

### 🎵 核心音乐功能
- **音乐播放**：高品质音频播放，支持MP3、WAV、FLAC等格式
- **智能搜索**：按标题、艺术家快速查找音乐
- **喜欢列表**：收藏您喜爱的音乐，创建个人音乐库
- **播放队列**：智能播放队列，自动记录播放历史和手动添加

### 🤖 AI音乐生成
- **AI作曲助手**：基于Stability AI Stable Audio 2.0
- **智能风格匹配**：根据喜欢列表自动匹配音乐风格
- **文本描述生成**：通过自然语言描述生成30秒音乐片段
- **高品质输出**：44.1kHz立体声MP3格式

### 💭 情绪时间胶囊
- **情绪记录**：为歌曲写下当时的心情和想法
- **时间锁定**：设定解封时间，创造未来的惊喜
- **自动解封**：到期自动解锁，回顾过往情感
- **北京时间**：基于北京时间的精确时间管理

### 📁 文件管理
- **音乐上传**：支持本地音乐文件上传
- **云端存储**：集成阿里云OSS，安全可靠
- **元数据解析**：自动提取音频文件信息
- **封面处理**：支持内嵌封面提取和自定义封面

### 👤 用户系统
- **用户注册/登录**：安全的JWT认证机制
- **权限管理**：管理员/普通用户权限分离
- **个人资料**：用户统计和偏好设置

## 🛠️ 技术栈

### 前端技术
- **React 18** + **Vite** - 现代化前端构建
- **TailwindCSS** - 实用优先的CSS框架
- **React Router** - 单页应用路由
- **Axios** - HTTP请求库
- **Lucide React** - 现代图标库

### 后端技术
- **Node.js** + **Express** - 服务端框架
- **MongoDB** + **Mongoose** - NoSQL数据库
- **JWT** - 安全认证
- **Multer** - 文件上传处理
- **node-cron** - 定时任务调度

### AI & 云服务
- **Stability AI** - AI音乐生成
- **阿里云OSS** - 对象存储服务
- **阿里云STS** - 临时访问凭证

### 部署技术
- **Docker** + **Docker Compose** - 容器化部署
- **Nginx** - 反向代理和静态文件服务
- **Render** / **Vercel** - 云端部署平台

## 🚀 快速开始

### 使用Docker Compose（推荐）

```bash
# 1. 克隆项目
git clone https://github.com/fjzdqaq/vibe-music-demo-tunetide.git
cd tune-tide

# 2. 启动所有服务
docker-compose up --build

# 3. 访问应用
# 前端：http://localhost
# 后端：http://localhost:3000
```

### 手动部署

```bash
# 后端启动
cd backend
npm install
npm start

# 前端启动（新终端）
cd frontend
npm install
npm run dev
```

## ⚙️ 环境变量配置

### 后端配置

创建 `backend/.env` 文件：

```env
# 数据库配置
MONGODB_URI=mongodb://localhost:27017/tunetide

# JWT配置
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# 服务器配置
PORT=3000
NODE_ENV=development

# 阿里云OSS配置（可选）
OSS_REGION=oss-cn-beijing
OSS_BUCKET=your-bucket-name
OSS_ACCESS_KEY_ID=your-access-key-id
OSS_ACCESS_KEY_SECRET=your-access-key-secret

# Stability AI配置（可选）
STABILITY_API_KEY=sk-your-stability-ai-api-key
```

### 前端配置

创建 `frontend/.env` 文件：

```env
VITE_API_URL=http://localhost:3000/api
```

## 📡 API 端点

### 认证 API
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取用户信息

### 音乐 API
- `GET /api/songs` - 获取歌曲列表（支持搜索、分页）
- `GET /api/songs/:id` - 获取单首歌曲
- `POST /api/upload/music` - 上传音乐文件

### 喜欢列表 API
- `GET /api/playlists` - 获取用户喜欢列表
- `POST /api/playlists` - 创建喜欢列表
- `PUT /api/playlists/:id` - 更新喜欢列表
- `DELETE /api/playlists/:id` - 删除喜欢列表

### 播放队列 API
- `GET /api/play-queue` - 获取播放队列
- `POST /api/play-queue/add` - 添加歌曲到队列
- `POST /api/play-queue/played` - 记录播放历史
- `DELETE /api/play-queue/:id` - 移除队列歌曲

### 情绪胶囊 API
- `GET /api/capsules` - 获取胶囊列表
- `POST /api/capsules` - 创建情绪胶囊
- `PUT /api/capsules/:id/unlock` - 解锁胶囊

### AI音乐生成 API
- `POST /api/musicgen/generate` - AI音乐生成
- `GET /api/musicgen/history` - 获取AI生成历史

## 📁 项目结构

```
tune-tide/
├── backend/                 # 后端应用
│   ├── config/             # 配置文件
│   ├── middleware/         # 中间件
│   ├── models/            # 数据模型
│   ├── routes/            # API路由
│   ├── services/          # 业务服务
│   ├── scripts/           # 脚本工具
│   ├── utils/             # 工具函数
│   └── index.js           # 入口文件
├── frontend/               # 前端应用
│   ├── src/
│   │   ├── components/    # React组件
│   │   ├── pages/        # 页面组件
│   │   ├── contexts/     # React上下文
│   │   ├── services/     # API服务
│   │   └── utils/        # 工具函数
│   ├── public/           # 静态资源
│   └── vite.config.js    # Vite配置
├── music/                 # 示例音乐文件
├── docker-compose.yml     # Docker编排
└── README.md             # 项目文档
```

## 🔧 开发指南

### 数据库初始化

```bash
# 在容器中运行
docker-compose exec backend npm run init-data

# 添加示例音乐（可选）
docker-compose exec backend npm run seed:music
```

### 本地开发

1. **启动数据库**：确保MongoDB运行在`localhost:27017`
2. **安装依赖**：分别在`backend/`和`frontend/`目录运行`npm install`
3. **配置环境变量**：按照上述配置创建`.env`文件
4. **启动服务**：后端`npm run dev`，前端`npm run dev`

### 代码规范

- **ES6+** 语法，使用现代JavaScript特性
- **组件化** 开发，合理拆分React组件
- **响应式** 设计，支持移动端适配
- **错误处理** 优雅处理各种异常情况

## 🌟 特色功能

### AI音乐生成工作流程

1. **选择喜欢列表** → 系统自动分析音乐风格
2. **描述音乐场景** → 输入自然语言描述
3. **AI智能生成** → Stability AI生成30秒音乐
4. **自动保存** → 生成的音乐自动添加到音乐库

### 播放队列智能管理

- **播放历史**：自动记录播放过的歌曲（蓝色时钟图标）
- **手动添加**：用户主动添加的歌曲（绿色加号图标）
- **持久化存储**：队列数据保存到数据库
- **实时同步**：多设备间播放状态同步

### 情绪时间胶囊体验

- **情绪记录**：记录听歌时的心情和想法
- **时间设定**：精确到分钟的解锁时间
- **自动提醒**：定时任务检查待解锁胶囊
- **回忆重现**：解锁时重新体验当时的情感

## 🐳 生产部署

### Docker部署

```bash
# 生产环境启动
docker-compose -f docker-compose.yml up -d

# 查看日志
docker-compose logs -f

# 更新应用
git pull origin main
docker-compose build --no-cache
docker-compose up -d
```

### 云端部署

项目支持一键部署到：
- **Vercel**（前端）+ **Render**（后端）
- **Docker** 容器平台
- **传统VPS** 服务器

## 🤝 贡献指南

1. **Fork** 项目仓库
2. **创建** 功能分支：`git checkout -b feature/amazing-feature`
3. **提交** 更改：`git commit -m 'Add amazing feature'`
4. **推送** 分支：`git push origin feature/amazing-feature`
5. **创建** Pull Request

## 📄 开源协议

本项目基于 **MIT License** 开源协议。

## 🙏 致谢

- [Stability AI](https://stability.ai/) - AI音乐生成技术
- [React](https://reactjs.org/) - 前端框架
- [Node.js](https://nodejs.org/) - 后端运行时
- [MongoDB](https://www.mongodb.com/) - 数据库
- [TailwindCSS](https://tailwindcss.com/) - UI框架

---

**TuneTide** - 让音乐与AI完美融合，创造属于你的音乐时光 🎵✨ 