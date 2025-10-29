import React from 'react'
import { Link } from 'react-router-dom'

export default function Dashboard(){
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  
  return (
    <div className="space-y-6">
      {/* Welcome Banner with 3D Effect */}
      <div className="relative bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl p-8 text-white overflow-hidden transform hover:scale-[1.02] transition-all duration-300"
           style={{
             boxShadow: '0 20px 60px -10px rgba(99, 102, 241, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)'
           }}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -ml-32 -mb-32"></div>
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2 float-animation">Chào mừng trở lại! 👋</h1>
          <p className="text-white/90 text-lg">Xin chào <span className="font-bold text-white">{user?.username || 'User'}</span>, chúc bạn làm việc hiệu quả!</p>
        </div>
      </div>

      {/* Stats Cards with 3D Effect */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/students" className="stat-card card cursor-pointer bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="card-body relative z-10">
            <div className="flex items-center gap-4">
              <div className="text-6xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">👨‍🎓</div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">Sinh viên</h3>
                <p className="text-2xl font-bold text-blue-600 group-hover:text-blue-700">Quản lý</p>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/projects" className="stat-card card cursor-pointer bg-gradient-to-br from-green-50 via-green-100 to-green-50 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="card-body relative z-10">
            <div className="flex items-center gap-4">
              <div className="text-6xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">📁</div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">Dự án</h3>
                <p className="text-2xl font-bold text-green-600 group-hover:text-green-700">Quản lý</p>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/teams" className="stat-card card cursor-pointer bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="card-body relative z-10">
            <div className="flex items-center gap-4">
              <div className="text-6xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">👥</div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">Nhóm</h3>
                <p className="text-2xl font-bold text-purple-600 group-hover:text-purple-700">Quản lý</p>
              </div>
            </div>
          </div>
        </Link>

        <Link to="/submissions" className="stat-card card cursor-pointer bg-gradient-to-br from-amber-50 via-amber-100 to-amber-50 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="card-body relative z-10">
            <div className="flex items-center gap-4">
              <div className="text-6xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">📝</div>
              <div>
                <h3 className="text-sm font-medium text-gray-600">Bài nộp</h3>
                <p className="text-2xl font-bold text-amber-600 group-hover:text-amber-700">Quản lý</p>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card">
          <div className="card-body">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              Thao tác nhanh
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Link to="/students" className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">👨‍🎓</span>
                  <div>
                    <h3 className="font-semibold text-blue-700">Quản lý sinh viên</h3>
                    <p className="text-sm text-gray-600">Thêm, sửa, xóa sinh viên</p>
                  </div>
                </div>
              </Link>

              <Link to="/projects" className="p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">📁</span>
                  <div>
                    <h3 className="font-semibold text-green-700">Quản lý dự án</h3>
                    <p className="text-sm text-gray-600">Tạo và theo dõi dự án</p>
                  </div>
                </div>
              </Link>

              <Link to="/teams" className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">👥</span>
                  <div>
                    <h3 className="font-semibold text-purple-700">Quản lý nhóm</h3>
                    <p className="text-sm text-gray-600">Tạo nhóm và thêm thành viên</p>
                  </div>
                </div>
              </Link>

              <Link to="/submissions" className="p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">📝</span>
                  <div>
                    <h3 className="font-semibold text-amber-700">Quản lý bài nộp</h3>
                    <p className="text-sm text-gray-600">Nộp bài và đánh giá</p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-indigo-50 to-purple-50">
          <div className="card-body">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="text-2xl">ℹ️</span>
              Thông tin
            </h2>
            <div className="space-y-3">
              <div className="p-3 bg-white rounded-lg">
                <p className="text-sm text-gray-600">Tài khoản</p>
                <p className="font-semibold text-indigo-600">{user?.username}</p>
              </div>
              <div className="p-3 bg-white rounded-lg">
                <p className="text-sm text-gray-600">Vai trò</p>
                <p className="font-semibold text-purple-600 capitalize">{user?.role}</p>
              </div>
              <Link to="/profile" className="block w-full p-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-center font-medium hover:shadow-lg transition-all">
                Xem Profile 🔗
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
