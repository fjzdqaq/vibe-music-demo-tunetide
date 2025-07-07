import OSS from 'ali-oss';
import { v4 as uuidv4 } from 'uuid';
import api from '../services/api';

// OSS客户端缓存
let ossClient = null;
let credentialsCache = null;

// 创建OSS客户端（使用STS凭证）
export const createOSSClient = async () => {
  // 检查缓存的凭证是否有效
  if (credentialsCache && new Date() < new Date(credentialsCache.expiration)) {
    if (ossClient) {
      return ossClient;
    }
  }

  try {
    // 从后端获取OSS凭证
    const response = await api.get('/sts/credentials');
    
    if (!response.data.success) {
      throw new Error(response.data.message || '获取OSS凭证失败');
    }

    const credentials = response.data.data;
    credentialsCache = credentials;

    // 创建OSS客户端配置
    const ossConfig = {
      region: credentials.region,
      bucket: credentials.bucket,
      accessKeyId: credentials.accessKeyId,
      accessKeySecret: credentials.accessKeySecret,
      stsToken: credentials.securityToken, // STS临时凭证
      secure: true, // 使用HTTPS
      timeout: 60000, // 60秒超时
      retryCount: 3, // 重试次数
    };

    ossClient = new OSS(ossConfig);
    
    console.log('OSS客户端创建成功', {
      region: credentials.region,
      bucket: credentials.bucket,
      expiration: credentials.expiration
    });

    return ossClient;
  } catch (error) {
    console.error('创建OSS客户端失败:', error);
    throw new Error(`OSS客户端创建失败: ${error.message}`);
  }
};

// 上传文件到OSS
export const uploadFileToOSS = async (file, folder = 'music') => {
  try {
    const client = await createOSSClient();
    
    // 生成唯一文件名
    const fileExtension = file.name.split('.').pop();
    const fileName = `${folder}/${uuidv4()}.${fileExtension}`;
    
    // 设置上传选项
    const options = {
      headers: {
        'x-oss-storage-class': 'Standard',
        'x-oss-object-acl': 'public-read',
        'Content-Type': file.type,
      },
      // 进度回调
      progress: (percentage, checkpoint) => {
        console.log(`上传进度: ${Math.round(percentage * 100)}%`);
      },
      // 分片上传配置
      partSize: 1024 * 1024, // 1MB分片
      parallel: 4, // 并发数
      // 错误重试
      retryCount: 3,
      retryDelay: 1000,
    };

    // 上传文件
    const result = await client.put(fileName, file, options);
    
    return {
      success: true,
      url: result.url,
      name: fileName,
      size: file.size,
      type: file.type
    };
  } catch (error) {
    console.error('OSS上传失败:', error);
    
    // 详细错误信息
    let errorMessage = '文件上传失败';
    
    if (error.name === 'ConnectionTimeoutError') {
      errorMessage = '上传超时，请检查网络连接';
    } else if (error.name === 'RequestError') {
      errorMessage = '网络请求失败，请稍后重试';
    } else if (error.status === 403) {
      errorMessage = 'OSS权限不足，请检查访问密钥';
    } else if (error.status === 404) {
      errorMessage = 'OSS存储桶不存在';
    } else if (error.code === 'InvalidAccessKeyId') {
      errorMessage = '访问密钥无效，请重新获取凭证';
    } else if (error.code === 'SecurityTokenExpired') {
      errorMessage = '访问凭证已过期，请重新获取';
    } else if (error.message && error.message.includes('凭证')) {
      errorMessage = '获取OSS凭证失败，请稍后重试';
    }
    
    throw new Error(errorMessage);
  }
};

// 测试OSS连接
export const testOSSConnection = async () => {
  try {
    // 从后端测试OSS连接
    const response = await api.get('/sts/test');
    
    if (response.data.success) {
      return { 
        success: true, 
        message: 'OSS连接测试成功',
        data: response.data.data 
      };
    } else {
      return { 
        success: false, 
        message: response.data.message || 'OSS连接测试失败' 
      };
    }
  } catch (error) {
    console.error('OSS连接测试失败:', error);
    
    let errorMessage = 'OSS连接测试失败';
    
    if (error.response) {
      errorMessage = error.response.data?.message || '服务器错误';
    } else if (error.request) {
      errorMessage = '网络连接失败，请检查后端服务';
    }
    
    return { 
      success: false, 
      message: errorMessage,
      error: error
    };
  }
};

// 删除OSS文件
export const deleteFileFromOSS = async (fileName) => {
  try {
    const client = await createOSSClient();
    await client.delete(fileName);
    return { success: true };
  } catch (error) {
    console.error('OSS删除失败:', error);
    throw new Error(`文件删除失败: ${error.message}`);
  }
};

// 获取文件访问URL
export const getFileUrl = async (fileName) => {
  try {
    const client = await createOSSClient();
    return client.generateObjectUrl(fileName);
  } catch (error) {
    console.error('获取文件URL失败:', error);
    throw new Error(`获取文件URL失败: ${error.message}`);
  }
};

// 清除凭证缓存
export const clearCredentialsCache = () => {
  credentialsCache = null;
  ossClient = null;
};

// 支持的文件类型
export const SUPPORTED_AUDIO_TYPES = [
  'audio/mpeg',        // MP3
  'audio/wav',         // WAV
  'audio/flac',        // FLAC
  'audio/m4a',         // M4A
  'audio/mp4',         // MP4音频
  'audio/ogg',         // OGG
  'audio/aac',         // AAC
];

export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
];

// 文件大小限制
export const FILE_SIZE_LIMITS = {
  audio: 100 * 1024 * 1024, // 100MB
  image: 10 * 1024 * 1024,  // 10MB
}; 