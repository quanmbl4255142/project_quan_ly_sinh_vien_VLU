# 🚀 Hướng dẫn chạy Development (Không cần Docker)

## Yêu cầu
- ✅ Python 3.11+ đã cài
- ✅ Node.js 18+ đã cài
- ✅ MySQL đã cài (hoặc dùng XAMPP/WAMP)

---

## Bước 1: Setup MySQL Database

### Cách 1: MySQL standalone
```sql
-- Mở MySQL Command Line hoặc MySQL Workbench
CREATE DATABASE student_project_management;
```

### Cách 2: XAMPP/WAMP
1. Mở XAMPP Control Panel
2. Start MySQL
3. Mở phpMyAdmin (http://localhost/phpmyadmin)
4. Tạo database: `student_project_management`

---

## Bước 2: Chạy Backend (API)

```powershell
# Mở PowerShell Terminal 1
cd D:\python\Project_Quan_ly_Sinh_Vien\API_Quanly_Sinh_vien

# Activate venv
.\venv\Scripts\Activate.ps1

# Chạy API
python app.py
```

✅ Backend sẽ chạy tại: **http://localhost:5000**

---

## Bước 3: Chạy Frontend

```powershell
# Mở PowerShell Terminal 2
cd D:\python\Project_Quan_ly_Sinh_Vien\Fontend_Quan_Ly_Sinh_Vien

# Cài dependencies (lần đầu)
npm install

# Chạy dev server
npm run dev
```

✅ Frontend sẽ chạy tại: **http://localhost:5173**

---

## Bước 4: Truy cập ứng dụng

1. Mở trình duyệt: **http://localhost:5173**
2. Đăng ký tài khoản mới
3. Đăng nhập và sử dụng!

---

## ⚠️ Troubleshooting

### Lỗi: MySQL connection failed
- Kiểm tra MySQL đang chạy
- Kiểm tra file `.env` trong `API_Quanly_Sinh_vien`:
  ```env
  DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost/student_project_management
  ```

### Lỗi: Port 5000 đã được sử dụng
- Đóng process đang dùng port 5000
- Hoặc đổi port trong `app.py`:
  ```python
  app.run(debug=True, port=5001)
  ```

### Lỗi: CORS
- Backend đã config CORS, nhưng nếu gặp lỗi, kiểm tra `app.py` có dòng:
  ```python
  CORS(app)
  ```

---

## 🎨 Giao diện đã có:

- ✅ **Dashboard** - Trang chủ với stats cards 3D
- ✅ **Students** - Quản lý sinh viên (CRUD) với glassmorphism
- ✅ **Projects** - Quản lý dự án (CRUD) với 3D effects
- ✅ **Teams** - Quản lý nhóm + members
- ✅ **Submissions** - Nộp bài + review + evaluation
- ✅ **Profile** - Xem/sửa thông tin + đổi mật khẩu

**Mọi thứ đã đẹp với TailwindCSS 3D effects!** 🎉

---

## 📝 Notes

- Development mode nhanh hơn Docker
- Hot reload tự động khi sửa code
- Dễ debug hơn
- Không cần pull Docker images

**Enjoy coding!** 🚀✨

