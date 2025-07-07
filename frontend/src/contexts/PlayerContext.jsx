import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

const PlayerContext = createContext();

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};

export const PlayerProvider = ({ children }) => {
  const audioRef = useRef(null);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isLooping, setIsLooping] = useState(false);
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  // 下一首 - 使用useCallback避免依赖问题
  const playNext = useCallback(() => {
    if (playlist.length === 0 || currentIndex < 0) return;
    
    const nextIndex = currentIndex < playlist.length - 1 ? currentIndex + 1 : 0;
    const nextSong = playlist[nextIndex];
    
    if (nextSong) {
      playSong(nextSong, playlist);
    }
  }, [playlist, currentIndex]);

  // 初始化音频元素 - 只在组件挂载时运行
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volume;
      
      // 监听音频事件
      const audio = audioRef.current;
      
      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
      };
      
      const handleLoadedMetadata = () => {
        setDuration(audio.duration);
      };
      
      const handleEnded = () => {
        if (isLooping) {
          audio.currentTime = 0;
          audio.play();
        } else {
          playNext();
        }
      };
      
      const handleCanPlayThrough = () => {
        // 移除自动播放逻辑，避免重复播放
      };

      const handleLoadStart = () => {
        setCurrentTime(0);
        setDuration(0);
      };

      const handleError = (e) => {
        console.error('音频播放错误:', e);
        setIsPlaying(false);
      };
      
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('canplaythrough', handleCanPlayThrough);
      audio.addEventListener('loadstart', handleLoadStart);
      audio.addEventListener('error', handleError);
      
      return () => {
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('canplaythrough', handleCanPlayThrough);
        audio.removeEventListener('loadstart', handleLoadStart);
        audio.removeEventListener('error', handleError);
      };
    }
  }, []); // 空依赖数组，只运行一次

  // 单独处理循环状态的变化
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = isLooping;
    }
  }, [isLooping]);

  // 播放歌曲
  const playSong = async (song, songList = []) => {
    if (!song || !song.audioUrl) return;
    
    try {
      setCurrentSong(song);
      
      if (songList.length > 0) {
        setPlaylist(songList);
        const index = songList.findIndex(s => s._id === song._id);
        setCurrentIndex(index);
      }
      
      if (audioRef.current) {
        audioRef.current.src = song.audioUrl;
        audioRef.current.load(); // 确保重新加载
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('播放失败:', error);
      setIsPlaying(false);
    }
  };

  // 暂停/恢复播放
  const togglePlay = async () => {
    if (!audioRef.current || !currentSong) return;
    
    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('播放控制失败:', error);
    }
  };

  // 上一首
  const playPrevious = () => {
    if (playlist.length === 0 || currentIndex < 0) return;
    
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : playlist.length - 1;
    const prevSong = playlist[prevIndex];
    
    if (prevSong) {
      playSong(prevSong, playlist);
    }
  };

  // 跳转到指定时间
  const seekTo = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // 设置音量
  const changeVolume = (newVolume) => {
    const vol = Math.max(0, Math.min(1, newVolume));
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  // 切换循环模式
  const toggleLoop = () => {
    setIsLooping(!isLooping);
  };

  // 停止播放
  const stopPlaying = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTime(0);
  };

  // 格式化时间
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const value = {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isLooping,
    playlist,
    currentIndex,
    playSong,
    togglePlay,
    playPrevious,
    playNext,
    seekTo,
    changeVolume,
    toggleLoop,
    stopPlaying,
    formatTime,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
}; 