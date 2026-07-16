import bcrypt
from datetime import datetime, timedelta, timezone
from jose import jwt
from app.config import JWT_SECRET

# Cấu hình mã hóa JWT(7)
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 120 # Token sẽ có hiệu lực trong 2 tiếng

def hash_password(password: str) -> str:   #(6)
    """
    Hàm băm mật khẩu plain-text sang chuỗi bảo mật bcrypt
    """
    # Chuyển đổi mật khẩu sang dạng bytes
    pwd_bytes = password.encode('utf-8')
    # Tạo chuỗi muối (salt) ngẫu nhiên
    salt = bcrypt.gensalt()
    # Thực hiện băm mật khẩu
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    # Trả về chuỗi string đã băm để lưu vào Database
    return hashed.decode('utf-8')



def verify_password(plain_password: str, hashed_password: str) -> bool: #(6)
    """
    Hàm kiểm tra so khớp mật khẩu người dùng nhập với mật khẩu đã băm trong DB
    """
    password_bytes = plain_password.encode('utf-8')
    hashed_bytes = hashed_password.encode('utf-8')
    # Hàm checkpw sẽ tự động phân tách salt và so sánh bảo mật
    return bcrypt.checkpw(password_bytes, hashed_bytes)




def create_access_token(data: dict) -> str: #(7)
    """
    Hàm tạo mã JWT Token chứa thông tin định danh (user_id, role)
    """
    to_encode = data.copy()
    # Tính thời gian hết hạn của Token
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    # Tiến hành mã hóa JWT với Secret Key đã cấu hình
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET, algorithm=ALGORITHM)
    return encoded_jwt