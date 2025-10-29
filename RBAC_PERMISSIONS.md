# 🔐 Role-Based Access Control (RBAC) - Phân quyền hệ thống

## 👥 Các vai trò trong hệ thống

### 1. **Admin** (Quản trị viên)
- ✅ Toàn quyền trên hệ thống
- ✅ Quản lý users, students, teachers
- ✅ Quản lý tất cả projects, teams, submissions
- ✅ Xem thống kê toàn hệ thống
- ✅ Xóa bất kỳ dữ liệu nào

### 2. **Teacher** (Giáo viên)
- ✅ Tạo và quản lý dự án của mình
- ✅ Xem danh sách students, teams
- ✅ Đánh giá submissions của dự án mình hướng dẫn
- ✅ Quản lý teams trong dự án của mình
- ❌ Không thể xóa students
- ❌ Không thể xóa projects của giáo viên khác

### 3. **Student** (Sinh viên)
- ✅ Xem danh sách projects (published only)
- ✅ Tham gia teams
- ✅ Nộp submissions cho dự án của nhóm mình
- ✅ Xem và sửa thông tin cá nhân
- ❌ Không thể tạo/sửa/xóa students khác
- ❌ Không thể tạo/sửa/xóa projects
- ❌ Không thể đánh giá submissions

---

## 📋 Phân quyền theo API Endpoints

### 🔐 Authentication (`/api/auth`)
| Endpoint | Method | Roles |
|----------|--------|-------|
| `/register` | POST | Public (tất cả) |
| `/login` | POST | Public |
| `/profile` | GET | Authenticated (tất cả đã login) |
| `/profile` | PUT | Authenticated (chỉ sửa của mình) |
| `/change-password` | POST | Authenticated |

### 👨‍🎓 Students (`/api/students`)
| Endpoint | Method | Roles |
|----------|--------|-------|
| `/` | GET | All authenticated |
| `/:id` | GET | All authenticated |
| `/` | POST | **Admin only** |
| `/:id` | PUT | **Admin only** |
| `/:id` | DELETE | **Admin only** |
| `/:id/teams` | GET | All authenticated |
| `/:id/projects` | GET | All authenticated |
| `/statistics` | GET | **Admin, Teacher** |

### 👨‍🏫 Teachers (`/api/teachers`)
| Endpoint | Method | Roles |
|----------|--------|-------|
| `/` | GET | All authenticated |
| `/:id` | GET | All authenticated |
| `/` | POST | **Admin only** |
| `/:id` | PUT | **Admin only** |
| `/:id` | DELETE | **Admin only** |
| `/:id/projects` | GET | All authenticated |
| `/:id/evaluations` | GET | All authenticated |
| `/statistics` | GET | **Admin** |

### 📁 Projects (`/api/projects`)
| Endpoint | Method | Roles |
|----------|--------|-------|
| `/` | GET | All authenticated (students see published only) |
| `/:id` | GET | All authenticated |
| `/` | POST | **Teacher, Admin** |
| `/:id` | PUT | **Teacher (own), Admin (all)** |
| `/:id` | DELETE | **Admin only** |
| `/:id/teams` | GET | All authenticated |
| `/:id/documents` | GET | All authenticated |
| `/:id/documents` | POST | **Teacher (own), Admin** |
| `/statistics` | GET | **Admin, Teacher** |

### 👥 Teams (`/api/teams`)
| Endpoint | Method | Roles |
|----------|--------|-------|
| `/` | GET | All authenticated |
| `/:id` | GET | All authenticated |
| `/` | POST | **Student (can create), Teacher, Admin** |
| `/:id` | PUT | **Team leader, Teacher (project), Admin** |
| `/:id` | DELETE | **Admin, Teacher (project)** |
| `/:id/members` | POST | **Team leader, Teacher (project), Admin** |
| `/:id/members/:id` | DELETE | **Team leader, Admin** |
| `/:id/members/:id/role` | PUT | **Team leader, Admin** |

### 📝 Submissions (`/api/submissions`)
| Endpoint | Method | Roles |
|----------|--------|-------|
| `/submissions` | GET | All authenticated |
| `/submissions/:id` | GET | All authenticated |
| `/submissions` | POST | **Student (own team), Teacher, Admin** |
| `/submissions/:id` | PUT | **Submission owner, Admin** |
| `/submissions/:id` | DELETE | **Submission owner, Admin** |
| `/submissions/:id/review` | POST | **Teacher (project), Admin** |

### 📊 Evaluations (`/api/submissions/evaluations`)
| Endpoint | Method | Roles |
|----------|--------|-------|
| `/evaluations` | GET | All authenticated |
| `/evaluations/:id` | GET | All authenticated |
| `/evaluations` | POST | **Teacher, Admin** |
| `/evaluations/:id` | PUT | **Evaluator (own), Admin** |
| `/evaluations/:id` | DELETE | **Admin only** |

---

## 🎯 Logic phân quyền chi tiết

### Admin
```python
@admin_required
def endpoint():
    # Chỉ admin mới được gọi
    pass
```

### Teacher or Admin
```python
@teacher_or_admin_required
def endpoint():
    # Teacher hoặc Admin
    pass
```

### Custom logic (Teacher can edit own projects)
```python
@jwt_required()
@teacher_or_admin_required
def update_project(project_id):
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    project = Project.query.get(project_id)
    
    # Admin can edit all
    if user.role == 'admin':
        # Allow
        pass
    # Teacher can only edit their own projects
    elif user.role == 'teacher':
        teacher = Teacher.query.filter_by(user_id=user.id).first()
        if project.supervisor_id != teacher.id:
            return jsonify({'error': 'You can only edit your own projects'}), 403
    
    # Update project...
```

### Student restrictions
```python
@jwt_required()
def get_projects():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    
    query = Project.query
    
    # Students only see published projects
    if user.role == 'student':
        query = query.filter(Project.status == 'published')
    
    # Teachers and admins see all
    projects = query.all()
    return jsonify({'projects': [p.to_dict() for p in projects]})
```

---

## 🎨 Frontend Role-Based UI

### Navigation based on role
```jsx
{user.role === 'admin' && (
  <>
    <Link to="/admin/users">👤 Users</Link>
    <Link to="/admin/statistics">📊 Statistics</Link>
  </>
)}

{(user.role === 'admin' || user.role === 'teacher') && (
  <Link to="/projects">📁 Projects</Link>
)}
```

### Buttons based on permissions
```jsx
{user.role === 'admin' && (
  <button onClick={handleDelete}>🗑️ Delete</button>
)}

{(user.role === 'admin' || user.role === 'teacher') && (
  <button onClick={handleEdit}>✏️ Edit</button>
)}
```

### Pages access
```jsx
// Protected route với role check
function AdminRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user'))
  return user?.role === 'admin' ? children : <Navigate to="/dashboard" />
}

<Route path="/admin/*" element={<AdminRoute><AdminPanel /></AdminRoute>} />
```

---

## 📊 Summary Matrix

| Feature | Admin | Teacher | Student |
|---------|-------|---------|---------|
| View Students | ✅ All | ✅ All | ✅ All |
| Create Student | ✅ | ❌ | ❌ |
| Edit Student | ✅ | ❌ | ❌ Self only |
| Delete Student | ✅ | ❌ | ❌ |
| View Projects | ✅ All | ✅ All | ✅ Published only |
| Create Project | ✅ | ✅ | ❌ |
| Edit Project | ✅ All | ✅ Own only | ❌ |
| Delete Project | ✅ | ❌ | ❌ |
| Create Team | ✅ | ✅ | ✅ |
| Edit Team | ✅ | ✅ Project teams | ✅ If leader |
| Delete Team | ✅ | ✅ Project teams | ❌ |
| Submit Work | ✅ | ✅ | ✅ Own teams |
| Review Submission | ✅ | ✅ Own projects | ❌ |
| Evaluate | ✅ | ✅ | ❌ |
| View Statistics | ✅ | ✅ Limited | ❌ |

---

**Đây là phân quyền chuẩn cho hệ thống quản lý dự án sinh viên!** 🔐✨

