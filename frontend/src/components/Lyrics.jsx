import React, { useState, useEffect } from 'react';
import { X, Music } from 'lucide-react';

const Lyrics = ({ song, isOpen, onClose, currentTime = 0 }) => {
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);

  // 模拟歌词数据（实际项目中应该从API获取）
  const sampleLyrics = {
    'default': [
      { time: 0, text: '♪ 音乐正在播放 ♪' },
      { time: 5, text: '暂无歌词' },
      { time: 10, text: '请欣赏这首美妙的音乐' },
      { time: 15, text: '让音乐带你飞翔' },
      { time: 20, text: '♪ ♪ ♪' }
    ],
    '晴天': [
      { time: 0, text: '故事的小黄花' },
      { time: 3, text: '从出生那年就飘着' },
      { time: 6, text: '童年的荡秋千' },
      { time: 9, text: '随记忆一直摇到现在' },
      { time: 12, text: '吹着前奏望着天空' },
      { time: 15, text: '我想起花瓣试着掉落' },
      { time: 18, text: '为你翘课的那一天' },
      { time: 21, text: '花落的那一天' },
      { time: 24, text: '教室的那一间' },
      { time: 27, text: '我怎么看不见' },
      { time: 30, text: '消失的下雨天' },
      { time: 33, text: '我好想再淋一遍' },
      { time: 36, text: '没想到失去的勇气我还留着' },
      { time: 42, text: '好想再问一遍' },
      { time: 45, text: '你会等待还是离开' }
    ],
    '夜曲': [
      { time: 0, text: '一群嗜血的蚂蚁' },
      { time: 3, text: '被腐肉所吸引' },
      { time: 6, text: '我面无表情' },
      { time: 9, text: '看孤独的风景' },
      { time: 12, text: '失去你爱恨开始分明' },
      { time: 18, text: '失去你还有什么事好关心' },
      { time: 24, text: '当鸽子不再象征和平' },
      { time: 27, text: '我终于被提醒' },
      { time: 30, text: '广场上喂鸽子的老人' },
      { time: 33, text: '眼神多么安详' },
      { time: 36, text: '可是飞起来的时候' },
      { time: 39, text: '那群白鸽却如此紧张' }
    ]
  };

  // 获取当前歌曲的歌词
  const getCurrentLyrics = () => {
    if (!song) return sampleLyrics.default;
    
    const songTitle = song.title;
    return sampleLyrics[songTitle] || sampleLyrics.default;
  };

  const lyrics = getCurrentLyrics();

  // 根据当前播放时间更新歌词索引
  useEffect(() => {
    if (currentTime && lyrics.length > 0) {
      let index = 0;
      for (let i = 0; i < lyrics.length; i++) {
        if (currentTime >= lyrics[i].time) {
          index = i;
        } else {
          break;
        }
      }
      setCurrentLyricIndex(index);
    }
  }, [currentTime, lyrics]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md mx-4 max-h-[80vh] overflow-hidden">
        {/* 头部 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Music className="w-6 h-6 text-blue-400" />
            <div>
              <h2 className="text-white text-lg font-semibold">
                {song?.title || '歌词'}
              </h2>
              <p className="text-gray-400 text-sm">
                {song?.artist || '未知艺术家'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 歌词显示区域 */}
        <div className="lyrics-container overflow-y-auto max-h-96 space-y-3">
          {lyrics.map((lyric, index) => (
            <div
              key={index}
              className={`text-center transition-all duration-300 ${
                index === currentLyricIndex
                  ? 'text-white text-lg font-semibold scale-105 text-shadow-lg'
                  : index < currentLyricIndex
                  ? 'text-gray-500 text-sm'
                  : 'text-gray-400 text-base'
              }`}
              style={{
                textShadow: index === currentLyricIndex ? '0 0 10px rgba(59, 130, 246, 0.5)' : 'none'
              }}
            >
              {lyric.text}
            </div>
          ))}
        </div>

        {/* 底部提示 */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-xs">
            歌词会随着音乐播放自动滚动
          </p>
        </div>
      </div>
    </div>
  );
};

export default Lyrics; 