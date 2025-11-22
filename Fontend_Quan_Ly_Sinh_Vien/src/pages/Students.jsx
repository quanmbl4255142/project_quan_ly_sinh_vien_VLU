import React, { useEffect, useState } from 'react'
import { getStudents, createStudent, updateStudent, deleteStudent } from '../api'
import { useAuth } from '../hooks/useAuth'

export default function Students(){
  const { user, isAdmin, isTeacherOrAdmin } = useAuth()
  const [students, setStudents] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingStudent, setEditingStudent] = useState(null)
  const [formData, setFormData] = useState({
    user_id: '',
    username: '',
    email: '',
    password: '',
    student_code: '',
    full_name: '',
    date_of_birth: '',
    phone: '',
    address: '',
    major: '',
    class_name: '',
    year_of_study: '',
    gpa: '',
    status: 'active'
  })

  useEffect(()=>{
    fetchStudents()
  },[])

  async function fetchStudents(){
    setLoading(true)
    setError('')
    try{
      const res = await getStudents()
      setStudents(res.students || res || [])
    }catch(err){
      setError(err?.data?.error || 'Lấy sinh viên thất bại')
    }finally{
      setLoading(false)
    }
  }

  function openForm(student = null){
    if(student){
      setEditingStudent(student)
      setFormData({
        user_id: student.user_id || '',
        username: '',
        email: '',
        password: '',
        student_code: student.student_code || '',
        full_name: student.full_name || '',
        date_of_birth: student.date_of_birth || '',
        phone: student.phone || '',
        address: student.address || '',
        major: student.major || '',
        class_name: student.class_name || '',
        year_of_study: student.year_of_study || '',
        gpa: student.gpa || '',
        status: student.status || 'active'
      })
    }else{
      setEditingStudent(null)
      setFormData({
        user_id: '',
        username: '',
        email: '',
        password: '',
        student_code: '',
        full_name: '',
        date_of_birth: '',
        phone: '',
        address: '',
        major: '',
        class_name: '',
        year_of_study: '',
        gpa: '',
        status: 'active'
      })
    }
    setShowForm(true)
  }

  function closeForm(){
    setShowForm(false)
    setEditingStudent(null)
  }

  async function handleSubmit(e){
    e.preventDefault()
    setError('')
    try{
      if(editingStudent){
        // When editing, only send student fields (not user creation fields)
        const { username, email, password, ...studentData } = formData
        await updateStudent(editingStudent.id, studentData)
      }else{
        // When creating, send all data (including username, email, password for user creation)
        await createStudent(formData)
      }
      closeForm()
      fetchStudents()
    }catch(err){
      setError(err?.data?.error || 'Lưu sinh viên thất bại')
    }
  }

  async function handleDelete(id){
    if(!confirm('Xóa sinh viên này?')) return
    setError('')
    try{
      await deleteStudent(id)
      fetchStudents()
    }catch(err){
      setError(err?.data?.error || 'Xóa thất bại')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-4xl">👨‍🎓</span>
          <h4 className="text-2xl font-bold text-gray-800">Danh sách sinh viên</h4>
        </div>
        {isTeacherOrAdmin() && (
          <button onClick={()=>openForm()} className="rounded-lg bg-blue-600 text-white px-5 py-2.5 text-sm font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2">
            <span className="text-lg">➕</span> Thêm sinh viên
          </button>
        )}
      </div>

      {error && <div className="mb-3 rounded-md bg-red-50 text-red-700 px-3 py-2 text-sm">{error}</div>}

      {loading ? (
        <div className="flex items-center justify-center gap-3 py-12">
          <span className="text-4xl animate-spin">⏳</span>
          <span className="text-lg text-gray-600">Đang tải...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {students.length === 0 && (
            <div className="card">
              <div className="card-body text-center py-12">
                <span className="text-6xl mb-4 inline-block">📭</span>
                <p className="text-gray-500">Không có sinh viên</p>
              </div>
            </div>
          )}
          {students.map(s => (
            <div key={s.id} className="card group hover:shadow-2xl transition-all duration-300">
              <div className="card-body flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-500 flex items-center justify-center text-white text-2xl font-bold group-hover:scale-110 transition-transform">
                    {(s.full_name || s.username || 'S').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-lg text-gray-800">{s.full_name || s.student_code || s.username}</div>
                    <div className="text-gray-600 text-sm flex items-center gap-2">
                      <span>📚 {s.major || '—'}</span>
                      <span>•</span>
                      <span>🎓 {s.class_name || '—'}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-3">
                      <span>🆔 {s.student_code}</span>
                      <span>📊 GPA: {s.gpa || '—'}</span>
                    </div>
                  </div>
                </div>
                {isTeacherOrAdmin() && (
                  <div className="flex items-center gap-2">
                    <button onClick={()=>openForm(s)} className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-1">
                      <span>✏️</span> Sửa
                    </button>
                    {isAdmin() && (
                      <button onClick={()=>handleDelete(s.id)} className="rounded-lg bg-red-600 text-white px-4 py-2 text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-1">
                        <span>🗑️</span> Xóa
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 modal-backdrop flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="modal-content max-w-2xl w-full max-h-[90vh] overflow-auto transform animate-slideUp">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">✏️</span>
                <h5 className="text-xl font-bold text-gray-800">{editingStudent ? 'Sửa sinh viên' : 'Thêm sinh viên'}</h5>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!editingStudent && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h6 className="text-sm font-semibold text-blue-800 mb-3">📝 Thông tin tài khoản (để tạo tài khoản mới)</h6>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Tên đăng nhập <span className="text-red-500">*</span></label>
                        <input type="text" className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.username} onChange={e=>setFormData({...formData, username: e.target.value})} required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Email <span className="text-red-500">*</span></label>
                        <input type="email" className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Mật khẩu <span className="text-red-500">*</span></label>
                        <input type="password" className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} required minLength={6} />
                        <p className="text-xs text-gray-500 mt-1">Tối thiểu 6 ký tự</p>
                      </div>
                    </div>
                  </div>
                )}
                {editingStudent && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-gray-600">💡 Khi sửa, chỉ có thể thay đổi thông tin sinh viên, không thể thay đổi thông tin tài khoản.</p>
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Mã sinh viên <span className="text-red-500">*</span></label>
                    <input className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.student_code} onChange={e=>setFormData({...formData, student_code: e.target.value})} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Họ tên</label>
                    <input className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.full_name} onChange={e=>setFormData({...formData, full_name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Ngày sinh</label>
                    <input type="date" className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.date_of_birth} onChange={e=>setFormData({...formData, date_of_birth: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                    <input className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.phone} onChange={e=>setFormData({...formData, phone: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Địa chỉ</label>
                    <input className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.address} onChange={e=>setFormData({...formData, address: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Ngành</label>
                    <input className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.major} onChange={e=>setFormData({...formData, major: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Lớp</label>
                    <input className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.class_name} onChange={e=>setFormData({...formData, class_name: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Năm học</label>
                    <input type="number" className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.year_of_study} onChange={e=>setFormData({...formData, year_of_study: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">GPA</label>
                    <input type="number" step="0.01" className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.gpa} onChange={e=>setFormData({...formData, gpa: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Trạng thái</label>
                    <select className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.status} onChange={e=>setFormData({...formData, status: e.target.value})}>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="graduated">Graduated</option>
                      <option value="suspended">Suspended</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={closeForm} className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">Hủy</button>
                  <button type="submit" className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700">Lưu</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
