# Hướng dẫn cấu hình Railway

## Vấn đề đã được sửa

Frontend trên Railway không kết nối được với Backend vì:
1. **CORS**: Backend cần cho phép origin của frontend
2. **API_BASE**: Frontend cần biết URL của backend (không thể hardcode vì URL thay đổi trên Railway)

## Giải pháp đã triển khai

### 1. Backend (API_Quanly_Sinh_vien)

- ✅ CORS đã được cấu hình để cho phép frontend origin
- ✅ Có thể set `FRONTEND_URL` trong Railway để chỉ định origin cụ thể (nếu không set sẽ cho phép tất cả)

### 2. Frontend (Fontend_Quan_Ly_Sinh_Vien)

- ✅ Runtime config: Frontend sẽ đọc `API_BASE` từ biến môi trường khi container khởi động
- ✅ `entrypoint.sh` sẽ inject `API_BASE` vào `index.html` trước khi nginx start

## Cách cấu hình trên Railway

### Bước 1: Lấy URL của Backend

1. Vào service **Backend** trên Railway
2. Vào tab **Settings** → tìm **Domains** hoặc **Public URL**
3. Copy URL (ví dụ: `https://backend-production-xxxx.up.railway.app`)
4. Thêm `/api` vào cuối: `https://backend-production-xxxx.up.railway.app/api`

### Bước 2: Set biến môi trường cho Frontend service

1. Vào service **Frontend** trên Railway
2. Vào tab **Variables**
3. Click **+ New Variable**
4. Thêm biến sau:
   - **Key**: `API_BASE`
   - **Value**: URL backend + `/api` (ví dụ: `https://backend-production-xxxx.up.railway.app/api`)

### Bước 3: Set biến môi trường cho Backend service (tùy chọn)

Nếu muốn giới hạn CORS chỉ cho frontend domain:

1. Vào service **Backend** trên Railway
2. Vào tab **Variables**
3. Click **+ New Variable**
4. Thêm biến sau:
   - **Key**: `FRONTEND_URL`
   - **Value**: URL frontend (ví dụ: `https://fontend-production-6b90.up.railway.app`)

### Bước 4: Redeploy

Sau khi set biến môi trường, Railway sẽ tự động redeploy. Nếu không:
- Vào tab **Deployments**
- Click **Redeploy** cho cả Frontend và Backend

## Kiểm tra

1. Mở browser console trên frontend
2. Xem log `[API_BASE]` - phải hiển thị URL backend đúng
3. Thử login hoặc gọi API
4. Kiểm tra Network tab trong DevTools để xem request có đến đúng backend URL không

## Troubleshooting

### Frontend vẫn không kết nối được

1. **Kiểm tra biến môi trường**:
   - Vào Frontend service → Variables → đảm bảo `API_BASE` đã được set đúng
   - URL phải có `/api` ở cuối

2. **Kiểm tra logs**:
   - Frontend logs: Xem entrypoint.sh có chạy không
   - Backend logs: Xem có request từ frontend không

3. **Kiểm tra CORS**:
   - Mở browser console → Network tab
   - Xem có lỗi CORS không
   - Nếu có, thêm `FRONTEND_URL` vào Backend service

4. **Kiểm tra URL backend**:
   - Thử truy cập trực tiếp URL backend: `https://backend-url/api/`
   - Phải thấy JSON response với endpoints

### Backend không nhận request

1. Kiểm tra backend đã start chưa (xem logs)
2. Kiểm tra PORT được set đúng (Railway tự động set)
3. Kiểm tra database connection (xem logs có lỗi database không)

