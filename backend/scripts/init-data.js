const mongoose = require('mongoose');
const User = require('../models/User');
const Song = require('../models/Song');
const fs = require('fs');
const path = require('path');

// 示例歌曲数据 - 使用免费音频资源
const sampleSongs = [
  {
    title: '夜曲',
    artist: '周杰伦',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    audioUrl: 'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav', // 临时音频，建议替换为真实音乐
    duration: 240
  },
  {
    title: '晴天',
    artist: '周杰伦',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=400&fit=crop',
    audioUrl: 'https://www.soundjay.com/buttons/button-09.wav', // 不同的音效
    duration: 268
  },
  {
    title: '青花瓷',
    artist: '周杰伦',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=400&h=400&fit=crop',
    audioUrl: 'https://www.soundjay.com/buttons/button-10.wav', // 不同的音效
    duration: 234
  },
  {
    title: '稻香',
    artist: '周杰伦',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    audioUrl: 'https://www.soundjay.com/buttons/button-3.wav', // 不同的音效
    duration: 223
  },
  {
    title: '告白气球',
    artist: '周杰伦',
    coverUrl: 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=400&h=400&fit=crop',
    audioUrl: 'https://www.soundjay.com/buttons/button-4.wav', // 不同的音效
    duration: 205
  },
  {
    title: '七里香',
    artist: '周杰伦',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    audioUrl: 'https://www.soundjay.com/buttons/button-5.wav', // 不同的音效
    duration: 298
  },
  {
    title: '演员',
    artist: '薛之谦',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
    audioUrl: 'https://www.soundjay.com/buttons/button-6.wav', // 不同的音效
    duration: 258
  },
  {
    title: '刚好遇见你',
    artist: '李玉刚',
    coverUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
    audioUrl: 'https://www.soundjay.com/buttons/button-7.wav', // 不同的音效
    duration: 226
  }
];

const initializeData = async () => {
  try {
    console.log('🔄 开始初始化数据...');
    
    // 1. 创建默认管理员用户
    const existingAdmin = await User.findOne({ username: 'admin' });
    if (!existingAdmin) {
      const adminUser = new User({
        username: 'admin',
        passwordHash: 'admin', // 这将被pre-save中间件自动哈希
        isAdmin: true
      });
      await adminUser.save();
      console.log('✅ 默认管理员用户创建成功: admin/admin');
    } else {
      console.log('ℹ️  管理员用户已存在，跳过创建');
    }

    // 2. 创建测试用户
    const existingUser = await User.findOne({ username: 'testuser' });
    if (!existingUser) {
      const testUser = new User({
        username: 'testuser',
        passwordHash: 'password123',
        isAdmin: false
      });
      await testUser.save();
      console.log('✅ 测试用户创建成功: testuser/password123');
    } else {
      console.log('ℹ️  测试用户已存在，跳过创建');
    }

    // 3. 检查是否有歌曲数据
    const songCount = await Song.countDocuments();
    console.log(`📊 当前数据库中有 ${songCount} 首歌曲`);

    if (songCount === 0) {
      console.log('📁 数据库中没有歌曲，可以运行 npm run seed 来添加示例音乐');
    }

    console.log('🎉 数据初始化完成！');
  } catch (error) {
    console.error('❌ 数据初始化失败:', error);
  } finally {
    await mongoose.connection.close();
  }
};

// 如果直接运行此脚本
if (require.main === module) {
  initializeData();
}

module.exports = initializeData; 