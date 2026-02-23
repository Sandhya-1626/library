import React, { useState } from 'react';
import axios from 'axios';
import {
  BookOpen, User, ShieldCheck, Eye, EyeOff,
  GraduationCap, Sparkles, ArrowRight, Library
} from 'lucide-react';

const DEPARTMENTS = [
  'Computer Science',
  'Information Technology',
  'Electronics & Communication',
  'Electrical & Electronics',
  'Mechanical Engineering',
];

const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

const Login = ({ onLoginSuccess }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '', department: DEPARTMENTS[0], rollNo: '', year: YEARS[0],
    username: '', password: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const endpoint = isAdmin ? '/api/login/admin' : '/api/login/student';
      const res = await axios.post(endpoint, formData);
      if (res.data.success) {
        onLoginSuccess(res.data, isAdmin ? 'admin' : 'student');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">

      {/* ── Left Hero Panel ── */}
      <div className="login-page__left">
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 440 }}>

          {/* Logo mark */}
          <div style={{
            width: 88, height: 88, borderRadius: 24,
            background: 'linear-gradient(135deg,#6366f1,#a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 2rem',
            boxShadow: '0 0 50px rgba(99,102,241,0.5)',
          }}>
            <Library size={44} color="#fff" />
          </div>

          <h1 style={{ fontSize: '2.6rem', marginBottom: '1rem', color: '#fff' }}>
            Smart Digital<br />
            <span className="text-gradient">Library</span>
          </h1>

          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '1.05rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>
            Explore thousands of books, read online with our immersive 3D flipbook, and pre-book physical copies — all in one place.
          </p>

          {/* Feature pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
            {['📚 1000+ Books', '🔖 Pre-Book System', '⭐ Reviews & Ratings', '📊 Live Analytics'].map(f => (
              <span key={f} style={{
                padding: '6px 16px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                fontSize: '0.82rem',
                color: 'rgba(255,255,255,0.80)',
              }}>{f}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="login-page__right">
        <div className="login-form-box">

          {/* Header */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.5rem' }}>
              <Sparkles size={16} color="#a855f7" />
              <span style={{ fontSize: '0.8rem', color: '#a855f7', fontWeight: 600, letterSpacing: '0.08em' }}>
                WELCOME BACK
              </span>
            </div>
            <h2 style={{ fontSize: '2rem', color: '#fff', marginBottom: '0.3rem' }}>
              {isAdmin ? 'Admin Login' : 'Student Login'}
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              {isAdmin
                ? 'Manage books, view analytics, and handle pre-bookings.'
                : 'Browse and read books from your digital library.'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="tab-pills">
            <button
              type="button"
              className={`tab-pill ${!isAdmin ? 'active' : ''}`}
              onClick={() => { setIsAdmin(false); setError(''); }}
            >
              <GraduationCap size={15} style={{ verticalAlign: 'middle', marginRight: 5 }} />
              Student
            </button>
            <button
              type="button"
              className={`tab-pill ${isAdmin ? 'active' : ''}`}
              onClick={() => { setIsAdmin(true); setError(''); }}
            >
              <ShieldCheck size={15} style={{ verticalAlign: 'middle', marginRight: 5 }} />
              Admin
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {!isAdmin ? (
              <>
                <div className="input-group">
                  <label>Full Name</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    required
                    autoComplete="name"
                  />
                </div>

                <div className="input-group">
                  <label>Department</label>
                  <select name="department" value={formData.department} onChange={handleChange}>
                    {DEPARTMENTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label>Roll Number</label>
                    <input
                      name="rollNo"
                      value={formData.rollNo}
                      onChange={handleChange}
                      placeholder="e.g. CS2021001"
                      required
                    />
                  </div>
                  <div className="input-group" style={{ marginBottom: 0 }}>
                    <label>Year</label>
                    <select name="year" value={formData.year} onChange={handleChange}>
                      {YEARS.map(y => <option key={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="input-group">
                  <label>Admin ID</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="Enter admin ID"
                      required
                      style={{ paddingLeft: '2.8rem' }}
                    />
                    <User size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                  </div>
                </div>
                <div className="input-group">
                  <label>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      name="password"
                      type={showPwd ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      required
                      style={{ paddingLeft: '2.8rem', paddingRight: '3rem' }}
                    />
                    <ShieldCheck size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      style={{
                        position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', padding: 0, color: 'var(--text-muted)',
                        cursor: 'pointer', width: 'auto', boxShadow: 'none',
                      }}
                    >
                      {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Error */}
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.30)',
                borderRadius: 12, padding: '0.75rem 1rem', marginTop: '0.5rem',
                color: '#fca5a5', fontSize: '0.88rem', marginBottom: '1rem',
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', marginTop: '1.5rem',
                padding: '0.9rem',
                background: 'linear-gradient(135deg,#6366f1,#a855f7)',
                fontSize: '1rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <span style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{
                    width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid #fff', borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite', display: 'inline-block',
                  }} />
                  Signing in...
                </span>
              ) : (
                <>Enter Library <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          {/* Footer note */}
          {isAdmin && (
            <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Default credentials: <code style={{ color: 'var(--primary-light)' }}>12345678</code> / <code style={{ color: 'var(--primary-light)' }}>sandhya</code>
            </p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>
    </div >
  );
};

export default Login;
