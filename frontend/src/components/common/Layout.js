import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const styles = {
  shell: { display: 'flex', flexDirection: 'column', minHeight: '100vh' },
  nav: {
    background: 'var(--color-primary)',
    padding: '0 2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '60px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 8px rgba(226,75,74,0.25)',
  },
  brand: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.35rem',
    color: '#fff',
    fontWeight: 500,
    letterSpacing: '-0.02em',
  },
  navLinks: { display: 'flex', gap: '0.25rem', alignItems: 'center' },
  right: { display: 'flex', alignItems: 'center', gap: '1rem' },
  userBadge: { color: 'rgba(255,255,255,0.8)', fontSize: '13px' },
  logoutBtn: {
    background: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.3)',
    color: '#fff',
    padding: '5px 14px',
    borderRadius: '6px',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'background 0.15s',
  },
  main: { flex: 1, padding: '2rem', maxWidth: '1200px', margin: '0 auto', width: '100%' },
};

const navLinkStyle = ({ isActive }) => ({
  color: isActive ? '#fff' : 'rgba(255,255,255,0.75)',
  fontWeight: isActive ? '500' : '400',
  fontSize: '14px',
  padding: '6px 14px',
  borderRadius: '6px',
  background: isActive ? 'rgba(255,255,255,0.18)' : 'transparent',
  transition: 'all 0.15s',
});

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = {
    teacher: [
      { to: '/teacher/dashboard', label: 'Dashboard' },
      { to: '/teacher/assignments', label: 'Assignments' },
    ],
    admin: [
      { to: '/admin/books', label: 'Manage Books' },
      { to: '/teacher/dashboard', label: 'Dashboard' },
      { to: '/teacher/assignments', label: 'Assignments' },
    ],
    student: [
      { to: '/student/dashboard', label: 'My Reading' },
    ],
  };

  const links = navItems[user?.role] || [];

  return (
    <div style={styles.shell}>
      <nav style={styles.nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <span style={styles.brand}>ReadTrack</span>
          <div style={styles.navLinks}>
            {links.map(l => <NavLink key={l.to} to={l.to} style={navLinkStyle}>{l.label}</NavLink>)}
          </div>
        </div>
        <div style={styles.right}>
          <span style={styles.userBadge}>{user?.name} · <span style={{ textTransform: 'capitalize' }}>{user?.role}</span></span>
          <button style={styles.logoutBtn} onClick={handleLogout}>Sign out</button>
        </div>
      </nav>
      <main style={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
