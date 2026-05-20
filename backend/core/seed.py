from sqlalchemy.orm import Session
from core.database import SessionLocal
from core.security import hash_password

def seed_data():
    """
    ASSUMPTION: Books are pre-seeded from /static/books/ directory.
    Default admin, teacher, and student accounts are created on first run.
    Passwords should be changed in production via environment variables.
    """
    db: Session = SessionLocal()
    try:
        from models.user import User, UserRole
        from models.book import Book

        if db.query(User).first():
            return  # Already seeded

        # Default users
        users = [
            User(name="Admin User", email="admin@school.edu", hashed_password=hash_password("admin123"), role=UserRole.admin),
            User(name="Ms. Johnson", email="teacher@school.edu", hashed_password=hash_password("teacher123"), role=UserRole.teacher),
            User(name="Alice Smith", email="alice@school.edu", hashed_password=hash_password("student123"), role=UserRole.student),
            User(name="Bob Martinez", email="bob@school.edu", hashed_password=hash_password("student123"), role=UserRole.student),
            User(name="Carol Lee", email="carol@school.edu", hashed_password=hash_password("student123"), role=UserRole.student),
            User(name="David Kim", email="david@school.edu", hashed_password=hash_password("student123"), role=UserRole.student),
        ]
        db.add_all(users)

        # ASSUMPTION: PDFs are pre-loaded into /static/books/ in the repo.
        # Admin UI allows registering them with metadata.
        # Real file upload can be swapped in before production deploy.
        books = [
            Book(
                title="The Great Gatsby",
                author="F. Scott Fitzgerald",
                description="A story of wealth, class, love, and the American Dream in the Jazz Age.",
                page_count=180,
                pdf_filename="the-great-gatsby.pdf",
            ),
            Book(
                title="To Kill a Mockingbird",
                author="Harper Lee",
                description="A classic of modern American literature about racial injustice and childhood innocence.",
                page_count=281,
                pdf_filename="to-kill-a-mockingbird.pdf",
            ),
            Book(
                title="Of Mice and Men",
                author="John Steinbeck",
                description="A tale of friendship and hardship during the Great Depression.",
                page_count=112,
                pdf_filename="of-mice-and-men.pdf",
            ),
            Book(
                title="The Catcher in the Rye",
                author="J.D. Salinger",
                description="A coming-of-age story narrated by the iconic Holden Caulfield.",
                page_count=277,
                pdf_filename="catcher-in-the-rye.pdf",
            ),
            Book(
                title="Lord of the Flies",
                author="William Golding",
                description="Boys stranded on an island descend into savagery — an exploration of human nature.",
                page_count=224,
                pdf_filename="lord-of-the-flies.pdf",
            ),
        ]
        db.add_all(books)
        db.commit()
        print("✅ Database seeded with default users and books.")

    except Exception as e:
        db.rollback()
        print(f"Seed error: {e}")
    finally:
        db.close()
