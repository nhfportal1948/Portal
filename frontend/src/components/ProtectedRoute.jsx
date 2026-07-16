import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * ProtectedRoute — wraps a route so only authenticated users with the
 * specified role can access it. Unauthenticated or unauthorised users
 * are silently redirected to the homepage.
 *
 * Usage:
 *   <ProtectedRoute role="GOVERNMENT_ADMIN">
 *     <AdminDashboard />
 *   </ProtectedRoute>
 */
export default function ProtectedRoute({ children, role }) {
  const token   = localStorage.getItem('token');
  const userRaw = localStorage.getItem('user');

  // No token at all → redirect
  if (!token || !userRaw) {
    return <Navigate to="/" replace />;
  }

  try {
    const user = JSON.parse(userRaw);

    // Role mismatch → redirect
    if (role && user.role !== role) {
      return <Navigate to="/" replace />;
    }

    return children;
  } catch {
    // Malformed localStorage value → redirect
    return <Navigate to="/" replace />;
  }
}
