import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'teacher') navigate('/teacher/dashboard');
      else if (user.role === 'student') navigate('/student/dashboard');
      else if (user.role === 'admin') navigate('/admin/books');
    } catch {
      setError('Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const fill = (e, p) => { setEmail(e); setPassword(p); };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--color-bg-page)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: 'var(--color-primary)', marginBottom: '0.5rem' }}>
            ReadTrack
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '15px' }}>Reading Assignment Portal</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          boxShadow: 'var(--shadow-card)',
        }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', fontFamily: 'var(--font-display)' }}>Sign in</h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: 'var(--color-text-secondary)' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@school.edu"
                required
                style={{
                  width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)', fontSize: '15px', outline: 'none',
                  background: 'var(--color-bg-page)',
                }}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '500', marginBottom: '6px', color: 'var(--color-text-secondary)' }}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%', padding: '10px 12px', border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)', fontSize: '15px', outline: 'none',
                  background: 'var(--color-bg-page)',
                }}
              />
            </div>

            {error && <p style={{ color: 'var(--color-primary)', fontSize: '13px', marginBottom: '1rem' }}>{error}</p>}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '11px', background: loading ? 'var(--color-primary-mid)' : 'var(--color-primary)',
                color: '#fff', border: 'none', borderRadius: 'var(--radius-sm)',
                fontSize: '15px', fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.15s',
              }}
            >
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>

        {/* Demo credentials */}
        <div style={{
          marginTop: '1.5rem',
          background: 'var(--color-bg-card)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
        }}>
          <p style={{ fontSize: '12px', fontWeight: '500', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Demo credentials</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              { label: 'Admin', email: 'admin@school.edu', pass: 'admin123' },
              { label: 'Teacher', email: 'teacher@school.edu', pass: 'teacher123' },
              { label: 'Student', email: 'alice@school.edu', pass: 'student123' },
            ].map(c => (
              <button
                key={c.email}
                onClick={() => fill(c.email, c.pass)}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'var(--color-bg-page)', border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)', padding: '6px 10px', cursor: 'pointer',
                  fontSize: '12px', color: 'var(--color-text-primary)',
                  transition: 'border-color 0.15s',
                }}
              >
                <span style={{ fontWeight: '500' }}>{c.label}</span>
                <span style={{ color: 'var(--color-text-secondary)' }}>{c.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
