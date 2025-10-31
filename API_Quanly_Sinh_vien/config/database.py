import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-change-in-production'
    
    # Get DATABASE_URL from environment (Railway automatically provides this)
    DATABASE_URL = os.environ.get('DATABASE_URL')
    
    # Alternative: Build from individual MySQL variables if DATABASE_URL not available
    if not DATABASE_URL:
        mysql_host = os.environ.get('MYSQL_HOST')
        mysql_user = os.environ.get('MYSQL_USER')
        mysql_password = os.environ.get('MYSQL_PASSWORD')
        mysql_database = os.environ.get('MYSQL_DATABASE')
        mysql_port = os.environ.get('MYSQL_PORT', '3306')
        
        if all([mysql_host, mysql_user, mysql_password, mysql_database]):
            DATABASE_URL = f"mysql+pymysql://{mysql_user}:{mysql_password}@{mysql_host}:{mysql_port}/{mysql_database}"
    
    # Railway NOT automatically provides DATABASE_URL with 'mysql://' prefix
    # But if it does, convert to 'mysql+pymysql://'
    if DATABASE_URL and DATABASE_URL.startswith('mysql://'):
        DATABASE_URL = DATABASE_URL.replace('mysql://', 'mysql+pymysql://', 1)
    # If already has mysql+pymysql://, keep it
    elif DATABASE_URL and not DATABASE_URL.startswith('mysql+pymysql://'):
        # Add mysql+pymysql:// prefix if missing
        if DATABASE_URL.startswith('mysql://'):
            DATABASE_URL = DATABASE_URL.replace('mysql://', 'mysql+pymysql://', 1)
    
    # Fallback to localhost for development only
    SQLALCHEMY_DATABASE_URI = DATABASE_URL or 'mysql+pymysql://root:Quan5599nguz@localhost/flaskshop'
    
    # Debug: Biết cách log connection để debug
    if DATABASE_URL:
        # Hide password in log
        safe_url = DATABASE_URL
        if '@' in DATABASE_URL:
            parts = DATABASE_URL.split('@')
            if '://' in parts[0]:
                creds = parts[0].split('://')[1]
                if ':' in creds:
                    user = creds.split(':')[0]
                    safe_url = DATABASE_URL.replace(creds, f"{user}:***", 1)
        print(f"🔗 Database URL: {safe_url}")
    else:
        print("⚠️  WARNING: DATABASE_URL not set! Using localhost fallback")
        print("   💡 Solution: Add DATABASE_URL variable in Railway Backend service")
        print("   💡 Option 1: Link MySQL service in Settings → Connected Services")
        print("   💡 Option 2: Add variable: DATABASE_URL = ${{MySQL.DATABASE_URL}}")
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-string'
    JWT_ACCESS_TOKEN_EXPIRES = False
