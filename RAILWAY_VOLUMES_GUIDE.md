# Hướng dẫn cấu hình Railway Volumes để lưu trữ file lâu dài

## Tình trạng hiện tại

Hiện tại, khi frontend upload dự án/tài liệu:
- **File path được lưu trong database**: Chỉ có đường dẫn file (`file_path`) được lưu trong bảng `project_documents` và `project_submissions`
- **File thực tế chưa được lưu**: Hệ thống chưa có code xử lý upload file thực tế, chỉ lưu đường dẫn
- **Vấn đề trên Railway**: Nếu không có persistent storage, file sẽ bị mất khi container restart hoặc redeploy

## Giải pháp: Sử dụng Railway Volumes

Railway Volumes cung cấp persistent storage để lưu trữ file lâu dài, không bị mất khi container restart.

---

## Bước 1: Tạo Volume trên Railway

### Cách 1: Tạo Volume qua Railway Dashboard

1. **Đăng nhập vào Railway Dashboard**
   - Truy cập: https://railway.app
   - Chọn project của bạn

2. **Vào Backend Service**
   - Click vào service **API_Quanly_Sinh_vien** (Backend)

3. **Tạo Volume**
   - Vào tab **Volumes** (hoặc **Storage**)
   - Click **+ New Volume**
   - Đặt tên: `uploads` (hoặc `project_files`)
   - Chọn mount path: `/app/uploads` (hoặc `/app/static/uploads`)
   - Chọn size: Tùy nhu cầu (ví dụ: 1GB, 5GB, 10GB)
   - Click **Create**

4. **Mount Volume vào Service**
   - Volume sẽ tự động được mount vào container
   - Đường dẫn mount: `/app/uploads` (hoặc path bạn đã chọn)

### Cách 2: Tạo Volume qua Railway CLI

```bash
# Cài đặt Railway CLI (nếu chưa có)
npm i -g @railway/cli

# Đăng nhập
railway login

# Link project
railway link

# Tạo volume
railway volume create uploads --mount-path /app/uploads --size 5GB
```

---

## Bước 2: Cấu hình Backend để sử dụng Volume

### 2.1. Tạo thư mục uploads trong code

Thư mục `static` đã có sẵn trong Dockerfile. Bạn cần đảm bảo có thư mục `uploads`:

```python
# Trong app.py hoặc config, thêm:
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'zip', 'rar', 'txt', 'jpg', 'png'}

# Tạo thư mục nếu chưa có
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
```

### 2.2. Cập nhật Dockerfile (nếu cần)

Đảm bảo Dockerfile tạo thư mục uploads:

```dockerfile
# Tạo thư mục cần thiết
RUN mkdir -p static uploads

# Hoặc tạo trong entrypoint script
```

### 2.3. Cấu hình biến môi trường trên Railway

1. Vào Backend service → **Variables**
2. Thêm biến môi trường:
   - **Key**: `UPLOAD_FOLDER`
   - **Value**: `/app/uploads` (phải khớp với mount path của volume)

---

## Bước 3: Cập nhật code để xử lý file upload

### 3.1. Tạo utility function để xử lý upload

Tạo file `API_Quanly_Sinh_vien/utils/file_upload.py`:

```python
import os
import uuid
from werkzeug.utils import secure_filename
from flask import current_app

ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'zip', 'rar', 'txt', 'jpg', 'png', 'jpeg'}

def allowed_file(filename):
    """Kiểm tra extension file có được phép không"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_uploaded_file(file, subfolder=''):
    """
    Lưu file đã upload vào thư mục uploads
    
    Args:
        file: File object từ request.files
        subfolder: Thư mục con (ví dụ: 'projects', 'submissions')
    
    Returns:
        dict: {
            'file_path': str,  # Đường dẫn tương đối
            'file_name': str,  # Tên file gốc
            'file_size': int,  # Kích thước file (bytes)
            'file_type': str   # Loại file
        }
    """
    if not file or not file.filename:
        return None
    
    if not allowed_file(file.filename):
        raise ValueError(f'File type not allowed. Allowed types: {ALLOWED_EXTENSIONS}')
    
    # Lấy upload folder từ config hoặc biến môi trường
    upload_folder = os.environ.get('UPLOAD_FOLDER', '/app/uploads')
    
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
    relative_path = f"/uploads/{subfolder}/{unique_filename}" if subfolder else f"/uploads/{unique_filename}"
    
    return {
        'file_path': relative_path,
        'file_name': filename,
        'file_size': file_size,
        'file_type': file_ext
    }

def delete_file(file_path):
    """Xóa file từ filesystem"""
    if not file_path:
        return False
    
    # Chuyển đường dẫn tương đối thành đường dẫn tuyệt đối
    if file_path.startswith('/uploads/'):
        upload_folder = os.environ.get('UPLOAD_FOLDER', '/app/uploads')
        file_path = os.path.join(upload_folder, file_path.replace('/uploads/', ''))
    
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
            return True
    except Exception as e:
        print(f"Error deleting file {file_path}: {e}")
    
    return False
```

### 3.2. Cập nhật route để xử lý file upload

Cập nhật `API_Quanly_Sinh_vien/routes/project.py`:

```python
from flask import request, jsonify, send_from_directory
from werkzeug.utils import secure_filename
from utils.file_upload import save_uploaded_file, delete_file
import os

@project_bp.route('/<int:project_id>/documents', methods=['POST'])
@jwt_required()
def upload_project_document(project_id):
    try:
        project = Project.query.get(project_id)
        
        if not project:
            return jsonify({'error': 'Project not found'}), 404
        
        # Kiểm tra có file trong request không
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Lưu file
        file_info = save_uploaded_file(file, subfolder='projects')
        
        if not file_info:
            return jsonify({'error': 'Failed to save file'}), 500
        
        # Lưu thông tin vào database
        document = ProjectDocument(
            project_id=project_id,
            title=request.form.get('title', file_info['file_name']),
            description=request.form.get('description'),
            file_path=file_info['file_path'],
            file_type=file_info['file_type'],
            file_size=file_info['file_size'],
            document_type=request.form.get('document_type', 'other'),
            uploaded_by=get_jwt_identity()
        )
        
        db.session.add(document)
        db.session.commit()
        
        return jsonify({
            'message': 'Document uploaded successfully',
            'document': document.to_dict()
        }), 201
        
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@project_bp.route('/documents/<path:filename>', methods=['GET'])
@jwt_required()
def download_document(filename):
    """Download file từ uploads folder"""
    try:
        upload_folder = os.environ.get('UPLOAD_FOLDER', '/app/uploads')
        return send_from_directory(upload_folder, filename, as_attachment=True)
    except Exception as e:
        return jsonify({'error': str(e)}), 404
```

Tương tự, cập nhật `API_Quanly_Sinh_vien/routes/submission.py`:

```python
from utils.file_upload import save_uploaded_file, delete_file

@submission_bp.route('/submissions', methods=['POST'])
@jwt_required()
def create_submission():
    try:
        # ... existing code ...
        
        # Xử lý file upload nếu có
        file_info = None
        if 'file' in request.files:
            file = request.files['file']
            if file.filename:
                file_info = save_uploaded_file(file, subfolder='submissions')
        
        # Tạo submission với file info
        submission = ProjectSubmission(
            # ... existing fields ...
            file_path=file_info['file_path'] if file_info else data.get('file_path'),
            file_type=file_info['file_type'] if file_info else data.get('file_type'),
            file_size=file_info['file_size'] if file_info else data.get('file_size'),
            # ... rest of fields ...
        )
        
        # ... rest of code ...
```

---

## Bước 4: Cập nhật Frontend để upload file thực tế

Cập nhật `Fontend_Quan_Ly_Sinh_Vien/src/pages/Submissions.jsx`:

```jsx
// Thay đổi form để sử dụng file input
const [selectedFile, setSelectedFile] = useState(null)

// Trong form:
<div>
  <label className="block text-sm font-medium mb-1">File đính kèm</label>
  <input 
    type="file" 
    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
    onChange={(e) => setSelectedFile(e.target.files[0])}
    accept=".pdf,.doc,.docx,.zip,.rar"
  />
</div>

// Khi submit:
async function handleSubmit(e) {
  e.preventDefault()
  
  const formData = new FormData()
  formData.append('title', formData.title)
  formData.append('description', formData.description)
  formData.append('project_id', formData.project_id)
  formData.append('submission_type', formData.submission_type)
  formData.append('submission_category', formData.submission_category)
  
  if (selectedFile) {
    formData.append('file', selectedFile)
  }
  
  // Gọi API với FormData
  const res = await createSubmission(formData)
  // ...
}
```

Cập nhật `Fontend_Quan_Ly_Sinh_Vien/src/api.js`:

```javascript
export async function createSubmission(data) {
  // Nếu data là FormData, không stringify
  const options = {
    method: 'POST',
    headers: {}
  }
  
  if (data instanceof FormData) {
    // FormData tự động set Content-Type với boundary
    options.body = data
  } else {
    options.headers['Content-Type'] = 'application/json'
    options.body = JSON.stringify(data)
  }
  
  return request('/submissions', options)
}
```

---

## Bước 5: Kiểm tra và Test

### 5.1. Kiểm tra Volume đã được mount

1. Vào Railway Dashboard → Backend service → **Deployments**
2. Click vào deployment mới nhất → **View Logs**
3. Hoặc SSH vào container (nếu có):
   ```bash
   railway shell
   ls -la /app/uploads  # Phải thấy thư mục uploads
   ```

### 5.2. Test upload file

1. Upload file từ frontend
2. Kiểm tra file có được lưu trong `/app/uploads` không
3. Kiểm tra database có lưu `file_path` đúng không
4. Test download file

### 5.3. Test persistent storage

1. Upload một file
2. Restart service trên Railway
3. Kiểm tra file vẫn còn sau khi restart

---

## Lưu ý quan trọng

### 1. Backup dữ liệu
- Railway Volumes được backup tự động, nhưng nên có backup riêng cho dữ liệu quan trọng
- Có thể sync với cloud storage (S3, Google Cloud Storage) để backup

### 2. Giới hạn kích thước file
- Cấu hình giới hạn upload size trong Flask:
  ```python
  app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB
  ```

### 3. Bảo mật
- Validate file type và size
- Scan virus nếu cần
- Không cho phép execute file upload

### 4. Performance
- Với file lớn, nên sử dụng cloud storage (S3, Cloudinary) thay vì local storage
- Railway Volumes phù hợp cho file nhỏ đến trung bình (< 100MB)

### 5. Cost
- Railway Volumes có phí theo GB storage
- Kiểm tra pricing: https://railway.app/pricing

---

## Tóm tắt các bước

1. ✅ Tạo Railway Volume với mount path `/app/uploads`
2. ✅ Cấu hình biến môi trường `UPLOAD_FOLDER=/app/uploads`
3. ✅ Tạo utility function xử lý file upload
4. ✅ Cập nhật routes để nhận và lưu file
5. ✅ Cập nhật frontend để upload file thực tế
6. ✅ Test upload và download file
7. ✅ Verify file persist sau khi restart

---

## Troubleshooting

### Volume không mount được
- Kiểm tra mount path có đúng không
- Kiểm tra service đã được redeploy sau khi tạo volume chưa
- Xem logs để tìm lỗi

### File không lưu được
- Kiểm tra quyền ghi vào thư mục uploads
- Kiểm tra biến môi trường `UPLOAD_FOLDER`
- Kiểm tra disk space còn đủ không

### File bị mất sau restart
- Đảm bảo volume đã được mount đúng
- Kiểm tra file có được lưu vào mount path không (không phải thư mục tạm)

---

## Tài liệu tham khảo

- Railway Volumes: https://docs.railway.app/storage/volumes
- Flask File Upload: https://flask.palletsprojects.com/en/2.3.x/patterns/fileuploads/
- Railway CLI: https://docs.railway.app/develop/cli

