#(16)

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class FeedbackBase(BaseModel):
    title: str = Field(..., min_length=1, description="Tiêu đề phản ánh")
    content: str = Field(..., min_length=20, description="Nội dung chi tiết, ít nhất 20 ký tự")
    category_id: int
    is_anonymous: bool = False

class FeedbackCreate(FeedbackBase):
    pass

class FeedbackUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, description="Tiêu đề phản ánh")
    content: Optional[str] = Field(None, min_length=20, description="Nội dung chi tiết, ít nhất 20 ký tự")
    category_id: Optional[int] = None
    is_anonymous: Optional[bool] = None

class FeedbackResponse(FeedbackBase):
    id: int
    student_id: int
    status: str
    created_at: datetime

    class Config:
        orm_mode = True
