import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    
    # Get DATABASE_URL from environment
    DATABASE_URL = os.environ.get('DATABASE_URL')
    
    # Railway MySQL uses 'mysql://' but SQLAlchemy needs 'mysql+pymysql://'
    if DATABASE_URL and DATABASE_URL.startswith('mysql://'):
        DATABASE_URL = DATABASE_URL.replace('mysql://', 'mysql+pymysql://', 1)
    
    # Fallback to localhost for development 
    # student_project_management này nằm bên railway còn flaskshop check
    SQLALCHEMY_DATABASE_URI = DATABASE_URL or 'mysql+pymysql://root:Quan5599nguz@localhost/student_project_management'
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-string'
    JWT_ACCESS_TOKEN_EXPIRES = False
