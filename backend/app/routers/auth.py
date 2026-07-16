from fastapi import APIRouter, HTTPException, status, Depends # Bổ sung Depends
from app.database import supabase
from app.schemas.auth import LoginRequest, TokenSchema, UserResponseSchema # Import thêm UserResponseSchema
from app.utils import verify_password, create_access_token
from app.dependencies import get_current_user # Import dependency xác thực vừa tạo
router = APIRouter()

@router.post("/login", response_model=TokenSchema)
def login(payload: LoginRequest):
    """
    API đăng nhập: Nhận username (hoặc student_code) + password, kiểm tra và trả về JWT Token
    """
    username_input = payload.username
    password_input = payload.password

    # 1. Truy vấn tìm kiếm user bằng username HOẶC student_code trong DB Supabase
    try:
        response = supabase.table("users")\
            .select("*")\
            .or_(f"username.eq.{username_input},student_code.eq.{username_input}")\
            .execute()
        
        users_list = response.data
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi truy vấn cơ sở dữ liệu: {str(e)}"
        )
    

    # 2. Nếu không tìm thấy tài khoản tương ứng
    if not users_list:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Mã sinh viên / Tên đăng nhập hoặc mật khẩu không chính xác."
        )
    
    user = users_list[0]

    # 3. Kiểm tra xem tài khoản có bị khóa hay không (Tránh trường hợp tài khoản vi phạm)
    # Lưu ý: Cột is_active mặc định là True, nếu có quản lý trạng thái thì kiểm tra ở đây.
    if user.get("is_active") is False:
         raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Tài khoản của bạn đã bị khóa bởi Quản trị viên."
        )

    # 4. Kiểm tra so khớp mật khẩu đã băm trong Database
    is_password_correct = verify_password(password_input, user["password_hash"])
    if not is_password_correct:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Mã sinh viên / Tên đăng nhập hoặc mật khẩu không chính xác."
        )

    # 5. Đăng nhập đúng -> Chuẩn bị payload chứa thông tin tối giản và sinh Token JWT
    token_data = {
        "user_id": user["id"],
        "role": user["role"]
    }
    access_token = create_access_token(data=token_data)

    # 6. Trả về Token theo định dạng của Schema TokenSchema đã thiết lập
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }



# API /me YÊU CẦU XÁC THỰC TOKEN (8)
@router.get("/me", response_model=UserResponseSchema)
def get_me(current_user: dict = Depends(get_current_user)):
    """
    API lấy thông tin cá nhân của tài khoản hiện hành đang đăng nhập (Yêu cầu JWT Token trong Header)
    """
    # current_user đã được giải mã và kiểm duyệt kỹ qua Dependency get_current_user
    return current_user