from flask import Blueprint, request, jsonify, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Project, ProjectDocument, Teacher
from sqlalchemy import or_
from utils.decorators import admin_required, teacher_or_admin_required
from utils.file_upload import save_uploaded_file, get_file_path, delete_file
from datetime import datetime
import os

project_bp = Blueprint('project', __name__)

@project_bp.route('/', methods=['GET'])
@jwt_required()
def get_projects():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        search = request.args.get('search', '')
        status = request.args.get('status', '')
        difficulty = request.args.get('difficulty', '')
        supervisor_id = request.args.get('supervisor_id', type=int)
        semester = request.args.get('semester', '')
        academic_year = request.args.get('academic_year', '')
        
        query = Project.query
        
        if search:
            query = query.filter(
                or_(
                    Project.title.contains(search),
                    Project.description.contains(search),
                    Project.technology_stack.contains(search)
                )
            )
        
        if status:
            query = query.filter(Project.status == status)
        
        if difficulty:
            query = query.filter(Project.difficulty_level == difficulty)
        
        if supervisor_id:
            query = query.filter(Project.supervisor_id == supervisor_id)
        
        if semester:
            query = query.filter(Project.semester == semester)
        
        if academic_year:
            query = query.filter(Project.academic_year == academic_year)
        
        projects = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'projects': [project.to_dict() for project in projects.items],
            'total': projects.total,
            'pages': projects.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@project_bp.route('/<int:project_id>', methods=['GET'])
@jwt_required()
def get_project(project_id):
    try:
        project = Project.query.get(project_id)
        
        if not project:
            return jsonify({'error': 'Project not found'}), 404
        
        project_data = project.to_dict()
        
        # Add supervisor info
        if project.supervisor:
            project_data['supervisor'] = project.supervisor.to_dict()
        
        # Add team count
        project_data['team_count'] = len([team for team in project.teams if team.status != 'disbanded'])
        
        return jsonify({'project': project_data}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@project_bp.route('/', methods=['POST'])
@jwt_required()
@teacher_or_admin_required
def create_project():
    try:
        data = request.get_json()
        
        # Validation
        required_fields = ['project_code', 'title', 'supervisor_id']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Check if project code exists
        if Project.query.filter_by(project_code=data['project_code']).first():
            return jsonify({'error': 'Project code already exists'}), 400
        
        # Check if supervisor exists
        supervisor = Teacher.query.get(data['supervisor_id'])
        if not supervisor:
            return jsonify({'error': 'Supervisor not found'}), 404
        
        # Create project
        project = Project(
            project_code=data['project_code'],
            title=data['title'],
            description=data.get('description'),
            requirements=data.get('requirements'),
            objectives=data.get('objectives'),
            technology_stack=data.get('technology_stack'),
            difficulty_level=data.get('difficulty_level', 'intermediate'),
            estimated_duration=data.get('estimated_duration'),
            max_team_size=data.get('max_team_size', 4),
            min_team_size=data.get('min_team_size', 2),
            supervisor_id=data['supervisor_id'],
            status=data.get('status', 'draft'),
            semester=data.get('semester'),
            academic_year=data.get('academic_year'),
            deadline=datetime.fromisoformat(data['deadline']) if data.get('deadline') else None
        )
        
        db.session.add(project)
        db.session.commit()
        
        return jsonify({
            'message': 'Project created successfully',
            'project': project.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@project_bp.route('/<int:project_id>', methods=['PUT'])
@jwt_required()
@teacher_or_admin_required
def update_project(project_id):
    try:
        project = Project.query.get(project_id)
        
        if not project:
            return jsonify({'error': 'Project not found'}), 404
        
        data = request.get_json()
        
        # Update fields
        if 'title' in data:
            project.title = data['title']
        if 'description' in data:
            project.description = data['description']
        if 'requirements' in data:
            project.requirements = data['requirements']
        if 'objectives' in data:
            project.objectives = data['objectives']
        if 'technology_stack' in data:
            project.technology_stack = data['technology_stack']
        if 'difficulty_level' in data:
            project.difficulty_level = data['difficulty_level']
        if 'estimated_duration' in data:
            project.estimated_duration = data['estimated_duration']
        if 'max_team_size' in data:
            project.max_team_size = data['max_team_size']
        if 'min_team_size' in data:
            project.min_team_size = data['min_team_size']
        if 'status' in data:
            project.status = data['status']
        if 'semester' in data:
            project.semester = data['semester']
        if 'academic_year' in data:
            project.academic_year = data['academic_year']
        if 'deadline' in data:
            project.deadline = datetime.fromisoformat(data['deadline']) if data['deadline'] else None
        
        db.session.commit()
        
        return jsonify({
            'message': 'Project updated successfully',
            'project': project.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@project_bp.route('/<int:project_id>', methods=['DELETE'])
@jwt_required()
@admin_required
def delete_project(project_id):
    try:
        project = Project.query.get(project_id)
        
        if not project:
            return jsonify({'error': 'Project not found'}), 404
        
        db.session.delete(project)
        db.session.commit()
        
        return jsonify({'message': 'Project deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@project_bp.route('/<int:project_id>/teams', methods=['GET'])
@jwt_required()
def get_project_teams(project_id):
    try:
        project = Project.query.get(project_id)
        
        if not project:
            return jsonify({'error': 'Project not found'}), 404
        
        teams = [team.to_dict() for team in project.teams]
        
        return jsonify({'teams': teams}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@project_bp.route('/<int:project_id>/documents', methods=['GET'])
@jwt_required()
def get_project_documents(project_id):
    try:
        project = Project.query.get(project_id)
        
        if not project:
            return jsonify({'error': 'Project not found'}), 404
        
        documents = [doc.to_dict() for doc in project.documents]
        
        return jsonify({'documents': documents}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@project_bp.route('/<int:project_id>/documents', methods=['POST'])
@jwt_required()
def upload_project_document(project_id):
    try:
        project = Project.query.get(project_id)
        
        if not project:
            return jsonify({'error': 'Project not found'}), 404
        
        # Kiểm tra có file trong request không
        file_info = None
        if 'file' in request.files:
            file = request.files['file']
            if file and file.filename:
                # Upload file thực tế
                file_info = save_uploaded_file(file, subfolder='projects')
        
        # Lấy dữ liệu từ form hoặc JSON
        if request.is_json:
            data = request.get_json()
        else:
            data = request.form.to_dict()
        
        # Sử dụng thông tin từ file upload hoặc từ request
        document = ProjectDocument(
            project_id=project_id,
            title=data.get('title') or (file_info['file_name'] if file_info else 'Untitled'),
            description=data.get('description'),
            file_path=file_info['file_path'] if file_info else data.get('file_path'),
            file_type=file_info['file_type'] if file_info else data.get('file_type'),
            file_size=file_info['file_size'] if file_info else data.get('file_size'),
            document_type=data.get('document_type', 'other'),
            uploaded_by=get_jwt_identity()
        )
        
        db.session.add(document)
        db.session.commit()
        
        return jsonify({
            'message': 'Document uploaded successfully',
            'document': document.to_dict()
        }), 201
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@project_bp.route('/documents/<path:filepath>', methods=['GET'])
@jwt_required()
def download_project_document(filepath):
    """Download file từ uploads folder"""
    try:
        # filepath có dạng: projects/filename hoặc filename
        upload_folder = os.environ.get('UPLOAD_FOLDER', '/app/uploads')
        directory = os.path.dirname(os.path.join(upload_folder, filepath))
        filename = os.path.basename(filepath)
        
        if not os.path.exists(os.path.join(directory, filename)):
            return jsonify({'error': 'File not found'}), 404
        
        return send_from_directory(directory, filename, as_attachment=True)
    except Exception as e:
        return jsonify({'error': str(e)}), 404

@project_bp.route('/statistics', methods=['GET'])
@jwt_required()
def get_project_statistics():
    try:
        total_projects = Project.query.count()
        published_projects = Project.query.filter_by(status='published').count()
        in_progress_projects = Project.query.filter_by(status='in_progress').count()
        completed_projects = Project.query.filter_by(status='completed').count()
        
        # Get difficulty distribution
        difficulties = db.session.query(
            Project.difficulty_level, 
            db.func.count(Project.id)
        ).group_by(Project.difficulty_level).all()
        
        return jsonify({
            'total_projects': total_projects,
            'published_projects': published_projects,
            'in_progress_projects': in_progress_projects,
            'completed_projects': completed_projects,
            'difficulty_distribution': [{'level': level, 'count': count} for level, count in difficulties]
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
