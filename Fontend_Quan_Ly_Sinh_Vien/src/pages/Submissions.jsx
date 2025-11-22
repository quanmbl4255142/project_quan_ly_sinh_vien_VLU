import React, { useEffect, useState } from 'react'
import { getSubmissions, createSubmission, updateSubmission, deleteSubmission, reviewSubmission, getProjects, createEvaluation } from '../api'
import { useAuth } from '../hooks/useAuth'

export default function Submissions(){
  const { user, isAdmin, isTeacherOrAdmin } = useAuth()
  const [submissions, setSubmissions] = useState([])
  const [projects, setProjects] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [showEvalForm, setShowEvalForm] = useState(false)
  const [editingSubmission, setEditingSubmission] = useState(null)
  const [reviewingSubmission, setReviewingSubmission] = useState(null)
  const [evaluatingSubmission, setEvaluatingSubmission] = useState(null)
  const [formData, setFormData] = useState({
    project_id: '',
    submission_type: 'team',
    title: '',
    description: '',
    file_path: '',
    file_type: '',
    file_size: '',
    submission_category: 'proposal'
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const [fileName, setFileName] = useState('')
  const [reviewData, setReviewData] = useState({ status: 'approved', feedback: '' })
  const [evalData, setEvalData] = useState({
    technical_quality: 5,
    creativity: 5,
    presentation: 5,
    teamwork: 5,
    timeliness: 5,
    documentation: 5,
    comments: ''
  })

  useEffect(()=>{
    fetchSubmissions()
    fetchProjects()
  },[])

  async function fetchSubmissions(){
    setLoading(true)
    setError('')
    try{
      const res = await getSubmissions()
      setSubmissions(res.submissions || res || [])
    }catch(err){
      setError(err?.data?.error || 'Lấy bài nộp thất bại')
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

  function openForm(submission = null){
    if(submission){
      setEditingSubmission(submission)
      setFormData({
        project_id: submission.project_id || '',
        submission_type: submission.submission_type || 'team',
        title: submission.title || '',
        description: submission.description || '',
        file_path: submission.file_path || '',
        file_type: submission.file_type || '',
        file_size: submission.file_size || '',
        submission_category: submission.submission_category || 'proposal'
      })
      setSelectedFile(null)
      setFileName(submission.file_path ? submission.file_path.split('/').pop() : '')
    }else{
      setEditingSubmission(null)
      setFormData({
        project_id: '',
        submission_type: 'team',
        title: '',
        description: '',
        file_path: '',
        file_type: '',
        file_size: '',
        submission_category: 'proposal'
      })
      setSelectedFile(null)
      setFileName('')
    }
    setShowForm(true)
  }

  function closeForm(){
    setShowForm(false)
    setEditingSubmission(null)
    setSelectedFile(null)
    setFileName('')
  }

  function openReviewForm(submission){
    setReviewingSubmission(submission)
    setReviewData({ status: 'approved', feedback: '' })
    setShowReviewForm(true)
  }

  function closeReviewForm(){
    setShowReviewForm(false)
    setReviewingSubmission(null)
  }

  function openEvalForm(submission){
    setEvaluatingSubmission(submission)
    setEvalData({
      technical_quality: 5,
      creativity: 5,
      presentation: 5,
      teamwork: 5,
      timeliness: 5,
      documentation: 5,
      comments: ''
    })
    setShowEvalForm(true)
  }

  function closeEvalForm(){
    setShowEvalForm(false)
    setEvaluatingSubmission(null)
  }

  async function handleSubmit(e){
    e.preventDefault()
    setError('')
    try{
      // Nếu có file được chọn, tạo FormData để upload file
      if(selectedFile){
        const formDataToSend = new FormData()
        formDataToSend.append('project_id', formData.project_id)
        formDataToSend.append('submission_type', formData.submission_type)
        formDataToSend.append('title', formData.title)
        formDataToSend.append('description', formData.description || '')
        formDataToSend.append('submission_category', formData.submission_category)
        formDataToSend.append('file', selectedFile)
        
        if(editingSubmission){
          await updateSubmission(editingSubmission.id, formDataToSend)
        }else{
          await createSubmission(formDataToSend)
        }
      }else{
        // Nếu không có file mới, gửi dữ liệu JSON như cũ
        if(editingSubmission){
          await updateSubmission(editingSubmission.id, formData)
        }else{
          await createSubmission(formData)
        }
      }
      closeForm()
      fetchSubmissions()
    }catch(err){
      setError(err?.data?.error || 'Lưu bài nộp thất bại')
    }
  }

  function handleFileChange(e){
    const file = e.target.files[0]
    if(file){
      setSelectedFile(file)
      setFileName(file.name)
      // Tự động điền file_type và file_size
      const ext = file.name.split('.').pop().toLowerCase()
      setFormData({
        ...formData,
        file_type: ext,
        file_size: file.size
      })
    }
  }

  async function handleDelete(id){
    if(!confirm('Xóa bài nộp này?')) return
    setError('')
    try{
      await deleteSubmission(id)
      fetchSubmissions()
    }catch(err){
      setError(err?.data?.error || 'Xóa thất bại')
    }
  }

  async function handleReview(e){
    e.preventDefault()
    if(!reviewingSubmission) return
    setError('')
    try{
      await reviewSubmission(reviewingSubmission.id, reviewData.status, reviewData.feedback)
      closeReviewForm()
      fetchSubmissions()
    }catch(err){
      setError(err?.data?.error || 'Đánh giá thất bại')
    }
  }

  async function handleEvaluate(e){
    e.preventDefault()
    if(!evaluatingSubmission) return
    setError('')
    try{
      const payload = {
        project_id: evaluatingSubmission.project_id,
        submission_id: evaluatingSubmission.id,
        evaluator_type: 'teacher',
        ...evalData
      }
      await createEvaluation(payload)
      closeEvalForm()
      alert('Đánh giá đã được lưu')
    }catch(err){
      setError(err?.data?.error || 'Đánh giá thất bại')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold">Danh sách bài nộp</h4>
        <button onClick={()=>openForm()} className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700">
          + Thêm bài nộp
        </button>
      </div>

      {error && <div className="mb-3 rounded-md bg-red-50 text-red-700 px-3 py-2 text-sm">{error}</div>}

      {loading ? (
        <div className="text-gray-500">Đang tải...</div>
      ) : (
        <div className="mt-4 space-y-3">
          {submissions.length === 0 && (
            <div className="text-gray-500">Không có bài nộp</div>
          )}
          {submissions.map(sub => (
            <div key={sub.id} className="card">
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="font-semibold">{sub.title}</h5>
                    <div className="text-sm text-gray-600 mt-1 space-y-0.5">
                      <div>Dự án: {projects.find(p => p.id === sub.project_id)?.title || '—'}</div>
                      <div>Loại: {sub.submission_type} - {sub.submission_category}</div>
                      <div>Trạng thái: <span className={`px-2 py-0.5 rounded text-xs ${sub.status === 'approved' ? 'bg-blue-100 text-blue-700' : sub.status === 'rejected' ? 'bg-gray-100 text-gray-700' : 'bg-blue-100 text-blue-700'}`}>{sub.status || 'pending'}</span></div>
                      {sub.description && <div className="text-gray-500">{sub.description}</div>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {isTeacherOrAdmin() && (
                      <>
                        <button onClick={()=>openReviewForm(sub)} className="rounded bg-blue-600 text-white px-2 py-1 text-xs hover:bg-blue-700">Review</button>
                        <button onClick={()=>openEvalForm(sub)} className="rounded bg-blue-600 text-white px-2 py-1 text-xs hover:bg-blue-700">Đánh giá</button>
                      </>
                    )}
                    <button onClick={()=>openForm(sub)} className="rounded bg-blue-600 text-white px-2 py-1 text-xs hover:bg-blue-700">Sửa</button>
                    {isAdmin() && (
                      <button onClick={()=>handleDelete(sub.id)} className="rounded bg-blue-600 text-white px-2 py-1 text-xs hover:bg-blue-700">Xóa</button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form tạo/sửa submission */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <h5 className="text-lg font-semibold mb-4">{editingSubmission ? 'Sửa bài nộp' : 'Thêm bài nộp'}</h5>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Dự án *</label>
                  <select className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.project_id} onChange={e=>setFormData({...formData, project_id: e.target.value})} required>
                    <option value="">-- Chọn dự án --</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.title || p.project_code}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Loại nộp</label>
                    <select className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.submission_type} onChange={e=>setFormData({...formData, submission_type: e.target.value})}>
                      <option value="team">Team</option>
                      <option value="individual">Individual</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Danh mục</label>
                    <select className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.submission_category} onChange={e=>setFormData({...formData, submission_category: e.target.value})}>
                      <option value="proposal">Proposal</option>
                      <option value="progress">Progress Report</option>
                      <option value="final">Final Report</option>
                      <option value="presentation">Presentation</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Tiêu đề *</label>
                  <input className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Mô tả</label>
                  <textarea rows="3" className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})}></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">File đính kèm *</label>
                  <input 
                    type="file" 
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.zip,.rar,.txt,.jpg,.png,.pptx,.xlsx"
                  />
                  {fileName && (
                    <p className="mt-1 text-sm text-gray-600">
                      Đã chọn: <span className="font-medium">{fileName}</span>
                      {formData.file_size && ` (${(formData.file_size / 1024).toFixed(2)} KB)`}
                    </p>
                  )}
                  {editingSubmission && editingSubmission.file_path && !selectedFile && (
                    <p className="mt-1 text-sm text-gray-500">
                      File hiện tại: {editingSubmission.file_path.split('/').pop()}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Loại file</label>
                    <input 
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      value={formData.file_type} 
                      onChange={e=>setFormData({...formData, file_type: e.target.value})} 
                      placeholder="pdf, docx..." 
                      readOnly={!!selectedFile}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Kích thước file (bytes)</label>
                    <input 
                      type="number" 
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      value={formData.file_size} 
                      onChange={e=>setFormData({...formData, file_size: e.target.value})}
                      readOnly={!!selectedFile}
                    />
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

      {/* Form review */}
      {showReviewForm && reviewingSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="p-6">
              <h5 className="text-lg font-semibold mb-4">Review - {reviewingSubmission.title}</h5>
              <form onSubmit={handleReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Trạng thái</label>
                  <select className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={reviewData.status} onChange={e=>setReviewData({...reviewData, status: e.target.value})}>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="revision_required">Revision Required</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nhận xét</label>
                  <textarea rows="4" className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={reviewData.feedback} onChange={e=>setReviewData({...reviewData, feedback: e.target.value})}></textarea>
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={closeReviewForm} className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">Hủy</button>
                  <button type="submit" className="rounded-lg bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700">Lưu</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Form evaluation */}
      {showEvalForm && evaluatingSubmission && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <h5 className="text-lg font-semibold mb-4">Đánh giá - {evaluatingSubmission.title}</h5>
              <form onSubmit={handleEvaluate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Technical Quality (1-10)</label>
                    <input type="number" min="1" max="10" className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={evalData.technical_quality} onChange={e=>setEvalData({...evalData, technical_quality: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Creativity (1-10)</label>
                    <input type="number" min="1" max="10" className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={evalData.creativity} onChange={e=>setEvalData({...evalData, creativity: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Presentation (1-10)</label>
                    <input type="number" min="1" max="10" className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={evalData.presentation} onChange={e=>setEvalData({...evalData, presentation: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Teamwork (1-10)</label>
                    <input type="number" min="1" max="10" className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={evalData.teamwork} onChange={e=>setEvalData({...evalData, teamwork: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Timeliness (1-10)</label>
                    <input type="number" min="1" max="10" className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={evalData.timeliness} onChange={e=>setEvalData({...evalData, timeliness: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Documentation (1-10)</label>
                    <input type="number" min="1" max="10" className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={evalData.documentation} onChange={e=>setEvalData({...evalData, documentation: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nhận xét</label>
                  <textarea rows="4" className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" value={evalData.comments} onChange={e=>setEvalData({...evalData, comments: e.target.value})}></textarea>
                </div>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={closeEvalForm} className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50">Hủy</button>
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

