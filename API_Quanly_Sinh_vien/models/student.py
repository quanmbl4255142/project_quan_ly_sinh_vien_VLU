from datetime import datetime
from . import db

class Student(db.Model):
    __tablename__ = 'students'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    student_code = db.Column(db.String(20), unique=True, nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    date_of_birth = db.Column(db.Date)
    phone = db.Column(db.String(15))
    address = db.Column(db.Text)
    major = db.Column(db.String(50), nullable=False)
    class_name = db.Column(db.String(50))
    year_of_study = db.Column(db.Integer)
    gpa = db.Column(db.Float, default=0.0)
    status = db.Column(db.Enum('active', 'inactive', 'graduated', 'suspended'), default='active')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    team_memberships = db.relationship('TeamMember', backref='student', cascade='all, delete-orphan')
    project_submissions = db.relationship('ProjectSubmission', backref='student', cascade='all, delete-orphan')
    evaluations_given = db.relationship('ProjectEvaluation', backref='evaluator_student', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'student_code': self.student_code,
            'full_name': self.full_name,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'phone': self.phone,
            'address': self.address,
            'major': self.major,
            'class_name': self.class_name,
            'year_of_study': self.year_of_study,
            'gpa': self.gpa,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
