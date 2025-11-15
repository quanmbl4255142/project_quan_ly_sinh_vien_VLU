import React, { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Navigate } from 'react-router-dom'
import { getAllUsers, toggleUserActive, changeUserRole, deleteUser } from '../api'

export default function AdminUsers(){
  const { user, isAdmin } = useAuth()
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(true)

  // Redirect if not admin
  if (!isAdmin()) {
    return <Navigate to="/dashboard" replace />
  }

  useEffect(()=>{
    fetchUsers()
  },[])

  async function fetchUsers(){
    setLoading(true)
    setError('')
    setSuccess('')
    try{
      const res = await getAllUsers()
      setUsers(res.users || [])
    }catch(err){
      setError(err?.data?.error || 'Không thể tải danh sách users')
    }finally{
      setLoading(false)
    }
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-4xl">👥</span>
          <h4 className="text-2xl font-bold text-gray-800">Quản lý Users (Admin)</h4>
        </div>
      </div>

      {error && <div className="mb-3 rounded-md bg-red-50 text-red-700 px-3 py-2 text-sm flex items-center gap-2"><span>⚠️</span>{error}</div>}
      {success && <div className="mb-3 rounded-md bg-green-50 text-green-700 px-3 py-2 text-sm flex items-center gap-2"><span>✅</span>{success}</div>}

      {loading ? (
        <div className="flex items-center justify-center gap-3 py-12">
          <span className="text-4xl animate-spin">⏳</span>
          <span className="text-lg text-gray-600">Đang tải...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {users.length === 0 && (
            <div className="card">
              <div className="card-body text-center py-12">
                <span className="text-6xl mb-4 inline-block">📭</span>
                <p className="text-gray-500">Không có users</p>
              </div>
            </div>
          )}
          {users.map(u => (
            <div key={u.id} className="card group hover:shadow-2xl transition-all duration-300">
              <div className="card-body flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold group-hover:scale-110 transition-transform
                    ${u.role === 'admin' ? 'bg-gradient-to-br from-blue-400 to-blue-600' : 
                      u.role === 'teacher' ? 'bg-gradient-to-br from-blue-400 to-blue-600' : 
                      'bg-gradient-to-br from-blue-400 to-blue-500'}`}>
                    {u.role === 'admin' ? '👑' : u.role === 'teacher' ? '👨‍🏫' : '👨‍🎓'}
                  </div>
                  <div>
                    <div className="font-bold text-lg text-gray-800 flex items-center gap-2">
                      {u.username}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium
                        ${u.role === 'admin' ? 'bg-blue-100 text-blue-700' : 
                          u.role === 'teacher' ? 'bg-blue-100 text-blue-700' : 
                          'bg-blue-100 text-blue-700'}`}>
                        {u.role}
                      </span>
                    </div>
                    <div className="text-gray-600 text-sm">📧 {u.email}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Trạng thái: <span className={`font-medium ${u.is_active ? 'text-blue-600' : 'text-gray-600'}`}>
                        {u.is_active ? '✅ Active' : '🚫 Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select 
                    value={u.role} 
                    onChange={(e)=>handleChangeRole(u.id, e.target.value)}
                    className="rounded-lg border-2 border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={u.id === user?.id}
                  >
                    <option value="admin">Admin</option>
                    <option value="teacher">Teacher</option>
                    <option value="student">Student</option>
                  </select>
                  <button 
                    onClick={()=>handleToggleActive(u.id)} 
                    className={`rounded-lg px-4 py-2 text-sm font-medium hover:shadow-lg transform hover:-translate-y-1 transition-all
                      ${u.is_active ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'}`}
                    disabled={u.id === user?.id}
                  >
                    {u.is_active ? '🚫 Khóa' : '✅ Mở khóa'}
                  </button>
                  {u.id !== user?.id && (
                    <button 
                      onClick={()=>handleDeleteUser(u.id)} 
                      className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 text-sm font-medium hover:shadow-lg transform hover:-translate-y-1 transition-all">
                      🗑️ Xóa
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

