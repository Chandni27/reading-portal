import React, { useEffect, useState } from 'react';
import { dashboardAPI } from '../services/api';
import StatusBadge from '../components/common/StatusBadge';

const card = {
  background: 'var(--color-bg-card)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-lg)',
  padding: '1.25rem 1.5rem',
  boxShadow: 'var(--shadow-card)',
};

export default function TeacherDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.get()
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: 'var(--color-text-secondary)' }}>Loading dashboard…</p>;
  if (!data) return <p style={{ color: 'var(--color-primary)' }}>Failed to load dashboard.</p>;

  const pct = (n) => data.total_assignments ? Math.round((n / data.total_assignments) * 100) : 0;

  return (
    <div>
      <h1 style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>Dashboard</h1>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '2rem' }}>Class-wide reading progress overview</p>

      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px', marginBottom: '2rem' }}>
        {[
          { label: 'Total Students', value: data.total_students, color: 'var(--color-text-primary)' },
          { label: 'Assignments', value: data.total_assignments, color: 'var(--color-text-primary)' },
          { label: 'Completed', value: data.completed, color: 'var(--color-completed-text)' },
          { label: 'In Progress', value: data.in_progress, color: 'var(--color-in-progress-text)' },
          { label: 'Not Started', value: data.not_started, color: 'var(--color-text-secondary)' },
        ].map(m => (
          <div key={m.label} style={{ ...card, padding: '1rem' }}>
            <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '6px' }}>{m.label}</p>
            <p style={{ fontSize: '1.75rem', fontWeight: '500', color: m.color, fontFamily: 'var(--font-display)' }}>{m.value}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {data.total_assignments > 0 && (
        <div style={{ ...card, marginBottom: '2rem' }}>
          <p style={{ fontSize: '13px', fontWeight: '500', marginBottom: '10px' }}>Overall completion</p>
          <div style={{ background: 'var(--color-bg-page)', borderRadius: '99px', height: '10px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${pct(data.completed)}%`,
              background: 'var(--color-primary)', borderRadius: '99px', transition: 'width 0.6s ease',
            }} />
          </div>
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '6px' }}>
            {pct(data.completed)}% of assignments completed
          </p>
        </div>
      )}

      {/* Student table */}
      <div style={card}>
        <h2 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Student progress</h2>
        {data.student_summaries.length === 0 ? (
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>No students yet. Add students and create assignments to see progress here.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                {['Student', 'Assignments', 'Completed', 'In Progress', 'Not Started', 'Mins Read'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontSize: '12px', color: 'var(--color-text-secondary)', fontWeight: '500' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.student_summaries.map(s => (
                <tr key={s.student.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td style={{ padding: '12px', fontWeight: '500' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '30px', height: '30px', borderRadius: '50%',
                        background: 'var(--color-primary-light)', color: 'var(--color-primary-dark)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '11px', fontWeight: '500', flexShrink: 0,
                      }}>
                        {s.student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      {s.student.name}
                    </div>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>{s.total_assignments}</td>
                  <td style={{ padding: '12px', textAlign: 'center', color: 'var(--color-completed-text)', fontWeight: '500' }}>{s.completed}</td>
                  <td style={{ padding: '12px', textAlign: 'center', color: 'var(--color-in-progress-text)' }}>{s.in_progress}</td>
                  <td style={{ padding: '12px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>{s.not_started}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>{s.total_minutes_read}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
