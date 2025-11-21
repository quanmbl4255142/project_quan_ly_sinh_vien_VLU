# Tóm tắt: Lưu trữ file trên Railway

## 📍 Vị trí lưu trữ file hiện tại

**Trên Railway, file được lưu tại:**
- **Đường dẫn trong container**: `/app/uploads/`
  - Projects: `/app/uploads/projects/`
  - Submissions: `/app/uploads/submissions/`
- **Database**: Chỉ lưu đường dẫn tương đối (ví dụ: `/uploads/projects/abc123.pdf`)

## ⚠️ Vấn đề

**Nếu KHÔNG sử dụng Railway Volumes:**
- File sẽ bị mất khi container restart
- File sẽ bị mất khi redeploy
- File chỉ tồn tại trong container tạm thời

## ✅ Giải pháp: Railway Volumes

### Cách thiết lập nhanh:

1. **Vào Railway Dashboard** → Backend service → **Volumes** tab
2. **Click "+ New Volume"**
3. **Cấu hình:**
   - Name: `uploads`
   - Mount Path: `/app/uploads`
   - Size: `5GB` (hoặc tùy nhu cầu)
4. **Click "Create"**
5. **Set biến môi trường:**
   - Key: `UPLOAD_FOLDER`
   - Value: `/app/uploads`
6. **Redeploy service**

### Kết quả:
- ✅ File được lưu vĩnh viễn
- ✅ File không bị mất khi restart/redeploy
- ✅ File có thể truy cập từ bất kỳ container nào mount cùng volume

## 📝 Code đã được cập nhật

1. ✅ `utils/file_upload.py` - Utility functions để xử lý upload/delete file
2. ✅ `routes/project.py` - Hỗ trợ upload file thực tế cho project documents
3. ✅ `routes/submission.py` - Hỗ trợ upload file thực tế cho submissions
4. ✅ `app.py` - Tự động tạo thư mục uploads khi khởi động
5. ✅ `Dockerfile` - Tạo thư mục uploads trong image

## 🔗 Xem hướng dẫn chi tiết

Xem file `RAILWAY_VOLUMES_GUIDE.md` để biết:
- Hướng dẫn chi tiết từng bước
- Cách cập nhật frontend để upload file
- Troubleshooting
- Best practices

