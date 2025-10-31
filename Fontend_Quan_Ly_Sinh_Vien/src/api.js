// Get API base from runtime config (injected in index.html) or build-time env
const API_BASE = (typeof window !== 'undefined' && window.__API_BASE__ && window.__API_BASE__ !== 'REPLACE_WITH_API_BASE') 
  ? window.__API_BASE__ 
  : (import.meta.env.VITE_API_BASE || 'http://localhost:5000/api')

// Debug: log resolved API base
if (typeof window !== 'undefined') {
  try { console.log('[API_BASE]', API_BASE) } catch (_) {}
}

async function request(path, options = {}){
  const headers = options.headers || {}
  const token = localStorage.getItem('token')
  if(token){
    headers['Authorization'] = `Bearer ${token}`
  }
  headers['Content-Type'] = headers['Content-Type'] || 'application/json'

  const url = `${API_BASE}${path}`
  // Debug: log the final request URL
  if (typeof window !== 'undefined') {
    try { console.log('[fetch]', url) } catch (_) {}
  }
  const res = await fetch(url, { ...options, headers })
  const text = await res.text()
  try{
    const data = text ? JSON.parse(text) : {}
    if(!res.ok) throw { status: res.status, data }
    return data
  }catch(err){
    throw err
  }
}

// ===== Auth =====
export async function login(username, password){
  return request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) })
}

export async function register(data){
  return request('/auth/register', { method: 'POST', body: JSON.stringify(data) })
}

export async function getProfile(){
  return request('/auth/profile')
}

export async function updateProfile(data){
  return request('/auth/profile', { method: 'PUT', body: JSON.stringify(data) })
}

export async function changePassword(currentPassword, newPassword){
  return request('/auth/change-password', { method: 'POST', body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }) })
}

// ===== Students =====
export async function getStudents(params = {}){
  const query = new URLSearchParams(params).toString()
  return request(`/students/${query ? '?'+query : ''}`)
}

export async function getStudent(id){
  return request(`/students/${id}`)
}

export async function createStudent(data){
  return request('/students/', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateStudent(id, data){
  return request(`/students/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteStudent(id){
  return request(`/students/${id}`, { method: 'DELETE' })
}

export async function getStudentTeams(id){
  return request(`/students/${id}/teams`)
}

export async function getStudentProjects(id){
  return request(`/students/${id}/projects`)
}

// ===== Teachers =====
export async function getTeachers(params = {}){
  const query = new URLSearchParams(params).toString()
  return request(`/teachers/${query ? '?'+query : ''}`)
}

export async function getTeacher(id){
  return request(`/teachers/${id}`)
}

export async function createTeacher(data){
  return request('/teachers/', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateTeacher(id, data){
  return request(`/teachers/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteTeacher(id){
  return request(`/teachers/${id}`, { method: 'DELETE' })
}

// ===== Projects =====
export async function getProjects(params = {}){
  const query = new URLSearchParams(params).toString()
  return request(`/projects/${query ? '?'+query : ''}`)
}

export async function getProject(id){
  return request(`/projects/${id}`)
}

export async function createProject(data){
  return request('/projects/', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateProject(id, data){
  return request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteProject(id){
  return request(`/projects/${id}`, { method: 'DELETE' })
}

export async function getProjectTeams(id){
  return request(`/projects/${id}/teams`)
}

export async function getProjectDocuments(id){
  return request(`/projects/${id}/documents`)
}

export async function uploadProjectDocument(id, data){
  return request(`/projects/${id}/documents`, { method: 'POST', body: JSON.stringify(data) })
}

// ===== Teams =====
export async function getTeams(params = {}){
  const query = new URLSearchParams(params).toString()
  return request(`/teams/${query ? '?'+query : ''}`)
}

export async function getTeam(id){
  return request(`/teams/${id}`)
}

export async function createTeam(data){
  return request('/teams/', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateTeam(id, data){
  return request(`/teams/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteTeam(id){
  return request(`/teams/${id}`, { method: 'DELETE' })
}

export async function addTeamMember(teamId, studentId){
  return request(`/teams/${teamId}/members`, { method: 'POST', body: JSON.stringify({ student_id: studentId }) })
}

export async function removeTeamMember(teamId, memberId){
  return request(`/teams/${teamId}/members/${memberId}`, { method: 'DELETE' })
}

export async function updateMemberRole(teamId, memberId, role){
  return request(`/teams/${teamId}/members/${memberId}/role`, { method: 'PUT', body: JSON.stringify({ role }) })
}

// ===== Submissions =====
export async function getSubmissions(params = {}){
  const query = new URLSearchParams(params).toString()
  return request(`/submissions/submissions${query ? '?'+query : ''}`)
}

export async function getSubmission(id){
  return request(`/submissions/submissions/${id}`)
}

export async function createSubmission(data){
  return request('/submissions/submissions', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateSubmission(id, data){
  return request(`/submissions/submissions/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteSubmission(id){
  return request(`/submissions/submissions/${id}`, { method: 'DELETE' })
}

export async function reviewSubmission(id, status, feedback){
  return request(`/submissions/submissions/${id}/review`, { method: 'POST', body: JSON.stringify({ status, feedback }) })
}

// ===== Evaluations =====
export async function getEvaluations(params = {}){
  const query = new URLSearchParams(params).toString()
  return request(`/submissions/evaluations${query ? '?'+query : ''}`)
}

export async function getEvaluation(id){
  return request(`/submissions/evaluations/${id}`)
}

export async function createEvaluation(data){
  return request('/submissions/evaluations', { method: 'POST', body: JSON.stringify(data) })
}

export async function updateEvaluation(id, data){
  return request(`/submissions/evaluations/${id}`, { method: 'PUT', body: JSON.stringify(data) })
}

export async function deleteEvaluation(id){
  return request(`/submissions/evaluations/${id}`, { method: 'DELETE' })
}

// ===== Admin =====
export async function getAllUsers(){
  return request('/admin/users')
}

export async function getUser(id){
  return request(`/admin/users/${id}`)
}

export async function toggleUserActive(id){
  return request(`/admin/users/${id}/toggle-active`, { method: 'PUT' })
}

export async function changeUserRole(id, role){
  return request(`/admin/users/${id}/change-role`, { method: 'PUT', body: JSON.stringify({ role }) })
}

export async function deleteUser(id){
  return request(`/admin/users/${id}`, { method: 'DELETE' })
}

export async function getAdminStatistics(){
  return request('/admin/statistics')
}
