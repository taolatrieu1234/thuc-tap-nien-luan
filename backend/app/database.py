from supabase import create_client, Client
from app.config import SUPABASE_URL, SUPABASE_ANON_KEY

if not SUPABASE_URL or not SUPABASE_ANON_KEY:
    raise ValueError("Lỗi hệ thống: Thiếu thông tin cấu hình Supabase URL hoặc Anon Key trong file .env!")


supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)   