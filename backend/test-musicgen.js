// 测试 HuggingFace MusicGen API
require('dotenv').config();

async function testMusicGenAPI() {
  const token = process.env.HUGGINGFACE_API_TOKEN;
  
  if (!token) {
    console.error('❌ 请先设置 HUGGINGFACE_API_TOKEN 环境变量');
    return;
  }
  
  console.log('🔑 API Token:', token.substring(0, 10) + '...');
  
  try {
    console.log('🎵 正在测试 MusicGen API...');
    
    const response = await fetch('https://api-inference.huggingface.co/models/facebook/musicgen-small', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify({
        inputs: "happy acoustic guitar melody"
      })
    });
    
    console.log('📡 响应状态:', response.status, response.statusText);
    
    if (response.status === 200) {
      console.log('✅ API 调用成功！');
      console.log('📝 响应头:', Object.fromEntries(response.headers));
      
      // 检查响应大小
      const contentLength = response.headers.get('content-length');
      if (contentLength) {
        console.log('📦 音频文件大小:', Math.round(contentLength / 1024), 'KB');
      }
      
    } else if (response.status === 503) {
      const errorText = await response.text();
      console.log('⏳ 模型正在加载中，请稍后重试');
      console.log('💡 错误信息:', errorText);
      
    } else if (response.status === 401) {
      console.log('❌ API Token 无效，请检查是否正确设置');
      
    } else if (response.status === 429) {
      console.log('⚠️ API 调用频率限制，请稍后重试');
      
    } else {
      const errorText = await response.text();
      console.log('❌ API 调用失败:', errorText);
    }
    
  } catch (error) {
    console.error('💥 网络错误:', error.message);
  }
}

// 运行测试
testMusicGenAPI(); 