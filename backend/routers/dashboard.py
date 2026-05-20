from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from core.database import get_db
from core.security import require_role
from models.user import User, UserRole
from models.assignment import Assignment, Progress, AssignmentStatus
from schemas.schemas import DashboardResponse, StudentProgressSummary, UserResponse

router = APIRouter()

@router.get("/", response_model=DashboardResponse)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.teacher, UserRole.admin))
):
    """
    Single endpoint that aggregates all assignment data for the teacher dashboard.
    Avoids N+1 queries by loading all data in bulk.
    """
    students = db.query(User).filter(User.role == UserRole.student).all()
    all_assignments = db.query(Assignment).all()
    all_progress = db.query(Progress).all()

    progress_map = {p.assignment_id: p for p in all_progress}

    total = len(all_assignments)
    completed = sum(1 for p in all_progress if p.status == AssignmentStatus.completed)
    in_progress = sum(1 for p in all_progress if p.status == AssignmentStatus.in_progress)
    not_started = sum(1 for p in all_progress if p.status == AssignmentStatus.not_started)

    summaries = []
    for student in students:
        student_assignments = [a for a in all_assignments if a.student_id == student.id]
        student_progress = [progress_map[a.id] for a in student_assignments if a.id in progress_map]

        summaries.append(StudentProgressSummary(
            student=UserResponse.model_validate(student),
            total_assignments=len(student_assignments),
            completed=sum(1 for p in student_progress if p.status == AssignmentStatus.completed),
            in_progress=sum(1 for p in student_progress if p.status == AssignmentStatus.in_progress),
            not_started=sum(1 for p in student_progress if p.status == AssignmentStatus.not_started),
            total_minutes_read=sum(p.minutes_read for p in student_progress),
        ))

    return DashboardResponse(
        total_students=len(students),
        total_assignments=total,
        completed=completed,
        in_progress=in_progress,
        not_started=not_started,
        student_summaries=summaries,
    )
