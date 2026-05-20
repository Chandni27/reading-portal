from sqlalchemy import Column, Integer, String, Enum, DateTime, ForeignKey, Date
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from core.database import Base

class AssignmentStatus(str, enum.Enum):
    not_started = "not_started"
    in_progress = "in_progress"
    completed = "completed"

class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(Integer, primary_key=True, index=True)
    book_id = Column(Integer, ForeignKey("books.id"), nullable=False)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    teacher_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    due_date = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    book = relationship("Book", back_populates="assignments")
    student = relationship("User", foreign_keys=[student_id], back_populates="assignments_as_student")
    teacher = relationship("User", foreign_keys=[teacher_id], back_populates="assignments_as_teacher")
    progress = relationship("Progress", back_populates="assignment", uselist=False, cascade="all, delete-orphan")

class Progress(Base):
    __tablename__ = "progress"

    id = Column(Integer, primary_key=True, index=True)
    assignment_id = Column(Integer, ForeignKey("assignments.id"), nullable=False)
    status = Column(Enum(AssignmentStatus), default=AssignmentStatus.not_started)
    # ASSUMPTION: minutes_read is self-reported by student (manual entry)
    # EXTENSIBILITY: sessions field reserved for future in-app timer feature
    minutes_read = Column(Integer, default=0)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    assignment = relationship("Assignment", back_populates="progress")
