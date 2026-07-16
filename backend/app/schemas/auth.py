from pydantic import BaseModel, EmailStr, Field
from typing import Optional

class LoginRequest(BaseModel):
    """
    Schema kiểm tra dữ liệu đầu vào khi người dùng gửi yêu cầu Đăng nhập
    """
    # Chấp nhận cả mã số sinh viên (student_code) hoặc username của cán bộ
    username: str = Field(..., description="Mã số sinh viên hoặc Tên đăng nhập của tài khoản")
    password: str = Field(..., min_length=6, description="Mật khẩu phải đạt tối thiểu 6 ký tự")


class TokenSchema(BaseModel):
    """
    Schema cấu trúc dữ liệu Token trả về sau khi đăng nhập thành công
    """
    access_token: str
    token_type: str = "bearer"


class UserResponseSchema(BaseModel):
    """
    Schema định dạng thông tin người dùng trả về cho Frontend (giấu mật khẩu)
    """
    id: int
    username: str
    email: EmailStr
    full_name: str
    student_code: Optional[str] = None
    class_name: Optional[str] = None
    role: str

    class Config:
        # Cho phép Pydantic đọc dữ liệu từ các object/dictionary trả về từ database
        from_attributes = True



