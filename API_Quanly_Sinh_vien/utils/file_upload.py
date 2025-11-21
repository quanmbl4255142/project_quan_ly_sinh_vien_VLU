import os
import uuid
from werkzeug.utils import secure_filename

ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'zip', 'rar', 'txt', 'jpg', 'png', 'jpeg', 'pptx', 'xlsx'}

def allowed_file(filename):
    """Kiểm tra extension file có được phép không"""
    if not filename:
        return False
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_upload_folder():
    """Lấy đường dẫn thư mục upload từ biến môi trường"""
    return os.environ.get('UPLOAD_FOLDER', '/app/uploads')

def save_uploaded_file(file, subfolder=''):
    """
    Lưu file đã upload vào thư mục uploads
    
    Args:
        file: File object từ request.files
        subfolder: Thư mục con (ví dụ: 'projects', 'submissions')
    
    Returns:
        dict: {
            'file_path': str,  # Đường dẫn tương đối để lưu vào DB
            'file_name': str,  # Tên file gốc
            'file_size': int,  # Kích thước file (bytes)
            'file_type': str   # Loại file (extension)
        }
    """
    if not file or not file.filename:
        return None
    
    if not allowed_file(file.filename):
        raise ValueError(f'File type not allowed. Allowed types: {ALLOWED_EXTENSIONS}')
    
    # Lấy upload folder từ config hoặc biến môi trường
    upload_folder = get_upload_folder()
    
    # Tạo thư mục con nếu có
    if subfolder:
        upload_folder = os.path.join(upload_folder, subfolder)
        os.makedirs(upload_folder, exist_ok=True)
    
    # Tạo tên file unique
    filename = secure_filename(file.filename)
    file_ext = filename.rsplit('.', 1)[1].lower()
    unique_filename = f"{uuid.uuid4().hex}.{file_ext}"
    
    # Đường dẫn đầy đủ
    file_path = os.path.join(upload_folder, unique_filename)
    
    # Lưu file
    file.save(file_path)
    
    # Lấy thông tin file
    file_size = os.path.getsize(file_path)
    
    # Trả về đường dẫn tương đối (để lưu vào database)
    if subfolder:
        relative_path = f"/uploads/{subfolder}/{unique_filename}"
    else:
        relative_path = f"/uploads/{unique_filename}"
    
    return {
        'file_path': relative_path,
        'file_name': filename,
        'file_size': file_size,
        'file_type': file_ext
    }

def delete_file(file_path):
    """
    Xóa file từ filesystem
    
    Args:
        file_path: Đường dẫn tương đối (từ database) hoặc đường dẫn tuyệt đối
    
    Returns:
        bool: True nếu xóa thành công, False nếu không
    """
    if not file_path:
        return False
    
    # Chuyển đường dẫn tương đối thành đường dẫn tuyệt đối
    if file_path.startswith('/uploads/'):
        upload_folder = get_upload_folder()
        # Bỏ /uploads/ prefix
        relative_path = file_path.replace('/uploads/', '')
        file_path = os.path.join(upload_folder, relative_path)
    
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
    except Exception as e:
        print(f"Error deleting file {file_path}: {e}")
    
    return False

def get_file_path(file_path):
    """
    Chuyển đường dẫn tương đối thành đường dẫn tuyệt đối
    
    Args:
        file_path: Đường dẫn tương đối từ database
    
    Returns:
        str: Đường dẫn tuyệt đối
    """
    if not file_path:
        return None
    
    if file_path.startswith('/uploads/'):
        upload_folder = get_upload_folder()
        relative_path = file_path.replace('/uploads/', '')
        return os.path.join(upload_folder, relative_path)
    
    return file_path

def file_exists(file_path):
    """Kiểm tra file có tồn tại không"""
    abs_path = get_file_path(file_path)
    return abs_path and os.path.exists(abs_path)

