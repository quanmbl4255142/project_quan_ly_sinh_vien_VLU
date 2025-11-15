from flask import Flask, jsonify, g, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from config.database import Config
from models import init_db, db
from utils.metrics import metrics_collector
import os

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Initialize extensions
    init_db(app)
    
    # CORS configuration - allow frontend origin
    frontend_url = os.environ.get('FRONTEND_URL', '*')
    CORS(app, 
         resources={r"/api/*": {"origins": frontend_url if frontend_url != '*' else "*"}},
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization"])
    # JWTManager là một extension của Flask-JWT-Extended để quản lý JWT token, token sẽ biến mất sau khi đăng nhập khoảng 1 giờ
    jwt = JWTManager(app)
    
    # Import and register blueprints
    from routes.auth import auth_bp
    from routes.student import student_bp
    from routes.teacher import teacher_bp
    from routes.project import project_bp
    from routes.team import team_bp
    from routes.submission import submission_bp
    from routes.admin import admin_bp
    from routes.monitor import monitor_bp
    
    # khung tổng 
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(student_bp, url_prefix='/api/students')
    app.register_blueprint(teacher_bp, url_prefix='/api/teachers')
    app.register_blueprint(project_bp, url_prefix='/api/projects')
    app.register_blueprint(team_bp, url_prefix='/api/teams')
    app.register_blueprint(submission_bp, url_prefix='/api/submissions')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(monitor_bp, url_prefix='/api/monitor')
    
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
    
    @app.before_request
    def _metrics_before_request():
        g._metrics_start = os.times()[4] if hasattr(os, 'times') else None

    @app.after_request
    def _metrics_after_request(response):
        try:
            start = getattr(g, '_metrics_start', None)
            if start is not None:
                end = os.times()[4] if hasattr(os, 'times') else None
                duration_ms = max((end - start) * 1000.0, 0) if end is not None else 0
            else:
                duration_ms = 0
            # try to read user id from JWT if present
            user_id = None
            try:
                from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
                verify_jwt_in_request(optional=True)
                identity = get_jwt_identity()
                if identity is not None:
                    user_id = int(identity)
            except Exception:
                user_id = None
            metrics_collector.record_request(response.status_code, duration_ms, user_id)
        except Exception:
            pass
        return response

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
