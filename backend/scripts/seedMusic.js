const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const musicMetadata = require('music-metadata');
const Song = require('../models/Song');
const { uploadToOSS } = require('../utils/ossUpload');
// require('dotenv').config(); // 不再需要，由 docker-compose 加载

const MUSIC_DIR = path.join(__dirname, '../music');

// 简单从文件名中提取艺术家和标题
const parseTrackInfo = (filename) => {
  const parts = path.parse(filename).name.split('-');
  if (parts.length >= 2) {
    return {
      artist: parts[0].trim(),
      title: parts[1].trim(),
    };
  }
  // 如果格式不匹配，则默认为标题
  return {
    artist: '未知艺术家',
    title: path.parse(filename).name,
  };
};

const seedMusic = async () => {
  try {
    console.log('🚀 开始填充音乐数据...');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ 数据库连接成功');

    const files = fs.readdirSync(MUSIC_DIR);
    const audioFiles = files.filter(f => /\.(mp3|wav|flac|m4a|ogg|aac)$/i.test(f));

    if (audioFiles.length === 0) {
      console.log('🤷 在 music 文件夹中未找到音频文件。');
      return;
    }
    
    console.log(`🎵 发现了 ${audioFiles.length} 个音频文件，准备处理...`);

    for (const audioFile of audioFiles) {
      const audioFilePath = path.join(MUSIC_DIR, audioFile);
      const fileBaseName = path.parse(audioFile).name;

      console.log(`\n--- 处理中: ${audioFile} ---`);

      // 检查歌曲是否已存在
      const trackInfo = parseTrackInfo(audioFile);
      const existingSong = await Song.findOne({ title: trackInfo.title, artist: trackInfo.artist });
      if (existingSong) {
        console.log(`ℹ️ 歌曲 "${trackInfo.title}" 已存在于数据库中，跳过。`);
        continue;
      }
      
      // 寻找匹配的封面
      const coverFile = files.find(f => 
        new RegExp(`^${fileBaseName}\\.(jpg|jpeg|png|gif)$`, 'i').test(f)
      );

      let coverFilePath = null;
      if (coverFile) {
        coverFilePath = path.join(MUSIC_DIR, coverFile);
        console.log(`🖼️ 找到封面: ${coverFile}`);
      } else {
        console.log('⚠️ 未找到对应的封面文件。');
      }

      // 读取音频元数据
      const metadata = await musicMetadata.parseFile(audioFilePath);
      console.log(`⏱️ 音频时长: ${metadata.format.duration} 秒`);

      // 准备上传数据
      const audioBuffer = fs.readFileSync(audioFilePath);
      const coverBuffer = coverFilePath ? fs.readFileSync(coverFilePath) : null;
      
      const audioUploadData = {
        buffer: audioBuffer,
        originalname: audioFile,
        mimetype: `audio/${path.extname(audioFile).slice(1)}`,
      };

      let coverUploadData = null;
      if (coverBuffer && coverFile) {
        coverUploadData = {
          buffer: coverBuffer,
          originalname: coverFile,
          mimetype: `image/${path.extname(coverFile).slice(1)}`,
        };
      }

      console.log('☁️ 开始上传到阿里云OSS...');
      const uploadResult = await uploadToOSS({
        audioFile: audioUploadData,
        coverFile: coverUploadData,
        title: trackInfo.title,
        artist: trackInfo.artist,
        scope: 'public',
        // 此处可以设置一个默认的上传者ID
        // uploadedBy: new mongoose.Types.ObjectId('your_default_user_id')
      });
      console.log('✅ 上传成功!');
      
      // 注意: uploadToOSS应该已经创建了歌曲记录，这里只是为了演示
      // 如果uploadToOSS不创建，则需要在这里手动创建
      // const newSong = new Song({ ... });
      // await newSong.save();

      console.log(`🎉 成功处理并添加歌曲: ${trackInfo.artist} - ${trackInfo.title}`);
    }

    console.log('\n✨ 所有音乐文件处理完毕！');

  } catch (error) {
    console.error('❌ 处理音乐数据时发生严重错误:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 数据库连接已断开。');
  }
};

seedMusic(); 