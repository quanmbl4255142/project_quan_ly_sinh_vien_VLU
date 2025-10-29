from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Teacher, User
from sqlalchemy import or_

teacher_bp = Blueprint('teacher', __name__)

@teacher_bp.route('/', methods=['GET'])
@jwt_required()
def get_teachers():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        search = request.args.get('search', '')
        department = request.args.get('department', '')
        status = request.args.get('status', '')
        
        query = Teacher.query
        
        if search:
            query = query.filter(
                or_(
                    Teacher.full_name.contains(search),
                    Teacher.teacher_code.contains(search),
                    Teacher.specialization.contains(search)
                )
            )
        
        if department:
            query = query.filter(Teacher.department == department)
        
        if status:
            query = query.filter(Teacher.status == status)
        
        teachers = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'teachers': [teacher.to_dict() for teacher in teachers.items],
            'total': teachers.total,
            'pages': teachers.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@teacher_bp.route('/<int:teacher_id>', methods=['GET'])
@jwt_required()
def get_teacher(teacher_id):
    try:
        teacher = Teacher.query.get(teacher_id)
        
        if not teacher:
            return jsonify({'error': 'Teacher not found'}), 404
        
        return jsonify({'teacher': teacher.to_dict()}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@teacher_bp.route('/', methods=['POST'])
@jwt_required()
def create_teacher():
    try:
        data = request.get_json()
        
        # Validation
        required_fields = ['user_id', 'teacher_code', 'full_name', 'department']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Check if teacher code exists
        if Teacher.query.filter_by(teacher_code=data['teacher_code']).first():
            return jsonify({'error': 'Teacher code already exists'}), 400
        
        # Check if user exists and is a teacher
        user = User.query.get(data['user_id'])
        if not user:
            return jsonify({'error': 'User not found'}), 404
        if user.role != 'teacher':
            return jsonify({'error': 'User must have teacher role'}), 400
        
        # Create teacher
        teacher = Teacher(
            user_id=data['user_id'],
            teacher_code=data['teacher_code'],
            full_name=data['full_name'],
            phone=data.get('phone'),
            email=data.get('email'),
            department=data['department'],
            title=data.get('title'),
            specialization=data.get('specialization'),
            status=data.get('status', 'active')
        )
        
        db.session.add(teacher)
        db.session.commit()
        
        return jsonify({
            'message': 'Teacher created successfully',
            'teacher': teacher.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@teacher_bp.route('/<int:teacher_id>', methods=['PUT'])
@jwt_required()
def update_teacher(teacher_id):
    try:
        teacher = Teacher.query.get(teacher_id)
        
        if not teacher:
            return jsonify({'error': 'Teacher not found'}), 404
        
        data = request.get_json()
        
        # Update fields
        if 'full_name' in data:
            teacher.full_name = data['full_name']
        if 'phone' in data:
            teacher.phone = data['phone']
        if 'email' in data:
            teacher.email = data['email']
        if 'department' in data:
            teacher.department = data['department']
        if 'title' in data:
            teacher.title = data['title']
        if 'specialization' in data:
            teacher.specialization = data['specialization']
        if 'status' in data:
            teacher.status = data['status']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Teacher updated successfully',
            'teacher': teacher.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@teacher_bp.route('/<int:teacher_id>', methods=['DELETE'])
@jwt_required()
def delete_teacher(teacher_id):
    try:
        teacher = Teacher.query.get(teacher_id)
        
        if not teacher:
            return jsonify({'error': 'Teacher not found'}), 404
        
        db.session.delete(teacher)
        db.session.commit()
        
        return jsonify({'message': 'Teacher deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@teacher_bp.route('/<int:teacher_id>/projects', methods=['GET'])
@jwt_required()
def get_teacher_projects(teacher_id):
    try:
        teacher = Teacher.query.get(teacher_id)
        
        if not teacher:
            return jsonify({'error': 'Teacher not found'}), 404
        
        projects = [project.to_dict() for project in teacher.projects]
        
        return jsonify({'projects': projects}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@teacher_bp.route('/<int:teacher_id>/evaluations', methods=['GET'])
@jwt_required()
def get_teacher_evaluations(teacher_id):
    try:
        teacher = Teacher.query.get(teacher_id)
        
        if not teacher:
            return jsonify({'error': 'Teacher not found'}), 404
        
        evaluations = [evaluation.to_dict() for evaluation in teacher.evaluations]
        
        return jsonify({'evaluations': evaluations}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@teacher_bp.route('/statistics', methods=['GET'])
@jwt_required()
def get_teacher_statistics():
    try:
        total_teachers = Teacher.query.count()
        active_teachers = Teacher.query.filter_by(status='active').count()
        retired_teachers = Teacher.query.filter_by(status='retired').count()
        
        # Get departments distribution
        departments = db.session.query(
            Teacher.department, 
            db.func.count(Teacher.id)
        ).group_by(Teacher.department).all()
        
        return jsonify({
            'total_teachers': total_teachers,
            'active_teachers': active_teachers,
            'retired_teachers': retired_teachers,
            'departments_distribution': [{'department': dept, 'count': count} for dept, count in departments]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
