import os
from dotenv import load_dotenv

# Tải các biến môi trường từ file .env ở thư mục gốc backend/
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
JWT_SECRET = os.getenv("JWT_SECRET")