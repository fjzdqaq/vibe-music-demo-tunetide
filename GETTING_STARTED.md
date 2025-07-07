# TuneTide 项目启动指南

## 快速开始

### 使用 Docker Compose（推荐）

1. **克隆项目并进入目录**
   ```bash
   cd tune-tide
   ```

2. **启动所有服务**
   ```bash
   docker-compose up --build
   ```

3. **访问应用**
   - 前端：http://localhost
   - 后端 API：http://localhost:3000
   - MongoDB：localhost:27017

4. **初始化示例数据**
   ```bash
   # 在另一个终端中运行
   docker-compose exec backend npm run init-data
   ```

### 手动启动（开发环境）

#### 前置要求
- Node.js 18+
- MongoDB
- npm 或 yarn

#### 1. 启动后端

```bash
cd backend

# 安装依赖
npm install

# 创建环境变量文件
cp .env.example .env
# 编辑 .env 文件配置数据库连接等

# 启动开发服务器
npm run dev

# 初始化示例数据
npm run init-data
```

#### 2. 启动前端

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## 环境变量配置

### 后端 (.env)
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/tunetide
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 前端 (.env)
```env
VITE_API_URL=http://localhost:3000/api
```

## 默认账户

系统启动后，您可以注册新账户或使用以下测试账户：

- 注册新账户：访问 http://localhost/register
- 登录：访问 http://localhost/login

## 功能测试

1. **用户注册/登录**
   - 访问注册页面创建账户
   - 使用用户名和密码登录

2. **音乐播放**
   - 浏览首页的歌曲列表
   - 点击播放按钮播放音乐
   - 使用底部播放器控制播放

3. **播放列表管理**
   - 访问播放列表页面
   - 创建和管理播放列表

4. **情绪胶囊**
   - 访问情绪胶囊页面
   - 创建时间胶囊，设置解锁时间
   - 查看已解锁的胶囊

## 开发说明

### 后端 API 端点

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/songs` - 获取歌曲列表
- `GET /api/playlists` - 获取播放列表
- `GET /api/emotion-capsules` - 获取情绪胶囊

### 项目结构

```
tune-tide/
├── backend/                 # 后端 Node.js 应用
│   ├── models/             # 数据模型
│   ├── routes/             # API 路由
│   ├── middleware/         # 中间件
│   ├── utils/              # 工具函数
│   └── scripts/            # 脚本文件
├── frontend/               # 前端 React 应用
│   ├── src/
│   │   ├── components/     # React 组件
│   │   ├── pages/          # 页面组件
│   │   ├── contexts/       # React 上下文
│   │   ├── services/       # API 服务
│   │   └── styles/         # 样式文件
├── docker-compose.yml      # Docker 编排文件
└── README.md              # 项目说明
```

## 故障排除

### 常见问题

1. **端口被占用**
   - 确保 3000、80、27017 端口未被其他应用占用
   - 或修改 docker-compose.yml 中的端口映射

2. **MongoDB 连接失败**
   - 检查 MongoDB 是否正常运行
   - 验证环境变量中的数据库连接字符串

3. **Docker 构建失败**
   - 确保 Docker 和 Docker Compose 已正确安装
   - 清理 Docker 缓存：`docker system prune`

### 日志查看

```bash
# 查看所有服务日志
docker-compose logs

# 查看特定服务日志
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb
```

## 生产部署

1. **修改环境变量**
   - 更新 JWT_SECRET 为安全的随机字符串
   - 配置生产环境的数据库连接
   - 设置适当的 CORS 策略

2. **使用反向代理**
   - 建议使用 Nginx 作为反向代理
   - 配置 HTTPS 证书

3. **数据备份**
   - 定期备份 MongoDB 数据
   - 配置日志轮转

## 开发贡献

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

## 许可证

MIT License 