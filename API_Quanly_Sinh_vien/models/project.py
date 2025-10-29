from datetime import datetime
from . import db

class Project(db.Model):
    __tablename__ = 'projects'
    
    id = db.Column(db.Integer, primary_key=True)
    project_code = db.Column(db.String(20), unique=True, nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    requirements = db.Column(db.Text)
    objectives = db.Column(db.Text)
    technology_stack = db.Column(db.String(200))
    difficulty_level = db.Column(db.Enum('beginner', 'intermediate', 'advanced'), default='intermediate')
    estimated_duration = db.Column(db.Integer)  # in weeks
    max_team_size = db.Column(db.Integer, default=4)
    min_team_size = db.Column(db.Integer, default=2)
    supervisor_id = db.Column(db.Integer, db.ForeignKey('teachers.id'), nullable=False)
    status = db.Column(db.Enum('draft', 'published', 'in_progress', 'completed', 'cancelled'), default='draft')
    semester = db.Column(db.String(20))
    academic_year = db.Column(db.String(10))
    deadline = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    teams = db.relationship('Team', backref='project', cascade='all, delete-orphan')
    submissions = db.relationship('ProjectSubmission', backref='project', cascade='all, delete-orphan')
    evaluations = db.relationship('ProjectEvaluation', backref='project', cascade='all, delete-orphan')
    documents = db.relationship('ProjectDocument', backref='project', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_code': self.project_code,
            'title': self.title,
            'description': self.description,
            'requirements': self.requirements,
            'objectives': self.objectives,
            'technology_stack': self.technology_stack,
            'difficulty_level': self.difficulty_level,
            'estimated_duration': self.estimated_duration,
            'max_team_size': self.max_team_size,
            'min_team_size': self.min_team_size,
            'supervisor_id': self.supervisor_id,
            'status': self.status,
            'semester': self.semester,
            'academic_year': self.academic_year,
            'deadline': self.deadline.isoformat() if self.deadline else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class ProjectDocument(db.Model):
    __tablename__ = 'project_documents'
    
    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    file_path = db.Column(db.String(500))
    file_type = db.Column(db.String(50))
    file_size = db.Column(db.Integer)
    document_type = db.Column(db.Enum('requirement', 'design', 'implementation', 'report', 'other'), default='other')
    uploaded_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'title': self.title,
            'description': self.description,
            'file_path': self.file_path,
            'file_type': self.file_type,
            'file_size': self.file_size,
            'document_type': self.document_type,
            'uploaded_by': self.uploaded_by,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
