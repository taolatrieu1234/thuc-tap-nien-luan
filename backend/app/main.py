from fastapi import FastAPI 
from fastapi.middleware.cors import CORSMiddleware #(5)
from app.routers import auth #(7)
from app.database import supabase

app = FastAPI(title="Hệ thống Phản ánh và Góp ý ẩn danh cho Sinh viên")


# cấu hình CORS (5)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"], 
    allow_credentials=True,
    allow_methods=["*"], # Cho phép tất cả các phương thức GET, POST, PUT, DELETE
    allow_headers=["*"], # Cho phép tất cả các Headers
)


#  Gắn nhánh API Auth vào hệ thống #(7)
app.include_router(auth.router, prefix="/api/auth", tags=["Xác thực tài khoản (Auth)"])


@app.get("/")
def read_root():
    return {"message": "Backend FastAPI đang hoạt động ổn định!"}

@app.get("/api/health")
def health_check():
    try:
        # Thực hiện truy vấn đếm số lượng dòng trong bảng categories của Supabase(4)
        response = supabase.table("categories").select("*", count="exact").execute()
        count = response.count        
        return {
            "status": "healthy",
            "database": "connected",
            "categories_count": count
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "database": "disconnected",
            "error": str(e)
        }