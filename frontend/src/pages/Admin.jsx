import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { adminAPI } from '../services/api';
import { 
  Users, 
  Music, 
  BarChart3, 
  Settings, 
  Shield, 
  Trash2, 
  Eye,
  Search,
  Plus,
  Upload,
  UserCheck,
  UserX,
  Calendar,
  TrendingUp
} from 'lucide-react';

const Admin = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('stats');
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && user.isAdmin) {
      fetchStats();
      if (activeTab === 'users') {
        fetchUsers();
      }
    }
  }, [user, activeTab, currentPage, searchQuery]);

  const fetchStats = async () => {
    try {
      const response = await adminAPI.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('获取统计信息失败:', error);
      setError('获取统计信息失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getUsers({
        page: currentPage,
        search: searchQuery
      });
      setUsers(response.data.users);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('获取用户列表失败:', error);
      setError('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('确定要删除这个用户吗？这将同时删除该用户的所有歌曲。')) {
      return;
    }

    try {
      await adminAPI.deleteUser(userId);
      alert('用户删除成功');
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error('删除用户失败:', error);
      alert(error.response?.data?.message || '删除用户失败');
    }
  };

  const handleToggleAdmin = async (userId) => {
    try {
      const response = await adminAPI.toggleAdmin(userId);
      alert(response.data.message);
      fetchUsers();
      fetchStats();
    } catch (error) {
      console.error('切换管理员状态失败:', error);
      alert(error.response?.data?.message || '操作失败');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!user || !user.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">访问被拒绝</h1>
          <p className="text-gray-600">您没有管理员权限访问此页面</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">管理员面板</h1>
        <p className="text-xl text-gray-600">系统管理和数据统计</p>
      </div>

      {/* 标签栏 */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'stats'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <BarChart3 className="w-5 h-5 inline mr-2" />
              系统统计
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Users className="w-5 h-5 inline mr-2" />
              用户管理
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upload'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Upload className="w-5 h-5 inline mr-2" />
              上传音乐
            </button>
          </nav>
        </div>
      </div>

      {/* 内容区域 */}
      {activeTab === 'stats' && (
        <div className="space-y-6">
          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">总用户数</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.stats?.totalUsers || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Music className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">总歌曲数</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.stats?.totalSongs || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">管理员数</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.stats?.totalAdmins || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Eye className="w-6 h-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-500">公共歌曲</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.stats?.publicSongs || 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 最近活动 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">最近注册用户</h3>
              <div className="space-y-3">
                {stats.recentUsers?.map((user) => (
                  <div key={user._id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{user.username}</p>
                        <p className="text-xs text-gray-500">{formatDate(user.createdAt)}</p>
                      </div>
                    </div>
                    {user.isAdmin && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                        管理员
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">最近上传音乐</h3>
              <div className="space-y-3">
                {stats.recentSongs?.map((song) => (
                  <div key={song._id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                        <Music className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{song.title}</p>
                        <p className="text-xs text-gray-500">{song.artist} • {song.uploadedBy?.username}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${
                      song.scope === 'public' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {song.scope === 'public' ? '公共' : '私有'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-6">
          {/* 搜索栏 */}
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="搜索用户..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* 用户列表 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">用户列表</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      用户名
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      类型
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      注册时间
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-gray-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${
                          user.isAdmin
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.isAdmin ? '管理员' : '普通用户'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleAdmin(user._id)}
                            className={`p-1 rounded hover:bg-gray-100 ${
                              user.isAdmin ? 'text-orange-600' : 'text-green-600'
                            }`}
                            title={user.isAdmin ? '移除管理员' : '设为管理员'}
                          >
                            {user.isAdmin ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user._id)}
                            className="p-1 rounded hover:bg-gray-100 text-red-600"
                            title="删除用户"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    上一页
                  </button>
                  <span className="text-sm text-gray-700">
                    第 {currentPage} 页，共 {totalPages} 页
                  </span>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                  >
                    下一页
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'upload' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">管理员上传</h3>
            <p className="text-gray-600 mb-4">
              作为管理员，您上传的音乐将自动设置为公共可见，所有用户都能看到和播放。
            </p>
            <button
              onClick={() => window.location.href = '/upload'}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              <Upload className="w-4 h-4 mr-2" />
              前往上传页面
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default Admin; 