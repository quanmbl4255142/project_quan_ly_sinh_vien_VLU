from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, ProjectSubmission, ProjectEvaluation, Project, Team, TeamMember, Student, Teacher
from sqlalchemy import and_
from datetime import datetime

submission_bp = Blueprint('submission', __name__)

# ============= PROJECT SUBMISSIONS =============

@submission_bp.route('/submissions', methods=['GET'])
@jwt_required()
def get_submissions():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        project_id = request.args.get('project_id', type=int)
        team_id = request.args.get('team_id', type=int)
        student_id = request.args.get('student_id', type=int)
        status = request.args.get('status', '')
        category = request.args.get('category', '')
        
        query = ProjectSubmission.query
        
        if project_id:
            query = query.filter(ProjectSubmission.project_id == project_id)
        
        if team_id:
            query = query.filter(ProjectSubmission.team_id == team_id)
        
        if student_id:
            query = query.filter(ProjectSubmission.student_id == student_id)
        
        if status:
            query = query.filter(ProjectSubmission.status == status)
        
        if category:
            query = query.filter(ProjectSubmission.submission_category == category)
        
        submissions = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'submissions': [submission.to_dict() for submission in submissions.items],
            'total': submissions.total,
            'pages': submissions.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@submission_bp.route('/submissions/<int:submission_id>', methods=['GET'])
@jwt_required()
def get_submission(submission_id):
    try:
        submission = ProjectSubmission.query.get(submission_id)
        
        if not submission:
            return jsonify({'error': 'Submission not found'}), 404
        
        submission_data = submission.to_dict()
        
        # Add project info
        submission_data['project'] = submission.project.to_dict()
        
        # Add team or student info
        if submission.team:
            submission_data['team'] = submission.team.to_dict()
        if submission.student:
            submission_data['student'] = submission.student.to_dict()
        
        return jsonify({'submission': submission_data}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@submission_bp.route('/submissions', methods=['POST'])
@jwt_required()
def create_submission():
    try:
        data = request.get_json()
        
        # Validation
        required_fields = ['project_id', 'submission_type', 'title']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        # Check if project exists
        project = Project.query.get(data['project_id'])
        if not project:
            return jsonify({'error': 'Project not found'}), 404
        
        user_id = int(get_jwt_identity())
        
        # Determine team_id or student_id based on submission type
        team_id = None
        student_id = None
        
        if data['submission_type'] == 'team':
            # Find student first
            student = Student.query.filter_by(user_id=user_id).first()
            if not student:
                return jsonify({'error': 'Student profile not found'}), 404
            
            # Find team for this project and student
            team_member = db.session.query(TeamMember).join(Team).filter(
                and_(
                    TeamMember.student_id == student.id,
                    Team.project_id == data['project_id'],
                    TeamMember.status == 'active'
                )
            ).first()
            
            if not team_member:
                return jsonify({'error': 'You are not a member of any team for this project'}), 400
            
            team_id = team_member.team_id
            
        elif data['submission_type'] == 'individual':
            # Find student
            student = Student.query.filter_by(user_id=user_id).first()
            if not student:
                return jsonify({'error': 'Student profile not found'}), 404
            
            student_id = student.id
        
        # Create submission
        submission = ProjectSubmission(
            project_id=data['project_id'],
            team_id=team_id,
            student_id=student_id,
            submission_type=data['submission_type'],
            title=data['title'],
            description=data.get('description'),
            file_path=data.get('file_path'),
            file_type=data.get('file_type'),
            file_size=data.get('file_size'),
            submission_category=data.get('submission_category', 'other'),
            status='draft'
        )
        
        db.session.add(submission)
        db.session.commit()
        
        return jsonify({
            'message': 'Submission created successfully',
            'submission': submission.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@submission_bp.route('/submissions/<int:submission_id>', methods=['PUT'])
@jwt_required()
def update_submission(submission_id):
    try:
        submission = ProjectSubmission.query.get(submission_id)
        
        if not submission:
            return jsonify({'error': 'Submission not found'}), 404
        
        data = request.get_json()
        
        # Update fields
        if 'title' in data:
            submission.title = data['title']
        if 'description' in data:
            submission.description = data['description']
        if 'file_path' in data:
            submission.file_path = data['file_path']
        if 'file_type' in data:
            submission.file_type = data['file_type']
        if 'file_size' in data:
            submission.file_size = data['file_size']
        if 'submission_category' in data:
            submission.submission_category = data['submission_category']
        if 'status' in data:
            submission.status = data['status']
            if data['status'] == 'submitted':
                submission.submitted_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({
            'message': 'Submission updated successfully',
            'submission': submission.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@submission_bp.route('/submissions/<int:submission_id>', methods=['DELETE'])
@jwt_required()
def delete_submission(submission_id):
    try:
        submission = ProjectSubmission.query.get(submission_id)
        
        if not submission:
            return jsonify({'error': 'Submission not found'}), 404
        
        db.session.delete(submission)
        db.session.commit()
        
        return jsonify({'message': 'Submission deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@submission_bp.route('/submissions/<int:submission_id>/review', methods=['POST'])
@jwt_required()
def review_submission(submission_id):
    try:
        submission = ProjectSubmission.query.get(submission_id)
        
        if not submission:
            return jsonify({'error': 'Submission not found'}), 404
        
        data = request.get_json()
        
        # Update submission status
        if 'status' in data:
            submission.status = data['status']
            if data['status'] in ['approved', 'rejected', 'revision_required']:
                submission.reviewed_at = datetime.utcnow()
        
        if 'feedback' in data:
            submission.feedback = data['feedback']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Submission reviewed successfully',
            'submission': submission.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# ============= PROJECT EVALUATIONS =============

@submission_bp.route('/evaluations', methods=['GET'])
@jwt_required()
def get_evaluations():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        project_id = request.args.get('project_id', type=int)
        submission_id = request.args.get('submission_id', type=int)
        evaluator_type = request.args.get('evaluator_type', '')
        
        query = ProjectEvaluation.query
        
        if project_id:
            query = query.filter(ProjectEvaluation.project_id == project_id)
        
        if submission_id:
            query = query.filter(ProjectEvaluation.submission_id == submission_id)
        
        if evaluator_type:
            query = query.filter(ProjectEvaluation.evaluator_type == evaluator_type)
        
        evaluations = query.paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'evaluations': [evaluation.to_dict() for evaluation in evaluations.items],
            'total': evaluations.total,
            'pages': evaluations.pages,
            'current_page': page
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@submission_bp.route('/evaluations/<int:evaluation_id>', methods=['GET'])
@jwt_required()
def get_evaluation(evaluation_id):
    try:
        evaluation = ProjectEvaluation.query.get(evaluation_id)
        
        if not evaluation:
            return jsonify({'error': 'Evaluation not found'}), 404
        
        evaluation_data = evaluation.to_dict()
        
        # Add evaluator info
        if evaluation.evaluator_teacher:
            evaluation_data['evaluator_teacher'] = evaluation.evaluator_teacher.to_dict()
        if evaluation.evaluator_student:
            evaluation_data['evaluator_student'] = evaluation.evaluator_student.to_dict()
        
        return jsonify({'evaluation': evaluation_data}), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@submission_bp.route('/evaluations', methods=['POST'])
@jwt_required()
def create_evaluation():
    try:
        data = request.get_json()
        
        # Validation
        required_fields = ['project_id', 'submission_id', 'evaluator_type']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        user_id = int(get_jwt_identity())
        
        # Determine evaluator
        evaluator_teacher_id = None
        evaluator_student_id = None
        
        if data['evaluator_type'] == 'teacher':
            teacher = Teacher.query.filter_by(user_id=user_id).first()
            if not teacher:
                return jsonify({'error': 'Teacher profile not found'}), 404
            evaluator_teacher_id = teacher.id
            
        elif data['evaluator_type'] == 'student':
            student = Student.query.filter_by(user_id=user_id).first()
            if not student:
                return jsonify({'error': 'Student profile not found'}), 404
            evaluator_student_id = student.id
        
        # Calculate scores
        scores = {
            'technical_quality': data.get('technical_quality', 0),
            'creativity': data.get('creativity', 0),
            'presentation': data.get('presentation', 0),
            'teamwork': data.get('teamwork', 0),
            'timeliness': data.get('timeliness', 0),
            'documentation': data.get('documentation', 0)
        }
        
        total_score = sum(scores.values())
        max_score = data.get('max_score', 60.0)
        percentage = (total_score / max_score) * 100 if max_score > 0 else 0
        
        # Determine recommendation
        if percentage >= 90:
            recommendation = 'excellent'
        elif percentage >= 80:
            recommendation = 'good'
        elif percentage >= 70:
            recommendation = 'satisfactory'
        elif percentage >= 60:
            recommendation = 'needs_improvement'
        else:
            recommendation = 'poor'
        
        # Create evaluation
        evaluation = ProjectEvaluation(
            project_id=data['project_id'],
            submission_id=data['submission_id'],
            evaluator_type=data['evaluator_type'],
            evaluator_teacher_id=evaluator_teacher_id,
            evaluator_student_id=evaluator_student_id,
            technical_quality=scores['technical_quality'],
            creativity=scores['creativity'],
            presentation=scores['presentation'],
            teamwork=scores['teamwork'],
            timeliness=scores['timeliness'],
            documentation=scores['documentation'],
            total_score=total_score,
            max_score=max_score,
            percentage=percentage,
            comments=data.get('comments'),
            recommendation=recommendation
        )
        
        db.session.add(evaluation)
        db.session.commit()
        
        return jsonify({
            'message': 'Evaluation created successfully',
            'evaluation': evaluation.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@submission_bp.route('/evaluations/<int:evaluation_id>', methods=['PUT'])
@jwt_required()
def update_evaluation(evaluation_id):
    try:
        evaluation = ProjectEvaluation.query.get(evaluation_id)
        
        if not evaluation:
            return jsonify({'error': 'Evaluation not found'}), 404
        
        data = request.get_json()
        
        # Update scores
        scores_updated = False
        for field in ['technical_quality', 'creativity', 'presentation', 'teamwork', 'timeliness', 'documentation']:
            if field in data:
                setattr(evaluation, field, data[field])
                scores_updated = True
        
        # Recalculate if scores were updated
        if scores_updated:
            total_score = sum([
                evaluation.technical_quality or 0,
                evaluation.creativity or 0,
                evaluation.presentation or 0,
                evaluation.teamwork or 0,
                evaluation.timeliness or 0,
                evaluation.documentation or 0
            ])
            evaluation.total_score = total_score
            evaluation.percentage = (total_score / evaluation.max_score) * 100 if evaluation.max_score > 0 else 0
            
            # Update recommendation
            if evaluation.percentage >= 90:
                evaluation.recommendation = 'excellent'
            elif evaluation.percentage >= 80:
                evaluation.recommendation = 'good'
            elif evaluation.percentage >= 70:
                evaluation.recommendation = 'satisfactory'
            elif evaluation.percentage >= 60:
                evaluation.recommendation = 'needs_improvement'
            else:
                evaluation.recommendation = 'poor'
        
        if 'comments' in data:
            evaluation.comments = data['comments']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Evaluation updated successfully',
            'evaluation': evaluation.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@submission_bp.route('/evaluations/<int:evaluation_id>', methods=['DELETE'])
@jwt_required()
def delete_evaluation(evaluation_id):
    try:
        evaluation = ProjectEvaluation.query.get(evaluation_id)
        
        if not evaluation:
            return jsonify({'error': 'Evaluation not found'}), 404
        
        db.session.delete(evaluation)
        db.session.commit()
        
        return jsonify({'message': 'Evaluation deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
