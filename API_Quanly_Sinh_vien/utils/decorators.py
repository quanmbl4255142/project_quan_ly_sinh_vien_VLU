from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from models import User

def role_required(*allowed_roles):
    """
    Decorator to check if user has required role
    Usage: @role_required('admin', 'teacher')
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            try:
                user_id = get_jwt_identity()
                user = User.query.get(int(user_id))
                
                if not user:
                    return jsonify({'error': 'User not found'}), 404
                
                if user.role not in allowed_roles:
                    return jsonify({
                        'error': 'Permission denied',
                        'message': f'This action requires one of these roles: {", ".join(allowed_roles)}',
                        'your_role': user.role
                    }), 403
                
                return fn(*args, **kwargs)
            except Exception as e:
                return jsonify({'error': str(e)}), 500
        return wrapper
    return decorator

def admin_required(fn):
    """
    Decorator for admin-only endpoints
    Usage: @admin_required
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            user_id = get_jwt_identity()
            user = User.query.get(int(user_id))
            
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            if user.role != 'admin':
                return jsonify({
                    'error': 'Admin access required',
                    'message': 'Only administrators can perform this action'
                }), 403
            
            return fn(*args, **kwargs)
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    return wrapper

def teacher_or_admin_required(fn):
    """
    Decorator for teacher or admin endpoints
    Usage: @teacher_or_admin_required
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            user_id = get_jwt_identity()
            user = User.query.get(int(user_id))
            
            if not user:
                return jsonify({'error': 'User not found'}), 404
            
            if user.role not in ['admin', 'teacher']:
                return jsonify({
                    'error': 'Permission denied',
                    'message': 'This action requires teacher or admin role'
                }), 403
            
            return fn(*args, **kwargs)
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    return wrapper

def own_resource_or_admin(resource_user_id_getter):
    """
    Decorator to check if user owns the resource or is admin
    Usage: @own_resource_or_admin(lambda student_id: Student.query.get(student_id).user_id)
    """
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            try:
                user_id = get_jwt_identity()
                user = User.query.get(int(user_id))
                
                if not user:
                    return jsonify({'error': 'User not found'}), 404
                
                # Admin can access everything
                if user.role == 'admin':
                    return fn(*args, **kwargs)
                
                # Check if user owns the resource
                resource_user_id = resource_user_id_getter(*args, **kwargs)
                
                if resource_user_id != user.id:
                    return jsonify({
                        'error': 'Permission denied',
                        'message': 'You can only access your own resources'
                    }), 403
                
                return fn(*args, **kwargs)
            except Exception as e:
                return jsonify({'error': str(e)}), 500
        return wrapper
    return decorator

