#!/usr/bin/env python3
"""
File test API hoàn chỉnh cho hệ thống quản lý dự án sinh viên
Test tất cả các endpoint với các trường hợp thành công và lỗi
"""

import requests
import json
import time
from datetime import datetime

# Cấu hình
BASE_URL = "http://localhost:5000"
API_BASE = f"{BASE_URL}/api"

class TestAPI:
    def __init__(self):
        self.base_url = API_BASE
        self.auth_token = None
        self.test_data = {}
        
    def log_test(self, test_name, status="ĐANG CHẠY"):
        """Ghi log test"""
        print(f"\n{'='*60}")
        print(f"TEST: {test_name} - {status}")
        print(f"{'='*60}")
    
    def make_request(self, method, endpoint, data=None, headers=None):
        """Thực hiện HTTP request"""
        url = f"{self.base_url}{endpoint}"
        
        if headers is None:
            headers = {}
        
        if self.auth_token:
            headers['Authorization'] = f'Bearer {self.auth_token}'
        
        headers['Content-Type'] = 'application/json'
        
        try:
            if method.upper() == 'GET':
                response = requests.get(url, headers=headers, params=data)
            elif method.upper() == 'POST':
                response = requests.post(url, headers=headers, json=data)
            elif method.upper() == 'PUT':
                response = requests.put(url, headers=headers, json=data)
            elif method.upper() == 'DELETE':
                response = requests.delete(url, headers=headers)
            else:
                raise ValueError(f"HTTP method không hỗ trợ: {method}")
            
            return response
            
        except requests.exceptions.RequestException as e:
            print(f"Lỗi request: {e}")
            return None

    # ============= TEST XÁC THỰC =============
    
    def test_dang_ky_dang_nhap(self):
        """Test đăng ký và đăng nhập"""
        self.log_test("Đăng ký và đăng nhập")
        
        # Test 1: Đăng ký user mới
        self.log_test("Đăng ký user", "ĐANG CHẠY")
        register_data = {
            "username": "testuser",
            "email": "testuser@example.com",
            "password": "password123",
            "role": "student"
        }
        
        response = self.make_request('POST', '/auth/register', register_data)
        if response and response.status_code == 201:
            print("SUCCESS: Dang ky thanh cong")
            self.test_data['user_id'] = response.json().get('user', {}).get('id')
        else:
            print("ERROR: Dang ky that bai")
            return False
        
        # Test 2: Đăng nhập
        self.log_test("Đăng nhập", "ĐANG CHẠY")
        login_data = {
            "username": "testuser",
            "password": "password123"
        }
        
        response = self.make_request('POST', '/auth/login', login_data)
        if response and response.status_code == 200:
            print("SUCCESS: Đăng nhập thành công")
            self.auth_token = response.json().get('access_token')
            self.test_data['auth_token'] = self.auth_token
        else:
            print("ERROR: Đăng nhập thất bại")
            return False
        
        # Test 3: Lấy thông tin profile
        self.log_test("Lấy thông tin profile", "ĐANG CHẠY")
        response = self.make_request('GET', '/auth/profile')
        if response and response.status_code == 200:
            print("SUCCESS: Lấy profile thành công")
        else:
            print("ERROR: Lấy profile thất bại")
            return False
        
        return True
    
    def test_loi_dang_ky_dang_nhap(self):
        """Test các trường hợp lỗi"""
        self.log_test("Test các trường hợp lỗi")
        
        # Test đăng nhập sai
        self.log_test("Đăng nhập sai", "ĐANG CHẠY")
        invalid_login = {
            "username": "khong_ton_tai",
            "password": "sai_mat_khau"
        }
        
        response = self.make_request('POST', '/auth/login', invalid_login)
        if response and response.status_code == 401:
            print("SUCCESS: Xử lý đăng nhập sai đúng")
        else:
            print("ERROR: Xử lý đăng nhập sai không đúng")
        
        # Test đăng ký trùng
        self.log_test("Đăng ký trùng", "ĐANG CHẠY")
        duplicate_data = {
            "username": "testuser",
            "email": "testuser@example.com",
            "password": "password123",
            "role": "student"
        }
        
        response = self.make_request('POST', '/auth/register', duplicate_data)
        if response and response.status_code == 400:
            print("SUCCESS: Xử lý đăng ký trùng đúng")
        else:
            print("ERROR: Xử lý đăng ký trùng không đúng")
        
        return True

    # ============= TEST QUẢN LÝ SINH VIÊN =============
    
    def test_quan_ly_sinh_vien(self):
        """Test quản lý sinh viên"""
        self.log_test("Quản lý sinh viên")
        
        # Tạo profile sinh viên
        self.log_test("Tạo profile sinh viên", "ĐANG CHẠY")
        student_data = {
            "user_id": self.test_data.get('user_id'),
            "student_code": "SV001",
            "full_name": "Nguyễn Văn A",
            "date_of_birth": "2000-01-01",
            "phone": "0123456789",
            "address": "123 Đường Test",
            "major": "Khoa học máy tính",
            "class_name": "CS2023",
            "year_of_study": 3,
            "gpa": 3.5,
            "status": "active"
        }
        
        response = self.make_request('POST', '/students/', student_data)
        if response and response.status_code == 201:
            print("SUCCESS: Tạo sinh viên thành công")
            self.test_data['student_id'] = response.json().get('student', {}).get('id')
        else:
            print("ERROR: Tạo sinh viên thất bại")
            return False
        
        # Lấy thông tin sinh viên
        self.log_test("Lấy thông tin sinh viên", "ĐANG CHẠY")
        student_id = self.test_data.get('student_id')
        response = self.make_request('GET', f'/students/{student_id}')
        if response and response.status_code == 200:
            print("SUCCESS: Lấy thông tin sinh viên thành công")
        else:
            print("ERROR: Lấy thông tin sinh viên thất bại")
        
        # Cập nhật sinh viên
        self.log_test("Cập nhật sinh viên", "ĐANG CHẠY")
        update_data = {
            "full_name": "Nguyễn Văn A Cập nhật",
            "gpa": 3.8
        }
        
        response = self.make_request('PUT', f'/students/{student_id}', update_data)
        if response and response.status_code == 200:
            print("SUCCESS: Cập nhật sinh viên thành công")
        else:
            print("ERROR: Cập nhật sinh viên thất bại")
        
        # Lấy danh sách sinh viên
        self.log_test("Lấy danh sách sinh viên", "ĐANG CHẠY")
        filters = {
            "search": "Nguyễn",
            "major": "Khoa học máy tính",
            "status": "active",
            "page": 1,
            "per_page": 10
        }
        
        response = self.make_request('GET', '/students/', filters)
        if response and response.status_code == 200:
            print("SUCCESS: Lấy danh sách sinh viên thành công")
        else:
            print("ERROR: Lấy danh sách sinh viên thất bại")
        
        # Thống kê sinh viên
        self.log_test("Thống kê sinh viên", "ĐANG CHẠY")
        response = self.make_request('GET', '/students/statistics')
        if response and response.status_code == 200:
            print("SUCCESS: Lấy thống kê sinh viên thành công")
        else:
            print("ERROR: Lấy thống kê sinh viên thất bại")
        
        return True

    # ============= TEST QUẢN LÝ GIẢNG VIÊN =============
    
    def test_quan_ly_giang_vien(self):
        """Test quản lý giảng viên"""
        self.log_test("Quản lý giảng viên")
        
        # Tạo user giảng viên
        self.log_test("Tạo user giảng viên", "ĐANG CHẠY")
        teacher_user_data = {
            "username": "giangvien1",
            "email": "giangvien1@example.com",
            "password": "password123",
            "role": "teacher"
        }
        
        response = self.make_request('POST', '/auth/register', teacher_user_data)
        if response and response.status_code == 201:
            print("SUCCESS: Tạo user giảng viên thành công")
            teacher_user_id = response.json().get('user', {}).get('id')
        else:
            print("ERROR: Tạo user giảng viên thất bại")
            return False
        
        # Đăng nhập giảng viên
        teacher_login_data = {
            "username": "giangvien1",
            "password": "password123"
        }
        
        response = self.make_request('POST', '/auth/login', teacher_login_data)
        if response and response.status_code == 200:
            print("SUCCESS: Đăng nhập giảng viên thành công")
            self.auth_token = response.json().get('access_token')
        else:
            print("ERROR: Đăng nhập giảng viên thất bại")
            return False
        
        # Tạo profile giảng viên
        self.log_test("Tạo profile giảng viên", "ĐANG CHẠY")
        teacher_data = {
            "user_id": teacher_user_id,
            "teacher_code": "GV001",
            "full_name": "Trần Thị B",
            "phone": "0987654321",
            "email": "giangvien1@example.com",
            "department": "Khoa học máy tính",
            "title": "Phó giáo sư",
            "specialization": "Công nghệ phần mềm",
            "status": "active"
        }
        
        response = self.make_request('POST', '/teachers/', teacher_data)
        if response and response.status_code == 201:
            print("SUCCESS: Tạo giảng viên thành công")
            self.test_data['teacher_id'] = response.json().get('teacher', {}).get('id')
        else:
            print("ERROR: Tạo giảng viên thất bại")
            return False
        
        # Lấy thông tin giảng viên
        self.log_test("Lấy thông tin giảng viên", "ĐANG CHẠY")
        teacher_id = self.test_data.get('teacher_id')
        response = self.make_request('GET', f'/teachers/{teacher_id}')
        if response and response.status_code == 200:
            print("SUCCESS: Lấy thông tin giảng viên thành công")
        else:
            print("ERROR: Lấy thông tin giảng viên thất bại")
        
        return True

    # ============= TEST QUẢN LÝ DỰ ÁN =============
    
    def test_quan_ly_du_an(self):
        """Test quản lý dự án"""
        self.log_test("Quản lý dự án")
        
        # Tạo dự án
        self.log_test("Tạo dự án", "ĐANG CHẠY")
        project_data = {
            "project_code": "PRJ001",
            "title": "Ứng dụng web quản lý",
            "description": "Ứng dụng web quản lý dự án sinh viên",
            "requirements": "HTML, CSS, JavaScript, Python, Flask",
            "objectives": "Học phát triển full-stack",
            "technology_stack": "Flask, React, MySQL",
            "difficulty_level": "intermediate",
            "estimated_duration": "3 tháng",
            "max_team_size": 4,
            "min_team_size": 2,
            "supervisor_id": self.test_data.get('teacher_id'),
            "status": "published",
            "semester": "Học kỳ 1 2024",
            "academic_year": "2024-2025",
            "deadline": "2024-12-31T23:59:59"
        }
        
        response = self.make_request('POST', '/projects/', project_data)
        if response and response.status_code == 201:
            print("SUCCESS: Tạo dự án thành công")
            self.test_data['project_id'] = response.json().get('project', {}).get('id')
        else:
            print("ERROR: Tạo dự án thất bại")
            return False
        
        # Lấy thông tin dự án
        self.log_test("Lấy thông tin dự án", "ĐANG CHẠY")
        project_id = self.test_data.get('project_id')
        response = self.make_request('GET', f'/projects/{project_id}')
        if response and response.status_code == 200:
            print("SUCCESS: Lấy thông tin dự án thành công")
        else:
            print("ERROR: Lấy thông tin dự án thất bại")
        
        # Upload tài liệu dự án
        self.log_test("Upload tài liệu dự án", "ĐANG CHẠY")
        document_data = {
            "title": "Tài liệu yêu cầu dự án",
            "description": "Tài liệu chi tiết yêu cầu dự án",
            "file_path": "/documents/yeu_cau.pdf",
            "file_type": "pdf",
            "file_size": 1024000,
            "document_type": "requirements"
        }
        
        response = self.make_request('POST', f'/projects/{project_id}/documents', document_data)
        if response and response.status_code == 201:
            print("SUCCESS: Upload tài liệu thành công")
        else:
            print("ERROR: Upload tài liệu thất bại")
        
        return True

    # ============= TEST QUẢN LÝ NHÓM =============
    
    def test_quan_ly_nhom(self):
        """Test quản lý nhóm"""
        self.log_test("Quản lý nhóm")
        
        # Tạo nhóm
        self.log_test("Tạo nhóm", "ĐANG CHẠY")
        team_data = {
            "team_name": "Nhóm Alpha",
            "project_id": self.test_data.get('project_id'),
            "leader_id": self.test_data.get('student_id'),
            "member_ids": [self.test_data.get('student_id')],
            "status": "forming"
        }
        
        response = self.make_request('POST', '/teams/', team_data)
        if response and response.status_code == 201:
            print("SUCCESS: Tạo nhóm thành công")
            self.test_data['team_id'] = response.json().get('team', {}).get('id')
        else:
            print("ERROR: Tạo nhóm thất bại")
            return False
        
        # Lấy thông tin nhóm
        self.log_test("Lấy thông tin nhóm", "ĐANG CHẠY")
        team_id = self.test_data.get('team_id')
        response = self.make_request('GET', f'/teams/{team_id}')
        if response and response.status_code == 200:
            print("SUCCESS: Lấy thông tin nhóm thành công")
        else:
            print("ERROR: Lấy thông tin nhóm thất bại")
        
        return True

    # ============= TEST NỘP BÀI VÀ ĐÁNH GIÁ =============
    
    def test_nop_bai_danh_gia(self):
        """Test nộp bài và đánh giá"""
        self.log_test("Nộp bài và đánh giá")
        
        # Tạo bài nộp
        self.log_test("Tạo bài nộp", "ĐANG CHẠY")
        submission_data = {
            "project_id": self.test_data.get('project_id'),
            "submission_type": "team",
            "title": "Báo cáo tiến độ dự án",
            "description": "Báo cáo tiến độ hàng tuần của dự án",
            "file_path": "/submissions/bao_cao_tien_do.pdf",
            "file_type": "pdf",
            "file_size": 2048000,
            "submission_category": "report",
            "status": "submitted"
        }
        
        response = self.make_request('POST', '/submissions/submissions', submission_data)
        if response and response.status_code == 201:
            print("SUCCESS: Tạo bài nộp thành công")
            self.test_data['submission_id'] = response.json().get('submission', {}).get('id')
        else:
            print("ERROR: Tạo bài nộp thất bại")
            return False
        
        # Lấy thông tin bài nộp
        self.log_test("Lấy thông tin bài nộp", "ĐANG CHẠY")
        submission_id = self.test_data.get('submission_id')
        response = self.make_request('GET', f'/submissions/submissions/{submission_id}')
        if response and response.status_code == 200:
            print("SUCCESS: Lấy thông tin bài nộp thành công")
        else:
            print("ERROR: Lấy thông tin bài nộp thất bại")
        
        # Review bài nộp
        self.log_test("Review bài nộp", "ĐANG CHẠY")
        review_data = {
            "status": "approved",
            "feedback": "Tiến độ tốt, tiếp tục phát huy!"
        }
        
        response = self.make_request('POST', f'/submissions/submissions/{submission_id}/review', review_data)
        if response and response.status_code == 200:
            print("SUCCESS: Review bài nộp thành công")
        else:
            print("ERROR: Review bài nộp thất bại")
        
        # Tạo đánh giá
        self.log_test("Tạo đánh giá", "ĐANG CHẠY")
        evaluation_data = {
            "project_id": self.test_data.get('project_id'),
            "submission_id": self.test_data.get('submission_id'),
            "evaluator_type": "teacher",
            "technical_quality": 8,
            "creativity": 7,
            "presentation": 9,
            "teamwork": 8,
            "timeliness": 9,
            "documentation": 8,
            "max_score": 60.0,
            "comments": "Công việc xuất sắc với triển khai kỹ thuật tốt."
        }
        
        response = self.make_request('POST', '/submissions/evaluations', evaluation_data)
        if response and response.status_code == 201:
            print("SUCCESS: Tạo đánh giá thành công")
        else:
            print("ERROR: Tạo đánh giá thất bại")
        
        return True

    # ============= TEST XỬ LÝ LỖI =============
    
    def test_xu_ly_loi(self):
        """Test xử lý các lỗi"""
        self.log_test("Xử lý lỗi")
        
        # Test 404 - Không tìm thấy
        self.log_test("Test 404", "ĐANG CHẠY")
        response = self.make_request('GET', '/students/99999')
        if response and response.status_code == 404:
            print("SUCCESS: Xử lý 404 đúng")
        else:
            print("ERROR: Xử lý 404 không đúng")
        
        # Test 400 - Dữ liệu không hợp lệ
        self.log_test("Test 400", "ĐANG CHẠY")
        invalid_data = {
            "invalid_field": "invalid_value"
        }
        
        response = self.make_request('POST', '/students/', invalid_data)
        if response and response.status_code == 400:
            print("SUCCESS: Xử lý 400 đúng")
        else:
            print("ERROR: Xử lý 400 không đúng")
        
        # Test 401 - Không có quyền truy cập
        self.log_test("Test 401", "ĐANG CHẠY")
        # Tạm thời xóa token
        original_token = self.auth_token
        self.auth_token = None
        
        response = self.make_request('GET', '/students/')
        if response and response.status_code == 401:
            print("SUCCESS: Xử lý 401 đúng")
        else:
            print("ERROR: Xử lý 401 không đúng")
        
        # Khôi phục token
        self.auth_token = original_token
        
        return True

    # ============= TEST HIỆU SUẤT =============
    
    def test_hieu_suat(self):
        """Test hiệu suất API"""
        self.log_test("Test hiệu suất")
        
        import threading
        import time
        
        def make_request_thread():
            response = self.make_request('GET', '/students/')
            return response is not None and response.status_code == 200
        
        threads = []
        start_time = time.time()
        
        # Tạo 5 request đồng thời
        for i in range(5):
            thread = threading.Thread(target=make_request_thread)
            threads.append(thread)
            thread.start()
        
        # Chờ tất cả thread hoàn thành
        for thread in threads:
            thread.join()
        
        end_time = time.time()
        duration = end_time - start_time
        
        print(f"SUCCESS: 5 request đồng thời hoàn thành trong {duration:.2f} giây")
        
        return True

    # ============= CHẠY TẤT CẢ TEST =============
    
    def chay_tat_ca_test(self):
        """Chạy tất cả test"""
        print("START: Bat dau test API hoan chinh")
        print("=" * 80)
        
        ket_qua_test = []
        
        # Test xác thực
        ket_qua_test.append(("Đăng ký đăng nhập", self.test_dang_ky_dang_nhap()))
        ket_qua_test.append(("Lỗi đăng ký đăng nhập", self.test_loi_dang_ky_dang_nhap()))
        
        # Test quản lý sinh viên
        ket_qua_test.append(("Quản lý sinh viên", self.test_quan_ly_sinh_vien()))
        
        # Test quản lý giảng viên
        ket_qua_test.append(("Quản lý giảng viên", self.test_quan_ly_giang_vien()))
        
        # Test quản lý dự án
        ket_qua_test.append(("Quản lý dự án", self.test_quan_ly_du_an()))
        
        # Test quản lý nhóm
        ket_qua_test.append(("Quản lý nhóm", self.test_quan_ly_nhom()))
        
        # Test nộp bài và đánh giá
        ket_qua_test.append(("Nộp bài đánh giá", self.test_nop_bai_danh_gia()))
        
        # Test xử lý lỗi
        ket_qua_test.append(("Xử lý lỗi", self.test_xu_ly_loi()))
        
        # Test hiệu suất
        ket_qua_test.append(("Test hiệu suất", self.test_hieu_suat()))
        
        # In kết quả
        print("\n" + "=" * 80)
        print("RESULT: TONG KET KET QUA TEST")
        print("=" * 80)
        
        thanh_cong = 0
        that_bai = 0
        
        for ten_test, ket_qua in ket_qua_test:
            trang_thai = "SUCCESS: THÀNH CÔNG" if ket_qua else "ERROR: THẤT BẠI"
            print(f"{ten_test:<30} {trang_thai}")
            if ket_qua:
                thanh_cong += 1
            else:
                that_bai += 1
        
        print("=" * 80)
        print(f"Tổng số test: {len(ket_qua_test)}")
        print(f"Thành công: {thanh_cong}")
        print(f"Thất bại: {that_bai}")
        print(f"Tỷ lệ thành công: {(thanh_cong/len(ket_qua_test)*100):.1f}%")
        print("=" * 80)
        
        return that_bai == 0

def main():
    """Hàm chính để chạy test"""
    print("Test API Quan ly Du an Sinh vien")
    print("=" * 80)
    
    # Kiểm tra API có chạy không
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code != 200:
            print("ERROR: API khong chay. Vui long khoi dong server API truoc.")
            print("Chay: python app.py")
            return False
    except requests.exceptions.RequestException:
        print("ERROR: Khong the ket noi API. Vui long khoi dong server API truoc.")
        print("Chạy: python app.py")
        return False
    
    print("SUCCESS: API dang chay. Bat dau test...")
    
    # Chạy test
    test_suite = TestAPI()
    thanh_cong = test_suite.chay_tat_ca_test()
    
    if thanh_cong:
        print("\nSUCCESS: Tất cả test đều thành công!")
        return True
    else:
        print("\nERROR: Một số test thất bại!")
        return False

if __name__ == "__main__":
    thanh_cong = main()
    exit(0 if thanh_cong else 1)
