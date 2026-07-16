from fastapi import Depends, HTTPException, status 
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from app.config import JWT_SECRET
from app.database import supabase

# Khởi tạo phương thức xác thực Bearer Token
security = HTTPBearer()
ALGORITHM = "HS256"

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """
    Dependency lấy thông tin người dùng hiện hành từ JWT Token.
    Được sử dụng làm chốt bảo mật cho mọi API cần đăng nhập.
    """
    token = credentials.credentials
    
    # Định nghĩa lỗi xác thực chung (8)
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Mã xác thực không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # 1. Giải mã JWT Token bằng Secret Key đã cấu hình(8) 
        payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
        user_id: int = payload.get("user_id")
        
        if user_id is None:
            raise credentials_exception
            
    except JWTError:
        raise credentials_exception

    try:
        # 2. Truy vấn Supabase để lấy thông tin mới nhất và kiểm tra tài khoản thực tế(8)
        response = supabase.table("users").select("*").eq("id", user_id).execute()
        users_list = response.data
        
        if not users_list:
            raise credentials_exception
            
        user = users_list[0]
        
        # 3. Kiểm tra xem tài khoản có đang bị khóa (is_active = False) hay không(8)
        # Lưu ý: Cột is_active mặc định là True trong thiết kế DB
        if user.get("is_active") is False:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Tài khoản của bạn đã bị khóa bởi Quản trị viên."
            )
            
        return user
        
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi kiểm tra danh tính hệ thống: {str(e)}"
        )


def require_role(allowed_roles: list[str]):
    """
    Helper Dependency dùng để phân quyền dựa trên vai trò (Role-based Access Control - RBAC).
    Ví dụ sử dụng: Depends(require_role(["admin", "staff"]))
    """
    def role_checker(current_user: dict = Depends(get_current_user)):
        user_role = current_user.get("role")
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bạn không có quyền thực hiện chức năng này."
            )
        return current_user
    return role_checker