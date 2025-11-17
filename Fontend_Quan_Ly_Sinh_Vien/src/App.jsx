import React, { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Students from './pages/Students'
import Projects from './pages/Projects'
import Teams from './pages/Teams'
import Submissions from './pages/Submissions'
import Profile from './pages/Profile'
import AdminUsers from './pages/AdminUsers'
import AdminMonitor from './pages/AdminMonitor'
import NavBar from './components/Nav'
import { heartbeat } from './api'

function PrivateRoute({ children }){
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" />
}

function AdminRoute({ children }){
  const token = localStorage.getItem('token')
  const [isAuthorized, setIsAuthorized] = useState(null)
  
  useEffect(() => {
    if (!token) {
      setIsAuthorized(false)
      return
    }
    
    try {
      const user = JSON.parse(localStorage.getItem('user') || 'null')
      setIsAuthorized(user?.role === 'admin')
    } catch (e) {
      setIsAuthorized(false)
    }
  }, [token])
  
  if (isAuthorized === null) {
    return (
      <div className="flex items-center justify-center gap-3 py-12">
        <span className="text-4xl animate-spin">⏳</span>
        <span className="text-lg text-gray-600">Đang kiểm tra quyền...</span>
      </div>
    )
  }
  
  return isAuthorized ? children : <Navigate to="/dashboard" replace />
}

export default function App(){
  useEffect(() => {
    // persistent client id
    let cid = localStorage.getItem('client_id')
    if(!cid){
      cid = crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`
      localStorage.setItem('client_id', cid)
    }
    let timer
    const tick = async () => {
      try{ await heartbeat(cid) }catch(_){ /* ignore */ }
    }
    tick()
    timer = setInterval(tick, 10000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div>
      <NavBar />
      <div className="app-container mt-6 pb-8">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/students" element={<PrivateRoute><Students /></PrivateRoute>} />
          <Route path="/projects" element={<PrivateRoute><Projects /></PrivateRoute>} />
          <Route path="/teams" element={<PrivateRoute><Teams /></PrivateRoute>} />
          <Route path="/submissions" element={<PrivateRoute><Submissions /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/monitor" element={<AdminRoute><AdminMonitor /></AdminRoute>} />
        </Routes>
      </div>
    </div>
  )
}
