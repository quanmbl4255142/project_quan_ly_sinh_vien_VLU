# 🚂 Railway Deploy - Quick Start (5 phút)

## Bước 1: Push code lên GitHub (2 phút)

```bash
git init
git add .
git commit -m "Student Management System - Ready for Railway"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

## Bước 2: Deploy trên Railway (3 phút)

### 2.1 Tạo account
1. Vào: https://railway.app
2. Sign up with GitHub
3. Verify email

### 2.2 Deploy Backend API
1. Click **"New Project"**
2. Chọn **"Deploy from GitHub repo"**
3. Chọn repo vừa push
4. Railway detect Python → Click **"Deploy"**
5. Vào **Settings**:
   - **Root Directory**: `API_Quanly_Sinh_vien`
   - **Start Command**: `python app.py`

### 2.3 Add MySQL Database
1. Click **"New"** → **"Database"** → **"MySQL"**
2. Đợi Railway tạo database

### 2.4 Config Backend Variables
Click vào API service → **"Variables"** → Add:
```
FLASK_ENV=production
SECRET_KEY=super-secret-key-change-this-in-production
JWT_SECRET_KEY=jwt-secret-key-change-this-too
DATABASE_URL=${{MySQL.DATABASE_URL}}
PORT=5000
```

**Copy API URL** (ví dụ: `https://xxx.railway.app`)

### 2.5 Deploy Frontend
1. Click **"New"** trong project
2. Chọn **"GitHub Repo"** (same repo)
3. Vào **Settings**:
   - **Root Directory**: `Fontend_Quan_Ly_Sinh_Vien`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run preview`

### 2.6 Config Frontend Variables
Click **"Variables"** → Add:
```
VITE_API_BASE=https://YOUR-API-URL.railway.app/api
```
*Thay YOUR-API-URL bằng URL thật của backend!*

---

## Bước 3: Update CORS (30 giây)

File `API_Quanly_Sinh_vien/app.py`, line 14:
```python
CORS(app, origins=[
    "http://localhost:5173",
    "https://YOUR-FRONTEND-URL.railway.app"
])
```

Push lại:
```bash
git add .
git commit -m "Update CORS"
git push
```

---

## ✅ Done!

- 🎨 **Frontend**: `https://your-frontend.railway.app`
- 🔧 **Backend**: `https://your-api.railway.app`
- 🗄️ **Database**: Auto-managed

**Test ngay:**
1. Mở frontend URL
2. Đăng ký account
3. Đăng nhập
4. Enjoy! 🎉

---

## 💰 Cost: FREE

Railway Free Tier:
- $5 credit/tháng
- 500 execution hours
- Đủ cho development/demo

---

## 🐛 Nếu có lỗi

**Xem logs:**
- Railway Dashboard → Service → **"Logs"** tab

**Common issues:**
- CORS: Thêm frontend URL vào CORS config
- Database: Check DATABASE_URL variable
- Build: Check requirements.txt và package.json

**Chi tiết:** Xem file `RAILWAY_DEPLOY.md`

---

**Enjoy your deployed app!** 🚀✨

