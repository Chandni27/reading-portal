import React, { useEffect, useState } from 'react';
import { assignmentsAPI } from '../services/api';
import StatusBadge from '../components/common/StatusBadge';

const card = {
  background: 'var(--color-bg-card)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  padding: '1.5rem',
  boxShadow: 'var(--shadow-card)',
};

const STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

export default function StudentDashboard() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState({}); // { [assignmentId]: { status, minutes_read } }
  const [saving, setSaving] = useState(null);

  const load = () => {
    assignmentsAPI.list()
      .then(r => setAssignments(r.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const startEdit = (a) => {
    setEditing(prev => ({
      ...prev,
      [a.id]: {
        status: a.progress?.status || 'not_started',
        minutes_read: a.progress?.minutes_read || 0,
      }
    }));
  };

  const cancelEdit = (id) => {
    setEditing(prev => { const n = { ...prev }; delete n[id]; return n; });
  };

  const saveProgress = async (id) => {
    setSaving(id);
    try {
      await assignmentsAPI.updateProgress(id, editing[id]);
      cancelEdit(id);
      load();
    } finally {
      setSaving(null);
    }
  };

  if (loading) return <p style={{ color: 'var(--color-text-secondary)' }}>Loading your assignments…</p>;

  const totalMins = assignments.reduce((s, a) => s + (a.progress?.minutes_read || 0), 0);
  const completed = assignments.filter(a => a.progress?.status === 'completed').length;

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>My Reading</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>Track your assigned books and reading progress</p>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '2rem' }}>
        {[
          { label: 'Assigned', value: assignments.length },
          { label: 'Completed', value: completed, color: 'var(--color-completed-text)' },
          { label: 'Mins Read', value: totalMins, color: 'var(--color-primary)' },
        ].map(m => (
          <div key={m.label} style={{ ...card, padding: '1rem' }}>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>{m.label}</p>
            <p style={{ fontSize: '1.75rem', fontWeight: '500', color: m.color || 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Assignment cards */}
      {assignments.length === 0 ? (
        <div style={{ ...card, textAlign: 'center', padding: '3rem' }}>
          <p style={{ fontSize: '1.1rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-display)' }}>No assignments yet</p>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginTop: '8px' }}>Your teacher hasn't assigned any books to you.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {assignments.map(a => {
            const edit = editing[a.id];
            const isEditing = !!edit;
            const progress = a.progress;
            const isOverdue = a.due_date && new Date(a.due_date) < new Date() && progress?.status !== 'completed';

            return (
              <div key={a.id} style={{
                ...card,
                borderLeft: `4px solid ${
                  progress?.status === 'completed' ? '#2D9B6B' :
                  progress?.status === 'in_progress' ? '#D4A017' :
                  'var(--color-border)'
                }`,
              }}>
                {/* Book info */}
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                    <h3 style={{ fontSize: '1rem', fontFamily: 'var(--font-display)' }}>{a.book.title}</h3>
                    <StatusBadge status={progress?.status || 'not_started'} />
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{a.book.author}</p>
                  {a.book.description && (
                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '6px', lineHeight: '1.5' }}>
                      {a.book.description}
                    </p>
                  )}
                </div>

                {/* Meta */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '1rem', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  {a.due_date && (
                    <span style={{ color: isOverdue ? 'var(--color-primary)' : 'inherit' }}>
                      {isOverdue ? '⚠ ' : ''}Due {new Date(a.due_date).toLocaleDateString()}
                    </span>
                  )}
                  <span>{progress?.minutes_read || 0} mins read</span>
                  {a.book.page_count > 0 && <span>{a.book.page_count} pages</span>}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {a.book.pdf_url && (
                    <a
                      href={a.book.pdf_url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        background: 'var(--color-primary)', color: '#fff', border: 'none',
                        padding: '7px 14px', borderRadius: 'var(--radius-sm)', fontSize: '13px',
                        fontWeight: '500', cursor: 'pointer', display: 'inline-block',
                      }}
                    >
                      Open book
                    </a>
                  )}
                  {!isEditing ? (
                    <button
                      onClick={() => startEdit(a)}
                      style={{
                        background: 'transparent', border: '1px solid var(--color-border)',
                        color: 'var(--color-text-primary)', padding: '7px 14px',
                        borderRadius: 'var(--radius-sm)', fontSize: '13px', cursor: 'pointer',
                      }}
                    >
                      Update progress
                    </button>
                  ) : (
                    <div style={{ width: '100%', marginTop: '8px', padding: '12px', background: 'var(--color-bg-page)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                      <div style={{ marginBottom: '10px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>Status</label>
                        <select
                          value={edit.status}
                          onChange={e => setEditing(prev => ({ ...prev, [a.id]: { ...prev[a.id], status: e.target.value } }))}
                          style={{ width: '100%', padding: '7px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontSize: '13px', background: '#fff' }}
                        >
                          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                      <div style={{ marginBottom: '10px' }}>
                        <label style={{ fontSize: '12px', fontWeight: '500', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '4px' }}>
                          Minutes read
                        </label>
                        <input
                          type="number"
                          min="0"
                          value={edit.minutes_read}
                          onChange={e => setEditing(prev => ({ ...prev, [a.id]: { ...prev[a.id], minutes_read: parseInt(e.target.value) || 0 } }))}
                          style={{ width: '100%', padding: '7px 10px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', fontSize: '13px', background: '#fff' }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => saveProgress(a.id)}
                          disabled={saving === a.id}
                          style={{ flex: 1, background: 'var(--color-primary)', color: '#fff', border: 'none', padding: '7px', borderRadius: 'var(--radius-sm)', fontSize: '13px', cursor: 'pointer', opacity: saving === a.id ? 0.7 : 1 }}
                        >
                          {saving === a.id ? 'Saving…' : 'Save'}
                        </button>
                        <button
                          onClick={() => cancelEdit(a.id)}
                          style={{ flex: 1, background: 'transparent', border: '1px solid var(--color-border)', padding: '7px', borderRadius: 'var(--radius-sm)', fontSize: '13px', cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
