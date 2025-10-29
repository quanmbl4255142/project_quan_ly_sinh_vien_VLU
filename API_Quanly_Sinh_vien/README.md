# Student Project Management API

Hệ thống API quản lý dự án sinh viên được xây dựng bằng Flask với MySQL database.

## 🚀 Tính năng chính

- **Quản lý người dùng**: Đăng ký, đăng nhập, phân quyền (Student, Teacher, Admin)
- **Quản lý sinh viên**: CRUD đầy đủ, tìm kiếm, lọc theo chuyên ngành
- **Quản lý giảng viên**: CRUD đầy đủ, quản lý theo khoa
- **Quản lý dự án**: Tạo dự án, phân công giảng viên hướng dẫn, quản lý tài liệu
- **Quản lý nhóm**: Tạo nhóm, thêm/xóa thành viên, phân quyền leader/member
- **Hệ thống nộp bài**: Nộp bài cá nhân/nhóm, review, feedback
- **Hệ thống đánh giá**: Đánh giá đa tiêu chí, tính điểm tự động
- **Thống kê báo cáo**: Thống kê sinh viên, giảng viên, dự án

## 📋 Yêu cầu hệ thống

- Python 3.8+
- MySQL 8.0+
- pip (Python package manager)

## 🛠️ Cài đặt

### 1. Clone repository
```bash
git clone <repository-url>
cd API_Quanly_Sinh_vien
```

### 2. Tạo môi trường ảo
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### 3. Cài đặt dependencies
```bash
pip install -r requirements.txt
```

### 4. Cấu hình MySQL
```sql
-- Tạo database
CREATE DATABASE student_project_management;

-- Tạo user (tùy chọn)
CREATE USER 'api_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON student_project_management.* TO 'api_user'@'localhost';
FLUSH PRIVILEGES;
```

### 5. Cấu hình environment variables
Tạo file `.env` từ `.env.example`:
```bash
# Windows
copy .env.example .env

# Linux/Mac
cp .env.example .env
```

Cập nhật các giá trị trong file `.env`:
```env
SECRET_KEY=your-secret-key-here
DATABASE_URL=mysql+pymysql://root:password@localhost/student_project_management
JWT_SECRET_KEY=your-jwt-secret-key-here
```

### 6. Chạy ứng dụng
```bash
python app.py
```

Ứng dụng sẽ chạy tại: `http://localhost:5000`

## 📚 API Documentation

Xem file `API_Documentation.md` để biết chi tiết về tất cả các endpoints.

### Các nhóm API chính:

1. **Authentication** (`/api/auth`)
   - POST `/register` - Đăng ký tài khoản
   - POST `/login` - Đăng nhập
   - GET `/profile` - Lấy thông tin profile
   - PUT `/profile` - Cập nhật profile
   - POST `/change-password` - Đổi mật khẩu

2. **Student Management** (`/api/students`)
   - GET `/` - Lấy danh sách sinh viên
   - POST `/` - Tạo sinh viên mới
   - GET `/{id}` - Lấy thông tin sinh viên
   - PUT `/{id}` - Cập nhật sinh viên
   - DELETE `/{id}` - Xóa sinh viên
   - GET `/{id}/teams` - Lấy nhóm của sinh viên
   - GET `/{id}/projects` - Lấy dự án của sinh viên
   - GET `/statistics` - Thống kê sinh viên

3. **Teacher Management** (`/api/teachers`)
   - Tương tự như Student Management
   - GET `/{id}/projects` - Lấy dự án giảng viên hướng dẫn
   - GET `/{id}/evaluations` - Lấy đánh giá của giảng viên

4. **Project Management** (`/api/projects`)
   - CRUD operations cho dự án
   - GET `/{id}/teams` - Lấy nhóm tham gia dự án
   - POST `/{id}/documents` - Upload tài liệu dự án
   - GET `/{id}/documents` - Lấy tài liệu dự án

5. **Team Management** (`/api/teams`)
   - CRUD operations cho nhóm
   - POST `/{id}/members` - Thêm thành viên
   - DELETE `/{id}/members/{member_id}` - Xóa thành viên
   - PUT `/{id}/members/{member_id}/role` - Thay đổi vai trò

6. **Submission & Evaluation** (`/api/submissions`)
   - CRUD operations cho bài nộp
   - POST `/submissions/{id}/review` - Review bài nộp
   - CRUD operations cho đánh giá
   - Tính điểm tự động theo nhiều tiêu chí

## 🧪 Testing API

### 🔗 Base URL
```
http://localhost:5000/api
```

### 📋 Danh sách đầy đủ các endpoints:

#### 1. **Authentication** (`/api/auth`)
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập  
- `GET /api/auth/profile` - Lấy thông tin profile
- `PUT /api/auth/profile` - Cập nhật profile
- `POST /api/auth/change-password` - Đổi mật khẩu

#### 2. **Student Management** (`/api/students`)
- `GET /api/students/` - Lấy danh sách sinh viên
- `POST /api/students/` - Tạo sinh viên mới
- `GET /api/students/{id}` - Lấy thông tin sinh viên
- `PUT /api/students/{id}` - Cập nhật sinh viên
- `DELETE /api/students/{id}` - Xóa sinh viên
- `GET /api/students/{id}/teams` - Lấy nhóm của sinh viên
- `GET /api/students/{id}/projects` - Lấy dự án của sinh viên
- `GET /api/students/statistics` - Thống kê sinh viên

#### 3. **Teacher Management** (`/api/teachers`)
- `GET /api/teachers/` - Lấy danh sách giảng viên
- `POST /api/teachers/` - Tạo giảng viên mới
- `GET /api/teachers/{id}` - Lấy thông tin giảng viên
- `PUT /api/teachers/{id}` - Cập nhật giảng viên
- `DELETE /api/teachers/{id}` - Xóa giảng viên
- `GET /api/teachers/{id}/projects` - Lấy dự án giảng viên hướng dẫn
- `GET /api/teachers/{id}/evaluations` - Lấy đánh giá của giảng viên
- `GET /api/teachers/statistics` - Thống kê giảng viên

#### 4. **Project Management** (`/api/projects`)
- `GET /api/projects/` - Lấy danh sách dự án
- `POST /api/projects/` - Tạo dự án mới
- `GET /api/projects/{id}` - Lấy thông tin dự án
- `PUT /api/projects/{id}` - Cập nhật dự án
- `DELETE /api/projects/{id}` - Xóa dự án
- `GET /api/projects/{id}/teams` - Lấy nhóm tham gia dự án
- `GET /api/projects/{id}/documents` - Lấy tài liệu dự án
- `POST /api/projects/{id}/documents` - Upload tài liệu dự án
- `GET /api/projects/statistics` - Thống kê dự án

#### 5. **Team Management** (`/api/teams`)
- `GET /api/teams/` - Lấy danh sách nhóm
- `POST /api/teams/` - Tạo nhóm mới
- `GET /api/teams/{id}` - Lấy thông tin nhóm
- `PUT /api/teams/{id}` - Cập nhật nhóm
- `DELETE /api/teams/{id}` - Xóa nhóm
- `POST /api/teams/{id}/members` - Thêm thành viên
- `DELETE /api/teams/{id}/members/{member_id}` - Xóa thành viên
- `PUT /api/teams/{id}/members/{member_id}/role` - Thay đổi vai trò

#### 6. **Submission & Evaluation** (`/api/submissions`)
- `GET /api/submissions/submissions` - Lấy danh sách bài nộp
- `POST /api/submissions/submissions` - Tạo bài nộp mới
- `GET /api/submissions/submissions/{id}` - Lấy thông tin bài nộp
- `PUT /api/submissions/submissions/{id}` - Cập nhật bài nộp
- `DELETE /api/submissions/submissions/{id}` - Xóa bài nộp
- `POST /api/submissions/submissions/{id}/review` - Review bài nộp
- `GET /api/submissions/evaluations` - Lấy danh sách đánh giá
- `POST /api/submissions/evaluations` - Tạo đánh giá mới
- `GET /api/submissions/evaluations/{id}` - Lấy thông tin đánh giá
- `PUT /api/submissions/evaluations/{id}` - Cập nhật đánh giá
- `DELETE /api/submissions/evaluations/{id}` - Xóa đánh giá

### 🧪 Ví dụ test API với curl:

#### **Bước 1: Đăng ký tài khoản sinh viên**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "student1",
    "email": "student1@example.com",
    "password": "password123",
    "role": "student"
  }'
```

#### **Bước 2: Đăng nhập**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "student1",
    "password": "password123"
  }'
```

**Response sẽ trả về JWT token:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "student1",
    "email": "student1@example.com",
    "role": "student"
  }
}
```

#### **Bước 3: Lấy thông tin profile**
```bash
curl -X GET http://localhost:5000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### **Bước 4: Tạo profile sinh viên**
```bash
curl -X POST http://localhost:5000/api/students/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "user_id": 1,
    "student_code": "SV001",
    "full_name": "Nguyễn Văn A",
    "major": "Khoa học máy tính",
    "year_of_study": 3,
    "gpa": 3.5
  }'
```

#### **Bước 5: Lấy danh sách sinh viên**
```bash
curl -X GET http://localhost:5000/api/students/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### **Bước 6: Lấy thông tin sinh viên cụ thể**
```bash
curl -X GET http://localhost:5000/api/students/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### **Bước 7: Cập nhật thông tin sinh viên**
```bash
curl -X PUT http://localhost:5000/api/students/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "full_name": "Nguyễn Văn A Cập nhật",
    "gpa": 3.8
  }'
```

### 🧪 Test với giảng viên:

#### **Đăng ký giảng viên**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "teacher1",
    "email": "teacher1@example.com",
    "password": "password123",
    "role": "teacher"
  }'
```

#### **Tạo profile giảng viên**
```bash
curl -X POST http://localhost:5000/api/teachers/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TEACHER_JWT_TOKEN" \
  -d '{
    "user_id": 2,
    "teacher_code": "GV001",
    "full_name": "Trần Thị B",
    "department": "Khoa học máy tính",
    "title": "Phó giáo sư"
  }'
```

#### **Tạo dự án**
```bash
curl -X POST http://localhost:5000/api/projects/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TEACHER_JWT_TOKEN" \
  -d '{
    "project_code": "PRJ001",
    "title": "Ứng dụng web quản lý",
    "description": "Ứng dụng web quản lý dự án sinh viên",
    "supervisor_id": 1,
    "status": "published",
    "difficulty_level": "intermediate"
  }'
```

#### **Tạo nhóm**
```bash
curl -X POST http://localhost:5000/api/teams/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer STUDENT_JWT_TOKEN" \
  -d '{
    "team_name": "Nhóm Alpha",
    "project_id": 1,
    "leader_id": 1,
    "member_ids": [1]
  }'
```

#### **Tạo bài nộp**
```bash
curl -X POST http://localhost:5000/api/submissions/submissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer STUDENT_JWT_TOKEN" \
  -d '{
    "project_id": 1,
    "submission_type": "team",
    "title": "Báo cáo tiến độ dự án",
    "description": "Báo cáo tiến độ hàng tuần"
  }'
```

#### **Tạo đánh giá**
```bash
curl -X POST http://localhost:5000/api/submissions/evaluations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TEACHER_JWT_TOKEN" \
  -d '{
    "project_id": 1,
    "submission_id": 1,
    "evaluator_type": "teacher",
    "technical_quality": 8,
    "creativity": 7,
    "presentation": 9,
    "teamwork": 8,
    "timeliness": 9,
    "documentation": 8,
    "max_score": 60.0,
    "comments": "Công việc xuất sắc!"
  }'
```

### 🧪 Test với Postman:

#### **Thiết lập Postman:**
1. **Base URL:** `http://localhost:5000/api`
2. **Headers mặc định:**
   - `Content-Type: application/json`
   - `Authorization: Bearer YOUR_JWT_TOKEN`

#### **Collection Postman:**
```json
{
  "info": {
    "name": "Student Project Management API",
    "description": "API quản lý dự án sinh viên",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"username\": \"student1\",\n  \"email\": \"student1@example.com\",\n  \"password\": \"password123\",\n  \"role\": \"student\"\n}"
            },
            "url": "{{base_url}}/auth/register"
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"username\": \"student1\",\n  \"password\": \"password123\"\n}"
            },
            "url": "{{base_url}}/auth/login"
          }
        },
        {
          "name": "Get Profile",
          "request": {
            "method": "GET",
            "header": [
              {"key": "Authorization", "value": "Bearer {{jwt_token}}"}
            ],
            "url": "{{base_url}}/auth/profile"
          }
        }
      ]
    }
  ],
  "variable": [
    {"key": "base_url", "value": "http://localhost:5000/api"},
    {"key": "jwt_token", "value": "YOUR_JWT_TOKEN_HERE"}
  ]
}
```

### 🧪 Test với Python requests:

```python
import requests
import json

# Base URL
BASE_URL = "http://localhost:5000/api"

# 1. Đăng ký
register_data = {
    "username": "student1",
    "email": "student1@example.com",
    "password": "password123",
    "role": "student"
}

response = requests.post(f"{BASE_URL}/auth/register", json=register_data)
print("Register:", response.status_code, response.json())

# 2. Đăng nhập
login_data = {
    "username": "student1",
    "password": "password123"
}

response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
token = response.json()['access_token']
print("Login:", response.status_code, "Token:", token[:20] + "...")

# 3. Lấy profile
headers = {'Authorization': f'Bearer {token}'}
response = requests.get(f"{BASE_URL}/auth/profile", headers=headers)
print("Profile:", response.status_code, response.json())

# 4. Tạo sinh viên
student_data = {
    "user_id": 1,
    "student_code": "SV001",
    "full_name": "Nguyễn Văn A",
    "major": "Khoa học máy tính"
}

response = requests.post(f"{BASE_URL}/students/", json=student_data, headers=headers)
print("Create Student:", response.status_code, response.json())
```

### 🧪 Test với JavaScript (fetch):

```javascript
const BASE_URL = 'http://localhost:5000/api';

// 1. Đăng ký
async function register() {
    const response = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: 'student1',
            email: 'student1@example.com',
            password: 'password123',
            role: 'student'
        })
    });
    
    const data = await response.json();
    console.log('Register:', data);
    return data;
}

// 2. Đăng nhập
async function login() {
    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: 'student1',
            password: 'password123'
        })
    });
    
    const data = await response.json();
    console.log('Login:', data);
    return data.access_token;
}

// 3. Lấy profile
async function getProfile(token) {
    const response = await fetch(`${BASE_URL}/auth/profile`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    
    const data = await response.json();
    console.log('Profile:', data);
    return data;
}

// Sử dụng
(async () => {
    await register();
    const token = await login();
    await getProfile(token);
})();
```

### 🧪 Test với HTTPie:

```bash
# Cài đặt HTTPie
pip install httpie

# 1. Đăng ký
http POST localhost:5000/api/auth/register \
  username=student1 \
  email=student1@example.com \
  password=password123 \
  role=student

# 2. Đăng nhập
http POST localhost:5000/api/auth/login \
  username=student1 \
  password=password123

# 3. Lấy profile (thay YOUR_JWT_TOKEN bằng token thực)
http GET localhost:5000/api/auth/profile \
  Authorization:"Bearer YOUR_JWT_TOKEN"

# 4. Tạo sinh viên
http POST localhost:5000/api/students/ \
  Authorization:"Bearer YOUR_JWT_TOKEN" \
  user_id:=1 \
  student_code=SV001 \
  full_name="Nguyễn Văn A" \
  major="Khoa học máy tính"
```

### 📊 Response Examples:

#### **Success Response:**
```json
{
  "message": "Student created successfully",
  "student": {
    "id": 1,
    "user_id": 1,
    "student_code": "SV001",
    "full_name": "Nguyễn Văn A",
    "major": "Khoa học máy tính",
    "gpa": 0.0,
    "status": "active",
    "created_at": "2025-10-04T06:27:14"
  }
}
```

#### **Error Response:**
```json
{
  "error": "Username already exists"
}
```

#### **Validation Error:**
```json
{
  "error": "user_id is required"
}
```

### 🔍 Debug Tips:

1. **Kiểm tra server có chạy không:**
   ```bash
   curl http://localhost:5000/
   ```

2. **Kiểm tra database connection:**
   ```bash
   mysql -u root -p -e "SHOW DATABASES;"
   ```

3. **Xem logs:**
   ```bash
   python app.py
   # Server sẽ hiển thị logs trong console
   ```

4. **Test với verbose curl:**
   ```bash
   curl -v -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"username": "test", "password": "test"}'
   ```

## 🗄️ Database Schema

### Các bảng chính:
- `users` - Thông tin tài khoản người dùng
- `students` - Thông tin sinh viên
- `teachers` - Thông tin giảng viên
- `projects` - Thông tin dự án
- `teams` - Thông tin nhóm
- `team_members` - Thành viên nhóm
- `project_submissions` - Bài nộp dự án
- `project_evaluations` - Đánh giá dự án
- `project_documents` - Tài liệu dự án

## 🔧 Development

### Cấu trúc thư mục:
```
├── app.py                 # File chính
├── requirements.txt       # Dependencies
├── config/               # Cấu hình
│   └── database.py
├── models/               # Database models
│   ├── __init__.py
│   ├── user.py
│   ├── student.py
│   ├── teacher.py
│   ├── project.py
│   ├── team.py
│   └── submission.py
├── routes/               # API routes
│   ├── __init__.py
│   ├── auth.py
│   ├── student.py
│   ├── teacher.py
│   ├── project.py
│   ├── team.py
│   └── submission.py
└── utils/                # Utilities (nếu có)
```

### Chạy trong development mode:
```bash
export FLASK_ENV=development  # Linux/Mac
set FLASK_ENV=development     # Windows
python app.py
```

## 🚀 Deployment

### Production setup:
1. Sử dụng production WSGI server như Gunicorn:
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

2. Cấu hình reverse proxy với Nginx
3. Sử dụng production database (MySQL với proper configuration)
4. Thiết lập SSL certificate

## 📝 License

MIT License

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📞 Support

Nếu gặp vấn đề, vui lòng tạo issue trên GitHub hoặc liên hệ qua email.

---

**Happy Coding! 🎉**
