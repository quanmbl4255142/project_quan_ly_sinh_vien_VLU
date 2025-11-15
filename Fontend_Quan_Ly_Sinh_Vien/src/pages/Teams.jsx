import React, { useEffect, useState } from 'react'
import { getTeams, createTeam, updateTeam, deleteTeam, getProjects, getStudents, addTeamMember, removeTeamMember } from '../api'

export default function Teams(){
  const [teams, setTeams] = useState([])
  const [projects, setProjects] = useState([])
  const [students, setStudents] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showMemberForm, setShowMemberForm] = useState(false)
  const [editingTeam, setEditingTeam] = useState(null)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [newMemberId, setNewMemberId] = useState('')
  const [formData, setFormData] = useState({
    team_name: '',
    project_id: '',
    leader_id: '',
    member_ids: [],
    status: 'forming'
  })

  useEffect(()=>{
    fetchTeams()
    fetchProjects()
    fetchStudents()
  },[])

  async function fetchTeams(){
    setLoading(true)
    setError('')
    try{
      const res = await getTeams()
      setTeams(res.teams || res || [])
    }catch(err){
      setError(err?.data?.error || 'Lấy nhóm thất bại')
    }finally{
      setLoading(false)
    }
  }

  async function fetchProjects(){
    try{
      const res = await getProjects()
      setProjects(res.projects || res || [])
    }catch(err){
      console.error('Failed to fetch projects:', err)
    }
  }

  async function fetchStudents(){
    try{
      const res = await getStudents()
      setStudents(res.students || res || [])
    }catch(err){
      console.error('Failed to fetch students:', err)
    }
  }

  function openForm(team = null){
    if(team){
      setEditingTeam(team)
      setFormData({
        team_name: team.team_name || '',
        project_id: team.project_id || '',
        leader_id: team.leader_id || '',
        member_ids: [],
        status: team.status || 'forming'
      })
    }else{
      setEditingTeam(null)
      setFormData({
        team_name: '',
        project_id: '',
        leader_id: '',
        member_ids: [],
        status: 'forming'
      })
    }
    setShowForm(true)
  }

  function closeForm(){
    setShowForm(false)
    setEditingTeam(null)
  }

  function openMemberForm(team){
    setSelectedTeam(team)
    setNewMemberId('')
    setShowMemberForm(true)
  }

  function closeMemberForm(){
    setShowMemberForm(false)
    setSelectedTeam(null)
    setNewMemberId('')
  }

  async function handleSubmit(e){
    e.preventDefault()
    setError('')
    try{
      if(editingTeam){
        await updateTeam(editingTeam.id, formData)
      }else{
        await createTeam(formData)
      }
      closeForm()
      fetchTeams()
    }catch(err){
      setError(err?.data?.error || 'Lưu nhóm thất bại')
    }
  }

  async function handleDelete(id){
    if(!confirm('Xóa nhóm này?')) return
    setError('')
    try{
      await deleteTeam(id)
      fetchTeams()
    }catch(err){
      setError(err?.data?.error || 'Xóa thất bại')
    }
  }

  async function handleAddMember(e){
    e.preventDefault()
    if(!newMemberId || !selectedTeam) return
    setError('')
    try{
      await addTeamMember(selectedTeam.id, newMemberId)
      closeMemberForm()
      fetchTeams()
    }catch(err){
      setError(err?.data?.error || 'Thêm thành viên thất bại')
    }
  }

  async function handleRemoveMember(teamId, memberId){
    if(!confirm('Xóa thành viên này?')) return
    setError('')
    try{
      await removeTeamMember(teamId, memberId)
      fetchTeams()
    }catch(err){
      setError(err?.data?.error || 'Xóa thành viên thất bại')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold">Danh sách nhóm</h4>
        <button onClick={()=>openForm()} className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700">
          + Thêm nhóm
        </button>
      </div>

      {error && <div className="mb-3 rounded-md bg-red-50 text-red-700 px-3 py-2 text-sm">{error}</div>}

      {loading ? (
        <div className="text-gray-500">Đang tải...</div>
      ) : (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {teams.length === 0 && (
            <div className="text-gray-500">Không có nhóm</div>
          )}
          {teams.map(t => (
            <div key={t.id} className="card">
              <div className="card-body">
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-semibold">{t.team_name}</h5>
                  <span className={`text-xs px-2 py-0.5 rounded ${t.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{t.status}</span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Dự án: {projects.find(p => p.id === t.project_id)?.title || '—'}</div>
                  <div>Trưởng nhóm: {students.find(s => s.id === t.leader_id)?.full_name || '—'}</div>
                  <div>Thành viên: {t.members?.length || 0}</div>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                  <button onClick={()=>openMemberForm(t)} className="rounded bg-blue-600 text-white px-2 py-1 text-xs hover:bg-blue-700">Thành viên</button>
                  <button onClick={()=>openForm(t)} className="rounded bg-blue-600 text-white px-2 py-1 text-xs hover:bg-blue-700">Sửa</button>
                  <button onClick={()=>handleDelete(t.id)} className="rounded bg-blue-600 text-white px-2 py-1 text-xs hover:bg-blue-700">Xóa</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form tạo/sửa nhóm */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <h5 className="text-lg font-semibold mb-4">{editingTeam ? 'Sửa nhóm' : 'Thêm nhóm'}</h5>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tên nhóm *</label>
                  <input className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.team_name} onChange={e=>setFormData({...formData, team_name: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Dự án *</label>
                  <select className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.project_id} onChange={e=>setFormData({...formData, project_id: e.target.value})} required>
                    <option value="">-- Chọn dự án --</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.title || p.project_code}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Trưởng nhóm *</label>
                  <select className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.leader_id} onChange={e=>setFormData({...formData, leader_id: e.target.value})} required>
                    <option value="">-- Chọn trưởng nhóm --</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.full_name || s.student_code}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Trạng thái</label>
                  <select className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.status} onChange={e=>setFormData({...formData, status: e.target.value})}>
                    <option value="forming">Forming</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="disbanded">Disbanded</option>
                  </select>
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

      {/* Form quản lý thành viên */}
      {showMemberForm && selectedTeam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <h5 className="text-lg font-semibold mb-4">Quản lý thành viên - {selectedTeam.team_name}</h5>
              <form onSubmit={handleAddMember} className="mb-4">
                <label className="block text-sm font-medium mb-1">Thêm thành viên</label>
                <div className="flex gap-2">
                  <select className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={newMemberId} onChange={e=>setNewMemberId(e.target.value)}>
                    <option value="">-- Chọn sinh viên --</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.full_name || s.student_code}</option>)}
                  </select>
                  <button type="submit" className="rounded-lg bg-emerald-600 text-white px-4 py-2 text-sm font-medium hover:bg-emerald-700">Thêm</button>
                </div>
              </form>
              <div className="border-t pt-4">
                <h6 className="text-sm font-medium mb-2">Thành viên hiện tại</h6>
                <div className="space-y-2">
                  {(!selectedTeam.members || selectedTeam.members.length === 0) && (
                    <div className="text-gray-500 text-sm">Chưa có thành viên</div>
                  )}
                  {selectedTeam.members?.map(m => (
                    <div key={m.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{students.find(s => s.id === m.student_id)?.full_name || m.student_id}</span>
                      <button onClick={()=>handleRemoveMember(selectedTeam.id, m.id)} className="text-red-600 text-xs hover:underline">Xóa</button>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button onClick={closeMemberForm} className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">Đóng</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

