const OSS = require('ali-oss');
const { v4: uuidv4 } = require('uuid');
const Song = require('../models/Song');

// OSS配置
const ossConfig = {
  region: process.env.OSS_REGION || 'oss-cn-beijing',
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  bucket: process.env.OSS_BUCKET,
  secure: true,
  timeout: 60000,
};

// 创建OSS客户端
const createOSSClient = () => {
  return new OSS(ossConfig);
};

// 上传单个文件到OSS
const uploadFileToOSS = async (file, folder = 'music') => {
  const client = createOSSClient();
  
  // 生成唯一文件名
  const fileExtension = file.originalname.split('.').pop();
  const fileName = `${folder}/${uuidv4()}.${fileExtension}`;
  
  try {
    console.log(`上传文件到OSS: ${fileName}`);
    
    // 上传文件
    const result = await client.put(fileName, file.buffer, {
      headers: {
        'Content-Type': file.mimetype,
        'x-oss-object-acl': 'public-read',
      }
    });
    
    console.log(`文件上传成功: ${result.url}`);
    
    return {
      success: true,
      url: result.url,
      name: fileName,
      size: file.size
    };
  } catch (error) {
    console.error(`文件上传失败 ${fileName}:`, error);
    throw new Error(`文件上传失败: ${error.message}`);
  }
};

// 删除OSS文件
const deleteFileFromOSS = async (fileName) => {
  const client = createOSSClient();
  
  try {
    await client.delete(fileName);
    console.log(`文件删除成功: ${fileName}`);
    return { success: true };
  } catch (error) {
    console.error(`文件删除失败 ${fileName}:`, error);
    throw new Error(`文件删除失败: ${error.message}`);
  }
};

// 提取音频元数据
const extractAudioMetadata = async (audioFile) => {
  try {
    // 使用动态导入来加载ESM模块
    const { parseBuffer } = await import('music-metadata');
    const metadata = await parseBuffer(audioFile.buffer);
    const duration = metadata.format.duration || 0;
    
    console.log('音频元数据:', {
      duration: duration,
      format: metadata.format.container,
      bitrate: metadata.format.bitrate
    });
    
    return {
      duration: Math.round(duration),
      metadata
    };
  } catch (error) {
    console.warn('无法解析音频元数据:', error.message);
    return {
      duration: 0,
      metadata: null
    };
  }
};

// 提取内嵌封面
const extractEmbeddedCover = async (metadata) => {
  if (!metadata || !metadata.common || !metadata.common.picture) {
    return null;
  }
  
  try {
    const picture = metadata.common.picture[0];
    if (picture && picture.data) {
      const coverBuffer = Buffer.from(picture.data);
      const coverFile = {
        buffer: coverBuffer,
        originalname: `cover.${picture.format === 'image/jpeg' ? 'jpg' : 'png'}`,
        mimetype: picture.format || 'image/jpeg',
        size: coverBuffer.length
      };
      
      const result = await uploadFileToOSS(coverFile, 'music/covers');
      console.log('成功提取并上传内嵌封面');
      return result.url;
    }
  } catch (error) {
    console.warn('提取内嵌封面失败:', error.message);
  }
  
  return null;
};

// 主上传函数
const uploadToOSS = async ({ audioFile, coverFile, title, artist, uploadedBy, scope = 'private', isAIGenerated = false, aiPrompt = null, withVocals = false }) => {
  const uploadedFiles = []; // 追踪已上传的文件，用于错误时清理
  
  try {
    // 1. 提取音频元数据
    console.log('提取音频元数据...');
    const { duration, metadata } = await extractAudioMetadata(audioFile);
    
    // 2. 上传音频文件
    console.log('上传音频文件...');
    const audioResult = await uploadFileToOSS(audioFile, 'music/audio');
    uploadedFiles.push(audioResult.name);
    
    // 3. 处理封面文件
    let coverUrl = null;
    
    if (coverFile) {
      // 上传用户提供的封面
      console.log('上传封面文件...');
      const coverResult = await uploadFileToOSS(coverFile, 'music/covers');
      uploadedFiles.push(coverResult.name);
      coverUrl = coverResult.url;
    } else {
      // 尝试提取内嵌封面
      console.log('尝试提取内嵌封面...');
      coverUrl = await extractEmbeddedCover(metadata);
      if (coverUrl) {
        // 内嵌封面上传成功，记录文件名（这里需要从URL推导）
        // 简化处理，不记录内嵌封面的文件名
      }
    }
    
    // 如果还是没有封面，使用默认封面
    if (!coverUrl) {
      coverUrl = 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop';
    }
    
    // 4. 保存歌曲信息到数据库
    console.log('保存歌曲信息到数据库...');
    const song = new Song({
      title,
      artist,
      coverUrl,
      audioUrl: audioResult.url,
      duration,
      scope,
      uploadedBy,
      isAIGenerated,
      aiPrompt,
      withVocals
    });
    
    await song.save();
    console.log('歌曲保存成功:', title);
    
    return {
      success: true,
      song: {
        id: song._id,
        title: song.title,
        artist: song.artist,
        coverUrl: song.coverUrl,
        audioUrl: song.audioUrl,
        duration: song.duration,
        createdAt: song.createdAt
      }
    };
    
  } catch (error) {
    // 错误时清理已上传的文件
    console.error('上传过程中发生错误，清理已上传的文件...');
    for (const fileName of uploadedFiles) {
      try {
        await deleteFileFromOSS(fileName);
      } catch (deleteError) {
        console.error('清理文件失败:', deleteError);
      }
    }
    
    throw error;
  }
};

module.exports = {
  uploadToOSS,
  uploadFileToOSS,
  deleteFileFromOSS,
  createOSSClient
}; 