import React, { useEffect, useState } from 'react';
import { booksAPI } from '../services/api';

const card = {
  background: 'var(--color-bg-card)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  padding: '1.5rem',
  boxShadow: 'var(--shadow-card)',
};

const inputStyle = {
  width: '100%', padding: '9px 12px',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-sm)', fontSize: '14px',
  background: 'var(--color-bg-page)', outline: 'none',
};

export default function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({ title: '', author: '', description: '', page_count: '', pdf_file: null });

  const load = () => {
    booksAPI.list().then(r => setBooks(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!form.title || !form.author) { setError('Title and author are required.'); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('author', form.author);
      fd.append('description', form.description);
      fd.append('page_count', form.page_count || 0);
      if (form.pdf_file) fd.append('pdf_file', form.pdf_file);
      await booksAPI.create(fd);
      setSuccess('Book added successfully.');
      setForm({ title: '', author: '', description: '', page_count: '', pdf_file: null });
      e.target.reset();
      load();
      setTimeout(() => setSuccess(''), 3000);
    } catch {
      setError('Failed to add book.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this book? Existing assignments will also be removed.')) return;
    await booksAPI.delete(id);
    load();
  };

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>Book Library</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>Manage available books for teachers to assign</p>

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '1.5rem', alignItems: 'start' }}>

        {/* Upload form */}
        <div style={card}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Add a book</h2>
          <form onSubmit={handleSubmit}>
            {[
              { label: 'Title *', key: 'title', type: 'text', placeholder: 'e.g. The Great Gatsby' },
              { label: 'Author *', key: 'author', type: 'text', placeholder: 'e.g. F. Scott Fitzgerald' },
              { label: 'Description', key: 'description', type: 'text', placeholder: 'Brief summary…' },
              { label: 'Page count', key: 'page_count', type: 'number', placeholder: '0' },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: '0.85rem' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '5px', color: 'var(--color-text-secondary)' }}>{f.label}</label>
                <input
                  type={f.type}
                  placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  style={inputStyle}
                />
              </div>
            ))}

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '5px', color: 'var(--color-text-secondary)' }}>PDF file</label>
              <input
                type="file"
                accept=".pdf"
                onChange={e => setForm(p => ({ ...p, pdf_file: e.target.files[0] }))}
                style={{ fontSize: '13px', color: 'var(--color-text-secondary)', width: '100%' }}
              />
              <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                Leave empty to use pre-loaded PDFs from /static/books/
              </p>
            </div>

            {error && <p style={{ color: 'var(--color-primary)', fontSize: '13px', marginBottom: '10px' }}>{error}</p>}
            {success && <p style={{ color: 'var(--color-completed-text)', fontSize: '13px', marginBottom: '10px' }}>{success}</p>}

            <button
              type="submit"
              disabled={submitting}
              style={{
                width: '100%', background: submitting ? 'var(--color-primary-mid)' : 'var(--color-primary)',
                color: '#fff', border: 'none', padding: '9px', borderRadius: 'var(--radius-sm)',
                fontSize: '14px', fontWeight: '500', cursor: submitting ? 'not-allowed' : 'pointer',
              }}
            >
              {submitting ? 'Adding…' : 'Add book'}
            </button>
          </form>
        </div>

        {/* Books list */}
        <div style={card}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>All books ({books.length})</h2>
          {loading ? (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>Loading…</p>
          ) : books.length === 0 ? (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>No books yet. Add one using the form.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {books.map(b => (
                <div key={b.id} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 14px', border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)', background: 'var(--color-bg-page)',
                  flexWrap: 'wrap',
                }}>
                  <div style={{
                    width: '36px', height: '48px', background: 'var(--color-primary-light)',
                    borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, fontSize: '18px',
                  }}>📖</div>
                  <div style={{ flex: 1, minWidth: '120px' }}>
                    <p style={{ fontWeight: '500', fontSize: '14px', marginBottom: '2px' }}>{b.title}</p>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{b.author}</p>
                    {b.description && <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>{b.description}</p>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                    {b.page_count > 0 && <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{b.page_count} pages</span>}
                    {b.pdf_url ? (
                      <a href={b.pdf_url} target="_blank" rel="noreferrer" style={{
                        fontSize: '12px', color: 'var(--color-primary)', fontWeight: '500',
                      }}>View PDF</a>
                    ) : (
                      <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>No PDF</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(b.id)}
                    style={{
                      background: 'none', border: '1px solid var(--color-border)',
                      color: 'var(--color-text-secondary)', borderRadius: 'var(--radius-sm)',
                      padding: '4px 10px', fontSize: '12px', cursor: 'pointer',
                    }}
                  >
                    Delete
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
