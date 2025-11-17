import React, { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Navigate } from 'react-router-dom'
import { getAllUsers, toggleUserActive, changeUserRole, deleteUser, getAdminStatistics } from '../api'

export default function AdminUsers(){
  const { user, isAdmin } = useAuth()
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [stats, setStats] = useState(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  // Check auth after user is loaded
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')
      
      if (!token) {
        setCheckingAuth(false)
        return
      }
      
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser)
          console.log('[AdminUsers] User role:', parsedUser?.role)
          setCheckingAuth(false)
        } catch (e) {
          console.error('[AdminUsers] Error parsing user:', e)
          setCheckingAuth(false)
        }
      } else {
        setCheckingAuth(false)
      }
    }
    
    checkAuth()
  }, [])

  // Show loading while checking auth
  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center gap-3 py-12">
        <span className="text-4xl animate-spin">⏳</span>
        <span className="text-lg text-gray-600">Đang kiểm tra quyền...</span>
      </div>
    )
  }

  // Redirect if not admin (after checking)
  if (!checkingAuth && !isAdmin()) {
    console.log('[AdminUsers] Not admin, redirecting to dashboard')
    return <Navigate to="/dashboard" replace />
  }

  useEffect(()=>{
    fetchUsers()
    fetchStats()
  },[])

  useEffect(() => {
    if (users.length > 0 || searchTerm || roleFilter !== 'all' || statusFilter !== 'all') {
      filterUsers()
    } else {
      setFilteredUsers([])
    }
  }, [users, searchTerm, roleFilter, statusFilter])

  async function fetchUsers(){
    setLoading(true)
    setError('')
    setSuccess('')
    try{
      const res = await getAllUsers()
      console.log('[AdminUsers] fetchUsers response:', res)
      setUsers(res.users || [])
      // Initialize filteredUsers with all users
      setFilteredUsers(res.users || [])
    }catch(err){
      console.error('[AdminUsers] fetchUsers error:', err)
      const errorMsg = err?.data?.error || err?.message || 'Không thể tải danh sách users'
      setError(errorMsg)
      setUsers([])
      setFilteredUsers([])
    }finally{
      setLoading(false)
    }
  }

  async function fetchStats(){
    try{
      const res = await getAdminStatistics()
      setStats(res.users || null)
    }catch(err){
      // Ignore stats error
    }
  }

  function filterUsers(){
    let filtered = [...users]

    // Search filter
    if(searchTerm){
      filtered = filtered.filter(u => 
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Role filter
    if(roleFilter !== 'all'){
      filtered = filtered.filter(u => u.role === roleFilter)
    }

    // Status filter
    if(statusFilter !== 'all'){
      filtered = filtered.filter(u => 
        statusFilter === 'active' ? u.is_active : !u.is_active
      )
    }

    setFilteredUsers(filtered)
  }

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

  // Debug log
  console.log('[AdminUsers] Render - checkingAuth:', checkingAuth, 'isAdmin:', isAdmin(), 'user:', user)

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-4xl">👥</span>
          <div>
            <h4 className="text-2xl font-bold text-gray-800">Quản lý Người dùng</h4>
            <p className="text-sm text-gray-500">Quản lý tất cả người dùng trong hệ thống</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="card-body">
              <div className="text-sm opacity-90">Tổng số Users</div>
              <div className="text-3xl font-bold mt-1">{stats.total || 0}</div>
            </div>
          </div>
          <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="card-body">
              <div className="text-sm opacity-90">Đang hoạt động</div>
              <div className="text-3xl font-bold mt-1">{stats.active || 0}</div>
            </div>
          </div>
          <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <div className="card-body">
              <div className="text-sm opacity-90">Admin</div>
              <div className="text-3xl font-bold mt-1">{stats.admins || 0}</div>
            </div>
          </div>
          <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="card-body">
              <div className="text-sm opacity-90">Giảng viên</div>
              <div className="text-3xl font-bold mt-1">{stats.teachers || 0}</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
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

            {/* Role Filter */}
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

            {/* Status Filter */}
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

          {/* Results count */}
          <div className="mt-4 text-sm text-gray-600">
            Hiển thị <span className="font-bold text-blue-600">{filteredUsers.length}</span> / {users.length} users
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && <div className="mb-3 rounded-md bg-red-50 text-red-700 px-3 py-2 text-sm flex items-center gap-2"><span>⚠️</span>{error}</div>}
      {success && <div className="mb-3 rounded-md bg-green-50 text-green-700 px-3 py-2 text-sm flex items-center gap-2"><span>✅</span>{success}</div>}

      {loading ? (
        <div className="flex items-center justify-center gap-3 py-12">
          <span className="text-4xl animate-spin">⏳</span>
          <span className="text-lg text-gray-600">Đang tải danh sách users...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredUsers.length === 0 && !error ? (
            <div className="card">
              <div className="card-body text-center py-12">
                <span className="text-6xl mb-4 inline-block">📭</span>
                <p className="text-gray-500 text-lg mb-2">
                  {users.length === 0 ? 'Không có users trong hệ thống' : 'Không tìm thấy users phù hợp với bộ lọc'}
                </p>
                {users.length === 0 && (
                  <p className="text-sm text-gray-400">Hãy đăng ký user mới để bắt đầu</p>
                )}
              </div>
            </div>
          ) : filteredUsers.length > 0 ? (
            filteredUsers.map(u => (
              <div key={u.id} className="card group hover:shadow-2xl transition-all duration-300">
                <div className="card-body">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    {/* User Info */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold group-hover:scale-110 transition-transform
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

                    {/* Actions */}
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
                        className={`rounded-lg px-4 py-2 text-sm font-medium hover:shadow-lg transform hover:-translate-y-1 transition-all whitespace-nowrap
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
                          className="rounded-lg bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 text-sm font-medium hover:shadow-lg transform hover:-translate-y-1 transition-all hover:from-red-700 hover:to-red-800 whitespace-nowrap"
                          title="Xóa người dùng"
                        >
                          🗑️ Xóa
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : null}
        </div>
      )}
    </div>
  )
}

