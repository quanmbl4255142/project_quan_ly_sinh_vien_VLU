# API Documentation - Student Project Management System

## Base URL
```
http://localhost:5000/api
```

## Authentication
Hầu hết các API endpoints yêu cầu JWT token trong header:
```
Authorization: Bearer <your_jwt_token>  
```

---

## 1. Authentication APIs

### 1.1 Register User
**POST** `/auth/register`

**Request Body:**
```json
{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "student" // "student", "teacher", "admin"
}
```

**Response:**
```json
{
    "message": "User registered successfully",
    "user": {
        "id": 1,
        "username": "john_doe",
        "email": "john@example.com",
        "role": "student",
        "is_active": true,
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-01T00:00:00"
    }
}
```

### 1.2 Login
**POST** `/auth/login`

**Request Body:**
```json
{
    "username": "john_doe",
    "password": "password123"
}
```

**Response:**
```json
{
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "user": {
        "id": 1,
        "username": "john_doe",
        "email": "john@example.com",
        "role": "student",
        "is_active": true
    }
}
```

### 1.3 Get Profile
**GET** `/auth/profile`

**Response:**
```json
{
    "user": {
        "id": 1,
        "username": "john_doe",
        "email": "john@example.com",
        "role": "student",
        "is_active": true
    }
}
```

### 1.4 Update Profile
**PUT** `/auth/profile`

**Request Body:**
```json
{
    "username": "john_doe_new",
    "email": "john_new@example.com"
}
```

### 1.5 Change Password
**POST** `/auth/change-password`

**Request Body:**
```json
{
    "current_password": "old_password",
    "new_password": "new_password123"
}
```

---

## 2. Student Management APIs

### 2.1 Get All Students
**GET** `/students/`

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Items per page (default: 10)
- `search` (optional): Search in name, student_code, class_name
- `major` (optional): Filter by major
- `status` (optional): Filter by status (active, inactive, graduated, suspended)

**Example:** `/students/?page=1&per_page=20&search=john&major=Computer Science`

**Response:**
```json
{
    "students": [
        {
            "id": 1,
            "user_id": 1,
            "student_code": "SV001",
            "full_name": "John Doe",
            "date_of_birth": "2000-01-01",
            "phone": "0123456789",
            "address": "123 Main St",
            "major": "Computer Science",
            "class_name": "CS101",
            "year_of_study": 3,
            "gpa": 3.5,
            "status": "active",
            "created_at": "2024-01-01T00:00:00",
            "updated_at": "2024-01-01T00:00:00"
        }
    ],
    "total": 100,
    "pages": 5,
    "current_page": 1
}
```

### 2.2 Get Student by ID
**GET** `/students/{student_id}`

### 2.3 Create Student
**POST** `/students/`

**Request Body:**
```json
{
    "user_id": 1,
    "student_code": "SV001",
    "full_name": "John Doe",
    "date_of_birth": "2000-01-01",
    "phone": "0123456789",
    "address": "123 Main St",
    "major": "Computer Science",
    "class_name": "CS101",
    "year_of_study": 3,
    "gpa": 3.5,
    "status": "active"
}
```

### 2.4 Update Student
**PUT** `/students/{student_id}`

### 2.5 Delete Student
**DELETE** `/students/{student_id}`

### 2.6 Get Student Teams
**GET** `/students/{student_id}/teams`

### 2.7 Get Student Projects
**GET** `/students/{student_id}/projects`

### 2.8 Get Student Statistics
**GET** `/students/statistics`

---

## 3. Teacher Management APIs

### 3.1 Get All Teachers
**GET** `/teachers/`

**Query Parameters:**
- `page`, `per_page`, `search`, `department`, `status`

### 3.2 Get Teacher by ID
**GET** `/teachers/{teacher_id}`

### 3.3 Create Teacher
**POST** `/teachers/`

**Request Body:**
```json
{
    "user_id": 2,
    "teacher_code": "GV001",
    "full_name": "Dr. Jane Smith",
    "phone": "0987654321",
    "email": "jane.smith@university.edu",
    "department": "Computer Science",
    "title": "Professor",
    "specialization": "Machine Learning",
    "status": "active"
}
```

### 3.4 Update Teacher
**PUT** `/teachers/{teacher_id}`

### 3.5 Delete Teacher
**DELETE** `/teachers/{teacher_id}`

### 3.6 Get Teacher Projects
**GET** `/teachers/{teacher_id}/projects`

### 3.7 Get Teacher Evaluations
**GET** `/teachers/{teacher_id}/evaluations`

### 3.8 Get Teacher Statistics
**GET** `/teachers/statistics`

---

## 4. Project Management APIs

### 4.1 Get All Projects
**GET** `/projects/`

**Query Parameters:**
- `page`, `per_page`, `search`, `status`, `difficulty`, `supervisor_id`, `semester`, `academic_year`

**Example:** `/projects/?status=published&difficulty=intermediate&semester=Fall2024`

### 4.2 Get Project by ID
**GET** `/projects/{project_id}`

### 4.3 Create Project
**POST** `/projects/`

**Request Body:**
```json
{
    "project_code": "PRJ001",
    "title": "Web Application Development",
    "description": "Build a full-stack web application",
    "requirements": "HTML, CSS, JavaScript, Python, Database",
    "objectives": "Learn full-stack development",
    "technology_stack": "React, Node.js, PostgreSQL",
    "difficulty_level": "intermediate",
    "estimated_duration": 12,
    "max_team_size": 4,
    "min_team_size": 2,
    "supervisor_id": 1,
    "status": "draft",
    "semester": "Fall2024",
    "academic_year": "2024-2025",
    "deadline": "2024-12-31T23:59:59"
}
```

### 4.4 Update Project
**PUT** `/projects/{project_id}`

### 4.5 Delete Project
**DELETE** `/projects/{project_id}`

### 4.6 Get Project Teams
**GET** `/projects/{project_id}/teams`

### 4.7 Get Project Documents
**GET** `/projects/{project_id}/documents`

### 4.8 Upload Project Document
**POST** `/projects/{project_id}/documents`

**Request Body:**
```json
{
    "title": "Project Requirements",
    "description": "Detailed project requirements document",
    "file_path": "/uploads/requirements.pdf",
    "file_type": "pdf",
    "file_size": 1024000,
    "document_type": "requirement"
}
```

### 4.9 Get Project Statistics
**GET** `/projects/statistics`

---

## 5. Team Management APIs

### 5.1 Get All Teams
**GET** `/teams/`

**Query Parameters:**
- `page`, `per_page`, `search`, `status`, `project_id`

### 5.2 Get Team by ID
**GET** `/teams/{team_id}`

### 5.3 Create Team
**POST** `/teams/`

**Request Body:**
```json
{
    "team_name": "Team Alpha",
    "project_id": 1,
    "leader_id": 1,
    "member_ids": [2, 3, 4],
    "status": "forming"
}
```

### 5.4 Update Team
**PUT** `/teams/{team_id}`

### 5.5 Delete Team
**DELETE** `/teams/{team_id}`

### 5.6 Add Team Member
**POST** `/teams/{team_id}/members`

**Request Body:**
```json
{
    "student_id": 5
}
```

### 5.7 Remove Team Member
**DELETE** `/teams/{team_id}/members/{member_id}`

### 5.8 Update Member Role
**PUT** `/teams/{team_id}/members/{member_id}/role`

**Request Body:**
```json
{
    "role": "leader" // or "member"
}
```

---

## 6. Submission & Evaluation APIs

### 6.1 Get All Submissions
**GET** `/submissions/submissions`

**Query Parameters:**
- `page`, `per_page`, `project_id`, `team_id`, `student_id`, `status`, `category`

### 6.2 Get Submission by ID
**GET** `/submissions/submissions/{submission_id}`

### 6.3 Create Submission
**POST** `/submissions/submissions`

**Request Body:**
```json
{
    "project_id": 1,
    "submission_type": "team", // or "individual"
    "title": "Project Proposal",
    "description": "Initial project proposal document",
    "file_path": "/uploads/proposal.pdf",
    "file_type": "pdf",
    "file_size": 2048000,
    "submission_category": "proposal"
}
```

### 6.4 Update Submission
**PUT** `/submissions/submissions/{submission_id}`

### 6.5 Delete Submission
**DELETE** `/submissions/submissions/{submission_id}`

### 6.6 Review Submission
**POST** `/submissions/submissions/{submission_id}/review`

**Request Body:**
```json
{
    "status": "approved", // "approved", "rejected", "revision_required"
    "feedback": "Great work! Please add more details in section 3."
}
```

### 6.7 Get All Evaluations
**GET** `/submissions/evaluations`

**Query Parameters:**
- `page`, `per_page`, `project_id`, `submission_id`, `evaluator_type`

### 6.8 Get Evaluation by ID
**GET** `/submissions/evaluations/{evaluation_id}`

### 6.9 Create Evaluation
**POST** `/submissions/evaluations`

**Request Body:**
```json
{
    "project_id": 1,
    "submission_id": 1,
    "evaluator_type": "teacher", // or "student"
    "technical_quality": 8,
    "creativity": 7,
    "presentation": 9,
    "teamwork": 8,
    "timeliness": 10,
    "documentation": 7,
    "max_score": 60.0,
    "comments": "Excellent work overall. Good technical implementation and presentation."
}
```

### 6.10 Update Evaluation
**PUT** `/submissions/evaluations/{evaluation_id}`

### 6.11 Delete Evaluation
**DELETE** `/submissions/evaluations/{evaluation_id}`

---

## Error Responses

All APIs return consistent error responses:

```json
{
    "error": "Error message description"
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `404` - Not Found
- `500` - Internal Server Error

---

## Testing Examples

### 1. Complete Registration and Login Flow
```bash
# Register a student
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "student1",
    "email": "student1@example.com",
    "password": "password123",
    "role": "student"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "student1",
    "password": "password123"
  }'
```

### 2. Create Student Profile
```bash
# Use the JWT token from login response
curl -X POST http://localhost:5000/api/students/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "user_id": 1,
    "student_code": "SV001",
    "full_name": "John Doe",
    "major": "Computer Science",
    "year_of_study": 3
  }'
```

### 3. Create Project
```bash
curl -X POST http://localhost:5000/api/projects/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "project_code": "PRJ001",
    "title": "Web Development Project",
    "description": "Build a full-stack web application",
    "supervisor_id": 1,
    "difficulty_level": "intermediate",
    "max_team_size": 4
  }'
```

### 4. Create Team
```bash
curl -X POST http://localhost:5000/api/teams/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "team_name": "Team Alpha",
    "project_id": 1,
    "leader_id": 1,
    "member_ids": [2, 3]
  }'
```

### 5. Submit Project
```bash
curl -X POST http://localhost:5000/api/submissions/submissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "project_id": 1,
    "submission_type": "team",
    "title": "Project Proposal",
    "submission_category": "proposal"
  }'
```

### 6. Evaluate Project
```bash
curl -X POST http://localhost:5000/api/submissions/evaluations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "project_id": 1,
    "submission_id": 1,
    "evaluator_type": "teacher",
    "technical_quality": 8,
    "creativity": 7,
    "presentation": 9,
    "teamwork": 8,
    "timeliness": 10,
    "documentation": 7,
    "comments": "Excellent work!"
  }'
```

---

## Database Setup

1. **Install MySQL** and create database:
```sql
CREATE DATABASE student_project_management;
```

2. **Install Python dependencies:**
```bash
# Activate virtual environment
venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt
```

3. **Configure environment variables:**
```bash
# Copy .env.example to .env and update values
cp .env.example .env
```

4. **Run the application:**
```bash
python app.py
```

5. **Initialize database:**
The database tables will be created automatically when you first run the application.

---

## Features Summary

### ✅ Completed Features:
- **User Authentication** (Register, Login, Profile Management)
- **Student Management** (CRUD operations, search, filtering)
- **Teacher Management** (CRUD operations, department filtering)
- **Project Management** (CRUD operations, document upload, statistics)
- **Team Management** (Team creation, member management, role assignment)
- **Submission System** (Individual/Team submissions, review workflow)
- **Evaluation System** (Multi-criteria scoring, recommendations)
- **Statistics & Reporting** (Student stats, teacher stats, project stats)
- **JWT Authentication** (Secure API access)
- **MySQL Database** (Production-ready database)
- **Pagination** (Efficient data loading)
- **Search & Filtering** (Advanced query capabilities)

### 🔧 Technical Features:
- **Flask Framework** with SQLAlchemy ORM
- **JWT Token Authentication**
- **MySQL Database** with proper relationships
- **RESTful API Design**
- **Error Handling** and validation
- **Pagination** for large datasets
- **Comprehensive Documentation**

This API system provides a complete solution for managing student projects with full CRUD operations, authentication, team management, project submissions, and evaluation capabilities.
