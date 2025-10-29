from datetime import datetime
from . import db

class Teacher(db.Model):
    __tablename__ = 'teachers'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False, unique=True)
    teacher_code = db.Column(db.String(20), unique=True, nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(15))
    email = db.Column(db.String(120))
    department = db.Column(db.String(50), nullable=False)
    title = db.Column(db.String(50))  # Professor, Associate Professor, etc.
    specialization = db.Column(db.String(100))
    status = db.Column(db.Enum('active', 'inactive', 'retired'), default='active')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    projects = db.relationship('Project', backref='supervisor', cascade='all, delete-orphan')
    evaluations = db.relationship('ProjectEvaluation', backref='evaluator_teacher', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'teacher_code': self.teacher_code,
            'full_name': self.full_name,
            'phone': self.phone,
            'email': self.email,
            'department': self.department,
            'title': self.title,
            'specialization': self.specialization,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
