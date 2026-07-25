
#(16)
from fastapi import APIRouter, Depends, HTTPException, status
from app.database import supabase
from app.schemas.feedback import FeedbackCreate, FeedbackResponse
from app.dependencies import require_role

router = APIRouter()

@router.post("/", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
def create_feedback(feedback: FeedbackCreate, current_user: dict = Depends(require_role(["student"]))):
    """Sinh viên tạo phản ánh mới"""
    try:
        # Kiểm tra category_id có tồn tại không
        cat_check = supabase.table("categories").select("id").eq("id", feedback.category_id).execute()
        if not cat_check.data or len(cat_check.data) == 0:
            raise HTTPException(status_code=400, detail="Danh mục không tồn tại.")

        # Lưu phản ánh vào CSDL
        response = supabase.table("feedbacks").insert({
            "title": feedback.title,
            "content": feedback.content,
            "category_id": feedback.category_id,
            "is_anonymous": feedback.is_anonymous,
            "student_id": current_user["id"],
            "status": "pending"
        }).execute()
        
        if not response.data:
            raise HTTPException(status_code=400, detail="Không thể lưu phản ánh.")
            
        return response.data[0]
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
