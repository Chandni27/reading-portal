from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime
from models.user import UserRole
from models.assignment import AssignmentStatus

# ── Auth ──────────────────────────────────────────────
class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserResponse"

# ── Users ─────────────────────────────────────────────
class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: UserRole
    created_at: datetime

    class Config:
        from_attributes = True

# ── Books ─────────────────────────────────────────────
class BookCreate(BaseModel):
    title: str
    author: str
    description: Optional[str] = None
    page_count: Optional[int] = 0
    pdf_filename: Optional[str] = None

class BookResponse(BaseModel):
    id: int
    title: str
    author: str
    description: Optional[str]
    page_count: int
    pdf_filename: Optional[str]
    pdf_url: Optional[str] = None  # computed in router
    created_at: datetime

    class Config:
        from_attributes = True

# ── Assignments ───────────────────────────────────────
class AssignmentCreate(BaseModel):
    book_id: int
    student_ids: List[int]  # fan-out: one request → multiple assignments
    due_date: Optional[date] = None

class ProgressUpdate(BaseModel):
    status: Optional[AssignmentStatus] = None
    minutes_read: Optional[int] = None

class ProgressResponse(BaseModel):
    status: AssignmentStatus
    minutes_read: int
    last_updated: datetime

    class Config:
        from_attributes = True

class AssignmentResponse(BaseModel):
    id: int
    book: BookResponse
    student: UserResponse
    teacher: UserResponse
    due_date: Optional[date]
    created_at: datetime
    progress: Optional[ProgressResponse]

    class Config:
        from_attributes = True

# ── Dashboard ─────────────────────────────────────────
class StudentProgressSummary(BaseModel):
    student: UserResponse
    total_assignments: int
    completed: int
    in_progress: int
    not_started: int
    total_minutes_read: int

class DashboardResponse(BaseModel):
    total_students: int
    total_assignments: int
    completed: int
    in_progress: int
    not_started: int
    student_summaries: List[StudentProgressSummary]

TokenResponse.model_rebuild()
