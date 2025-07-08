import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { playQueueAPI } from '../services/api';

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
  const [playQueue, setPlayQueue] = useState([]);
  const [queueIndex, setQueueIndex] = useState(-1);
  const [queueLoading, setQueueLoading] = useState(false);

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

  // 加载播放队列
  const loadPlayQueue = useCallback(async () => {
    try {
      setQueueLoading(true);
      const response = await playQueueAPI.getPlayQueue();
      const queueData = response.data.data || [];
      setPlayQueue(queueData.map(item => ({
        ...item.song,
        queueId: item._id,
        addedType: item.addedType,
        addedAt: item.addedAt
      })));
    } catch (error) {
      console.error('加载播放队列失败:', error);
    } finally {
      setQueueLoading(false);
    }
  }, []);

  // 初始化时加载播放队列
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      loadPlayQueue();
    }
  }, [loadPlayQueue]);

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
        
        // 记录播放历史到数据库
        try {
          await playQueueAPI.recordPlayed(song._id);
          // 重新加载播放队列
          loadPlayQueue();
        } catch (error) {
          console.error('记录播放历史失败:', error);
        }
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

  // 添加歌曲到播放队列
  const addToPlayQueue = async (song) => {
    try {
      await playQueueAPI.addToPlayQueue(song._id);
      // 重新加载播放队列
      loadPlayQueue();
      return true;
    } catch (error) {
      console.error('添加歌曲到播放队列失败:', error);
      return false;
    }
  };

  // 从播放队列中移除歌曲
  const removeFromPlayQueue = async (queueId) => {
    try {
      await playQueueAPI.removeFromPlayQueue(queueId);
      // 重新加载播放队列
      loadPlayQueue();
      return true;
    } catch (error) {
      console.error('从播放队列移除歌曲失败:', error);
      return false;
    }
  };

  // 清空播放队列
  const clearPlayQueue = async () => {
    try {
      await playQueueAPI.clearPlayQueue();
      setPlayQueue([]);
      setQueueIndex(-1);
      return true;
    } catch (error) {
      console.error('清空播放队列失败:', error);
      return false;
    }
  };

  // 播放队列中的歌曲
  const playFromQueue = (song) => {
    const index = playQueue.findIndex(s => s._id === song._id);
    if (index !== -1) {
      setQueueIndex(index);
      playSong(song, playQueue);
    }
  };

  // 播放队列中的下一首
  const playNextInQueue = () => {
    if (playQueue.length === 0) return;
    
    const nextIndex = queueIndex < playQueue.length - 1 ? queueIndex + 1 : 0;
    const nextSong = playQueue[nextIndex];
    
    if (nextSong) {
      setQueueIndex(nextIndex);
      playSong(nextSong, playQueue);
    }
  };

  // 播放队列中的上一首
  const playPrevInQueue = () => {
    if (playQueue.length === 0) return;
    
    const prevIndex = queueIndex > 0 ? queueIndex - 1 : playQueue.length - 1;
    const prevSong = playQueue[prevIndex];
    
    if (prevSong) {
      setQueueIndex(prevIndex);
      playSong(prevSong, playQueue);
    }
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
    playQueue,
    queueIndex,
    queueLoading,
    playSong,
    togglePlay,
    playPrevious,
    playNext,
    seekTo,
    changeVolume,
    toggleLoop,
    stopPlaying,
    formatTime,
    addToPlayQueue,
    removeFromPlayQueue,
    clearPlayQueue,
    playFromQueue,
    playNextInQueue,
    playPrevInQueue,
    loadPlayQueue,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
}; 