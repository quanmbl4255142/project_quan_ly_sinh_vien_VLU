# Hướng dẫn Seed Dữ liệu Giả

Script này sẽ tạo dữ liệu giả cho tất cả các trang trong hệ thống quản lý sinh viên.

## Dữ liệu sẽ được tạo:

- **Users**: 1 admin, 3 teachers, 8 students
- **Students**: 8 hồ sơ sinh viên với thông tin đầy đủ
- **Teachers**: 3 giáo viên với thông tin đầy đủ
- **Projects**: 6 dự án với các mức độ khác nhau
- **Teams**: 4 nhóm dự án
- **Submissions**: 7 bài nộp với các trạng thái khác nhau

## Cách chạy:

### Trên Local (Development):

```bash
cd API_Quanly_Sinh_vien
python seed_data.py
```

### Trên Railway (Production):

1. **Cách 1: Chạy qua Railway CLI**
   ```bash
   railway run python seed_data.py
   ```

2. **Cách 2: Chạy qua Railway Shell**
   - Vào Railway Dashboard
   - Chọn service Backend
   - Vào tab "Deployments" → "Shell"
   - Chạy: `python seed_data.py`

3. **Cách 3: Thêm vào Procfile (tùy chọn)**
   - Thêm command seed vào Procfile để chạy tự động khi deploy

## Thông tin đăng nhập mặc định:

### Admin:
- Username: `admin`
- Password: `admin123`

### Teachers:
- Username: `teacher1`, `teacher2`, `teacher3`
- Password: `teacher123`

### Students:
- Username: `student1`, `student2`, ..., `student8`
- Password: `student123`

## Lưu ý:

- Script sẽ **XÓA** tất cả dữ liệu cũ (trừ admin user) trước khi tạo dữ liệu mới
- Nếu muốn giữ dữ liệu cũ, comment phần xóa dữ liệu trong script
- Đảm bảo database đã được tạo và kết nối thành công trước khi chạy
- Script sẽ tự động commit tất cả dữ liệu vào database

## Kiểm tra kết quả:

Sau khi chạy script, bạn có thể:
1. Đăng nhập vào hệ thống với các tài khoản trên
2. Kiểm tra các trang:
   - **Students**: Sẽ có 8 sinh viên
   - **Projects**: Sẽ có 6 dự án
   - **Teams**: Sẽ có 4 nhóm
   - **Submissions**: Sẽ có 7 bài nộp

