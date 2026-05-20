import React from 'react';

const config = {
  not_started: { label: 'Not Started', bg: 'var(--color-not-started-bg)', color: 'var(--color-not-started-text)' },
  in_progress:  { label: 'In Progress', bg: 'var(--color-in-progress-bg)', color: 'var(--color-in-progress-text)' },
  completed:    { label: 'Completed',   bg: 'var(--color-completed-bg)',   color: 'var(--color-completed-text)' },
};

export default function StatusBadge({ status }) {
  const c = config[status] || config.not_started;
  return (
    <span style={{
      background: c.bg,
      color: c.color,
      fontSize: '12px',
      fontWeight: '500',
      padding: '3px 10px',
      borderRadius: '20px',
      whiteSpace: 'nowrap',
    }}>
      {c.label}
    </span>
  );
}
