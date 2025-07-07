import React, { useState } from 'react';
import { usePlayer } from '../contexts/PlayerContext';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  Repeat,
  Heart,
  FileText
} from 'lucide-react';
import Lyrics from './Lyrics';

const Player = () => {
  const [showLyrics, setShowLyrics] = useState(false);
  
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isLooping,
    togglePlay,
    playPrevious,
    playNext,
    seekTo,
    changeVolume,
    toggleLoop,
    formatTime,
  } = usePlayer();

  if (!currentSong) return null;

  const progressPercentage = duration ? (currentTime / duration) * 100 : 0;

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    seekTo(newTime);
  };

  const handleVolumeChange = (e) => {
    changeVolume(parseFloat(e.target.value));
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            {/* 歌曲信息 */}
            <div className="flex items-center space-x-4 flex-1 min-w-0">
              <div className="w-12 h-12 bg-gray-300 rounded-lg overflow-hidden flex-shrink-0">
                {currentSong.coverUrl ? (
                  <img
                    src={currentSong.coverUrl}
                    alt={currentSong.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {currentSong.title[0]}
                    </span>
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {currentSong.title}
                </h3>
                <p className="text-xs text-gray-500 truncate">
                  {currentSong.artist}
                </p>
              </div>
            </div>

            {/* 播放控制 */}
            <div className="flex items-center space-x-4 flex-1 justify-center">
              <button
                onClick={playPrevious}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <SkipBack className="w-5 h-5 text-gray-700" />
              </button>
              
              <button
                onClick={togglePlay}
                className="p-3 bg-primary-600 hover:bg-primary-700 rounded-full transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-white" />
                ) : (
                  <Play className="w-5 h-5 text-white ml-0.5" />
                )}
              </button>
              
              <button
                onClick={playNext}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <SkipForward className="w-5 h-5 text-gray-700" />
              </button>
              
              <button
                onClick={toggleLoop}
                className={`p-2 rounded-full transition-colors ${
                  isLooping 
                    ? 'bg-primary-100 text-primary-600' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Repeat className="w-4 h-4" />
              </button>
            </div>

            {/* 音量控制和其他功能 */}
            <div className="flex items-center space-x-4 flex-1 justify-end">
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <Heart className="w-4 h-4 text-gray-700" />
              </button>
              
              <button 
                onClick={() => setShowLyrics(true)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="查看歌词"
              >
                <FileText className="w-4 h-4 text-gray-700" />
              </button>
              
              <div className="flex items-center space-x-2">
                <Volume2 className="w-4 h-4 text-gray-700" />
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* 进度条 */}
          <div className="mt-3 flex items-center space-x-4">
            <span className="text-xs text-gray-500 w-10 text-right">
              {formatTime(currentTime)}
            </span>
            
            <div 
              className="flex-1 h-1 bg-gray-200 rounded-full cursor-pointer"
              onClick={handleProgressClick}
            >
              <div 
                className="h-full bg-primary-600 rounded-full transition-all duration-100"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            
            <span className="text-xs text-gray-500 w-10">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>

      {/* 歌词显示组件 */}
      <Lyrics
        song={currentSong}
        isOpen={showLyrics}
        onClose={() => setShowLyrics(false)}
        currentTime={currentTime}
      />
    </>
  );
};

export default Player; 