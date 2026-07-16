import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Key, LayoutDashboard } from 'lucide-react';

export default function Navbar({ onSignInClick }) {
  const location = useLocation();

  // Read logged-in user role from localStorage (reactive on route change)
  const [userRole, setUserRole] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}').role || null; }
    catch { return null; }
  });

  // Refresh role whenever the pathname changes (catches login/logout)
  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user') || '{}');
      setUserRole(u.role || null);
    } catch {
      setUserRole(null);
    }
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <img src="/assets/logo-emblem.jpg" alt="Government Crest" className="logo-img" />
          <div className="logo-text">
            <span className="logo-title">NATIONAL HOCKEY PORTAL</span>
            <span className="logo-subtitle">Ministry of Inter Provincial Coordination</span>
          </div>
        </Link>

        <div className="navbar-menu">
          <Link to="/"                   className={`nav-link ${isActive('/')                   ? 'active' : ''}`}>Home</Link>
          <a    href="#about"            className="nav-link">About</a>
          <Link to="/register-principal" className={`nav-link ${isActive('/register-principal') ? 'active' : ''}`}>Register School</Link>
          <Link to="/register-student"   className={`nav-link ${isActive('/register-student')   ? 'active' : ''}`}>Register Athlete</Link>
          <Link to="/track-status"       className={`nav-link ${isActive('/track-status')       ? 'active' : ''}`}>Track Status</Link>

          {/* Admin dashboard link — only visible to logged-in GOVERNMENT_ADMIN */}
          {userRole === 'GOVERNMENT_ADMIN' && (
            <Link
              to="/admin"
              className={`nav-link nav-link--admin ${isActive('/admin') ? 'active' : ''}`}
              id="nav-admin-panel"
            >
              <LayoutDashboard size={14} />
              <span>Admin Panel</span>
            </Link>
          )}
        </div>

        <div className="navbar-actions">
          <button onClick={onSignInClick} className="btn btn-primary btn-signin" id="btn-navbar-signin">
            <Key size={16} />
            <span>Sign In</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
