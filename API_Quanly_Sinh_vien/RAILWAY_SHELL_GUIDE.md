# Hướng dẫn chạy Seed Script trên Railway

## Cách 1: Qua Railway Dashboard (Dễ nhất) ⭐

### Bước 1: Truy cập Railway Dashboard
1. Mở trình duyệt và vào: https://railway.app
2. Đăng nhập vào tài khoản của bạn

### Bước 2: Tìm service Backend
1. Chọn **Project** của bạn
2. Tìm và click vào service **Backend** (service chứa API_Quanly_Sinh_vien)

### Bước 3: Mở Shell
Có 2 cách để mở Shell:

**Cách A: Qua tab Deployments**
1. Click vào tab **"Deployments"** ở menu trên
2. Tìm deployment mới nhất (đang chạy)
3. Ở góc trên bên phải, tìm nút **"Shell"** hoặc **"Open Shell"**
4. Click vào nút đó

**Cách B: Qua menu Settings**
1. Click vào tab **"Settings"**
2. Scroll xuống phần **"Shell"** hoặc **"Console"**
3. Click **"Open Shell"**

### Bước 4: Chạy script
Khi Shell mở ra (terminal trong trình duyệt), gõ các lệnh sau:

```bash
# Di chuyển vào thư mục API (nếu cần)
cd API_Quanly_Sinh_vien

# Chạy script seed
python seed_data.py
```

### Bước 5: Kiểm tra kết quả
Bạn sẽ thấy output tương tự:
```
✅ Đã tạo 12 users
✅ Đã tạo 3 teachers
✅ Đã tạo 8 students
...
🎉 Hoàn thành seed dữ liệu!
```

---

## Cách 2: Qua Railway CLI (Nâng cao)

### Bước 1: Cài Railway CLI
```bash
# Windows (PowerShell)
iwr https://railway.app/install.ps1 | iex

# Mac/Linux
curl -fsSL https://railway.app/install.sh | sh
```

### Bước 2: Đăng nhập
```bash
railway login
```

### Bước 3: Link project
```bash
# Di chuyển vào thư mục project
cd D:\python\project_python_nang_cao\project_quan_ly_sinh_vien_VLU

# Link với Railway project
railway link
```

### Bước 4: Chạy script
```bash
# Chạy script trên Railway
cd API_Quanly_Sinh_vien
railway run python seed_data.py
```

---

## Cách 3: Thêm vào Procfile (Tự động chạy khi deploy)

Nếu muốn script tự động chạy mỗi khi deploy:

1. Mở file `API_Quanly_Sinh_vien/Procfile`
2. Thêm dòng sau (NHƯNG CẨN THẬN - sẽ chạy mỗi lần deploy):
```
seed: python seed_data.py
```

**⚠️ Lưu ý:** Cách này sẽ chạy script mỗi lần deploy, có thể xóa dữ liệu cũ. Chỉ dùng nếu chắc chắn.

---

## Troubleshooting

### Không tìm thấy nút Shell?
- Đảm bảo service Backend đang chạy (status: Active)
- Thử refresh trang
- Kiểm tra xem bạn có quyền truy cập service không

### Lỗi "python: command not found"?
- Thử dùng `python3` thay vì `python`:
  ```bash
  python3 seed_data.py
  ```

### Lỗi "No module named 'app'"?
- Đảm bảo đang ở đúng thư mục:
  ```bash
  cd API_Quanly_Sinh_vien
  pwd  # Kiểm tra đường dẫn hiện tại
  ls   # Xem có file seed_data.py không
  ```

### Lỗi kết nối database?
- Kiểm tra biến môi trường `DATABASE_URL` đã được set chưa
- Vào Backend service → Variables → kiểm tra `DATABASE_URL`

---

## Sau khi chạy xong

1. Kiểm tra dữ liệu đã được tạo:
   - Đăng nhập vào frontend
   - Kiểm tra các trang: Students, Projects, Teams, Submissions
   - Phải thấy dữ liệu mới

2. Thông tin đăng nhập:
   - Admin: `admin` / `admin123`
   - Teacher: `teacher1` / `teacher123`
   - Student: `student1` / `student123`

