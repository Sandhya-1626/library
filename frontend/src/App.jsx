import React, { useState } from 'react';
import axios from 'axios';
import Login from './Login';
import StudentDashboard from './StudentDashboard';
import AdminDashboard from './AdminDashboard';
import './App.css';

/* ── Error boundary so a crash in Dashboard never breaks Login ── */
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  componentDidCatch(error, info) { console.error('App error:', error, info); }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexDirection: 'column', gap: '1rem', padding: '2rem',
          background: '#04051a', color: '#f1f5f9', fontFamily: 'Inter, sans-serif',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '3rem' }}>⚠️</div>
          <h2 style={{ color: '#fca5a5' }}>Something went wrong</h2>
          <p style={{ color: '#64748b', maxWidth: 400 }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              padding: '0.6rem 1.5rem', borderRadius: 12,
              background: 'linear-gradient(135deg,#6366f1,#a855f7)',
              color: '#fff', cursor: 'pointer', border: 'none', fontSize: '0.9rem',
            }}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [session, setSession] = useState(null); // { user, role }

  const handleLoginSuccess = (data, role) => {
    setSession({ user: data.user || { name: 'Admin', department: '', rollNo: '', year: '' }, role });
  };

  const handleLogout = async (duration = 0) => {
    if (session?.role === 'student') {
      try {
        await axios.post('/api/logout', { name: session.user.name, duration });
      } catch {/* ignore */ }
    }
    setSession(null);
  };

  return (
    <ErrorBoundary>
      <div className="app-container">
        {!session ? (
          <Login onLoginSuccess={handleLoginSuccess} />
        ) : session.role === 'admin' ? (
          <ErrorBoundary>
            <AdminDashboard onLogout={handleLogout} />
          </ErrorBoundary>
        ) : (
          <ErrorBoundary>
            <StudentDashboard user={session.user} onLogout={handleLogout} />
          </ErrorBoundary>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
