const OSS = require('ali-oss');
const { v4: uuidv4 } = require('uuid');

// 阿里云OSS配置 - 华北2（北京）
const ossConfig = {
  // 华北2（北京）地域
  region: process.env.OSS_REGION || 'oss-cn-beijing',
  // 从环境变量获取访问凭证
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  // 使用V4签名算法
  authorizationV4: true,
  // bucket名称
  bucket: process.env.OSS_BUCKET,
  // 华北2（北京）公网Endpoint
  endpoint: 'https://oss-cn-beijing.aliyuncs.com',
};

// 创建OSS客户端
const createOSSClient = () => {
  if (!ossConfig.accessKeyId || !ossConfig.accessKeySecret || !ossConfig.bucket) {
    throw new Error('缺少必要的OSS配置：accessKeyId, accessKeySecret, 或 bucket');
  }
  return new OSS(ossConfig);
};

// 上传文件到OSS
const uploadToOSS = async (file, folder = 'music') => {
  const client = createOSSClient();
  
  // 生成唯一文件名
  const fileExtension = file.originalname.split('.').pop();
  const fileName = `${folder}/${uuidv4()}.${fileExtension}`;
  
  try {
    // 自定义请求头
    const headers = {
      // 指定Object的存储类型
      'x-oss-storage-class': 'Standard',
      // 指定Object的访问权限
      'x-oss-object-acl': 'public-read',
      // 设置Content-Type
      'Content-Type': file.mimetype,
    };

    // 上传文件
    const result = await client.put(fileName, file.buffer, {
      headers: headers
    });
    
    return {
      success: true,
      url: result.url,
      name: fileName,
      size: file.size,
      mimetype: file.mimetype
    };
  } catch (error) {
    console.error('OSS上传失败:', error);
    throw new Error('文件上传失败: ' + error.message);
  }
};

// 删除OSS文件
const deleteFromOSS = async (fileName) => {
  const client = createOSSClient();
  
  try {
    await client.delete(fileName);
    return { success: true };
  } catch (error) {
    console.error('OSS删除失败:', error);
    throw new Error('文件删除失败: ' + error.message);
  }
};

// 获取文件访问URL
const getFileUrl = (fileName) => {
  const client = createOSSClient();
  return client.generateObjectUrl(fileName);
};

module.exports = {
  createOSSClient,
  uploadToOSS,
  deleteFromOSS,
  getFileUrl,
  ossConfig
}; 