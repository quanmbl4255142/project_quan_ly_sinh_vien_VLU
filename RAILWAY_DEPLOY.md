# 🚂 Deploy lên Railway.app - Hướng dẫn chi tiết

Railway là nền tảng deployment miễn phí, dễ dùng, tự động build và deploy từ Git!

---

## 🎯 Tổng quan

Railway sẽ tự động:
- ✅ Detect Python và Node.js
- ✅ Install dependencies
- ✅ Build frontend
- ✅ Tạo MySQL database
- ✅ Deploy cả frontend + backend

---

## 📋 Bước 1: Chuẩn bị Repository

### 1.1 Tạo `.gitignore` (nếu chưa có)

```gitignore
# Python
__pycache__/
*.pyc
venv/
*.env
.env

# Node
node_modules/
.next/
dist/
build/

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db
```

### 1.2 Push code lên GitHub

```bash
git init
git add .
git commit -m "Initial commit - Student Project Management System"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

## 🚀 Bước 2: Deploy Backend (API) lên Railway

### 2.1 Tạo tài khoản Railway
1. Truy cập: https://railway.app
2. Sign up với GitHub
3. Verify email

### 2.2 Deploy Backend
1. Click **"New Project"**
2. Chọn **"Deploy from GitHub repo"**
3. Chọn repository của bạn
4. Railway sẽ detect Python app

### 2.3 Cấu hình Backend
1. Click vào service vừa tạo
2. Vào tab **"Settings"**
3. **Root Directory**: Đặt là `API_Quanly_Sinh_vien`
4. **Start Command**: `python app.py`

### 2.4 Thêm MySQL Database
1. Click **"New"** trong project
2. Chọn **"Database"** → **"Add MySQL"**
3. Railway tự động tạo database

### 2.5 Thêm Environment Variables cho Backend
Click vào API service → **"Variables"** → Add:

```env
FLASK_APP=app.py
FLASK_ENV=production
SECRET_KEY=your-super-secret-key-here-change-this
JWT_SECRET_KEY=your-jwt-secret-key-here-change-this
DATABASE_URL=${{MySQL.DATABASE_URL}}
PORT=5000
```

**Note:** `${{MySQL.DATABASE_URL}}` tự động lấy từ MySQL service

### 2.6 Deploy
- Railway tự động build và deploy
- Đợi ~2-3 phút
- Copy **Public URL** của API (ví dụ: `https://your-api.railway.app`)

---

## 🎨 Bước 3: Deploy Frontend lên Railway

### 3.1 Tạo service Frontend
1. Click **"New"** trong project
2. Chọn **"GitHub Repo"** (cùng repo)
3. Railway detect Node.js

### 3.2 Cấu hình Frontend
1. Click vào Frontend service
2. Vào tab **"Settings"**
3. **Root Directory**: `Fontend_Quan_Ly_Sinh_Vien`
4. **Build Command**: `npm install && npm run build`
5. **Start Command**: `npm run preview`

### 3.3 Thêm Environment Variables cho Frontend
Click **"Variables"** → Add:

```env
VITE_API_BASE=https://your-api.railway.app/api
```

**Thay `your-api.railway.app` bằng URL thật của API service!**

### 3.4 Cấu hình Build Output
Vào `vite.config.js` đã có sẵn, nhưng đảm bảo:
```js
export default defineConfig({
  server: {
    port: 5173
  },
  preview: {
    port: 4173,
    host: true
  }
})
```

---

## 🔗 Bước 4: Connect Frontend với Backend

### 4.1 Update CORS trong Backend
File `API_Quanly_Sinh_vien/app.py`, thêm frontend URL:

```python
from flask_cors import CORS

# Allow frontend domain
CORS(app, origins=[
    "http://localhost:5173",
    "https://your-frontend.railway.app"  # Thay bằng URL thật
])
```

### 4.2 Redeploy Backend
- Push code mới lên GitHub
- Railway tự động rebuild

---

## ✅ Bước 5: Test Deployment

### 5.1 Kiểm tra Backend
```bash
curl https://your-api.railway.app/api/health
```

### 5.2 Kiểm tra Frontend
Mở browser: `https://your-frontend.railway.app`

### 5.3 Test Full Flow
1. Truy cập frontend
2. Đăng ký tài khoản mới
3. Đăng nhập
4. Test CRUD operations

---

## 📦 Cấu trúc Project trên Railway

```
Railway Project: Student Management
├── 📱 Frontend Service (Node.js)
│   ├── Root: Fontend_Quan_Ly_Sinh_Vien/
│   ├── Port: 4173
│   └── URL: https://your-frontend.railway.app
│
├── 🔧 Backend Service (Python/Flask)
│   ├── Root: API_Quanly_Sinh_vien/
│   ├── Port: 5000
│   └── URL: https://your-api.railway.app
│
└── 🗄️ MySQL Database
    ├── Auto-managed by Railway
    └── Connection via DATABASE_URL
```

---

## 💰 Chi phí

### Free Tier (Starter Plan)
- ✅ $5 credit/tháng
- ✅ 500 hours execution/tháng
- ✅ 1GB RAM
- ✅ Unlimited bandwidth
- ✅ Custom domains

**Đủ cho development và demo!**

### Pro Plan ($20/tháng)
- Nếu cần scale lên production

---

## 🐛 Troubleshooting

### Lỗi: Module not found
```bash
# Đảm bảo requirements.txt đầy đủ
cd API_Quanly_Sinh_vien
pip freeze > requirements.txt
git add requirements.txt
git commit -m "Update requirements"
git push
```

### Lỗi: Database connection failed
- Kiểm tra `DATABASE_URL` variable
- Đảm bảo dùng `${{MySQL.DATABASE_URL}}`

### Lỗi: CORS
- Thêm frontend URL vào CORS config
- Redeploy backend

### Lỗi: Frontend không kết nối API
- Kiểm tra `VITE_API_BASE` environment variable
- Đảm bảo có `/api` ở cuối
- Rebuild frontend

---

## 🔄 Update Code

Mỗi khi bạn update code:

```bash
git add .
git commit -m "Update features"
git push
```

Railway tự động:
1. Detect changes
2. Rebuild
3. Redeploy
4. Zero downtime!

---

## 🎉 Kết quả

Sau khi deploy xong, bạn có:
- ✅ **Frontend**: Beautiful UI với 3D effects
- ✅ **Backend**: RESTful API với JWT auth
- ✅ **Database**: MySQL managed by Railway
- ✅ **HTTPS**: Auto SSL certificate
- ✅ **Custom Domain**: Có thể add domain riêng

**Ứng dụng production-ready!** 🚀✨

---

## 📚 Tài liệu Railway

- Docs: https://docs.railway.app
- Templates: https://railway.app/templates
- Community: https://discord.gg/railway

---

## 🌟 Tips

1. **Monitoring**: Railway có built-in metrics
2. **Logs**: Xem real-time logs trong Railway dashboard
3. **Environment**: Dùng Railway Variables, không commit `.env`
4. **Backups**: Railway tự động backup database
5. **Scaling**: Dễ dàng scale horizontal/vertical

**Enjoy your deployed app!** 🎊🚂✨

