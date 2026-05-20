import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import LoginPage from './pages/LoginPage';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherAssignments from './pages/TeacherAssignments';
import StudentDashboard from './pages/StudentDashboard';
import AdminBooks from './pages/AdminBooks';
import Layout from './components/common/Layout';

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', fontFamily:'var(--font-body)', color:'var(--color-text-secondary)' }}>Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
  if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
  if (user.role === 'admin') return <Navigate to="/admin/books" replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<RoleRedirect />} />

          <Route path="/teacher" element={
            <ProtectedRoute roles={['teacher', 'admin']}><Layout /></ProtectedRoute>
          }>
            <Route path="dashboard" element={<TeacherDashboard />} />
            <Route path="assignments" element={<TeacherAssignments />} />
          </Route>

          <Route path="/student" element={
            <ProtectedRoute roles={['student']}><Layout /></ProtectedRoute>
          }>
            <Route path="dashboard" element={<StudentDashboard />} />
          </Route>

          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}><Layout /></ProtectedRoute>
          }>
            <Route path="books" element={<AdminBooks />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
