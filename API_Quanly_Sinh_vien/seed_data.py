"""
Script để seed dữ liệu giả vào database
Chạy script này để thêm dữ liệu mẫu cho tất cả các trang
"""
from app import create_app
from models import db
from models.user import User
from models.student import Student
from models.teacher import Teacher
from models.project import Project, ProjectDocument
from models.team import Team, TeamMember
from models.submission import ProjectSubmission, ProjectEvaluation
from datetime import datetime, timedelta
import random

def seed_data():
    """Tạo dữ liệu giả cho database"""
    app = create_app()
    
    with app.app_context():
        # Xóa dữ liệu cũ (tùy chọn - comment nếu muốn giữ dữ liệu cũ)
        print("🗑️  Đang xóa dữ liệu cũ...")
        try:
            # Xóa theo thứ tự để tránh foreign key constraint
            ProjectEvaluation.query.delete()
            ProjectDocument.query.delete()
            ProjectSubmission.query.delete()
            TeamMember.query.delete()
            Team.query.delete()
            Project.query.delete()
            Student.query.delete()
            Teacher.query.delete()
            # Giữ admin user
            User.query.filter(User.role != 'admin').delete()
            
            db.session.commit()
            print("✅ Đã xóa dữ liệu cũ")
        except Exception as e:
            print(f"⚠️  Lỗi khi xóa dữ liệu cũ (có thể bảng chưa tồn tại hoặc có ràng buộc): {e}")
            db.session.rollback()
            print("⚠️  Tiếp tục tạo dữ liệu mới (có thể trùng lặp)...")
        
        # Tạo Users
        print("\n👥 Đang tạo users...")
        users_data = [
            # Admin (tạo mới nếu chưa có)
            {'username': 'admin', 'email': 'admin@vlu.edu.vn', 'role': 'admin', 'password': 'admin123'},
            
            # Teachers
            {'username': 'teacher1', 'email': 'nguyenvanhoc@vlu.edu.vn', 'role': 'teacher', 'password': 'teacher123'},
            {'username': 'teacher2', 'email': 'tranthithu@vlu.edu.vn', 'role': 'teacher', 'password': 'teacher123'},
            {'username': 'teacher3', 'email': 'levanminh@vlu.edu.vn', 'role': 'teacher', 'password': 'teacher123'},
            
            # Students
            {'username': 'student1', 'email': 'sv001@student.vlu.edu.vn', 'role': 'student', 'password': 'student123'},
            {'username': 'student2', 'email': 'sv002@student.vlu.edu.vn', 'role': 'student', 'password': 'student123'},
            {'username': 'student3', 'email': 'sv003@student.vlu.edu.vn', 'role': 'student', 'password': 'student123'},
            {'username': 'student4', 'email': 'sv004@student.vlu.edu.vn', 'role': 'student', 'password': 'student123'},
            {'username': 'student5', 'email': 'sv005@student.vlu.edu.vn', 'role': 'student', 'password': 'student123'},
            {'username': 'student6', 'email': 'sv006@student.vlu.edu.vn', 'role': 'student', 'password': 'student123'},
            {'username': 'student7', 'email': 'sv007@student.vlu.edu.vn', 'role': 'student', 'password': 'student123'},
            {'username': 'student8', 'email': 'sv008@student.vlu.edu.vn', 'role': 'student', 'password': 'student123'},
        ]
        
        users = {}
        for user_data in users_data:
            existing_user = User.query.filter_by(username=user_data['username']).first()
            if not existing_user:
                user = User(
                    username=user_data['username'],
                    email=user_data['email'],
                    role=user_data['role']
                )
                user.set_password(user_data['password'])
                db.session.add(user)
                db.session.flush()
                users[user_data['username']] = user
                print(f"  ✅ Tạo user: {user_data['username']} ({user_data['role']})")
            else:
                # Cập nhật password nếu là admin (để đảm bảo có thể đăng nhập)
                if user_data['username'] == 'admin':
                    existing_user.set_password(user_data['password'])
                    db.session.commit()
                users[user_data['username']] = existing_user
                print(f"  ⚠️  User đã tồn tại: {user_data['username']}")
        
        db.session.commit()
        print(f"✅ Đã tạo {len(users)} users")
        
        # Tạo Teachers
        print("\n👨‍🏫 Đang tạo teachers...")
        teachers_data = [
            {
                'username': 'teacher1',
                'teacher_code': 'GV001',
                'full_name': 'Nguyễn Văn Học',
                'phone': '0901234567',
                'email': 'nguyenvanhoc@vlu.edu.vn',
                'department': 'Khoa Công nghệ Thông tin',
                'title': 'Tiến sĩ',
                'specialization': 'Lập trình Web, Trí tuệ Nhân tạo'
            },
            {
                'username': 'teacher2',
                'teacher_code': 'GV002',
                'full_name': 'Trần Thị Thu',
                'phone': '0902345678',
                'email': 'tranthithu@vlu.edu.vn',
                'department': 'Khoa Công nghệ Thông tin',
                'title': 'Thạc sĩ',
                'specialization': 'Cơ sở Dữ liệu, Phân tích Dữ liệu'
            },
            {
                'username': 'teacher3',
                'teacher_code': 'GV003',
                'full_name': 'Lê Văn Minh',
                'phone': '0903456789',
                'email': 'levanminh@vlu.edu.vn',
                'department': 'Khoa Công nghệ Thông tin',
                'title': 'Tiến sĩ',
                'specialization': 'Mạng Máy tính, Bảo mật Thông tin'
            },
        ]
        
        teachers = {}
        for teacher_data in teachers_data:
            if teacher_data['username'] in users:
                # Kiểm tra theo user_id hoặc teacher_code
                existing_teacher = Teacher.query.filter_by(user_id=users[teacher_data['username']].id).first()
                if not existing_teacher:
                    # Kiểm tra xem teacher_code đã tồn tại chưa
                    existing_by_code = Teacher.query.filter_by(teacher_code=teacher_data['teacher_code']).first()
                    if existing_by_code:
                        teachers[teacher_data['username']] = existing_by_code
                        print(f"  ⚠️  Teacher code đã tồn tại: {teacher_data['teacher_code']} - Sử dụng bản hiện có")
                    else:
                        teacher = Teacher(
                            user_id=users[teacher_data['username']].id,
                            teacher_code=teacher_data['teacher_code'],
                            full_name=teacher_data['full_name'],
                            phone=teacher_data['phone'],
                            email=teacher_data['email'],
                            department=teacher_data['department'],
                            title=teacher_data['title'],
                            specialization=teacher_data['specialization'],
                            status='active'
                        )
                        db.session.add(teacher)
                        db.session.flush()
                        teachers[teacher_data['username']] = teacher
                        print(f"  ✅ Tạo teacher: {teacher_data['full_name']}")
                else:
                    teachers[teacher_data['username']] = existing_teacher
                    print(f"  ⚠️  Teacher đã tồn tại: {teacher_data['full_name']}")
        
        db.session.commit()
        print(f"✅ Đã tạo {len(teachers)} teachers")
        
        # Tạo Students
        print("\n👨‍🎓 Đang tạo students...")
        students_data = [
            {
                'username': 'student1',
                'student_code': 'SV001',
                'full_name': 'Phạm Văn An',
                'date_of_birth': '2003-05-15',
                'phone': '0911111111',
                'address': '123 Đường ABC, Quận 1, TP.HCM',
                'major': 'Công nghệ Thông tin',
                'class_name': 'CNTT2021A',
                'year_of_study': 3,
                'gpa': 3.5,
                'status': 'active'
            },
            {
                'username': 'student2',
                'student_code': 'SV002',
                'full_name': 'Nguyễn Thị Bình',
                'date_of_birth': '2003-08-20',
                'phone': '0912222222',
                'address': '456 Đường XYZ, Quận 3, TP.HCM',
                'major': 'Công nghệ Thông tin',
                'class_name': 'CNTT2021A',
                'year_of_study': 3,
                'gpa': 3.8,
                'status': 'active'
            },
            {
                'username': 'student3',
                'student_code': 'SV003',
                'full_name': 'Trần Văn Cường',
                'date_of_birth': '2003-02-10',
                'phone': '0913333333',
                'address': '789 Đường DEF, Quận 5, TP.HCM',
                'major': 'Công nghệ Thông tin',
                'class_name': 'CNTT2021B',
                'year_of_study': 3,
                'gpa': 3.2,
                'status': 'active'
            },
            {
                'username': 'student4',
                'student_code': 'SV004',
                'full_name': 'Lê Thị Dung',
                'date_of_birth': '2003-11-25',
                'phone': '0914444444',
                'address': '321 Đường GHI, Quận 7, TP.HCM',
                'major': 'Công nghệ Thông tin',
                'class_name': 'CNTT2021B',
                'year_of_study': 3,
                'gpa': 3.9,
                'status': 'active'
            },
            {
                'username': 'student5',
                'student_code': 'SV005',
                'full_name': 'Hoàng Văn Em',
                'date_of_birth': '2003-07-05',
                'phone': '0915555555',
                'address': '654 Đường JKL, Quận 10, TP.HCM',
                'major': 'Công nghệ Thông tin',
                'class_name': 'CNTT2021C',
                'year_of_study': 3,
                'gpa': 3.6,
                'status': 'active'
            },
            {
                'username': 'student6',
                'student_code': 'SV006',
                'full_name': 'Võ Thị Phương',
                'date_of_birth': '2003-09-12',
                'phone': '0916666666',
                'address': '987 Đường MNO, Quận 12, TP.HCM',
                'major': 'Công nghệ Thông tin',
                'class_name': 'CNTT2021C',
                'year_of_study': 3,
                'gpa': 3.4,
                'status': 'active'
            },
            {
                'username': 'student7',
                'student_code': 'SV007',
                'full_name': 'Đặng Văn Giang',
                'date_of_birth': '2003-04-18',
                'phone': '0917777777',
                'address': '147 Đường PQR, Quận Bình Thạnh, TP.HCM',
                'major': 'Công nghệ Thông tin',
                'class_name': 'CNTT2021D',
                'year_of_study': 3,
                'gpa': 3.7,
                'status': 'active'
            },
            {
                'username': 'student8',
                'student_code': 'SV008',
                'full_name': 'Bùi Thị Hoa',
                'date_of_birth': '2003-12-30',
                'phone': '0918888888',
                'address': '258 Đường STU, Quận Tân Bình, TP.HCM',
                'major': 'Công nghệ Thông tin',
                'class_name': 'CNTT2021D',
                'year_of_study': 3,
                'gpa': 3.3,
                'status': 'active'
            },
        ]
        
        students = {}
        for student_data in students_data:
            if student_data['username'] in users:
                # Kiểm tra theo user_id hoặc student_code
                existing_student = Student.query.filter_by(user_id=users[student_data['username']].id).first()
                if not existing_student:
                    # Kiểm tra xem student_code đã tồn tại chưa
                    existing_by_code = Student.query.filter_by(student_code=student_data['student_code']).first()
                    if existing_by_code:
                        students[student_data['username']] = existing_by_code
                        print(f"  ⚠️  Student code đã tồn tại: {student_data['student_code']} - Sử dụng bản hiện có")
                    else:
                        student = Student(
                            user_id=users[student_data['username']].id,
                            student_code=student_data['student_code'],
                            full_name=student_data['full_name'],
                            date_of_birth=datetime.strptime(student_data['date_of_birth'], '%Y-%m-%d').date() if student_data['date_of_birth'] else None,
                            phone=student_data['phone'],
                            address=student_data['address'],
                            major=student_data['major'],
                            class_name=student_data['class_name'],
                            year_of_study=student_data['year_of_study'],
                            gpa=student_data['gpa'],
                            status=student_data['status']
                        )
                        db.session.add(student)
                        db.session.flush()
                        students[student_data['username']] = student
                        print(f"  ✅ Tạo student: {student_data['full_name']} ({student_data['student_code']})")
                else:
                    students[student_data['username']] = existing_student
                    print(f"  ⚠️  Student đã tồn tại: {student_data['full_name']}")
        
        db.session.commit()
        print(f"✅ Đã tạo {len(students)} students")
        
        # Tạo Projects
        print("\n📁 Đang tạo projects...")
        projects_data = [
            {
                'project_code': 'PRJ001',
                'title': 'Hệ thống Quản lý Thư viện Số',
                'description': 'Xây dựng hệ thống quản lý thư viện số với các tính năng tìm kiếm, mượn trả sách, quản lý tài khoản người dùng.',
                'requirements': 'React, Node.js, MongoDB, JWT Authentication',
                'objectives': 'Tạo hệ thống quản lý thư viện hiện đại, dễ sử dụng',
                'technology_stack': 'React, Node.js, Express, MongoDB, JWT',
                'difficulty_level': 'intermediate',
                'estimated_duration': 12,
                'max_team_size': 4,
                'min_team_size': 2,
                'supervisor_username': 'teacher1',
                'status': 'published',
                'semester': 'Fall2024',
                'academic_year': '2024-2025',
                'deadline': datetime.now() + timedelta(days=90)
            },
            {
                'project_code': 'PRJ002',
                'title': 'Ứng dụng E-commerce Mobile',
                'description': 'Phát triển ứng dụng mua sắm trực tuyến trên nền tảng di động với thanh toán online và quản lý đơn hàng.',
                'requirements': 'React Native, Firebase, Stripe API',
                'objectives': 'Tạo ứng dụng mua sắm tiện lợi cho người dùng',
                'technology_stack': 'React Native, Firebase, Stripe, Redux',
                'difficulty_level': 'advanced',
                'estimated_duration': 16,
                'max_team_size': 5,
                'min_team_size': 3,
                'supervisor_username': 'teacher2',
                'status': 'published',
                'semester': 'Fall2024',
                'academic_year': '2024-2025',
                'deadline': datetime.now() + timedelta(days=120)
            },
            {
                'project_code': 'PRJ003',
                'title': 'Hệ thống Quản lý Dự án Agile',
                'description': 'Xây dựng hệ thống quản lý dự án theo phương pháp Agile với Kanban board, sprint planning, và báo cáo tiến độ.',
                'requirements': 'Vue.js, Python Django, PostgreSQL',
                'objectives': 'Hỗ trợ quản lý dự án hiệu quả theo phương pháp Agile',
                'technology_stack': 'Vue.js, Django, PostgreSQL, WebSocket',
                'difficulty_level': 'intermediate',
                'estimated_duration': 14,
                'max_team_size': 4,
                'min_team_size': 2,
                'supervisor_username': 'teacher1',
                'status': 'published',
                'semester': 'Fall2024',
                'academic_year': '2024-2025',
                'deadline': datetime.now() + timedelta(days=100)
            },
            {
                'project_code': 'PRJ004',
                'title': 'Chatbot Hỗ trợ Sinh viên',
                'description': 'Phát triển chatbot thông minh sử dụng AI để trả lời câu hỏi của sinh viên về lịch học, điểm số, và thông tin trường.',
                'requirements': 'Python, TensorFlow, Flask, NLP',
                'objectives': 'Tự động hóa việc trả lời câu hỏi thường gặp của sinh viên',
                'technology_stack': 'Python, TensorFlow, Flask, NLTK, Dialogflow',
                'difficulty_level': 'advanced',
                'estimated_duration': 18,
                'max_team_size': 4,
                'min_team_size': 2,
                'supervisor_username': 'teacher3',
                'status': 'published',
                'semester': 'Fall2024',
                'academic_year': '2024-2025',
                'deadline': datetime.now() + timedelta(days=130)
            },
            {
                'project_code': 'PRJ005',
                'title': 'Website Portfolio Cá nhân',
                'description': 'Thiết kế và phát triển website portfolio cá nhân với animation, responsive design, và CMS để quản lý nội dung.',
                'requirements': 'HTML, CSS, JavaScript, CMS',
                'objectives': 'Tạo website portfolio chuyên nghiệp và đẹp mắt',
                'technology_stack': 'HTML5, CSS3, JavaScript, GSAP, WordPress',
                'difficulty_level': 'beginner',
                'estimated_duration': 8,
                'max_team_size': 3,
                'min_team_size': 1,
                'supervisor_username': 'teacher2',
                'status': 'published',
                'semester': 'Fall2024',
                'academic_year': '2024-2025',
                'deadline': datetime.now() + timedelta(days=60)
            },
            {
                'project_code': 'PRJ006',
                'title': 'Hệ thống Phân tích Dữ liệu Bán hàng',
                'description': 'Xây dựng hệ thống thu thập và phân tích dữ liệu bán hàng với dashboard trực quan, báo cáo tự động.',
                'requirements': 'Python, Pandas, Matplotlib, Flask',
                'objectives': 'Giúp doanh nghiệp phân tích và đưa ra quyết định dựa trên dữ liệu',
                'technology_stack': 'Python, Pandas, Matplotlib, Flask, MySQL',
                'difficulty_level': 'intermediate',
                'estimated_duration': 10,
                'max_team_size': 4,
                'min_team_size': 2,
                'supervisor_username': 'teacher2',
                'status': 'in_progress',
                'semester': 'Fall2024',
                'academic_year': '2024-2025',
                'deadline': datetime.now() + timedelta(days=80)
            },
        ]
        
        projects = {}
        for project_data in projects_data:
            supervisor = teachers.get(project_data['supervisor_username'])
            if supervisor:
                existing_project = Project.query.filter_by(project_code=project_data['project_code']).first()
                if not existing_project:
                    project = Project(
                        project_code=project_data['project_code'],
                        title=project_data['title'],
                        description=project_data['description'],
                        requirements=project_data['requirements'],
                        objectives=project_data['objectives'],
                        technology_stack=project_data['technology_stack'],
                        difficulty_level=project_data['difficulty_level'],
                        estimated_duration=project_data['estimated_duration'],
                        max_team_size=project_data['max_team_size'],
                        min_team_size=project_data['min_team_size'],
                        supervisor_id=supervisor.id,
                        status=project_data['status'],
                        semester=project_data['semester'],
                        academic_year=project_data['academic_year'],
                        deadline=project_data['deadline']
                    )
                    db.session.add(project)
                    db.session.flush()
                    projects[project_data['project_code']] = project
                    print(f"  ✅ Tạo project: {project_data['title']}")
                else:
                    projects[project_data['project_code']] = existing_project
                    print(f"  ⚠️  Project đã tồn tại: {project_data['title']}")
        
        db.session.commit()
        print(f"✅ Đã tạo {len(projects)} projects")
        
        # Tạo Teams
        print("\n👥 Đang tạo teams...")
        teams_data = [
            {
                'team_name': 'Team Alpha',
                'project_code': 'PRJ001',
                'leader_username': 'student1',
                'member_usernames': ['student1', 'student2', 'student3'],
                'status': 'active'
            },
            {
                'team_name': 'Team Beta',
                'project_code': 'PRJ002',
                'leader_username': 'student4',
                'member_usernames': ['student4', 'student5', 'student6'],
                'status': 'active'
            },
            {
                'team_name': 'Team Gamma',
                'project_code': 'PRJ003',
                'leader_username': 'student7',
                'member_usernames': ['student7', 'student8'],
                'status': 'active'
            },
            {
                'team_name': 'Team Delta',
                'project_code': 'PRJ004',
                'leader_username': 'student2',
                'member_usernames': ['student2', 'student3', 'student5'],
                'status': 'forming'
            },
        ]
        
        teams = {}
        for team_data in teams_data:
            project = projects.get(team_data['project_code'])
            leader = students.get(team_data['leader_username'])
            
            if project and leader:
                existing_team = Team.query.filter_by(team_name=team_data['team_name']).first()
                if not existing_team:
                    team = Team(
                        team_name=team_data['team_name'],
                        project_id=project.id,
                        leader_id=leader.id,
                        status=team_data['status']
                    )
                    db.session.add(team)
                    db.session.flush()
                    
                    # Thêm thành viên
                    for member_username in team_data['member_usernames']:
                        member = students.get(member_username)
                        if member:
                            team_member = TeamMember(
                                team_id=team.id,
                                student_id=member.id,
                                role='leader' if member.id == leader.id else 'member',
                                status='active'
                            )
                            db.session.add(team_member)
                    
                    teams[team_data['team_name']] = team
                    print(f"  ✅ Tạo team: {team_data['team_name']} ({len(team_data['member_usernames'])} members)")
                else:
                    teams[team_data['team_name']] = existing_team
                    print(f"  ⚠️  Team đã tồn tại: {team_data['team_name']}")
        
        db.session.commit()
        print(f"✅ Đã tạo {len(teams)} teams")
        
        # Tạo Submissions
        print("\n📄 Đang tạo submissions...")
        submissions_data = [
            {
                'project_code': 'PRJ001',
                'team_name': 'Team Alpha',
                'title': 'Đề xuất Dự án - Hệ thống Quản lý Thư viện Số',
                'description': 'Tài liệu đề xuất chi tiết về hệ thống quản lý thư viện số',
                'submission_type': 'team',
                'submission_category': 'proposal',
                'status': 'approved',
                'file_path': '/uploads/prj001_team_alpha_proposal.pdf',
                'file_type': 'pdf',
                'file_size': 1024000
            },
            {
                'project_code': 'PRJ001',
                'team_name': 'Team Alpha',
                'title': 'Báo cáo Tiến độ - Tuần 4',
                'description': 'Báo cáo tiến độ dự án sau 4 tuần thực hiện',
                'submission_type': 'team',
                'submission_category': 'progress',
                'status': 'submitted',
                'file_path': '/uploads/prj001_team_alpha_progress_week4.pdf',
                'file_type': 'pdf',
                'file_size': 512000
            },
            {
                'project_code': 'PRJ001',
                'team_name': 'Team Alpha',
                'title': 'Báo cáo Cuối kỳ - Hệ thống Quản lý Thư viện Số',
                'description': 'Báo cáo tổng kết dự án hoàn chỉnh',
                'submission_type': 'team',
                'submission_category': 'final',
                'status': 'approved',
                'file_path': '/uploads/prj001_team_alpha_final_report.pdf',
                'file_type': 'pdf',
                'file_size': 2048000
            },
            {
                'project_code': 'PRJ002',
                'team_name': 'Team Beta',
                'title': 'Đề xuất Dự án - Ứng dụng E-commerce Mobile',
                'description': 'Tài liệu đề xuất về ứng dụng mua sắm trực tuyến',
                'submission_type': 'team',
                'submission_category': 'proposal',
                'status': 'under_review',
                'file_path': '/uploads/prj002_team_beta_proposal.pdf',
                'file_type': 'pdf',
                'file_size': 1536000
            },
            {
                'project_code': 'PRJ003',
                'team_name': 'Team Gamma',
                'title': 'Thiết kế UI/UX - Hệ thống Quản lý Dự án',
                'description': 'Bản thiết kế giao diện người dùng cho hệ thống quản lý dự án',
                'submission_type': 'team',
                'submission_category': 'other',
                'status': 'approved',
                'file_path': '/uploads/prj003_team_gamma_ui_design.pdf',
                'file_type': 'pdf',
                'file_size': 2048000
            },
            {
                'project_code': 'PRJ004',
                'team_name': 'Team Delta',
                'title': 'Đề xuất Dự án - Chatbot Hỗ trợ Sinh viên',
                'description': 'Tài liệu đề xuất về chatbot sử dụng AI',
                'submission_type': 'team',
                'submission_category': 'proposal',
                'status': 'draft',
                'file_path': '/uploads/prj004_team_delta_proposal.pdf',
                'file_type': 'pdf',
                'file_size': 768000
            },
            {
                'project_code': 'PRJ005',
                'team_name': None,
                'title': 'Đề xuất Dự án - Website Portfolio',
                'description': 'Đề xuất cá nhân về website portfolio',
                'submission_type': 'individual',
                'submission_category': 'proposal',
                'status': 'submitted',
                'file_path': '/uploads/prj005_individual_proposal.pdf',
                'file_type': 'pdf',
                'file_size': 256000,
                'student_username': 'student1'
            },
        ]
        
        submissions = []
        for submission_data in submissions_data:
            project = projects.get(submission_data['project_code'])
            if not project:
                continue
            
            team = None
            student = None
            
            if submission_data['team_name']:
                team = teams.get(submission_data['team_name'])
            elif submission_data.get('student_username'):
                student = students.get(submission_data['student_username'])
            
            if project and (team or student):
                submission = ProjectSubmission(
                    project_id=project.id,
                    team_id=team.id if team else None,
                    student_id=student.id if student else None,
                    submission_type=submission_data['submission_type'],
                    title=submission_data['title'],
                    description=submission_data['description'],
                    file_path=submission_data['file_path'],
                    file_type=submission_data['file_type'],
                    file_size=submission_data['file_size'],
                    submission_category=submission_data['submission_category'],
                    status=submission_data['status'],
                    submitted_at=datetime.now() - timedelta(days=random.randint(1, 30)) if submission_data['status'] != 'draft' else None,
                    version=1
                )
                db.session.add(submission)
                submissions.append(submission)
                print(f"  ✅ Tạo submission: {submission_data['title']}")
        
        db.session.commit()
        print(f"✅ Đã tạo {len(submissions)} submissions")
        
        print("\n" + "="*50)
        print("🎉 Hoàn thành seed dữ liệu!")
        print("="*50)
        print(f"📊 Tổng kết:")
        print(f"   - Users: {User.query.count()}")
        print(f"   - Students: {Student.query.count()}")
        print(f"   - Teachers: {Teacher.query.count()}")
        print(f"   - Projects: {Project.query.count()}")
        print(f"   - Teams: {Team.query.count()}")
        print(f"   - Submissions: {ProjectSubmission.query.count()}")
        print("="*50)

if __name__ == '__main__':
    seed_data()

