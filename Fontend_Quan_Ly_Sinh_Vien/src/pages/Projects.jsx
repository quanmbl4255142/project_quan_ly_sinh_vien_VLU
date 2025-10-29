import React, { useEffect, useState } from 'react'
import { getProjects, createProject, updateProject, deleteProject, getTeachers } from '../api'
import { useAuth } from '../hooks/useAuth'

export default function Projects(){
  const { user, isAdmin, isTeacherOrAdmin } = useAuth()
  const [projects, setProjects] = useState([])
  const [teachers, setTeachers] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [formData, setFormData] = useState({
    project_code: '',
    title: '',
    description: '',
    requirements: '',
    objectives: '',
    technology_stack: '',
    difficulty_level: 'beginner',
    estimated_duration: '',
    max_team_size: '',
    min_team_size: '',
    supervisor_id: '',
    status: 'draft',
    semester: '',
    academic_year: '',
    deadline: ''
  })

  useEffect(()=>{
    fetchProjects()
    fetchTeachers()
  },[])

  async function fetchProjects(){
    setLoading(true)
    setError('')
    try{
      const res = await getProjects()
      setProjects(res.projects || res || [])
    }catch(err){
      setError(err?.data?.error || 'Lấy dự án thất bại')
    }finally{
      setLoading(false)
    }
  }

  async function fetchTeachers(){
    try{
      const res = await getTeachers()
      setTeachers(res.teachers || res || [])
    }catch(err){
      console.error('Failed to fetch teachers:', err)
    }
  }

  function openForm(project = null){
    if(project){
      setEditingProject(project)
      setFormData({
        project_code: project.project_code || '',
        title: project.title || '',
        description: project.description || '',
        requirements: project.requirements || '',
        objectives: project.objectives || '',
        technology_stack: project.technology_stack || '',
        difficulty_level: project.difficulty_level || 'beginner',
        estimated_duration: project.estimated_duration || '',
        max_team_size: project.max_team_size || '',
        min_team_size: project.min_team_size || '',
        supervisor_id: project.supervisor_id || '',
        status: project.status || 'draft',
        semester: project.semester || '',
        academic_year: project.academic_year || '',
        deadline: project.deadline || ''
      })
    }else{
      setEditingProject(null)
      setFormData({
        project_code: '',
        title: '',
        description: '',
        requirements: '',
        objectives: '',
        technology_stack: '',
        difficulty_level: 'beginner',
        estimated_duration: '',
        max_team_size: '',
        min_team_size: '',
        supervisor_id: '',
        status: 'draft',
        semester: '',
        academic_year: '',
        deadline: ''
      })
    }
    setShowForm(true)
  }

  function closeForm(){
    setShowForm(false)
    setEditingProject(null)
  }

  async function handleSubmit(e){
    e.preventDefault()
    setError('')
    try{
      if(editingProject){
        await updateProject(editingProject.id, formData)
      }else{
        await createProject(formData)
      }
      closeForm()
      fetchProjects()
    }catch(err){
      setError(err?.data?.error || 'Lưu dự án thất bại')
    }
  }

  async function handleDelete(id){
    if(!confirm('Xóa dự án này?')) return
    setError('')
    try{
      await deleteProject(id)
      fetchProjects()
    }catch(err){
      setError(err?.data?.error || 'Xóa thất bại')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-4xl">📁</span>
          <h4 className="text-2xl font-bold text-gray-800">Danh sách dự án</h4>
        </div>
        {isTeacherOrAdmin() && (
          <button onClick={()=>openForm()} className="rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 text-sm font-bold hover:shadow-2xl transform hover:-translate-y-1 transition-all flex items-center gap-2">
            <span className="text-lg">➕</span> Thêm dự án
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.length === 0 && (
            <div className="col-span-full card">
              <div className="card-body text-center py-12">
                <span className="text-6xl mb-4 inline-block">📂</span>
                <p className="text-gray-500">Không có dự án</p>
              </div>
            </div>
          )}
          {projects.map(p => (
            <div key={p.id} className="card group hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-200/30 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform"></div>
              <div className="card-body relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <h5 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                    <span className="text-2xl">📁</span>
                    <span className="line-clamp-1">{p.title || p.project_code}</span>
                  </h5>
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${p.status === 'published' ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
                    {p.status}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mt-2 line-clamp-3 leading-relaxed">{p.description}</p>
                <div className="text-xs text-gray-600 mt-4 space-y-2 bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <span>⚡</span>
                    <span>Mức độ: <strong>{p.difficulty_level || '—'}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>📅</span>
                    <span>Kỳ: <strong>{p.semester || '—'}</strong></span>
                  </div>
                </div>
                {isTeacherOrAdmin() && (
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                    <button onClick={()=>openForm(p)} className="flex-1 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-2 text-sm font-medium hover:shadow-lg transform hover:-translate-y-1 transition-all flex items-center justify-center gap-1">
                      <span>✏️</span> Sửa
                    </button>
                    {isAdmin() && (
                      <button onClick={()=>handleDelete(p.id)} className="flex-1 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white px-3 py-2 text-sm font-medium hover:shadow-lg transform hover:-translate-y-1 transition-all flex items-center justify-center gap-1">
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
          <div className="modal-content max-w-3xl w-full max-h-[90vh] overflow-auto animate-slideUp">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">📁</span>
                <h5 className="text-xl font-bold text-gray-800">{editingProject ? 'Sửa dự án' : 'Thêm dự án'}</h5>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Mã dự án *</label>
                    <input className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={formData.project_code} onChange={e=>setFormData({...formData, project_code: e.target.value})} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Tiêu đề *</label>
                    <input className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mô tả</label>
                  <textarea rows="3" className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})}></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Yêu cầu</label>
                  <textarea rows="2" className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={formData.requirements} onChange={e=>setFormData({...formData, requirements: e.target.value})}></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mục tiêu</label>
                  <textarea rows="2" className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={formData.objectives} onChange={e=>setFormData({...formData, objectives: e.target.value})}></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Công nghệ</label>
                  <input className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={formData.technology_stack} onChange={e=>setFormData({...formData, technology_stack: e.target.value})} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Mức độ</label>
                    <select className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={formData.difficulty_level} onChange={e=>setFormData({...formData, difficulty_level: e.target.value})}>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Thời gian (tuần)</label>
                    <input type="number" className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={formData.estimated_duration} onChange={e=>setFormData({...formData, estimated_duration: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Trạng thái</label>
                    <select className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={formData.status} onChange={e=>setFormData({...formData, status: e.target.value})}>
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Số thành viên tối thiểu</label>
                    <input type="number" className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={formData.min_team_size} onChange={e=>setFormData({...formData, min_team_size: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Số thành viên tối đa</label>
                    <input type="number" className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={formData.max_team_size} onChange={e=>setFormData({...formData, max_team_size: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Giáo viên hướng dẫn</label>
                    <select className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={formData.supervisor_id} onChange={e=>setFormData({...formData, supervisor_id: e.target.value})}>
                      <option value="">-- Chọn giáo viên --</option>
                      {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name || t.teacher_code}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Deadline</label>
                    <input type="datetime-local" className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={formData.deadline} onChange={e=>setFormData({...formData, deadline: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Học kỳ</label>
                    <input className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={formData.semester} onChange={e=>setFormData({...formData, semester: e.target.value})} placeholder="Fall2024" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Năm học</label>
                    <input className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={formData.academic_year} onChange={e=>setFormData({...formData, academic_year: e.target.value})} placeholder="2024-2025" />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={closeForm} className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">Hủy</button>
                  <button type="submit" className="rounded-lg bg-indigo-600 text-white px-4 py-2 text-sm font-medium hover:bg-indigo-700">Lưu</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
