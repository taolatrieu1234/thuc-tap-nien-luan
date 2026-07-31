
#(16)
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.database import supabase
from app.schemas.feedback import FeedbackCreate, FeedbackResponse, FeedbackUpdate
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

#(19)
@router.get("/my", response_model=List[FeedbackResponse])
def get_my_feedbacks(current_user: dict = Depends(require_role(["student"]))):
    """Sinh viên lấy danh sách phản ánh cá nhân"""
    try:
        response = supabase.table("feedbacks")\
            .select("*")\
            .eq("student_id", current_user["id"])\
            .order("created_at", desc=True)\
            .execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

#(21)
@router.put("/{feedback_id}", response_model=FeedbackResponse)
def update_feedback(feedback_id: int, feedback_update: FeedbackUpdate, current_user: dict = Depends(require_role(["student"]))):
    """Sinh viên cập nhật phản ánh (Chỉ khi status == 'pending')"""
    try:
        # 1. Lấy thông tin phiếu phản ánh
        fb_check = supabase.table("feedbacks").select("*").eq("id", feedback_id).execute()
        if not fb_check.data or len(fb_check.data) == 0:
            raise HTTPException(status_code=404, detail="Phiếu phản ánh không tồn tại.")
            
        fb = fb_check.data[0]
        
        # 2. Kiểm tra quyền sở hữu
        if fb["student_id"] != current_user["id"]:
            raise HTTPException(status_code=403, detail="Bạn không có quyền chỉnh sửa phiếu này.")
            
        # 3. Kiểm tra trạng thái
        if fb["status"] != "pending":
            raise HTTPException(status_code=400, detail="Không thể chỉnh sửa phiếu phản ánh đã được Cán bộ tiếp nhận xử lý.")
            
        # 4. Thực hiện cập nhật
        update_data = feedback_update.dict(exclude_unset=True)
        if not update_data:
            raise HTTPException(status_code=400, detail="Không có dữ liệu cập nhật.")
            
        if "category_id" in update_data:
            cat_check = supabase.table("categories").select("id").eq("id", update_data["category_id"]).execute()
            if not cat_check.data or len(cat_check.data) == 0:
                raise HTTPException(status_code=400, detail="Danh mục mới không tồn tại.")

        response = supabase.table("feedbacks").update(update_data).eq("id", feedback_id).execute()
        
        return response.data[0]
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{feedback_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_feedback(feedback_id: int, current_user: dict = Depends(require_role(["student"]))):
    """Sinh viên xóa (rút) phiếu phản ánh (Chỉ khi status == 'pending')"""
    try:
        # 1. Lấy thông tin phiếu
        fb_check = supabase.table("feedbacks").select("*").eq("id", feedback_id).execute()
        if not fb_check.data or len(fb_check.data) == 0:
            raise HTTPException(status_code=404, detail="Phiếu phản ánh không tồn tại.")
            
        fb = fb_check.data[0]
        
        # 2. Kiểm tra quyền sở hữu
        if fb["student_id"] != current_user["id"]:
            raise HTTPException(status_code=403, detail="Bạn không có quyền xóa phiếu này.")
            
        # 3. Kiểm tra trạng thái
        if fb["status"] != "pending":
            raise HTTPException(status_code=400, detail="Không thể rút phiếu phản ánh đã được Cán bộ tiếp nhận xử lý.")
            
        # 4. Thực hiện xóa
        supabase.table("feedbacks").delete().eq("id", feedback_id).execute()
        
        return None
    except HTTPException as http_exc:
        raise http_exc
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
