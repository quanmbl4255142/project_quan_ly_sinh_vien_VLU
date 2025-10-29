# 🔧 Fix Railway Deploy - Hướng dẫn từng bước

## ⚠️ Vấn đề
Railway không biết build gì vì repo có cả Frontend + Backend.

## ✅ Giải pháp
Tạo **2 services riêng**, mỗi service trỏ vào 1 folder.

---

## 🚀 Bước 1: Push code lên GitHub

```bash
git add .
git commit -m "Ready for Railway with nixpacks config"
git push
```

---

## 📱 Bước 2: Deploy Backend API

### 2.1 New Project
1. Vào https://railway.app
2. Click **"New Project"**
3. Chọn **"Deploy from GitHub repo"**
4. Chọn repository của bạn
5. Railway sẽ **BÁO LỖI** → Không sao!

### 2.2 Config Backend Service
1. Click vào service vừa tạo (có thể tên là tên repo)
2. Vào tab **"Settings"**
3. Scroll xuống **"Service"** section
4. **Root Directory**: Nhập `API_Quanly_Sinh_vien` ✏️
5. **Start Command**: Để trống (dùng Procfile)
6. Click **"Deploy"** ở góc trên

### 2.3 Wait for deploy
- Đợi 2-3 phút
- Xem tab **"Deployments"** → Đợi thành công
- Copy **Public Domain** (ví dụ: `your-api-abc123.railway.app`)

---

## 🗄️ Bước 3: Add MySQL Database

### 3.1 Create Database
1. Trong cùng project, click **"New"** (góc trên phải)
2. Chọn **"Database"**
3. Chọn **"Add MySQL"**
4. Đợi Railway tạo database (~30 giây)

### 3.2 Connect Database
Railway tự động tạo connection string. Không cần làm gì!

---

## ⚙️ Bước 4: Config Backend Environment Variables

### 4.1 Add Variables
1. Click vào **API service** (backend)
2. Vào tab **"Variables"**
3. Click **"New Variable"**
4. Add từng biến:

```
FLASK_ENV=production
SECRET_KEY=my-super-secret-key-change-this
JWT_SECRET_KEY=my-jwt-secret-key-change-this
DATABASE_URL=${{MySQL.DATABASE_URL}}
PORT=${{PORT}}
```

**LƯU Ý:** 
- `${{MySQL.DATABASE_URL}}` → Railway tự động thay thế
- `${{PORT}}` → Railway tự động assign port

### 4.2 Save & Redeploy
- Click **"Add"** cho mỗi variable
- Railway tự động redeploy
- Đợi deploy xong

---

## 🎨 Bước 5: Deploy Frontend

### 5.1 Create New Service
1. Trong cùng project, click **"New"**
2. Chọn **"GitHub Repo"**
3. Chọn **CÙNG repository** (same repo as backend)
4. Railway tạo service mới

### 5.2 Config Frontend Service
1. Click vào Frontend service vừa tạo
2. Vào tab **"Settings"**
3. **Root Directory**: Nhập `Fontend_Quan_Ly_Sinh_Vien` ✏️
4. **Build Command**: Để trống (dùng nixpacks.toml)
5. **Start Command**: Để trống (dùng nixpacks.toml)
6. Click **"Deploy"**

### 5.3 Wait for build
- Đợi 3-5 phút (build + install dependencies)
- Copy **Public Domain** (ví dụ: `your-frontend-xyz789.railway.app`)

---

## 🔗 Bước 6: Connect Frontend ↔ Backend

### 6.1 Add Frontend Variable
1. Click vào **Frontend service**
2. Tab **"Variables"**
3. Add:
```
VITE_API_BASE=https://your-api-abc123.railway.app/api
```
**QUAN TRỌNG:** Thay `your-api-abc123` bằng domain thật của backend!

### 6.2 Update Backend CORS
File: `API_Quanly_Sinh_vien/app.py`, line ~14:

```python
CORS(app, origins=[
    "http://localhost:5173",
    "https://your-frontend-xyz789.railway.app"  # Thay domain thật!
])
```

Push lại:
```bash
git add .
git commit -m "Update CORS for Railway"
git push
```

Railway tự động redeploy backend.

---

## ✅ Bước 7: Test

### 7.1 Test Backend
Mở: `https://your-api-abc123.railway.app`

Phải thấy:
```json
{
  "message": "Student Project Management API",
  "version": "1.0.0",
  ...
}
```

### 7.2 Test Frontend
Mở: `https://your-frontend-xyz789.railway.app`

Phải thấy trang login đẹp!

### 7.3 Test Full Flow
1. Đăng ký tài khoản
2. Đăng nhập
3. Test CRUD (Students, Projects, etc.)

---

## 🎉 Done!

Bạn có:
- ✅ Backend API: `https://your-api.railway.app`
- ✅ Frontend: `https://your-frontend.railway.app`
- ✅ MySQL Database: Managed by Railway
- ✅ Auto HTTPS/SSL
- ✅ Auto redeploy khi push code

---

## 🐛 Troubleshooting

### Lỗi: Build failed
- Check tab **"Logs"** trong service
- Đảm bảo Root Directory đúng
- Đảm bảo có `nixpacks.toml` trong folder

### Lỗi: Database connection
- Check variable `DATABASE_URL=${{MySQL.DATABASE_URL}}`
- Đảm bảo MySQL service đang chạy
- Restart backend service

### Lỗi: CORS
- Check `app.py` có add frontend URL
- Redeploy backend sau khi update CORS
- Clear browser cache

### Lỗi: Frontend không connect API
- Check variable `VITE_API_BASE` đúng URL
- Đảm bảo có `/api` ở cuối
- Rebuild frontend

### Check logs
Railway Dashboard → Service → **"Logs"** tab → Real-time logs

---

## 💰 Free Tier Limits

Railway Free:
- $5 credit/month
- ~500 hours execution
- 1GB RAM per service
- 100GB bandwidth

**Đủ cho dev/demo!**

---

## 📚 Reference

- Railway Docs: https://docs.railway.app
- Nixpacks: https://nixpacks.com
- Support: https://discord.gg/railway

**Enjoy!** 🚂✨

