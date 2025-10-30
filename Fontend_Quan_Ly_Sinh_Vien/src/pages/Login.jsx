import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../api'

export default function Login(){
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) =>{
    e.preventDefault()
    setError('')
    setLoading(true)
    try{
      const res = await login(username, password)
      localStorage.setItem('token', res.access_token)
      localStorage.setItem('user', JSON.stringify(res.user))
      navigate('/dashboard')
    }catch(err){
      const msg = err && err.data && err.data.error ? err.data.error : 'Đăng nhập thất bại'
      setError(msg)
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="card shadow-2xl">
          <div className="card-body">
            <div className="text-center mb-6">
              <div className="text-6xl mb-3">🔐</div>
              <h3 className="text-2xl font-bold text-gray-800">Đăng nhập</h3>
              <p className="text-gray-500 mt-1">Chào mừng trở lại!</p>
            </div>
            
            {error && (
              <div className="mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                <span>{error}</span>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tên đăng nhập</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-400">👤</span>
                  <input 
                    className="w-full rounded-lg border-2 border-gray-200 pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" 
                    placeholder="Nhập tên đăng nhập"
                    value={username} 
                    onChange={e=>setUsername(e.target.value)}
                    required 
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mật khẩu</label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-400">🔒</span>
                  <input 
                    type="password" 
                    className="w-full rounded-lg border-2 border-gray-200 pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" 
                    placeholder="Nhập mật khẩu"
                    value={password} 
                    onChange={e=>setPassword(e.target.value)}
                    required 
                  />
                </div>
              </div>
              
              <button 
                className="w-full rounded-lg bg-indigo-600 text-white py-3 font-bold text-lg hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2" 
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="animate-spin">⏳</span> Đang đăng nhập...
                  </>
                ) : (
                  <>
                    <span>🚀</span> Đăng nhập
                  </>
                )}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-gray-600">Chưa có tài khoản?</p>
              <a className="text-indigo-600 font-semibold hover:text-indigo-800 hover:underline inline-flex items-center gap-1" href="/register">
                Tạo tài khoản mới <span>✨</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
