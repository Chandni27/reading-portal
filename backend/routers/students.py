from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from core.database import get_db
from core.security import get_current_user, require_role
from models.user import User, UserRole
from schemas.schemas import UserResponse

router = APIRouter()

@router.get("/", response_model=List[UserResponse])
def list_students(
    db: Session = Depends(get_db),
    _=Depends(require_role(UserRole.teacher, UserRole.admin))
):
    return db.query(User).filter(User.role == UserRole.student).order_by(User.name).all()
