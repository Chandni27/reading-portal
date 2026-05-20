from sqlalchemy import Column, Integer, String, Enum, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from core.database import Base

class UserRole(str, enum.Enum):
    # EXTENSIBILITY: Add 'parent', 'principal' roles here without touching other code
    admin = "admin"
    teacher = "teacher"
    student = "student"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    assignments_as_student = relationship("Assignment", foreign_keys="Assignment.student_id", back_populates="student")
    assignments_as_teacher = relationship("Assignment", foreign_keys="Assignment.teacher_id", back_populates="teacher")
