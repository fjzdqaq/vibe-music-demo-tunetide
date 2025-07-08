const mongoose = require('mongoose');
const PlayQueue = require('../models/PlayQueue');
const User = require('../models/User');

const migratePlayQueue = async () => {
  try {
    console.log('🔄 开始迁移PlayQueue数据库...');
    
    // 1. 确保PlayQueue集合存在
    const collections = await mongoose.connection.db.listCollections().toArray();
    const playQueueExists = collections.some(col => col.name === 'playqueues');
    
    if (!playQueueExists) {
      console.log('📝 创建PlayQueue集合...');
      await mongoose.connection.db.createCollection('playqueues');
    }
    
    // 2. 创建索引
    console.log('📊 创建PlayQueue索引...');
    await PlayQueue.collection.createIndex({ userId: 1, addedAt: -1 });
    console.log('✅ PlayQueue索引创建成功');
    
    // 3. 检查现有数据
    const playQueueCount = await PlayQueue.countDocuments();
    console.log(`📊 当前播放队列记录数: ${playQueueCount}`);
    
    // 4. 显示用户统计
    const userCount = await User.countDocuments();
    console.log(`👤 当前用户数: ${userCount}`);
    
    console.log('🎉 PlayQueue迁移完成！');
    
  } catch (error) {
    console.error('❌ PlayQueue迁移失败:', error);
    throw error;
  }
};

// 如果直接运行此脚本
if (require.main === module) {
  // 连接数据库
  const connectDB = async () => {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/tunetide';
      await mongoose.connect(mongoUri);
      console.log('📦 数据库连接成功');
      
      await migratePlayQueue();
      
    } catch (error) {
      console.error('❌ 数据库连接失败:', error);
      process.exit(1);
    } finally {
      await mongoose.connection.close();
      console.log('🔌 数据库连接已关闭');
    }
  };
  
  connectDB();
}

module.exports = migratePlayQueue; 