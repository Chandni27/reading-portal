from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional

from core.database import get_db
from core.security import get_current_user, require_role
from models.user import User, UserRole
from models.assignment import Assignment, Progress, AssignmentStatus
from models.book import Book
from schemas.schemas import AssignmentCreate, AssignmentResponse, ProgressUpdate, ProgressResponse

router = APIRouter()

@router.post("/", response_model=List[AssignmentResponse])
def create_assignments(
    payload: AssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.teacher, UserRole.admin))
):
    """
    Fan-out: teacher selects multiple students → backend creates individual assignment
    records per student so each student tracks progress independently.
    """
    book = db.query(Book).filter(Book.id == payload.book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    created = []
    for student_id in payload.student_ids:
        student = db.query(User).filter(User.id == student_id, User.role == UserRole.student).first()
        if not student:
            continue

        # Check for duplicate assignment
        existing = db.query(Assignment).filter(
            Assignment.book_id == payload.book_id,
            Assignment.student_id == student_id
        ).first()
        if existing:
            continue

        assignment = Assignment(
            book_id=payload.book_id,
            student_id=student_id,
            teacher_id=current_user.id,
            due_date=payload.due_date
        )
        db.add(assignment)
        db.flush()

        progress = Progress(assignment_id=assignment.id)
        db.add(progress)
        created.append(assignment)

    db.commit()
    for a in created:
        db.refresh(a)
    return created

@router.get("/", response_model=List[AssignmentResponse])
def list_assignments(
    student_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Assignment).options(
        joinedload(Assignment.book),
        joinedload(Assignment.student),
        joinedload(Assignment.teacher),
        joinedload(Assignment.progress)
    )

    # Students only see their own assignments
    if current_user.role == UserRole.student:
        query = query.filter(Assignment.student_id == current_user.id)
    elif student_id:
        query = query.filter(Assignment.student_id == student_id)

    return query.order_by(Assignment.created_at.desc()).all()

@router.patch("/{assignment_id}/progress", response_model=ProgressResponse)
def update_progress(
    assignment_id: int,
    payload: ProgressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    # Only the assigned student or teacher/admin can update progress
    if current_user.role == UserRole.student and assignment.student_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your assignment")

    progress = assignment.progress
    if not progress:
        progress = Progress(assignment_id=assignment_id)
        db.add(progress)

    if payload.status is not None:
        progress.status = payload.status
    if payload.minutes_read is not None:
        progress.minutes_read = payload.minutes_read

    db.commit()
    db.refresh(progress)
    return progress

@router.delete("/{assignment_id}")
def delete_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_role(UserRole.teacher, UserRole.admin))
):
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    db.delete(assignment)
    db.commit()
    return {"message": "Assignment deleted"}
