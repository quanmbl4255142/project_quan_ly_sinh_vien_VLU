# Hướng dẫn Upload File

## ✅ Đã cập nhật

Bây giờ bạn có thể **upload file thực tế** thay vì chỉ nhập đường dẫn!

## 📤 Cách sử dụng

### 1. Trên Frontend (Submissions page)

1. Click **"Thêm bài nộp"** hoặc **"Sửa"** một bài nộp
2. Trong form, bạn sẽ thấy:
   - **File đính kèm**: Input để chọn file từ máy tính
   - File được chấp nhận: `.pdf`, `.doc`, `.docx`, `.zip`, `.rar`, `.txt`, `.jpg`, `.png`, `.pptx`, `.xlsx`
3. Chọn file từ máy tính
4. File sẽ tự động:
   - Hiển thị tên file
   - Tự động điền loại file (file_type)
   - Tự động điền kích thước (file_size)
5. Click **"Lưu"** để upload

### 2. File được lưu ở đâu?

**Trên Railway:**
- **Đường dẫn trong container**: `/app/uploads/submissions/`
- **Đường dẫn trong database**: `/uploads/submissions/[tên-file-unique]`

**Ví dụ:**
- File: `bai_nop_1.pdf`
- Được lưu tại: `/app/uploads/submissions/abc123def456.pdf`
- Database lưu: `/uploads/submissions/abc123def456.pdf`

## 🔧 Cách hoạt động

### Frontend → Backend

1. **Frontend**: User chọn file → Tạo `FormData` → Gửi đến API
2. **Backend**: Nhận file → Lưu vào `/app/uploads/submissions/` → Tạo tên file unique
3. **Database**: Lưu đường dẫn tương đối (`/uploads/submissions/...`)

### Code Flow

```
User chọn file
    ↓
handleFileChange() → setSelectedFile(file)
    ↓
User click "Lưu"
    ↓
handleSubmit() → Tạo FormData với file
    ↓
createSubmission(FormData) → API request
    ↓
Backend: save_uploaded_file() → Lưu file vào disk
    ↓
Backend: Lưu file_path vào database
    ↓
✅ Hoàn thành!
```

## 📁 Cấu trúc thư mục

```
/app/uploads/                    (Railway Volume mount point)
├── projects/                    (Tài liệu dự án)
│   └── [unique-id].pdf
└── submissions/                 (Bài nộp)
    └── [unique-id].pdf
```

## ⚙️ Cấu hình Railway

Để file được lưu vĩnh viễn, cần tạo **Railway Volume**:

1. Vào Railway Dashboard → Backend service → **Volumes**
2. Click **"+ New Volume"**
3. Cấu hình:
   - Name: `uploads`
   - Mount Path: `/app/uploads`
   - Size: `5GB` (hoặc tùy nhu cầu)
4. Set biến môi trường:
   - Key: `UPLOAD_FOLDER`
   - Value: `/app/uploads`
5. Redeploy

Xem chi tiết: `RAILWAY_VOLUMES_GUIDE.md`

## 🔍 Kiểm tra file đã upload

### Trên Frontend
- Xem danh sách submissions → Click vào submission → Xem `file_path`

### Trên Backend (qua API)
```bash
GET /api/submissions/submissions/{id}
```

Response sẽ có:
```json
{
  "submission": {
    "file_path": "/uploads/submissions/abc123.pdf",
    "file_type": "pdf",
    "file_size": 102400
  }
}
```

### Download file
```
GET /api/submissions/submissions/{filepath}
```

Ví dụ: `/api/submissions/submissions/submissions/abc123.pdf`

## ⚠️ Lưu ý

1. **Kích thước file tối đa**: 16MB (có thể thay đổi trong `app.py`)
2. **File types được phép**: Xem trong `utils/file_upload.py` → `ALLOWED_EXTENSIONS`
3. **Tên file**: Tự động tạo unique ID để tránh trùng tên
4. **File cũ**: Khi update submission với file mới, file cũ sẽ tự động bị xóa

## 🐛 Troubleshooting

### File không upload được
- Kiểm tra kích thước file (< 16MB)
- Kiểm tra loại file có trong danh sách cho phép
- Xem console log để biết lỗi cụ thể

### File bị mất sau khi restart
- Đảm bảo đã tạo Railway Volume
- Kiểm tra biến môi trường `UPLOAD_FOLDER` đã set chưa

### Không thấy file input
- Clear cache và reload trang
- Kiểm tra code đã được deploy chưa

