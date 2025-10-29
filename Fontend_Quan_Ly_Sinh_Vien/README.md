# Frontend - Quản lý dự án sinh viên

Ứng dụng frontend React + Vite với TailwindCSS, kết nối đầy đủ tới backend API Flask.

## 🚀 Cài đặt

Mở PowerShell trong thư mục `Fontend_Quan_Ly_Sinh_Vien` và chạy:

```powershell
# Cài dependencies
npm install

# Chạy dev server (mở http://localhost:5173)
npm run dev

# Build production
npm run build
```

> **Yêu cầu:** Node.js 18+ đã được cài đặt.

## ⚙️ Cấu hình

Frontend đọc biến môi trường `VITE_API_BASE` để biết địa chỉ backend API. Mặc định: `http://localhost:5000/api`.

Tạo file `.env` (hoặc `.env.local`) nếu muốn thay đổi:

```env
VITE_API_BASE=http://localhost:5000/api
```

## ✨ Tính năng đã hoàn thiện

### 1. **Authentication**
- ✅ Đăng ký tài khoản (student/teacher/admin)
- ✅ Đăng nhập (JWT token)
- ✅ Xem profile
- ✅ Chỉnh sửa profile
- ✅ Đổi mật khẩu
- ✅ Đăng xuất

### 2. **Quản lý sinh viên (Students)**
- ✅ Xem danh sách sinh viên
- ✅ Thêm sinh viên mới
- ✅ Chỉnh sửa thông tin sinh viên
- ✅ Xóa sinh viên
- ✅ Hiển thị thông tin: mã SV, họ tên, ngành, GPA, trạng thái...

### 3. **Quản lý dự án (Projects)**
- ✅ Xem danh sách dự án
- ✅ Thêm dự án mới
- ✅ Chỉnh sửa dự án
- ✅ Xóa dự án
- ✅ Chọn giáo viên hướng dẫn
- ✅ Thiết lập mức độ, công nghệ, deadline, semester...

### 4. **Quản lý nhóm (Teams)**
- ✅ Xem danh sách nhóm
- ✅ Tạo nhóm mới với dự án và trưởng nhóm
- ✅ Chỉnh sửa thông tin nhóm
- ✅ Xóa nhóm
- ✅ Thêm/xóa thành viên trong nhóm

### 5. **Quản lý bài nộp & đánh giá (Submissions & Evaluations)**
- ✅ Xem danh sách bài nộp
- ✅ Tạo bài nộp mới (team/individual, nhiều loại: proposal, report, code...)
- ✅ Chỉnh sửa/xóa bài nộp
- ✅ Review bài nộp (approve/reject/revision)
- ✅ Đánh giá bài nộp (technical_quality, creativity, presentation, teamwork, timeliness, documentation)

### 6. **Dashboard**
- ✅ Trang chủ sau khi đăng nhập
- ✅ Link nhanh tới các module chính

### 7. **UI/UX**
- ✅ Responsive design với TailwindCSS
- ✅ Modal forms cho CRUD operations
- ✅ Loading states
- ✅ Error handling
- ✅ Success/error messages

## 📁 Cấu trúc thư mục

```
src/
├── api.js                 # API client với tất cả endpoints
├── App.jsx                # Router chính
├── main.jsx               # Entry point
├── styles.css             # Tailwind + custom styles
├── components/
│   └── Nav.jsx            # Navigation bar
└── pages/
    ├── Login.jsx          # Đăng nhập
    ├── Register.jsx       # Đăng ký
    ├── Dashboard.jsx      # Trang chủ
    ├── Students.jsx       # Quản lý sinh viên (CRUD)
    ├── Projects.jsx       # Quản lý dự án (CRUD)
    ├── Teams.jsx          # Quản lý nhóm (CRUD + members)
    ├── Submissions.jsx    # Quản lý bài nộp + review + evaluation
    └── Profile.jsx        # Profile + đổi mật khẩu
```

## 🔌 API Endpoints được sử dụng

Frontend kết nối đầy đủ với backend API:

### Auth
- `POST /auth/register` - Đăng ký
- `POST /auth/login` - Đăng nhập
- `GET /auth/profile` - Xem profile
- `PUT /auth/profile` - Cập nhật profile
- `POST /auth/change-password` - Đổi mật khẩu

### Students
- `GET /students/` - Danh sách (support pagination, search)
- `GET /students/:id` - Chi tiết
- `POST /students/` - Tạo mới
- `PUT /students/:id` - Cập nhật
- `DELETE /students/:id` - Xóa

### Teachers
- `GET /teachers/` - Danh sách
- `GET /teachers/:id` - Chi tiết
- `POST /teachers/` - Tạo mới
- `PUT /teachers/:id` - Cập nhật
- `DELETE /teachers/:id` - Xóa

### Projects
- `GET /projects/` - Danh sách
- `GET /projects/:id` - Chi tiết
- `POST /projects/` - Tạo mới
- `PUT /projects/:id` - Cập nhật
- `DELETE /projects/:id` - Xóa

### Teams
- `GET /teams/` - Danh sách
- `GET /teams/:id` - Chi tiết
- `POST /teams/` - Tạo mới
- `PUT /teams/:id` - Cập nhật
- `DELETE /teams/:id` - Xóa
- `POST /teams/:id/members` - Thêm thành viên
- `DELETE /teams/:id/members/:memberId` - Xóa thành viên

### Submissions
- `GET /submissions/submissions` - Danh sách
- `GET /submissions/submissions/:id` - Chi tiết
- `POST /submissions/submissions` - Tạo mới
- `PUT /submissions/submissions/:id` - Cập nhật
- `DELETE /submissions/submissions/:id` - Xóa
- `POST /submissions/submissions/:id/review` - Review

### Evaluations
- `GET /submissions/evaluations` - Danh sách
- `POST /submissions/evaluations` - Tạo đánh giá
- `PUT /submissions/evaluations/:id` - Cập nhật
- `DELETE /submissions/evaluations/:id` - Xóa

## 🎨 Công nghệ sử dụng

- **React 18** - UI framework
- **Vite 5** - Build tool
- **React Router 6** - Routing
- **TailwindCSS 3** - Styling
- **Fetch API** - HTTP client
- **JWT** - Authentication

## 📝 Hướng dẫn sử dụng

1. **Khởi động backend API** (port 5000)
   ```bash
   cd API_Quanly_Sinh_vien
   python app.py
   ```

2. **Khởi động frontend** (port 5173)
   ```bash
   cd Fontend_Quan_Ly_Sinh_Vien
   npm run dev
   ```

3. **Truy cập** `http://localhost:5173`

4. **Đăng ký tài khoản** hoặc đăng nhập với tài khoản đã có

5. **Sử dụng các tính năng:**
   - Dashboard: Xem tổng quan
   - Students: Quản lý sinh viên
   - Projects: Quản lý dự án
   - Teams: Quản lý nhóm
   - Submissions: Quản lý bài nộp và đánh giá
   - Profile: Xem/sửa thông tin cá nhân

## 🔐 Authentication Flow

1. User đăng ký hoặc đăng nhập
2. Backend trả về JWT token
3. Frontend lưu token vào `localStorage`
4. Mọi request sau đó gửi header: `Authorization: Bearer <token>`
5. Protected routes kiểm tra token trước khi render

## 🐛 Debug

Nếu gặp lỗi CORS:
- Kiểm tra backend đã bật CORS (`flask-cors`)
- Kiểm tra `VITE_API_BASE` đúng địa chỉ

Nếu không kết nối được API:
- Kiểm tra backend đang chạy ở port 5000
- Mở DevTools > Network để xem request/response

## 🚀 Deploy Production

```bash
# Build
npm run build

# Dist folder sẽ có static files
# Deploy với Nginx, Vercel, Netlify, etc.
```

Nhớ cập nhật `VITE_API_BASE` cho production URL.

## 📄 License

MIT

---

**Developed with ❤️ using React + TailwindCSS**
