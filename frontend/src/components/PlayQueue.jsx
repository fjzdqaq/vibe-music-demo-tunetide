import React from 'react';
import { Play, X, Trash2, ListMusic, Clock, PlusCircle } from 'lucide-react';
import { usePlayer } from '../contexts/PlayerContext';

const PlayQueue = ({ isOpen, onClose }) => {
  const { 
    playQueue, 
    currentSong, 
    queueIndex,
    queueLoading,
    playFromQueue, 
    removeFromPlayQueue, 
    clearPlayQueue 
  } = usePlayer();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <ListMusic className="w-5 h-5 mr-2" />
            播放队列
          </h2>
          <div className="flex items-center space-x-2">
            {playQueue.length > 0 && (
              <button
                onClick={clearPlayQueue}
                className="text-sm text-red-600 hover:text-red-700 px-2 py-1 rounded"
              >
                清空队列
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 队列信息 */}
        <div className="px-4 py-2 bg-gray-50 border-b">
          <p className="text-sm text-gray-600">
            队列中共有 {playQueue.length} 首歌曲
          </p>
          <p className="text-xs text-gray-500 mt-1">
            <Clock className="w-3 h-3 inline mr-1" />
            播放历史
            <PlusCircle className="w-3 h-3 inline ml-3 mr-1" />
            手动添加
          </p>
        </div>

        {/* 队列列表 */}
        <div className="flex-1 overflow-y-auto">
          {queueLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-500">加载中...</p>
            </div>
          ) : playQueue.length === 0 ? (
            <div className="text-center py-12">
              <ListMusic className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">播放队列为空</p>
              <p className="text-gray-400 text-sm">从首页添加歌曲到播放队列</p>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {playQueue.map((song, index) => (
                <div
                  key={`${song._id}-${index}`}
                  className={`flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors ${
                    currentSong?._id === song._id && queueIndex === index
                      ? 'bg-primary-50 border border-primary-200'
                      : ''
                  }`}
                >
                  {/* 类型图标 */}
                  <div className="w-6 text-center">
                    {song.addedType === 'played' ? (
                      <Clock className="w-3 h-3 text-blue-500" title="播放历史" />
                    ) : (
                      <PlusCircle className="w-3 h-3 text-green-500" title="手动添加" />
                    )}
                  </div>

                  {/* 封面 */}
                  <div className="w-10 h-10 bg-gray-300 rounded-md overflow-hidden flex-shrink-0 ml-2">
                    {song.coverUrl ? (
                      <img
                        src={song.coverUrl}
                        alt={song.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">
                          {song.title[0]}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 歌曲信息 */}
                  <div className="flex-1 min-w-0 ml-3">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {song.title}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">
                      {song.artist}
                    </p>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex items-center space-x-1 ml-2">
                    <button
                      onClick={() => playFromQueue(song)}
                      className="p-1.5 text-gray-400 hover:text-primary-600 transition-colors"
                      title="播放"
                    >
                      <Play className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => removeFromPlayQueue(song.queueId)}
                      className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                      title="移除"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayQueue; 