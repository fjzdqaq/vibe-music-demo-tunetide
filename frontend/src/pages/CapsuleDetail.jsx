import React from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Play, Heart } from 'lucide-react';

const CapsuleDetail = () => {
  const { id } = useParams();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <button className="btn btn-ghost flex items-center space-x-2 mb-4">
          <ArrowLeft className="w-5 h-5" />
          <span>返回胶囊列表</span>
        </button>
        
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            情绪胶囊已解锁
          </h1>
          <p className="text-gray-600">
            创建于 2024年1月15日
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* 歌曲信息 */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">关联歌曲</h2>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gray-300 rounded-lg overflow-hidden">
              <div className="w-full h-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center">
                <span className="text-white font-bold">歌</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">歌曲名称</h3>
              <p className="text-gray-500">艺术家</p>
            </div>
            <button className="btn btn-primary">
              <Play className="w-4 h-4 mr-2" />
              播放
            </button>
          </div>
        </div>

        {/* 情绪文字 */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Heart className="w-5 h-5 mr-2 text-red-500" />
            当时的心情
          </h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-gray-700 leading-relaxed">
              这里是您当时写下的情绪文字...
            </p>
          </div>
        </div>

        {/* 时间信息 */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">时间记录</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">创建时间</span>
              <span className="text-gray-900">2024年1月15日 20:30</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">设定解锁时间</span>
              <span className="text-gray-900">2024年8月15日 20:30</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">实际解锁时间</span>
              <span className="text-gray-900">2024年8月15日 20:35</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CapsuleDetail; 