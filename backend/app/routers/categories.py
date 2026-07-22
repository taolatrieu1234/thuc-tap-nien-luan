from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.database import supabase
from app.schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse
from app.dependencies import require_role

router = APIRouter()

@router.get("/", response_model=List[CategoryResponse])
def get_categories():
    """Lấy danh sách tất cả các danh mục phản ánh (Ai cũng có thể xem)"""
    try:
        response = supabase.table("categories").select("*").order("id").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(category: CategoryCreate, current_user: dict = Depends(require_role(["admin"]))):
    """Admin tạo mới một danh mục"""
    try:
        response = supabase.table("categories").insert({
            "name": category.name,
            "description": category.description
        }).execute()
        
        if not response.data:
            raise HTTPException(status_code=400, detail="Không thể tạo danh mục")
            
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{category_id}", response_model=CategoryResponse)
def update_category(category_id: int, category: CategoryUpdate, current_user: dict = Depends(require_role(["admin"]))):
    """Admin cập nhật thông tin danh mục"""
    try:
        # Kiểm tra tồn tại
        check = supabase.table("categories").select("id").eq("id", category_id).execute()
        if not check.data:
            raise HTTPException(status_code=404, detail="Không tìm thấy danh mục")
            
        response = supabase.table("categories").update({
            "name": category.name,
            "description": category.description
        }).eq("id", category_id).execute()
        
        return response.data[0]
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(category_id: int, current_user: dict = Depends(require_role(["admin"]))):
    """Admin xóa danh mục (Chỉ xóa nếu chưa có phản ánh nào)"""
    try:
        # Kiểm tra tồn tại
        check_cat = supabase.table("categories").select("id").eq("id", category_id).execute()
        if not check_cat.data:
            raise HTTPException(status_code=404, detail="Không tìm thấy danh mục")
            
        # Kiểm tra xem có phản ánh nào thuộc danh mục này không
        check_fb = supabase.table("feedbacks").select("id", count="exact").eq("category_id", category_id).execute()
        if check_fb.count and check_fb.count > 0:
            raise HTTPException(status_code=400, detail="Không thể xóa danh mục này vì đang chứa phiếu phản ánh.")
            
        # Thực hiện xóa
        supabase.table("categories").delete().eq("id", category_id).execute()
        return None
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
