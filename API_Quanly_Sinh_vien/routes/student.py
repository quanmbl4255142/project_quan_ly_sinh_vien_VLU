from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Student, User
from sqlalchemy import or_
from utils.decorators import admin_required, teacher_or_admin_required
import re

student_bp = Blueprint('student', __name__)

@student_bp.route('/', methods=['GET'])
@jwt_required()
def get_students():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        search = request.args.get('search', '')
        major = request.args.get('major', '')
        status = request.args.get('status', '')
        
        query = Student.query
        
        if search:
            query = query.filter(
                or_(
                    Student.full_name.contains(search),
                    Student.student_code.contains(search),
                    Student.class_name.contains(search)
                )
            )
        
        if major:
            query = query.filter(Student.major == major)
        
        if status:
            query = query.filter(Student.status == status)
        
        students = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'students': [student.to_dict() for student in students.items],
            'total': students.total,
            'pages': students.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@student_bp.route('/<int:student_id>', methods=['GET'])
@jwt_required()
def get_student(student_id):
    try:
        student = Student.query.get(student_id)
        
        if not student:
            return jsonify({'error': 'Student not found'}), 404
        
        return jsonify({'student': student.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@student_bp.route('/', methods=['POST'])
@jwt_required()
@admin_required
def create_student():
    try:
        data = request.get_json()
        
        # Validation
        required_fields = ['user_id', 'student_code', 'full_name', 'major']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Check if student code exists
        if Student.query.filter_by(student_code=data['student_code']).first():
            return jsonify({'error': 'Student code already exists'}), 400
        
        # Check if user exists and is a student
        user = User.query.get(data['user_id'])
        if not user:
            return jsonify({'error': 'User not found'}), 404
        if user.role != 'student':
            return jsonify({'error': 'User must have student role'}), 400
        
        # Create student
        student = Student(
            user_id=data['user_id'],
            student_code=data['student_code'],
            full_name=data['full_name'],
            date_of_birth=data.get('date_of_birth'),
            phone=data.get('phone'),
            address=data.get('address'),
            major=data['major'],
            class_name=data.get('class_name'),
            year_of_study=data.get('year_of_study'),
            gpa=data.get('gpa', 0.0),
            status=data.get('status', 'active')
        )
        
        db.session.add(student)
        db.session.commit()
        
        return jsonify({
            'message': 'Student created successfully',
            'student': student.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@student_bp.route('/<int:student_id>', methods=['PUT'])
@jwt_required()
@admin_required
def update_student(student_id):
    try:
        student = Student.query.get(student_id)
        
        if not student:
            return jsonify({'error': 'Student not found'}), 404
        
        data = request.get_json()
        
        # Update fields
        if 'full_name' in data:
            student.full_name = data['full_name']
        if 'date_of_birth' in data:
            student.date_of_birth = data['date_of_birth']
        if 'phone' in data:
            student.phone = data['phone']
        if 'address' in data:
            student.address = data['address']
        if 'major' in data:
            student.major = data['major']
        if 'class_name' in data:
            student.class_name = data['class_name']
        if 'year_of_study' in data:
            student.year_of_study = data['year_of_study']
        if 'gpa' in data:
            student.gpa = data['gpa']
        if 'status' in data:
            student.status = data['status']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Student updated successfully',
            'student': student.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@student_bp.route('/<int:student_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_student(student_id):
    try:
        student = Student.query.get(student_id)
        
        if not student:
            return jsonify({'error': 'Student not found'}), 404
        
        db.session.delete(student)
        db.session.commit()
        
        return jsonify({'message': 'Student deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@student_bp.route('/<int:student_id>/teams', methods=['GET'])
@jwt_required()
def get_student_teams(student_id):
    try:
        student = Student.query.get(student_id)
        
        if not student:
            return jsonify({'error': 'Student not found'}), 404
        
        teams = []
        for membership in student.team_memberships:
            if membership.status == 'active':
                team_data = membership.team.to_dict()
                team_data['role'] = membership.role
                teams.append(team_data)
        
        return jsonify({'teams': teams}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@student_bp.route('/<int:student_id>/projects', methods=['GET'])
@jwt_required()
def get_student_projects(student_id):
    try:
        student = Student.query.get(student_id)
        
        if not student:
            return jsonify({'error': 'Student not found'}), 404
        
        projects = []
        for membership in student.team_memberships:
            if membership.status == 'active':
                project_data = membership.team.project.to_dict()
                project_data['team_role'] = membership.role
                projects.append(project_data)
        
        return jsonify({'projects': projects}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@student_bp.route('/statistics', methods=['GET'])
@jwt_required()
def get_student_statistics():
    try:
        total_students = Student.query.count()
        active_students = Student.query.filter_by(status='active').count()
        graduated_students = Student.query.filter_by(status='graduated').count()
        
        # Get majors distribution
        majors = db.session.query(
            Student.major, 
            db.func.count(Student.id)
        ).group_by(Student.major).all()
        
        return jsonify({
            'total_students': total_students,
            'active_students': active_students,
            'graduated_students': graduated_students,
            'majors_distribution': [{'major': major, 'count': count} for major, count in majors]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
