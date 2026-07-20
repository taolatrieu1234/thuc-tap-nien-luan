from fastapi import APIRouter, HTTPException, status, Depends # Bổ sung Depends
from app.database import supabase
from app.schemas.auth import LoginRequest, TokenSchema, UserResponseSchema , ChangePasswordRequest 
from app.utils import verify_password, create_access_token, hash_password
from app.dependencies import get_current_user 
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




#API Đổi mật khẩu (11)
@router.put("/change-password")
def change_password(payload: ChangePasswordRequest, current_user: dict = Depends(get_current_user)):
    """
    API đổi mật khẩu cá nhân: Đọc Token nhận diện user_id -> Kiểm tra mật khẩu cũ -> Băm mật khẩu mới cập nhật vào DB
    """
    # Lấy dữ liệu từ payload do Frontend gửi lên
    old_pwd_input = payload.old_password
    new_pwd_input = payload.new_password

    # Luồng xử lý logic theo thiết kế hệ thống:
    
    # Kịch bản 1: Sử dụng bcrypt so khớp mật khẩu cũ nhập vào với mật khẩu băm trong DB
    is_old_password_correct = verify_password(old_pwd_input, current_user["password_hash"])
    if not is_old_password_correct:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mật khẩu hiện tại không chính xác."
        )

    # Kịch bản 2: Không cho phép đổi mật khẩu mới trùng lặp hoàn toàn với mật khẩu cũ để tăng tính an toàn
    if old_pwd_input == new_pwd_input:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Mật khẩu mới không được trùng với mật khẩu hiện tại."
        )

    # Kịch bản 3: Hợp lệ -> Tiến hành băm mật khẩu mới bằng bcrypt trước khi lưu
    new_password_hash = hash_password(new_pwd_input)

    # Kịch bản 4: Tiến hành cập nhật cột password_hash tại bảng users của Supabase Cloud
    try:
        supabase.table("users")\
            .update({"password_hash": new_password_hash})\
            .eq("id", current_user["id"])\
            .execute()
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi hệ thống khi cập nhật cơ sở dữ liệu: {str(e)}"
        )

    # Trả về mã phản hồi thành công
    return {"message": "Thay đổi mật khẩu tài khoản thành công!"}