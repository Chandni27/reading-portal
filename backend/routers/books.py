from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request
from sqlalchemy.orm import Session
from typing import List, Optional
import shutil, os

from core.database import get_db
from core.security import get_current_user, require_role
from models.user import User, UserRole
from models.book import Book
from schemas.schemas import BookResponse, BookCreate

router = APIRouter()

def book_with_url(book: Book, request: Request) -> BookResponse:
    base = str(request.base_url).rstrip("/")
    data = BookResponse.model_validate(book)
    if book.pdf_filename:
        data.pdf_url = f"{base}/static/books/{book.pdf_filename}"
    return data

@router.get("/", response_model=List[BookResponse])
def list_books(request: Request, db: Session = Depends(get_db), _=Depends(get_current_user)):
    books = db.query(Book).order_by(Book.created_at.desc()).all()
    return [book_with_url(b, request) for b in books]

@router.post("/", response_model=BookResponse)
def create_book(
    request: Request,
    title: str = Form(...),
    author: str = Form(...),
    description: Optional[str] = Form(None),
    page_count: int = Form(0),
    pdf_file: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.admin))
):
    pdf_filename = None
    if pdf_file:
        safe_name = pdf_file.filename.replace(" ", "-").lower()
        dest = f"static/books/{safe_name}"
        with open(dest, "wb") as f:
            shutil.copyfileobj(pdf_file.file, f)
        pdf_filename = safe_name

    book = Book(
        title=title,
        author=author,
        description=description,
        page_count=page_count,
        pdf_filename=pdf_filename,
        uploaded_by=current_user.id
    )
    db.add(book)
    db.commit()
    db.refresh(book)
    return book_with_url(book, request)

@router.delete("/{book_id}")
def delete_book(
    book_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_role(UserRole.admin))
):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    db.delete(book)
    db.commit()
    return {"message": "Book deleted"}
