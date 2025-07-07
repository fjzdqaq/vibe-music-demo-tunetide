import React, { useState } from 'react';
import { Wand2, Music, Upload, Download, Play, X } from 'lucide-react';

const PlaylistAIGenerator = ({ playlist, onClose }) => {
  const [userScene, setUserScene] = useState('');
  const [generatedMusic, setGeneratedMusic] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [audioUrl, setAudioUrl] = useState('');

  // 分析播放列表生成音乐风格描述
  const generateStyleDescription = () => {
    const artists = playlist.songs?.map(song => song.artist) || [];
    const uniqueArtists = [...new Set(artists)];
    
    let styleDesc = '';
    if (playlist.description) {
      styleDesc += playlist.description;
    }
    
    if (uniqueArtists.length > 0) {
      styleDesc += ` 风格类似于 ${uniqueArtists.slice(0, 3).join(', ')}`;
    }
    
    return styleDesc;
  };

  const handleGenerate = async () => {
    if (!userScene.trim()) {
      alert('请输入您想要的音乐场景描述');
      return;
    }

    setGenerating(true);
    
    try {
      // 组合提示词：播放列表风格 + 用户场景
      const styleDesc = generateStyleDescription();
      const combinedPrompt = `${userScene.trim()}, ${styleDesc}`;
      
      // 这里我们先模拟生成过程，实际可以调用真实的API
      setTimeout(() => {
        // 模拟生成成功
        setGeneratedMusic({
          title: `AI生成 - ${userScene}`,
          description: combinedPrompt,
          duration: 30
        });
        // 这里应该是真实的音频URL
        setAudioUrl('https://www.soundjay.com/misc/sounds/bell-ringing-05.wav'); // 示例音频
        setGenerating(false);
      }, 3000);
      
    } catch (error) {
      console.error('生成音乐失败:', error);
      alert('生成音乐失败，请重试');
      setGenerating(false);
    }
  };

  const handleUploadToLibrary = () => {
    // 跳转到上传页面，并预填充生成的音乐信息
    const uploadData = {
      title: generatedMusic.title,
      artist: 'AI Generated',
      audioUrl: audioUrl,
      isAIGenerated: true,
      sourcePlaylist: playlist.name
    };
    
    // 将数据存储到localStorage，供上传页面使用
    localStorage.setItem('aiGeneratedMusic', JSON.stringify(uploadData));
    
    // 跳转到上传页面
    window.location.href = '/upload?source=ai';
  };

  const openExternalGenerator = () => {
    const styleDesc = generateStyleDescription();
    const combinedPrompt = `${userScene.trim()}, ${styleDesc}`;
    
    // 打开外部音乐生成器，并尝试预填充描述
    const encodedPrompt = encodeURIComponent(combinedPrompt);
    window.open(`https://huggingface.co/spaces/facebook/MusicGen?prompt=${encodedPrompt}`, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* 标题栏 */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <Wand2 className="w-6 h-6 mr-2 text-purple-600" />
              为「{playlist.name}」生成AI音乐
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 播放列表风格分析 */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">播放列表风格分析</h3>
            <p className="text-blue-800 text-sm">
              {generateStyleDescription() || '暂无风格描述，将基于您的场景描述生成音乐'}
            </p>
            <div className="mt-2 text-xs text-blue-600">
              基于您播放列表中的 {playlist.songs?.length || 0} 首歌曲分析
            </div>
          </div>

          {/* 用户场景输入 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              描述您想要的音乐场景 *
            </label>
            <textarea
              value={userScene}
              onChange={(e) => setUserScene(e.target.value)}
              placeholder="例如：适合雨天听的安静音乐、运动时的激励音乐、工作时的专注背景音乐..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows="3"
              disabled={generating}
            />
            <p className="text-xs text-gray-500 mt-1">
              我们会结合您的播放列表风格和场景描述来生成个性化音乐
            </p>
          </div>

          {/* 生成按钮 */}
          <div className="mb-6">
            <button
              onClick={handleGenerate}
              disabled={!userScene.trim() || generating}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  正在生成中...
                </>
              ) : (
                <>
                  <Music className="w-5 h-5 mr-2" />
                  生成AI音乐
                </>
              )}
            </button>
          </div>

          {/* 外部生成器选项 */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900 mb-2">或使用外部AI音乐生成器</h3>
            <p className="text-sm text-gray-600 mb-3">
              我们会自动为您组合播放列表风格和场景描述
            </p>
            <button
              onClick={openExternalGenerator}
              disabled={!userScene.trim()}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              在新窗口中打开 MusicGen
            </button>
          </div>

          {/* 生成结果 */}
          {generatedMusic && (
            <div className="border border-green-200 bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-3">🎉 音乐生成成功！</h3>
              
              <div className="mb-4">
                <h4 className="font-medium text-gray-900">{generatedMusic.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{generatedMusic.description}</p>
                <p className="text-xs text-gray-500 mt-1">时长: {generatedMusic.duration}秒</p>
              </div>

              {/* 音频预览 */}
              {audioUrl && (
                <div className="mb-4">
                  <audio controls className="w-full">
                    <source src={audioUrl} type="audio/mpeg" />
                    您的浏览器不支持音频播放。
                  </audio>
                </div>
              )}

              {/* 操作按钮 */}
              <div className="flex space-x-3">
                <button
                  onClick={handleUploadToLibrary}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  上传到音乐库
                </button>
                
                {audioUrl && (
                  <a
                    href={audioUrl}
                    download={`${generatedMusic.title}.mp3`}
                    className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center text-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    下载音频
                  </a>
                )}
              </div>
            </div>
          )}

          {/* 使用说明 */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">💡 使用提示</h4>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• 描述越具体，生成的音乐越符合您的需求</li>
              <li>• 我们会自动结合您播放列表的音乐风格</li>
              <li>• 生成后可以预览、下载或直接上传到音乐库</li>
              <li>• 英文描述通常效果更好</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaylistAIGenerator; 