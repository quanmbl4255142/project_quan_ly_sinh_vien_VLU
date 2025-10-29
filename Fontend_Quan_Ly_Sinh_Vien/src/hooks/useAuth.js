import { useState, useEffect } from 'react'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    
    setToken(storedToken)
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (e) {
        setUser(null)
      }
    }
  }, [])

  const isAdmin = () => user?.role === 'admin'
  const isTeacher = () => user?.role === 'teacher'
  const isStudent = () => user?.role === 'student'
  const isTeacherOrAdmin = () => user?.role === 'admin' || user?.role === 'teacher'

  return {
    user,
    token,
    isAdmin,
    isTeacher,
    isStudent,
    isTeacherOrAdmin,
    isAuthenticated: !!token
  }
}

