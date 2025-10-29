import React from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function NavBar(){
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  const navigate = useNavigate()

  const handleLogout = () =>{
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <header className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 text-white shadow-lg">
      <div className="app-container">
        <div className="flex items-center justify-between py-4">
          <Link to="/" className="text-xl font-bold tracking-tight hover:text-indigo-100 transition-colors flex items-center gap-2">
            <span className="text-2xl">📚</span>
            <span>QL Dự án SV</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {token && (
              <>
                <Link to="/dashboard" className="hover:text-white font-medium hover:scale-105 transition-all">📊 Dashboard</Link>
                <Link to="/students" className="hover:text-white font-medium hover:scale-105 transition-all">👨‍🎓 Students</Link>
                <Link to="/projects" className="hover:text-white font-medium hover:scale-105 transition-all">📁 Projects</Link>
                <Link to="/teams" className="hover:text-white font-medium hover:scale-105 transition-all">👥 Teams</Link>
                <Link to="/submissions" className="hover:text-white font-medium hover:scale-105 transition-all">📝 Submissions</Link>
                {user?.role === 'admin' && (
                  <Link to="/admin/users" className="hover:text-white font-medium hover:scale-105 transition-all bg-red-500/20 px-3 py-1 rounded-lg">👑 Admin</Link>
                )}
              </>
            )}
          </nav>
          <div className="flex items-center gap-3">
            {token ? (
              <>
                <span className="text-sm hidden sm:flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg">
                  <span className="text-lg">👤</span>
                  <span className="font-medium">{user ? user.username : ''}</span>
                </span>
                <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-lg border-2 border-white/30 px-4 py-2 text-sm font-medium hover:bg-white hover:text-indigo-600 transition-all">
                  <span>🚪</span> Logout
                </button>
              </>
            ) : (
              <>
                <Link className="rounded-lg bg-white text-indigo-600 px-4 py-2 text-sm font-bold hover:bg-indigo-50 hover:shadow-lg transition-all" to="/login">🔑 Đăng nhập</Link>
                <Link className="rounded-lg border-2 border-white/50 px-4 py-2 text-sm font-medium hover:bg-white hover:text-indigo-600 transition-all" to="/register">✨ Đăng ký</Link>
              </>
            )}
          </div>
        </div>
        {token && (
          <nav className="md:hidden pb-3 flex flex-wrap items-center gap-4">
            <Link to="/dashboard" className="hover:text-white/90">Dashboard</Link>
            <Link to="/students" className="hover:text-white/90">Students</Link>
            <Link to="/projects" className="hover:text-white/90">Projects</Link>
            <Link to="/teams" className="hover:text-white/90">Teams</Link>
            <Link to="/submissions" className="hover:text-white/90">Submissions</Link>
          </nav>
        )}
      </div>
    </header>
  )
}
