from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User
from utils.decorators import admin_required
from utils.metrics import metrics_collector

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/users', methods=['GET'])
@jwt_required()
@admin_required
def get_all_users():
    """Admin: Get all users in the system"""
    try:
        users = User.query.all()
        users_list = []
        for user in users:
            try:
                users_list.append(user.to_dict())
            except Exception as e:
                # Log error for individual user but continue
                print(f"Error serializing user {user.id}: {str(e)}")
                continue
        
        return jsonify({
            'users': users_list
        }), 200
    except Exception as e:
        import traceback
        print(f"Error in get_all_users: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'error': str(e),
            'message': 'Failed to retrieve users'
        }), 500

@admin_bp.route('/metrics', methods=['GET'])
@jwt_required()
@admin_required
def get_metrics():
    """Admin: Lightweight runtime metrics for monitoring"""
    try:
        return jsonify(metrics_collector.snapshot()), 200
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
        import psutil
        import os
        
        # Use proper SQLAlchemy queries for efficiency
        total_users = User.query.count()
        
        # Count active users - use explicit True comparison
        active_users = User.query.filter(User.is_active == True).count()
        inactive_users = User.query.filter(User.is_active == False).count()
        
        # Role distribution
        admins = User.query.filter(User.role == 'admin').count()
        teachers = User.query.filter(User.role == 'teacher').count()
        students = User.query.filter(User.role == 'student').count()
        
        # Verify counts for debugging
        print(f"[Admin Stats] Total users: {total_users}, Active: {active_users}, Inactive: {inactive_users}")
        print(f"[Admin Stats] Admins: {admins}, Teachers: {teachers}, Students: {students}")
        
        # Verify active count matches
        if active_users + inactive_users != total_users:
            print(f"[Admin Stats] WARNING: Active ({active_users}) + Inactive ({inactive_users}) != Total ({total_users})")
        
        # Other stats
        total_students = Student.query.count()
        total_teachers = Teacher.query.count()
        total_projects = Project.query.count()
        total_teams = Team.query.count()
        total_submissions = ProjectSubmission.query.count()
        
        # System metrics (CPU, Memory, Disk)
        system_metrics = {}
        try:
            # CPU usage
            cpu_percent = psutil.cpu_percent(interval=0.1)
            cpu_count = psutil.cpu_count()
            
            # Memory usage
            memory = psutil.virtual_memory()
            memory_total_gb = memory.total / (1024**3)
            memory_used_gb = memory.used / (1024**3)
            memory_percent = memory.percent
            
            # Disk usage
            disk = psutil.disk_usage('/')
            disk_total_gb = disk.total / (1024**3)
            disk_used_gb = disk.used / (1024**3)
            disk_percent = disk.percent
            
            # Process info
            process = psutil.Process(os.getpid())
            process_memory_mb = process.memory_info().rss / (1024**2)
            
            system_metrics = {
                'cpu': {
                    'percent': round(cpu_percent, 2),
                    'cores': cpu_count
                },
                'memory': {
                    'total_gb': round(memory_total_gb, 2),
                    'used_gb': round(memory_used_gb, 2),
                    'percent': round(memory_percent, 2),
                    'available_gb': round(memory.available / (1024**3), 2)
                },
                'disk': {
                    'total_gb': round(disk_total_gb, 2),
                    'used_gb': round(disk_used_gb, 2),
                    'percent': round(disk_percent, 2),
                    'free_gb': round(disk.free / (1024**3), 2)
                },
                'process': {
                    'memory_mb': round(process_memory_mb, 2)
                }
            }
        except Exception as e:
            print(f"[Admin Stats] Error getting system metrics: {str(e)}")
            system_metrics = {'error': 'Unable to fetch system metrics'}
        
        # Get runtime metrics
        runtime_metrics = {}
        try:
            runtime_metrics = metrics_collector.snapshot()
        except Exception as e:
            print(f"[Admin Stats] Error getting runtime metrics: {str(e)}")
        
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
            },
            'metrics': {
                'system': system_metrics,
                'runtime': runtime_metrics
            }
        }), 200
    except Exception as e:
        import traceback
        print(f"[Admin Stats] Error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({'error': str(e)}), 500

@admin_bp.route('/seed-data', methods=['POST'])
@jwt_required()
@admin_required
def seed_data_endpoint():
    """Admin: Seed fake data into database"""
    try:
        import sys
        import io
        from contextlib import redirect_stdout
        
        # Import seed function
        from seed_data import seed_data
        
        # Capture output
        output = io.StringIO()
        with redirect_stdout(output):
            seed_data()
        
        output_str = output.getvalue()
        
        # Get final statistics
        from models import Student, Teacher, Project, Team, ProjectSubmission
        
        stats = {
            'users': User.query.count(),
            'students': Student.query.count(),
            'teachers': Teacher.query.count(),
            'projects': Project.query.count(),
            'teams': Team.query.count(),
            'submissions': ProjectSubmission.query.count()
        }
        
        return jsonify({
            'message': 'Seed data completed successfully',
            'output': output_str,
            'statistics': stats
        }), 200
    except Exception as e:
        import traceback
        return jsonify({
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

