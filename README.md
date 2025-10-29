# 🎓 Student Project Management System

Hệ thống quản lý dự án sinh viên hiện đại với giao diện 3D đẹp mắt!

## ✨ Features

### Frontend (React + TailwindCSS + 3D Effects)
- 🎨 **Beautiful UI** với glassmorphism và 3D transforms
- 👨‍🎓 **Students Management** - CRUD với avatar và cards đẹp
- 📁 **Projects Management** - Grid layout với gradient overlays
- 👥 **Teams Management** - Quản lý nhóm và thành viên
- 📝 **Submissions & Evaluations** - Nộp bài và đánh giá
- 👤 **Profile** - Xem/sửa thông tin + đổi mật khẩu
- 🔐 **Authentication** - JWT với register/login

### Backend (Python Flask + MySQL)
- 🔧 **RESTful API** với JWT authentication
- 🗄️ **MySQL Database** với SQLAlchemy ORM
- 📊 **Full CRUD** cho tất cả entities
- 🔒 **Secure** với password hashing
- 📄 **API Documentation** đầy đủ

## 🚀 Quick Start

### Option 1: Development Mode (Khuyến nghị)
```bash
# Backend
cd API_Quanly_Sinh_vien
python app.py

# Frontend
cd Fontend_Quan_Ly_Sinh_Vien
npm install
npm run dev
```

Xem chi tiết: [START_DEV.md](START_DEV.md)

### Option 2: Deploy on Railway
```bash
git push origin main
# Then deploy on Railway.app
```

Xem chi tiết: [RAILWAY_FIX.md](RAILWAY_FIX.md)

## 📁 Project Structure

```
├── API_Quanly_Sinh_vien/     # Backend Flask API
│   ├── models/               # Database models
│   ├── routes/               # API endpoints
│   ├── config/               # Database config
│   └── app.py               # Main application
│
├── Fontend_Quan_Ly_Sinh_Vien/ # Frontend React
│   ├── src/
│   │   ├── pages/           # Page components
│   │   ├── components/      # Reusable components
│   │   ├── api.js          # API client
│   │   └── styles.css      # Tailwind + 3D effects
│   └── package.json
│
└── docker-compose.yml        # Docker setup (optional)
```

## 🎨 Screenshots

### Dashboard
Beautiful dashboard với 3D stat cards và gradient banners

### Students Management
CRUD operations với glassmorphism cards và avatars

### Projects Management
Grid layout với hover effects và animated overlays

## 🛠️ Tech Stack

**Frontend:**
- React 18
- Vite 5
- TailwindCSS 3
- React Router 6

**Backend:**
- Python 3.11
- Flask
- SQLAlchemy
- JWT
- MySQL

## 📚 Documentation

- [START_DEV.md](START_DEV.md) - Development setup
- [RAILWAY_FIX.md](RAILWAY_FIX.md) - Deploy to Railway
- [API_Documentation.md](API_Quanly_Sinh_vien/API_Documentation.md) - API docs

## 🎯 Features Checklist

- ✅ Authentication (Register, Login, JWT)
- ✅ Students CRUD
- ✅ Projects CRUD
- ✅ Teams Management
- ✅ Submissions & Reviews
- ✅ Evaluations
- ✅ Profile Management
- ✅ Responsive Design
- ✅ 3D Effects & Animations
- ✅ Glassmorphism UI

## 🤝 Contributing

Pull requests are welcome!

## 📄 License

MIT

## 👨‍💻 Author

Developed with ❤️ using modern web technologies

---

**Enjoy! 🚀✨**

