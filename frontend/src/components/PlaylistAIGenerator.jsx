import React, { useState } from 'react';
import { Wand2, Music, Upload, Download, X } from 'lucide-react';
import { musicgenAPI } from '../services/api';

const PlaylistAIGenerator = ({ playlist, onClose }) => {
  const [userScene, setUserScene] = useState('');
  const [generating, setGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState('');
  const [generatedSong, setGeneratedSong] = useState(null);

  const generateStyleDescription = () => {
    const artists = playlist.songs?.map(song => song.artist) || [];
    const uniqueArtists = [...new Set(artists)];
    let styleDesc = playlist.description ? `${playlist.description}, ` : '';
    if (uniqueArtists.length > 0) {
      styleDesc += `风格类似于 ${uniqueArtists.slice(0, 3).join(', ')}`;
    }
    return styleDesc || '流行音乐';
  };

  const handleGenerate = async () => {
    if (!userScene.trim()) {
      setError('请输入您想要的歌曲主题描述');
      return;
    }

    setGenerating(true);
    setError('');
    setGeneratedSong(null);

    const fullPrompt = `${userScene.trim()}, ${generateStyleDescription()}`;
    
    try {
      setStatusMessage('正在连接AI音乐生成服务...');
      const data = await musicgenAPI.generateMusic({
        prompt: fullPrompt,
        duration: 30, // 固定生成30秒的歌曲
        withVocals: true,
      });

      if (data.success && data.song) {
        setStatusMessage('AI歌曲生成成功！');
        setGeneratedSong(data.song);
        console.log('✅ AI歌曲已生成并保存:', data.song);
      } else {
        throw new Error(data.message || '生成失败，未知错误');
      }
    } catch (err) {
      console.error('生成歌曲失败:', err);
      setError(err.message || '网络错误，请检查连接后重试');
      setStatusMessage('');
    } finally {
      setGenerating(false);
    }
  };

  const handleFinish = () => {
    alert('AI歌曲已保存到您的音乐库！');
    onClose();
    // 强制刷新页面以在列表中看到新歌曲
    window.location.reload();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 relative">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <Wand2 className="w-6 h-6 mr-3 text-purple-600" />
              AI作曲助手
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-1">创作风格</h3>
              <p className="text-blue-800 text-sm">{generateStyleDescription()}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                歌曲主题描述 *
              </label>
              <textarea
                value={userScene}
                onChange={(e) => setUserScene(e.target.value)}
                placeholder="例如：一场雨中浪漫的邂逅、夏日海滩派对、深夜独自开车的思绪..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                rows="3"
                disabled={generating}
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {statusMessage && (
            <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-sm text-indigo-700">
              {statusMessage}
            </div>
          )}
          
          {generatedSong && (
            <div className="mt-4 p-4 border border-green-300 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-800 mb-2">生成完毕: {generatedSong.title}</h3>
              <audio controls className="w-full" src={generatedSong.filePath}>
                您的浏览器不支持音频播放。
              </audio>
            </div>
          )}

          <div className="mt-6">
            {!generatedSong ? (
              <button
                onClick={handleGenerate}
                disabled={!userScene.trim() || generating}
                className="w-full bg-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-purple-700 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-300"
              >
                {generating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-3"></div>
                    请稍候...
                  </>
                ) : (
                  <>
                    <Music className="w-5 h-5 mr-2" />
                    开始生成 (约30秒)
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleFinish}
                className="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 flex items-center justify-center transition-all duration-300"
              >
                <Upload className="w-5 h-5 mr-2" />
                完成并关闭
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaylistAIGenerator; 