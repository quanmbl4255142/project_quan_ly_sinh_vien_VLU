import React from 'react'
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
import NavBar from './components/Nav'

function PrivateRoute({ children }){
  const token = localStorage.getItem('token')
  return token ? children : <Navigate to="/login" />
}

function AdminRoute({ children }){
  const token = localStorage.getItem('token')
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  return token && user?.role === 'admin' ? children : <Navigate to="/dashboard" />
}

export default function App(){
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
        </Routes>
      </div>
    </div>
  )
}
