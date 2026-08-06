from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Dict, Any, Optional
from app.database import supabase
from app.dependencies import require_role

router = APIRouter()

#(26)
@router.get("/feedbacks", response_model=List[Dict[str, Any]])
def get_all_feedbacks_for_staff(
    status: Optional[str] = None,
    search: Optional[str] = None,
    current_user: dict = Depends(require_role(["staff", "admin"]))
):
    """
    Cán bộ xem danh sách phản ánh (26).
    Hỗ trợ lọc theo trạng thái và tìm kiếm từ khóa.
    Nếu is_anonymous == true, backend sẽ tự động che giấu thông tin sinh viên gửi.
    """
    try:
        query = supabase.table("feedbacks")\
            .select("*, categories(name), users!feedbacks_student_id_fkey(full_name, student_code)")
            
        if status and status != "all":
            query = query.eq("status", status)
            
        if search:
            # Tìm kiếm theo tiêu đề hoặc nội dung (sử dụng ilike cho PostgreSQL)
            query = query.or_(f"title.ilike.%{search}%,content.ilike.%{search}%")
            
        response = query.order("created_at", desc=True).execute()
            
        feedbacks = response.data
        
        # Xử lý logic ẩn danh trước khi trả về cho Frontend
        for fb in feedbacks:
            if fb.get("is_anonymous") is True:
                # Ghi đè thông tin người gửi
                fb["users"] = {
                    "full_name": "Sinh viên ẩn danh",
                    "student_code": "ẨN_DANH"
                }
                # Xóa luôn student_id để frontend không thể dò ra
                fb["student_id"] = None
                
        return feedbacks
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
