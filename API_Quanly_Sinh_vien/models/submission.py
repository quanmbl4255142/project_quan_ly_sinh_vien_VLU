from datetime import datetime
from . import db

class ProjectSubmission(db.Model):
    __tablename__ = 'project_submissions'
    
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    team_id = db.Column(db.Integer, db.ForeignKey('teams.id'), nullable=True)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=True)  # For individual submissions
    submission_type = db.Column(db.Enum('individual', 'team'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    file_path = db.Column(db.String(500))
    file_type = db.Column(db.String(50))
    file_size = db.Column(db.Integer)
    submission_category = db.Column(db.Enum('proposal', 'progress', 'final', 'presentation', 'other'), default='other')
    status = db.Column(db.Enum('draft', 'submitted', 'under_review', 'approved', 'rejected', 'revision_required'), default='draft')
    submitted_at = db.Column(db.DateTime)
    reviewed_at = db.Column(db.DateTime)
    feedback = db.Column(db.Text)
    version = db.Column(db.Integer, default=1)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'team_id': self.team_id,
            'student_id': self.student_id,
            'submission_type': self.submission_type,
            'title': self.title,
            'description': self.description,
            'file_path': self.file_path,
            'file_type': self.file_type,
            'file_size': self.file_size,
            'submission_category': self.submission_category,
            'status': self.status,
            'submitted_at': self.submitted_at.isoformat() if self.submitted_at else None,
            'reviewed_at': self.reviewed_at.isoformat() if self.reviewed_at else None,
            'feedback': self.feedback,
            'version': self.version,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class ProjectEvaluation(db.Model):
    __tablename__ = 'project_evaluations'
    
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    submission_id = db.Column(db.Integer, db.ForeignKey('project_submissions.id'), nullable=False)
    evaluator_type = db.Column(db.Enum('teacher', 'student'), nullable=False)
    evaluator_teacher_id = db.Column(db.Integer, db.ForeignKey('teachers.id'), nullable=True)
    evaluator_student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=True)
    
    # Evaluation criteria scores (1-10 scale)
    technical_quality = db.Column(db.Integer)
    creativity = db.Column(db.Integer)
    presentation = db.Column(db.Integer)
    teamwork = db.Column(db.Integer)
    timeliness = db.Column(db.Integer)
    documentation = db.Column(db.Integer)
    
    # Overall scores
    total_score = db.Column(db.Float)
    max_score = db.Column(db.Float, default=60.0)
    percentage = db.Column(db.Float)
    
    comments = db.Column(db.Text)
    recommendation = db.Column(db.Enum('excellent', 'good', 'satisfactory', 'needs_improvement', 'poor'))
    evaluated_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'submission_id': self.submission_id,
            'evaluator_type': self.evaluator_type,
            'evaluator_teacher_id': self.evaluator_teacher_id,
            'evaluator_student_id': self.evaluator_student_id,
            'technical_quality': self.technical_quality,
            'creativity': self.creativity,
            'presentation': self.presentation,
            'teamwork': self.teamwork,
            'timeliness': self.timeliness,
            'documentation': self.documentation,
            'total_score': self.total_score,
            'max_score': self.max_score,
            'percentage': self.percentage,
            'comments': self.comments,
            'recommendation': self.recommendation,
            'evaluated_at': self.evaluated_at.isoformat() if self.evaluated_at else None
        }
