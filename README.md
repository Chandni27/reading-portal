# ReadTrack — Reading Assignment Portal

A full-stack web application for teachers to assign books to students and track reading progress.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6 |
| Backend | Python 3.11+, FastAPI |
| Database | SQLite (local) → PostgreSQL (production) |
| Auth | JWT (bcrypt passwords) |
| Hosting | Render (backend + DB) + Vercel or Render (frontend) |

---

## Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@school.edu | admin123 |
| Teacher | teacher@school.edu | teacher123 |
| Student | alice@school.edu | student123 |
| Student | bob@school.edu | student123 |

> ⚠️ Change these in production via environment variables.

---

## Local Setup

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # Edit as needed
uvicorn main:app --reload --port 8000
```

API runs at: http://localhost:8000  
Swagger docs: http://localhost:8000/docs

### 2. Add sample PDFs

Place PDF files in `backend/static/books/` matching these filenames:
- `the-great-gatsby.pdf`
- `to-kill-a-mockingbird.pdf`
- `of-mice-and-men.pdf`
- `catcher-in-the-rye.pdf`
- `lord-of-the-flies.pdf`

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local      # Edit REACT_APP_API_URL if needed
npm start
```

App runs at: http://localhost:3000

---

## API Overview (v1)

```
POST   /api/v1/auth/login                → login, returns JWT
GET    /api/v1/auth/me                   → current user
GET    /api/v1/books/                    → list books
POST   /api/v1/books/                    → upload book (admin)
DELETE /api/v1/books/{id}               → delete book (admin)
GET    /api/v1/students/                 → list students (teacher/admin)
POST   /api/v1/assignments/              → create assignments (teacher/admin)
GET    /api/v1/assignments/              → list assignments
PATCH  /api/v1/assignments/{id}/progress → update progress (student)
DELETE /api/v1/assignments/{id}         → delete assignment (teacher/admin)
GET    /api/v1/dashboard/               → teacher dashboard summary
```

---

## Deployment (Render)

1. Push to GitHub
2. Create a new **Web Service** on Render pointing to `/backend`
   - Build: `pip install -r requirements.txt`
   - Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - Add env vars: `DATABASE_URL`, `SECRET_KEY`
3. Create a **PostgreSQL** database on Render, copy the URL to `DATABASE_URL`
4. Create a **Static Site** on Render pointing to `/frontend`
   - Build: `npm install && npm run build`
   - Publish dir: `build`
   - Add env var: `REACT_APP_API_URL=https://your-backend.onrender.com`

---

## Assumptions

1. Single school / single teacher scope for MVP
2. Books are pre-seeded PDFs in `/static/books/` (admin can also upload via UI)
3. Minutes read is self-reported by the student (no real-time timer)
4. No email notifications or reminders
5. "Open book" opens the PDF URL in a new browser tab
6. No pagination (reasonable class size ~30 students)
7. Passwords hashed with bcrypt, auth via JWT — no OAuth
8. SQLite for local dev; swap to PostgreSQL for production via `.env`

## Extensibility Notes

- `UserRole` enum in `models/user.py` — add `parent`, `principal` roles without touching other code
- `Progress.minutes_read` — designed for future in-app timer (sessions field can be added)
- `pdf_filename` in Book model → swap for `pdf_url` (Cloudinary) in production
- API versioned at `/api/v1/` — backward-compatible future versions at `/api/v2/`
