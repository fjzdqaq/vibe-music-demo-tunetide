const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const cron = require('node-cron');
// require('dotenv').config(); // 不再需要，由 docker-compose 加载

const authRoutes = require('./routes/auth');
const songRoutes = require('./routes/songs');
const playlistRoutes = require('./routes/playlists');
const playQueueRoutes = require('./routes/playQueue');
const capsuleRoutes = require('./routes/capsules');
const adminRoutes = require('./routes/admin');
const stsRoutes = require('./routes/sts');
const uploadRoutes = require('./routes/upload');
const musicgenRoutes = require('./routes/musicgen');
const { checkUnlockCapsules } = require('./utils/capsuleScheduler');

const app = express();

// 信任Render提供的代理
app.set('trust proxy', 1);

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP每15分钟最多100个请求
  message: '请求过于频繁，请稍后再试'
});

app.use('/api/', limiter);

// 健康检查
app.get('/', (req, res) => {
  res.json({ 
    message: 'TuneTide API 服务正在运行',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    features: ['音乐播放', '播放列表', '情绪胶囊', 'AI音乐生成'],
    // 暂时注释掉上传功能
    // oss: {
    //   region: '华北2（北京）',
    //   endpoint: 'oss-cn-beijing.aliyuncs.com'
    // }
  });
});

// 路由
app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/play-queue', playQueueRoutes);
app.use('/api/capsules', capsuleRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/sts', stsRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/musicgen', musicgenRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// 定时任务：每小时检查胶囊解封
cron.schedule('0 * * * *', () => {
  console.log('检查胶囊解封...');
  checkUnlockCapsules();
});

// 连接数据库
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tunetide', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('📦 MongoDB 连接成功'))
.catch(err => console.error('❌ MongoDB 连接失败:', err));

// 启动服务器
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 服务器运行在端口 ${PORT}`);
  console.log(`🎵 TuneTide API 功能列表:`);
  console.log(`   ✅ 用户认证系统`);
  console.log(`   ✅ 音乐播放管理`);
  console.log(`   ✅ 播放列表功能`);
  console.log(`   ✅ 情绪胶囊功能`);
  console.log(`   ✅ 音乐上传功能 (阿里云OSS - 华北2)`);
  console.log(`   ✅ AI音乐生成功能 (Stability AI)`);
  console.log(`   🔧 支持格式: MP3, WAV, FLAC, M4A, OGG, AAC`);
});

module.exports = app; 