from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User
from utils.decorators import admin_required

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
@admin_required
def get_all_users():
    """Admin: Get all users in the system"""
    try:
        users = User.query.all()
        return jsonify({
            'users': [user.to_dict() for user in users]
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>', methods=['GET'])
@jwt_required()
@admin_required
def get_user(user_id):
    """Admin: Get specific user"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({'user': user.to_dict()}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>/toggle-active', methods=['PUT'])
@jwt_required()
@admin_required
def toggle_user_active(user_id):
    """Admin: Toggle user active status"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Cannot deactivate yourself
        current_user_id = get_jwt_identity()
        if int(current_user_id) == user_id:
            return jsonify({'error': 'Cannot deactivate your own account'}), 400
        
        user.is_active = not user.is_active
        db.session.commit()
        
        return jsonify({
            'message': f'User {"activated" if user.is_active else "deactivated"} successfully',
            'user': user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>/change-role', methods=['PUT'])
@jwt_required()
@admin_required
def change_user_role(user_id):
    """Admin: Change user role"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        new_role = data.get('role')
        
        if new_role not in ['admin', 'teacher', 'student']:
            return jsonify({'error': 'Invalid role'}), 400
        
        # Cannot change your own role
        current_user_id = get_jwt_identity()
        if int(current_user_id) == user_id:
            return jsonify({'error': 'Cannot change your own role'}), 400
        
        user.role = new_role
        db.session.commit()
        
        return jsonify({
            'message': 'User role changed successfully',
            'user': user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/users/<int:user_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_user(user_id):
    """Admin: Delete user"""
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Cannot delete yourself
        current_user_id = get_jwt_identity()
        if int(current_user_id) == user_id:
            return jsonify({'error': 'Cannot delete your own account'}), 400
        
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({'message': 'User deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/statistics', methods=['GET'])
@jwt_required()
@admin_required
def get_admin_statistics():
    """Admin: Get system-wide statistics"""
    try:
        from models import Student, Teacher, Project, Team, ProjectSubmission
        
        total_users = User.query.count()
        active_users = User.query.filter_by(is_active=True).count()
        
        # Role distribution
        admins = User.query.filter_by(role='admin').count()
        teachers = User.query.filter_by(role='teacher').count()
        students = User.query.filter_by(role='student').count()
        
        # Other stats
        total_students = Student.query.count()
        total_teachers = Teacher.query.count()
        total_projects = Project.query.count()
        total_teams = Team.query.count()
        total_submissions = ProjectSubmission.query.count()
        
        return jsonify({
            'users': {
                'total': total_users,
                'active': active_users,
                'admins': admins,
                'teachers': teachers,
                'students': students
            },
            'system': {
                'total_students': total_students,
                'total_teachers': total_teachers,
                'total_projects': total_projects,
                'total_teams': total_teams,
                'total_submissions': total_submissions
            }
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

