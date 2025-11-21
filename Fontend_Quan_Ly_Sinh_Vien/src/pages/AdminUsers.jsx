import React, { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Navigate } from 'react-router-dom'
import { getAllUsers, toggleUserActive, changeUserRole, deleteUser, getAdminStatistics } from '../api'

export default function AdminUsers(){
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [stats, setStats] = useState(null)
  const [systemMetrics, setSystemMetrics] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [checking, setChecking] = useState(true)

  // Check admin status
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser)
        const userIsAdmin = parsedUser?.role === 'admin'
        console.log('[AdminUsers] User check:', { parsedUser, userIsAdmin })
        setIsAdmin(userIsAdmin)
      } else {
        console.log('[AdminUsers] No user in localStorage')
        setIsAdmin(false)
      }
    } catch (e) {
      console.error('[AdminUsers] Error checking admin:', e)
      setIsAdmin(false)
    } finally {
      setChecking(false)
    }
  }, [])

  // Define fetch functions first
  const fetchUsers = React.useCallback(async () => {
    setLoading(true)
    setError('')
    try{
      console.log('[AdminUsers] Calling getAllUsers...')
      const res = await getAllUsers()
      console.log('[AdminUsers] Response:', res)
      
      let usersList = []
      if (Array.isArray(res)) {
        usersList = res
      } else if (res && Array.isArray(res.users)) {
        usersList = res.users
      } else if (res && res.data && Array.isArray(res.data)) {
        usersList = res.data
      }
      
      console.log('[AdminUsers] Parsed users:', usersList.length)
      setUsers(usersList)
      setFilteredUsers(usersList)
    }catch(err){
      console.error('[AdminUsers] Error:', err)
      const errorMsg = err?.data?.error || err?.data?.message || err?.message || 'Không thể tải danh sách users'
      setError(`Lỗi: ${errorMsg}${err?.status ? ` (Status: ${err.status})` : ''}`)
      setUsers([])
      setFilteredUsers([])
    }finally{
      setLoading(false)
    }
  }, [])

  const fetchStats = React.useCallback(async () => {
    try{
      const res = await getAdminStatistics()
      console.log('[AdminUsers] Stats response:', res)
      const statsData = res.users || null
      console.log('[AdminUsers] Parsed stats:', statsData)
      if (statsData) {
        console.log('[AdminUsers] Active users:', statsData.active, 'Total users:', statsData.total)
      }
      setStats(statsData)
      
      // Set system metrics if available
      if (res.metrics && res.metrics.system) {
        setSystemMetrics(res.metrics.system)
      }
    }catch(err){
      console.error('[AdminUsers] Stats error:', err)
    }
  }, [])

  // Fetch users and stats
  useEffect(() => {
    if (!checking && isAdmin) {
      console.log('[AdminUsers] Fetching data...')
      fetchUsers()
      fetchStats()
    }
  }, [checking, isAdmin, fetchUsers, fetchStats])

  // Filter users
  useEffect(() => {
    let filtered = [...users]

    if(searchTerm){
      filtered = filtered.filter(u => 
        u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if(roleFilter !== 'all'){
      filtered = filtered.filter(u => u.role === roleFilter)
    }

    if(statusFilter !== 'all'){
      filtered = filtered.filter(u => 
        statusFilter === 'active' ? u.is_active : !u.is_active
      )
    }

    setFilteredUsers(filtered)
  }, [users, searchTerm, roleFilter, statusFilter])


  async function handleToggleActive(userId){
    setError('')
    setSuccess('')
    try{
      await toggleUserActive(userId)
      setSuccess('Cập nhật trạng thái thành công')
      fetchUsers()
    }catch(err){
      setError(err?.data?.error || 'Không thể cập nhật trạng thái')
    }
  }

  async function handleChangeRole(userId, newRole){
    setError('')
    setSuccess('')
    try{
      await changeUserRole(userId, newRole)
      setSuccess('Đổi role thành công')
      fetchUsers()
    }catch(err){
      setError(err?.data?.error || 'Không thể đổi role')
    }
  }

  async function handleDeleteUser(userId){
    if(!confirm('Xóa user này? Hành động không thể hoàn tác!')) return
    setError('')
    setSuccess('')
    try{
      await deleteUser(userId)
      setSuccess('Xóa user thành công')
      fetchUsers()
    }catch(err){
      setError(err?.data?.error || 'Không thể xóa user')
    }
  }

  // Show loading while checking
  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <span className="text-4xl animate-spin block mb-4">⏳</span>
          <span className="text-lg text-gray-600">Đang kiểm tra quyền...</span>
        </div>
      </div>
    )
  }

  // Redirect if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <span className="text-4xl mb-4 block">🚫</span>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Không có quyền truy cập</h2>
          <p className="text-gray-600 mb-4">Bạn cần quyền Admin để truy cập trang này</p>
          <Navigate to="/dashboard" replace />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="bg-white shadow-sm mb-6 p-4 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">👥</span>
            <div>
              <h4 className="text-2xl font-bold text-gray-800">Quản lý Người dùng</h4>
              <p className="text-sm text-gray-500">Quản lý tất cả người dùng trong hệ thống</p>
            </div>
          </div>
          {user && (
            <div className="text-sm text-gray-500 bg-gray-100 px-3 py-2 rounded">
              Đang đăng nhập: <span className="font-medium text-blue-600">{user.username}</span> 
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                {user.role || 'N/A'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 text-red-700 px-4 py-3">
          <div className="flex items-start gap-2">
            <span className="text-xl">⚠️</span>
            <div className="flex-1">
              <div className="font-medium mb-1">Lỗi tải dữ liệu</div>
              <div className="mb-2">{error}</div>
              <button 
                onClick={() => {
                  setError('')
                  fetchUsers()
                  fetchStats()
                }}
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                🔄 Thử lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-3 rounded-md bg-green-50 text-green-700 px-3 py-2 text-sm flex items-center gap-2">
          <span>✅</span>
          <span>{success}</span>
        </div>
      )}

      {/* Statistics Cards */}
      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4 shadow">
              <div className="text-sm opacity-90">Tổng số Users</div>
              <div className="text-3xl font-bold mt-1">{stats.total || 0}</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-4 shadow">
              <div className="text-sm opacity-90">Đang hoạt động</div>
              <div className="text-3xl font-bold mt-1">{stats.active || 0}</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg p-4 shadow">
              <div className="text-sm opacity-90">Admin</div>
              <div className="text-3xl font-bold mt-1">{stats.admins || 0}</div>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg p-4 shadow">
              <div className="text-sm opacity-90">Giảng viên</div>
              <div className="text-3xl font-bold mt-1">{stats.teachers || 0}</div>
            </div>
          </div>

          {/* System Metrics */}
          {systemMetrics && !systemMetrics.error && (
            <div className="bg-white rounded-lg shadow-sm mb-6 p-4">
              <h5 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <span>📊</span> Tổng quan hệ thống
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* CPU */}
                {systemMetrics.cpu && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">CPU Usage</span>
                      <span className="text-sm font-bold text-gray-800">{systemMetrics.cpu.percent}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                      <div 
                        className={`h-2.5 rounded-full ${
                          systemMetrics.cpu.percent > 80 ? 'bg-red-500' : 
                          systemMetrics.cpu.percent > 60 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${systemMetrics.cpu.percent}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500">Cores: {systemMetrics.cpu.cores}</div>
                  </div>
                )}

                {/* Memory */}
                {systemMetrics.memory && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Memory</span>
                      <span className="text-sm font-bold text-gray-800">{systemMetrics.memory.percent}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                      <div 
                        className={`h-2.5 rounded-full ${
                          systemMetrics.memory.percent > 80 ? 'bg-red-500' : 
                          systemMetrics.memory.percent > 60 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${systemMetrics.memory.percent}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {systemMetrics.memory.used_gb.toFixed(1)} GB / {systemMetrics.memory.total_gb.toFixed(1)} GB
                    </div>
                  </div>
                )}

                {/* Disk */}
                {systemMetrics.disk && (
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Disk Usage</span>
                      <span className="text-sm font-bold text-gray-800">{systemMetrics.disk.percent}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                      <div 
                        className={`h-2.5 rounded-full ${
                          systemMetrics.disk.percent > 80 ? 'bg-red-500' : 
                          systemMetrics.disk.percent > 60 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${systemMetrics.disk.percent}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {systemMetrics.disk.used_gb.toFixed(1)} GB / {systemMetrics.disk.total_gb.toFixed(1)} GB
                    </div>
                  </div>
                )}
              </div>
              {systemMetrics.process && (
                <div className="mt-4 text-xs text-gray-500">
                  Process Memory: {systemMetrics.process.memory_mb.toFixed(1)} MB
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🔍 Tìm kiếm
            </label>
            <input
              type="text"
              placeholder="Tìm theo username hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border-2 border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              👤 Lọc theo Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full rounded-lg border-2 border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="admin">Admin</option>
              <option value="teacher">Teacher</option>
              <option value="student">Student</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📊 Lọc theo Trạng thái
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border-2 border-gray-200 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tất cả</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Đã khóa</option>
            </select>
          </div>
        </div>
        <div className="mt-4 text-sm text-gray-600">
          Hiển thị <span className="font-bold text-blue-600">{filteredUsers.length}</span> / {users.length} users
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center justify-center gap-3">
            <span className="text-4xl animate-spin">⏳</span>
            <div>
              <div className="text-lg font-medium text-gray-700">Đang tải danh sách users...</div>
              <div className="text-sm text-gray-500 mt-1">Vui lòng đợi trong giây lát</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredUsers.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12">
              <div className="text-center">
                <span className="text-6xl mb-4 inline-block">📭</span>
                <p className="text-gray-500 text-lg mb-2">
                  {users.length === 0 ? 'Không có users trong hệ thống' : 'Không tìm thấy users phù hợp với bộ lọc'}
                </p>
                {users.length === 0 && (
                  <p className="text-sm text-gray-400">Hãy đăng ký user mới để bắt đầu</p>
                )}
              </div>
            </div>
          ) : (
            filteredUsers.map(u => (
              <div key={u.id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold
                      ${u.role === 'admin' ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : 
                        u.role === 'teacher' ? 'bg-gradient-to-br from-blue-400 to-blue-600' : 
                        'bg-gradient-to-br from-green-400 to-green-600'}`}>
                      {u.role === 'admin' ? '👑' : u.role === 'teacher' ? '👨‍🏫' : '👨‍🎓'}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-lg text-gray-800 flex items-center gap-2 flex-wrap">
                        {u.username}
                        {u.id === user?.id && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                            (Bạn)
                          </span>
                        )}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium
                          ${u.role === 'admin' ? 'bg-yellow-100 text-yellow-700' : 
                            u.role === 'teacher' ? 'bg-blue-100 text-blue-700' : 
                            'bg-green-100 text-green-700'}`}>
                          {u.role === 'admin' ? 'Admin' : u.role === 'teacher' ? 'Teacher' : 'Student'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium
                          ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {u.is_active ? '✅ Active' : '🚫 Inactive'}
                        </span>
                      </div>
                      <div className="text-gray-600 text-sm mt-1">📧 {u.email}</div>
                      {u.created_at && (
                        <div className="text-xs text-gray-500 mt-1">
                          Tạo lúc: {new Date(u.created_at).toLocaleString('vi-VN')}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <select 
                      value={u.role} 
                      onChange={(e)=>handleChangeRole(u.id, e.target.value)}
                      className="rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      disabled={u.id === user?.id}
                      title={u.id === user?.id ? 'Không thể thay đổi role của chính mình' : 'Thay đổi role'}
                    >
                      <option value="admin">Admin</option>
                      <option value="teacher">Teacher</option>
                      <option value="student">Student</option>
                    </select>
                    <button 
                      onClick={()=>handleToggleActive(u.id)} 
                      className={`rounded-lg px-4 py-2 text-sm font-medium hover:shadow-lg transition-all whitespace-nowrap
                        ${u.is_active 
                          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700' 
                          : 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700'}`}
                      disabled={u.id === user?.id}
                      title={u.id === user?.id ? 'Không thể khóa tài khoản của chính mình' : u.is_active ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                    >
                      {u.is_active ? '🚫 Khóa' : '✅ Mở khóa'}
                    </button>
                    {u.id !== user?.id && (
                      <button 
                        onClick={()=>handleDeleteUser(u.id)} 
                        className="rounded-lg bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 text-sm font-medium hover:shadow-lg transition-all hover:from-red-700 hover:to-red-800 whitespace-nowrap"
                        title="Xóa người dùng"
                      >
                        🗑️ Xóa
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
