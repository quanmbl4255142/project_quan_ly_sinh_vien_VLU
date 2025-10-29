import React, { useEffect, useState } from 'react'
import { getProfile, updateProfile, changePassword } from '../api'

export default function Profile(){
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [formData, setFormData] = useState({ username: '', email: '' })
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })

  useEffect(()=>{
    fetchProfile()
  },[])

  async function fetchProfile(){
    setError('')
    try{
      const res = await getProfile()
      const user = res.user || res
      setProfile(user)
      setFormData({ username: user.username || '', email: user.email || '' })
    }catch(err){
      setError(err?.data?.error || 'Lấy profile thất bại')
    }
  }

  async function handleUpdateProfile(e){
    e.preventDefault()
    setError('')
    setSuccess('')
    try{
      await updateProfile(formData)
      setSuccess('Cập nhật thành công')
      setEditMode(false)
      fetchProfile()
    }catch(err){
      setError(err?.data?.error || 'Cập nhật thất bại')
    }
  }

  async function handleChangePassword(e){
    e.preventDefault()
    setError('')
    setSuccess('')
    if(passwordData.newPassword !== passwordData.confirmPassword){
      setError('Mật khẩu mới không khớp')
      return
    }
    try{
      await changePassword(passwordData.currentPassword, passwordData.newPassword)
      setSuccess('Đổi mật khẩu thành công')
      setShowPasswordForm(false)
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    }catch(err){
      setError(err?.data?.error || 'Đổi mật khẩu thất bại')
    }
  }

  if(!profile){
    return <div className="text-gray-500">Đang tải...</div>
  }

  return (
    <div className="max-w-2xl">
      <h4 className="text-lg font-semibold mb-4">Profile</h4>
      
      {error && <div className="mb-3 rounded-md bg-red-50 text-red-700 px-3 py-2 text-sm">{error}</div>}
      {success && <div className="mb-3 rounded-md bg-green-50 text-green-700 px-3 py-2 text-sm">{success}</div>}

      <div className="card mb-4">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <h5 className="font-semibold">Thông tin cá nhân</h5>
            {!editMode && (
              <button onClick={()=>setEditMode(true)} className="rounded bg-blue-600 text-white px-3 py-1 text-sm hover:bg-blue-700">Chỉnh sửa</button>
            )}
          </div>

          {editMode ? (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <input className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={formData.username} onChange={e=>setFormData({...formData, username: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-medium hover:bg-indigo-700">Lưu</button>
                <button type="button" onClick={()=>setEditMode(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">Hủy</button>
              </div>
            </form>
          ) : (
            <div className="space-y-2">
              <p><span className="font-medium">Username:</span> {profile.username}</p>
              <p><span className="font-medium">Email:</span> {profile.email}</p>
              <p><span className="font-medium">Role:</span> <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">{profile.role}</span></p>
              <p><span className="font-medium">Trạng thái:</span> <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${profile.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{profile.is_active ? 'Active' : 'Inactive'}</span></p>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <div className="flex items-center justify-between mb-4">
            <h5 className="font-semibold">Bảo mật</h5>
            {!showPasswordForm && (
              <button onClick={()=>setShowPasswordForm(true)} className="rounded bg-amber-600 text-white px-3 py-1 text-sm hover:bg-amber-700">Đổi mật khẩu</button>
            )}
          </div>

          {showPasswordForm && (
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Mật khẩu hiện tại</label>
                <input type="password" className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={passwordData.currentPassword} onChange={e=>setPasswordData({...passwordData, currentPassword: e.target.value})} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mật khẩu mới</label>
                <input type="password" className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={passwordData.newPassword} onChange={e=>setPasswordData({...passwordData, newPassword: e.target.value})} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Xác nhận mật khẩu mới</label>
                <input type="password" className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={passwordData.confirmPassword} onChange={e=>setPasswordData({...passwordData, confirmPassword: e.target.value})} required />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="rounded-lg bg-amber-600 text-white px-4 py-2 text-sm font-medium hover:bg-amber-700">Đổi mật khẩu</button>
                <button type="button" onClick={()=>{setShowPasswordForm(false); setPasswordData({currentPassword:'',newPassword:'',confirmPassword:''})}} className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">Hủy</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
