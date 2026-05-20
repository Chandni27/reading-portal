import React, { useEffect, useState } from 'react';
import { assignmentsAPI, booksAPI, studentsAPI } from '../services/api';
import StatusBadge from '../components/common/StatusBadge';

const card = {
  background: 'var(--color-bg-card)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  padding: '1.5rem',
  boxShadow: 'var(--shadow-card)',
};

const btnPrimary = {
  background: 'var(--color-primary)', color: '#fff', border: 'none',
  padding: '9px 20px', borderRadius: 'var(--radius-sm)', fontSize: '14px',
  fontWeight: '500', cursor: 'pointer',
};

const inputStyle = {
  width: '100%', padding: '9px 12px', border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)', fontSize: '14px', background: 'var(--color-bg-page)',
  outline: 'none',
};

export default function TeacherAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [books, setBooks] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ book_id: '', student_ids: [], due_date: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = () => {
    Promise.all([
      assignmentsAPI.list(),
      booksAPI.list(),
      studentsAPI.list(),
    ]).then(([a, b, s]) => {
      setAssignments(a.data);
      setBooks(b.data);
      setStudents(s.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const toggleStudent = (id) => {
    setForm(f => ({
      ...f,
      student_ids: f.student_ids.includes(id)
        ? f.student_ids.filter(s => s !== id)
        : [...f.student_ids, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.book_id || form.student_ids.length === 0) {
      setError('Select a book and at least one student.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await assignmentsAPI.create({
        book_id: parseInt(form.book_id),
        student_ids: form.student_ids,
        due_date: form.due_date || null,
      });
      setSuccess(`Assignment created for ${form.student_ids.length} student(s).`);
      setForm({ book_id: '', student_ids: [], due_date: '' });
      load();
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to create assignment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this assignment?')) return;
    await assignmentsAPI.delete(id);
    load();
  };

  if (loading) return <p style={{ color: 'var(--color-text-secondary)' }}>Loading…</p>;

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>Assignments</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>Assign books to students and track their progress</p>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* Create form */}
        <div style={card}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>New assignment</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: 'var(--color-text-secondary)' }}>Book</label>
              <select value={form.book_id} onChange={e => setForm(f => ({ ...f, book_id: e.target.value }))} style={inputStyle}>
                <option value="">Select a book…</option>
                {books.map(b => <option key={b.id} value={b.id}>{b.title} — {b.author}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: 'var(--color-text-secondary)' }}>Students</label>
              <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                {students.length === 0
                  ? <p style={{ padding: '10px 12px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>No students found.</p>
                  : students.map(s => (
                    <label key={s.id} style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '9px 12px', cursor: 'pointer',
                      background: form.student_ids.includes(s.id) ? 'var(--color-primary-light)' : 'transparent',
                      borderBottom: '1px solid var(--color-border)',
                      fontSize: '14px', transition: 'background 0.1s',
                    }}>
                      <input
                        type="checkbox"
                        checked={form.student_ids.includes(s.id)}
                        onChange={() => toggleStudent(s.id)}
                        style={{ accentColor: 'var(--color-primary)' }}
                      />
                      <span>{s.name}</span>
                      {form.student_ids.includes(s.id) && <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--color-primary-dark)', fontWeight: '500' }}>Selected</span>}
                    </label>
                  ))
                }
              </div>
              {form.student_ids.length > 0 && (
                <p style={{ fontSize: '12px', color: 'var(--color-primary-dark)', marginTop: '4px' }}>
                  {form.student_ids.length} student(s) selected
                </p>
              )}
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: 'var(--color-text-secondary)' }}>Due date (optional)</label>
              <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} style={inputStyle} />
            </div>

            {error && <p style={{ color: 'var(--color-primary)', fontSize: '13px', marginBottom: '10px' }}>{error}</p>}
            {success && <p style={{ color: 'var(--color-completed-text)', fontSize: '13px', marginBottom: '10px' }}>{success}</p>}

            <button type="submit" disabled={submitting} style={{ ...btnPrimary, width: '100%', opacity: submitting ? 0.7 : 1 }}>
              {submitting ? 'Creating…' : 'Create assignment'}
            </button>
          </form>
        </div>

        {/* Assignments list */}
        <div style={card}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>All assignments ({assignments.length})</h2>
          {assignments.length === 0 ? (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>No assignments yet. Create one using the form.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {assignments.map(a => (
                <div key={a.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 14px', border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)', background: 'var(--color-bg-page)',
                  gap: '12px', flexWrap: 'wrap',
                }}>
                  <div style={{ flex: 1, minWidth: '150px' }}>
                    <p style={{ fontWeight: '500', fontSize: '14px', marginBottom: '2px' }}>{a.book.title}</p>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{a.book.author}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '26px', height: '26px', borderRadius: '50%',
                      background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '10px', fontWeight: '500',
                    }}>
                      {a.student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <span style={{ fontSize: '13px' }}>{a.student.name}</span>
                  </div>
                  <StatusBadge status={a.progress?.status || 'not_started'} />
                  <div style={{ textAlign: 'right', minWidth: '80px' }}>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                      {a.progress?.minutes_read || 0} mins
                    </p>
                    {a.due_date && (
                      <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)' }}>
                        Due {new Date(a.due_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(a.id)}
                    style={{
                      background: 'none', border: '1px solid var(--color-border)',
                      color: 'var(--color-text-secondary)', borderRadius: 'var(--radius-sm)',
                      padding: '4px 10px', fontSize: '12px', cursor: 'pointer',
                    }}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
