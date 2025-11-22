#  mục đích của file này là để khởi tạo các bảng trong database, được tạo khi chạy app
# nếu như đã tồn tại bảng trong database thì sẽ không tạo lại
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

db = SQLAlchemy()

# phương thức Migrate() nói dễ hiểu thì nó t
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
