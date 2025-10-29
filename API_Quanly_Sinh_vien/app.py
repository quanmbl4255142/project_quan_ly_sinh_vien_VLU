from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config.database import Config
from models import init_db, db
import os

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Initialize extensions
    init_db(app)
    CORS(app)
    jwt = JWTManager(app)
    
    # Import and register blueprints
    from routes.auth import auth_bp
    from routes.student import student_bp
    from routes.teacher import teacher_bp
    from routes.project import project_bp
    from routes.team import team_bp
    from routes.submission import submission_bp
    from routes.admin import admin_bp
    
    # khung tổng 
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(student_bp, url_prefix='/api/students')
    app.register_blueprint(teacher_bp, url_prefix='/api/teachers')
    app.register_blueprint(project_bp, url_prefix='/api/projects')
    app.register_blueprint(team_bp, url_prefix='/api/teams')
    app.register_blueprint(submission_bp, url_prefix='/api/submissions')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    
    @app.route('/')
    def index():
        return jsonify({
            'message': 'Student Project Management API',
            'version': '1.0.0',
            'endpoints': {
                'auth': '/api/auth',
                'students': '/api/students',
                'teachers': '/api/teachers',
                'projects': '/api/projects',
                'teams': '/api/teams',
                'submissions': '/api/submissions'
            }
        })
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500
    
    # Create tables
    with app.app_context():
        db.create_all()
    
    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 5000))
    debug = os.environ.get('FLASK_ENV', 'development') == 'development'
    app.run(debug=debug, host='0.0.0.0', port=port)
