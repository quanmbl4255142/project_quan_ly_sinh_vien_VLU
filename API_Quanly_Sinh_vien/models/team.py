from datetime import datetime
from . import db

class Team(db.Model):
    __tablename__ = 'teams'
    
    id = db.Column(db.Integer, primary_key=True)
    team_name = db.Column(db.String(100), nullable=False)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id'), nullable=False)
    leader_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    status = db.Column(db.Enum('forming', 'active', 'completed', 'disbanded'), default='forming')
    formed_at = db.Column(db.DateTime, default=datetime.utcnow)
    completed_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    members = db.relationship('TeamMember', backref='team', cascade='all, delete-orphan')
    submissions = db.relationship('ProjectSubmission', backref='team', cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'team_name': self.team_name,
            'project_id': self.project_id,
            'leader_id': self.leader_id,
            'status': self.status,
            'formed_at': self.formed_at.isoformat() if self.formed_at else None,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class TeamMember(db.Model):
    __tablename__ = 'team_members'
    
    id = db.Column(db.Integer, primary_key=True)
    team_id = db.Column(db.Integer, db.ForeignKey('teams.id'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('students.id'), nullable=False)
    role = db.Column(db.Enum('leader', 'member'), default='member')
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)
    left_at = db.Column(db.DateTime)
    status = db.Column(db.Enum('active', 'left'), default='active')
    
    # Unique constraint to prevent duplicate memberships
    __table_args__ = (db.UniqueConstraint('team_id', 'student_id', name='unique_team_student'),)
    
    def to_dict(self):
        return {
            'id': self.id,
            'team_id': self.team_id,
            'student_id': self.student_id,
            'role': self.role,
            'joined_at': self.joined_at.isoformat() if self.joined_at else None,
            'left_at': self.left_at.isoformat() if self.left_at else None,
            'status': self.status
        }
