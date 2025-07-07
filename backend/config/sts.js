// 简化版OSS凭证配置（避免STS复杂性）

// 直接返回OSS凭证
const getDirectCredentials = () => {
  return {
    success: true,
    data: {
      accessKeyId: process.env.OSS_ACCESS_KEY_ID,
      accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
      securityToken: null, // 永久凭证不需要securityToken
      expiration: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24小时后过期
      region: process.env.OSS_REGION,
      bucket: process.env.OSS_BUCKET,
    }
  };
};

// 获取临时访问凭证（占位符，待完善）
const getSTSToken = async () => {
  // 暂时返回直接凭证
  console.log('STS功能待完善，使用直接凭证');
  return getDirectCredentials();
};

module.exports = {
  getSTSToken,
  getDirectCredentials
}; 