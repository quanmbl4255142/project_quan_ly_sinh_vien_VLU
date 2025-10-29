from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

db = SQLAlchemy()
migrate = Migrate()

# Import all models
from .user import User
from .student import Student
from .teacher import Teacher
from .project import Project, ProjectDocument
from .team import Team, TeamMember
from .submission import ProjectSubmission, ProjectEvaluation

def init_db(app):
    db.init_app(app)
    migrate.init_app(app, db)
