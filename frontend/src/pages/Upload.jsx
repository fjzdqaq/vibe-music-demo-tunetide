import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadAPI } from '../services/api';
import { useLocation } from 'react-router-dom';
import { 
  UploadCloud, 
  Music, 
  Image as ImageIcon, 
  X, 
  Loader, 
  Play, 
  Pause, 
  RotateCcw,
  Wand2,
  Eye,
  Volume2
} from 'lucide-react';

const Upload = () => {
  const location = useLocation();
  
  // 基本信息
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [isAIGenerated, setIsAIGenerated] = useState(false);
  
  // 文件状态
  const [audioFile, setAudioFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  
  // 预览状态
  const [audioPreviewUrl, setAudioPreviewUrl] = useState('');
  const [coverPreview, setCoverPreview] = useState('');
  const [audioMetadata, setAudioMetadata] = useState(null);
  
  // 播放状态
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);
  
  // 上传状态
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 检查是否来自AI生成
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    if (urlParams.get('source') === 'ai') {
      const aiMusicData = localStorage.getItem('aiGeneratedMusic');
      if (aiMusicData) {
        try {
          const data = JSON.parse(aiMusicData);
          setTitle(data.title || '');
          setArtist(data.artist || 'AI Generated');
          setIsAIGenerated(true);
          
          // 清除localStorage
          localStorage.removeItem('aiGeneratedMusic');
          
          // 显示提示信息
          setSuccessMessage('AI生成的音乐信息已自动填充，请上传音频文件。');
        } catch (error) {
          console.error('解析AI音乐数据失败:', error);
        }
      }
    }
  }, [location]);

  // 自动解析音频元数据
  const parseAudioMetadata = async (file) => {
    try {
      // 创建 audio 元素来获取基本信息
      const audio = new Audio();
      const url = URL.createObjectURL(file);
      
      return new Promise((resolve) => {
        audio.addEventListener('loadedmetadata', () => {
          const metadata = {
            duration: audio.duration,
            fileName: file.name,
            size: file.size,
            type: file.type,
          };
          
          // 尝试从文件名解析标题和艺术家
          const fileName = file.name.replace(/\.[^/.]+$/, ""); // 移除扩展名
          const parts = fileName.split(' - ');
          
          if (parts.length >= 2) {
            metadata.parsedTitle = parts[1].trim();
            metadata.parsedArtist = parts[0].trim();
          } else {
            metadata.parsedTitle = fileName;
          }
          
          URL.revokeObjectURL(url);
          resolve(metadata);
        });
        
        audio.addEventListener('error', () => {
          URL.revokeObjectURL(url);
          resolve({
            fileName: file.name,
            size: file.size,
            type: file.type,
          });
        });
        
        audio.src = url;
      });
    } catch (error) {
      console.error('解析音频元数据失败:', error);
      return {
        fileName: file.name,
        size: file.size,
        type: file.type,
      };
    }
  };

  // 音频文件上传处理
  const onAudioDrop = useCallback(async (acceptedFiles) => {
    setError('');
    const audio = acceptedFiles.find(f => f.type.startsWith('audio/'));
    
    if (audio) {
      setAudioFile(audio);
      
      // 创建预览URL
      const previewUrl = URL.createObjectURL(audio);
      setAudioPreviewUrl(previewUrl);
      
      // 解析元数据
      const metadata = await parseAudioMetadata(audio);
      setAudioMetadata(metadata);
      
      // 自动填充表单
      if (metadata.parsedTitle) {
        setTitle(metadata.parsedTitle);
      }
      if (metadata.parsedArtist) {
        setArtist(metadata.parsedArtist);
      }
    }
  }, []);

  // 封面文件上传处理
  const onCoverDrop = useCallback((acceptedFiles) => {
    setError('');
    const image = acceptedFiles.find(f => f.type.startsWith('image/'));
    
    if (image) {
      setCoverFile(image);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result);
      };
      reader.readAsDataURL(image);
    }
  }, []);

  const { getRootProps: getAudioRootProps, getInputProps: getAudioInputProps, isDragActive: isAudioDragActive } = useDropzone({
    onDrop: onAudioDrop,
    accept: {
      'audio/*': ['.mp3', '.wav', '.flac', '.m4a', '.ogg', '.aac']
    },
    multiple: false,
  });

  const { getRootProps: getCoverRootProps, getInputProps: getCoverInputProps, isDragActive: isCoverDragActive } = useDropzone({
    onDrop: onCoverDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp']
    },
    multiple: false,
  });

  // 音频播放控制
  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      const newTime = percentage * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 自动填充建议
  const autoFillFromMetadata = () => {
    if (audioMetadata?.parsedTitle) {
      setTitle(audioMetadata.parsedTitle);
    }
    if (audioMetadata?.parsedArtist) {
      setArtist(audioMetadata.parsedArtist);
    }
  };

  // 提交处理
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!audioFile) {
      setError('请选择一个音频文件。');
      return;
    }
    if (!title || !artist) {
      setError('请输入歌曲标题和艺术家。');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError('');
    setSuccessMessage('');

    const formData = new FormData();
    formData.append('title', title);
    formData.append('artist', artist);
    formData.append('audioFile', audioFile);
    if (coverFile) {
      formData.append('coverFile', coverFile);
    }

    try {
      const response = await uploadAPI.uploadMusic(formData, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      });
      setSuccessMessage('上传成功！歌曲已添加到您的音乐库。');
      
      // 重置表单
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || '上传失败，请稍后重试。');
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setArtist('');
    setAudioFile(null);
    setCoverFile(null);
    setCoverPreview('');
    setAudioMetadata(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    
    if (audioPreviewUrl) {
      URL.revokeObjectURL(audioPreviewUrl);
      setAudioPreviewUrl('');
    }
  };

  const removeAudio = () => {
    setAudioFile(null);
    setAudioMetadata(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    
    if (audioPreviewUrl) {
      URL.revokeObjectURL(audioPreviewUrl);
      setAudioPreviewUrl('');
    }
  };

  const removeCover = () => {
    setCoverFile(null);
    setCoverPreview('');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">上传音乐</h1>
        <p className="text-xl text-gray-600">分享您的音乐作品</p>
      </div>

      {/* 步骤指示器 */}
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <div className={`flex items-center space-x-2 ${audioFile ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${audioFile ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
              <Music className="w-4 h-4" />
            </div>
            <span className="font-medium">选择音频</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-200"></div>
          <div className={`flex items-center space-x-2 ${coverFile ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${coverFile ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
              <ImageIcon className="w-4 h-4" />
            </div>
            <span className="font-medium">添加封面</span>
          </div>
          <div className="w-8 h-0.5 bg-gray-200"></div>
          <div className={`flex items-center space-x-2 ${title && artist ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${title && artist ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
              <Eye className="w-4 h-4" />
            </div>
            <span className="font-medium">完善信息</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 左侧：文件上传 */}
        <div className="space-y-6">
          {/* 音频上传 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Music className="w-5 h-5 mr-2" />
              音频文件
            </h2>
            
            {!audioFile ? (
              <div 
                {...getAudioRootProps()} 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                  isAudioDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
                }`}
              >
                <input {...getAudioInputProps()} />
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <p className="text-lg font-medium text-gray-700">拖拽音频文件到这里</p>
                <p className="text-sm text-gray-500">或点击选择文件</p>
                <p className="text-xs text-gray-400 mt-2">支持 MP3, WAV, FLAC, M4A, OGG, AAC</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Music className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{audioFile.name}</p>
                      <p className="text-sm text-gray-500">
                        {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                        {audioMetadata?.duration && ` • ${formatTime(audioMetadata.duration)}`}
                      </p>
                    </div>
                  </div>
                  <button onClick={removeAudio} className="text-gray-400 hover:text-red-500">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* 音频预览播放器 */}
                {audioPreviewUrl && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3 mb-3">
                      <button
                        onClick={togglePlayPause}
                        className="w-10 h-10 bg-primary-600 hover:bg-primary-700 rounded-full flex items-center justify-center text-white"
                      >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
                      </button>
                      <div className="flex-1">
                        <div 
                          className="h-2 bg-gray-200 rounded-full cursor-pointer"
                          onClick={handleSeek}
                        >
                          <div 
                            className="h-full bg-primary-600 rounded-full"
                            style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm text-gray-500 min-w-0">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>
                    <audio
                      ref={audioRef}
                      src={audioPreviewUrl}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      onEnded={() => setIsPlaying(false)}
                    />
                  </div>
                )}

                {/* 自动解析的元数据 */}
                {audioMetadata && (audioMetadata.parsedTitle || audioMetadata.parsedArtist) && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-blue-900 flex items-center">
                        <Wand2 className="w-4 h-4 mr-1" />
                        自动解析信息
                      </h4>
                      <button
                        onClick={autoFillFromMetadata}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        应用到表单
                      </button>
                    </div>
                    {audioMetadata.parsedTitle && (
                      <p className="text-sm text-blue-700">标题: {audioMetadata.parsedTitle}</p>
                    )}
                    {audioMetadata.parsedArtist && (
                      <p className="text-sm text-blue-700">艺术家: {audioMetadata.parsedArtist}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 封面上传 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <ImageIcon className="w-5 h-5 mr-2" />
              封面图片
              <span className="text-sm text-gray-500 font-normal ml-2">(可选)</span>
            </h2>
            
            {!coverFile ? (
              <div 
                {...getCoverRootProps()} 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
                  isCoverDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-primary-400'
                }`}
              >
                <input {...getCoverInputProps()} />
                <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <p className="text-lg font-medium text-gray-700">拖拽封面图片到这里</p>
                <p className="text-sm text-gray-500">或点击选择文件</p>
                <p className="text-xs text-gray-400 mt-2">支持 JPG, PNG, WebP</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <img 
                    src={coverPreview} 
                    alt="封面预览" 
                    className="w-full max-w-sm mx-auto rounded-lg shadow-md"
                  />
                  <button
                    onClick={removeCover}
                    className="absolute top-2 right-2 w-8 h-8 bg-black bg-opacity-50 hover:bg-opacity-75 text-white rounded-full flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <p className="text-sm text-gray-500 text-center">{coverFile.name}</p>
              </div>
            )}
          </div>
        </div>

        {/* 右侧：信息填写 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">歌曲信息</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                歌曲标题 *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="输入歌曲标题"
                required
              />
            </div>

            <div>
              <label htmlFor="artist" className="block text-sm font-medium text-gray-700 mb-2">
                艺术家 *
              </label>
              <input
                type="text"
                id="artist"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="输入艺术家名称"
                required
              />
            </div>

            {/* AI生成标识 */}
            {isAIGenerated && (
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <div className="flex items-center">
                  <Wand2 className="w-5 h-5 text-purple-600 mr-2" />
                  <div>
                    <h4 className="font-medium text-purple-900">AI生成的音乐</h4>
                    <p className="text-sm text-purple-700">
                      这首音乐是基于您的喜欢列表风格生成的，将被标记为AI创作。
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* 上传进度 */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-primary-700">上传中...</span>
                  <span className="text-primary-700">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* 错误和成功消息 */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{error}</p>
              </div>
            )}
            
            {successMessage && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600">{successMessage}</p>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isUploading}
              >
                <RotateCcw className="w-4 h-4 inline mr-2" />
                重置
              </button>
              <button
                type="submit"
                disabled={isUploading || !audioFile || !title || !artist}
                className="flex-1 px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center justify-center"
              >
                {isUploading ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                    上传中...
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4 mr-2" />
                    确认上传
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Upload; 