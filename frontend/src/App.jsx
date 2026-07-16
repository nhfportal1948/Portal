import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';

import Navbar           from './components/Navbar';
import Footer           from './components/Footer';
import ProtectedRoute   from './components/ProtectedRoute';
import ScrollToTop      from './components/ScrollToTop';

import Home              from './pages/Home';
import RegisterPrincipal from './pages/RegisterPrincipal';
import RegisterStudent   from './pages/RegisterStudent';
import TrackStatus       from './pages/TrackStatus';
import Login             from './pages/Login';
import AdminDashboard    from './pages/AdminDashboard';
import PrincipalDashboard from './pages/PrincipalDashboard';
import StudentDashboard  from './pages/StudentDashboard';

/**
 * Public-facing layout — shared Navbar, Footer, and Login modal.
 * All portal pages (Home, Registration, Track) render inside this shell.
 */
function PublicLayout() {
  const [isSignInOpen, setIsSignInOpen] = useState(false);

  return (
    <div className="app-wrapper">
      <Navbar onSignInClick={() => setIsSignInOpen(true)} />

      <main className="main-content-area">
        <Routes>
          <Route path="/"                   element={<Home />} />
          <Route path="/register-principal" element={<RegisterPrincipal />} />
          <Route path="/register-student"   element={<RegisterStudent />} />
          <Route path="/track-status"       element={<TrackStatus onSignInClick={() => setIsSignInOpen(true)} />} />
        </Routes>
      </main>

      <Footer />

      <Login isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} />
    </div>
  );
}

/**
 * Root App — splits admin routes from the public layout so the
 * Admin Dashboard has its own full-viewport layout (no Navbar/Footer).
 */
function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
      {/* Admin dashboard — full-viewport, role-gated */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="GOVERNMENT_ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Principal dashboard — full-viewport, role-gated */}
      <Route
        path="/principal"
        element={
          <ProtectedRoute role="PRINCIPAL">
            <PrincipalDashboard />
          </ProtectedRoute>
        }
      />

      {/* Student dashboard — full-viewport, role-gated */}
      <Route
        path="/student"
        element={
          <ProtectedRoute role="STUDENT">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      {/* All public routes — wrapped in shared Navbar/Footer shell */}
      <Route path="/*" element={<PublicLayout />} />
    </Routes>
    </>
  );
}

export default App;
