import React, { useState } from 'react';
import { ShieldCheck, Key, LogIn, X, LogOut, Shield, Clock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function Login({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [user, setUser]         = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken]     = useState(() => localStorage.getItem('token'));
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Detect the "pending verification" specific error
  const isPendingError = errorMsg.toLowerCase().includes('pending');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, email: identifier, phone: identifier, password }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Invalid credentials.');
      }

      // Save credentials to localStorage
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      setToken(result.token);
      setUser(result.user);

      // Close modal shortly after success and redirect to dashboard
      setTimeout(() => {
        onClose();
        if (result.user.role === 'GOVERNMENT_ADMIN') navigate('/admin');
        else if (result.user.role === 'PRINCIPAL') navigate('/principal');
        else if (result.user.role === 'STUDENT') navigate('/student');
      }, 600);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-fade-in">
        <button onClick={onClose} className="modal-close-btn" aria-label="Close modal">
          <X size={20} />
        </button>

        {/* ── Already logged in ─────────────────────────────────────────────── */}
        {user ? (
          <div className="logged-in-container">
            <ShieldCheck size={48} className="success-icon" />
            <h2 className="modal-title font-serif">Logged In Successfully</h2>
            <div className="user-details-card">
              <p><strong>Account:</strong> {user.email || user.phone}</p>
              <p><strong>Role:</strong> <span className="badge-role">{user.role}</span></p>
              {user.linkedSchoolId && (
                <p>
                  <strong>Linked School ID:</strong><br />
                  <code className="id-code">{user.linkedSchoolId}</code>
                </p>
              )}
              {user.linkedStudentId && (
                <p>
                  <strong>Linked Student ID:</strong><br />
                  <code className="id-code">{user.linkedStudentId}</code>
                </p>
              )}
            </div>

            <div className="modal-actions-stacked" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {user.role === 'GOVERNMENT_ADMIN' && (
                <button onClick={() => { onClose(); navigate('/admin'); }} className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', fontWeight: 700 }}>
                  Go to Admin Dashboard ↗
                </button>
              )}
              {user.role === 'PRINCIPAL' && (
                <button onClick={() => { onClose(); navigate('/principal'); }} className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', fontWeight: 700 }}>
                  Go to Principal Dashboard ↗
                </button>
              )}
              {user.role === 'STUDENT' && (
                <button onClick={() => { onClose(); navigate('/student'); }} className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', fontWeight: 700 }}>
                  Go to Student Dashboard ↗
                </button>
              )}
              <button onClick={handleLogout} className="btn btn-outline btn-logout" style={{ width: '100%' }}>
                <LogOut size={16} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

        ) : (
          /* ── Login form ─────────────────────────────────────────────────── */
          <div>
            <div className="modal-header">
              <Key className="modal-icon" size={32} />
              <h2 className="modal-title font-serif">Official Sign In</h2>
              <p className="modal-subtitle">Authorized access for Government Admins, Principals, and Athletes.</p>
            </div>

            {/* ── Pending verification notice (styled amber panel) ─────────── */}
            {isPendingError && (
              <div className="alert-pending">
                <div className="alert-pending__icon">
                  <Clock size={20} />
                </div>
                <div className="alert-pending__body">
                  <p className="alert-pending__title">Application Under Review</p>
                  <p className="alert-pending__message">
                    Your school registration is still <strong>pending government verification</strong>.
                    You will receive access once a regional administrator approves your application.
                  </p>
                  <Link
                    to="/track-status"
                    className="alert-pending__link"
                    onClick={onClose}
                  >
                    Track your application status →
                  </Link>
                </div>
              </div>
            )}

            {/* ── Generic error (non-pending) ──────────────────────────────── */}
            {errorMsg && !isPendingError && (
              <div className="alert alert-error">{errorMsg}</div>
            )}

            <form onSubmit={handleLogin} className="modal-form">
              <div className="form-group">
                <label htmlFor="modal-identifier">Email Address or Phone Number</label>
                <input
                  type="text"
                  id="modal-identifier"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  placeholder="e.g. athlete@gmail.com or 0300-1234567"
                  autoComplete="username"
                />
              </div>

              <div className="form-group">
                <label htmlFor="modal-password">Password</label>
                <input
                  type="password"
                  id="modal-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>

              <button type="submit" className="btn btn-accent btn-full" disabled={loading} id="btn-sign-in">
                <LogIn size={16} />
                <span>{loading ? 'Authenticating…' : 'Sign In'}</span>
              </button>
            </form>

            <div className="modal-footer-note">
              <Shield size={12} />
              <span>Federal Sports Registry Access Control System</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
