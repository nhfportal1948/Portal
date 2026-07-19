import React, { useEffect, useState } from 'react';
import { ShieldAlert, Award, FileSearch, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TrackStatus({ onSignInClick }) {
  const [profile, setProfile] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const token = localStorage.getItem('token');

  const fetchStatus = async () => {
    if (!token) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch status details.');
      }

      setProfile(result.profile);
      setUser(result.user);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, [token]);

  // Status style helper
  const getStatusClass = (status) => {
    switch (status) {
      case 'APPROVED':
        return 'status-badge approved';
      case 'PENDING':
      case 'PENDING_REVIEW':
        return 'status-badge pending';
      case 'REJECTED':
        return 'status-badge rejected';
      default:
        return 'status-badge';
    }
  };

  if (!token) {
    return (
      <div className="status-page container animate-fade-in">
        <div className="status-tracker-card empty-state">
          <FileSearch size={48} className="tracker-icon" />
          <h2 className="tracker-title font-serif">Track Registration Status</h2>
          <p className="tracker-desc">
            To view the status of your school validation or athlete ID registration, please log in with your portal credentials.
          </p>
          <button onClick={onSignInClick} className="btn btn-accent btn-tracker">
            <span>Sign In to Track Profile</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="status-page container animate-fade-in">
      <div className="status-tracker-card">
        <div className="tracker-header">
          <h2 className="tracker-title font-serif">Registry Status Details</h2>
          <button onClick={fetchStatus} className="btn btn-outline btn-refresh" disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spin-icon' : ''} />
            <span>Refresh Status</span>
          </button>
        </div>

        {errorMsg && <div className="alert alert-error">{errorMsg}</div>}

        {loading && <div className="loading-state">Retrieving registration details from the government database...</div>}

        {!loading && user && (
          <div className="tracker-details">
            {user.role === 'GOVERNMENT_ADMIN' && (
              <div className="admin-status-view">
                <ShieldCheck size={36} className="admin-icon" />
                <h3>Government Administrator Profile</h3>
                <p><strong>System Email:</strong> {user.email}</p>
                <div className="alert alert-success">
                  You are logged in as a Government Admin. You can review pending schools and students via the administrator tools.
                </div>
              </div>
            )}

            {user.role === 'PRINCIPAL' && profile && (
              <div className="school-status-view">
                <div className="status-info-row">
                  <div>
                    <h3>{profile.schoolName}</h3>
                    <p className="school-emis">EMIS Code: {profile.emisCode}</p>
                  </div>
                  <span className={getStatusClass(profile.status)}>{profile.status}</span>
                </div>

                <div className="details-list">
                  <p><strong>Principal Name:</strong> {profile.principalName}</p>
                  <p><strong>Official Phone:</strong> {profile.officialPhone}</p>
                  <p><strong>Complete Address:</strong> {profile.completeAddress}</p>
                  <p><strong>School Unique ID:</strong> <code className="id-code">{profile.id}</code></p>
                </div>

                {profile.status === 'APPROVED' && (
                  <div className="alert alert-success">
                    Your school has been verified. Share the <strong>School Unique ID</strong> above with your U-15 students so they can self-register.
                  </div>
                )}

                {profile.status === 'PENDING' && (
                  <div className="alert alert-warning">
                    Your application is currently undergoing geographic credentials verification. Please check back later.
                  </div>
                )}

                {profile.status === 'REJECTED' && (
                  <div className="alert alert-error">
                    <strong>Rejection Reason:</strong> {profile.rejectionReason}
                  </div>
                )}
              </div>
            )}

            {user.role === 'STUDENT' && profile && (
              <div className="athlete-status-view">
                <div className="status-info-row">
                  <div>
                    <h3>{profile.fullName}</h3>
                    <p className="athlete-sport">Primary Sport: {profile.primarySport}</p>
                  </div>
                  <span className={getStatusClass(profile.status)}>{profile.status}</span>
                </div>

                {profile.status === 'APPROVED' && profile.athleteId && (
                  <div className="athlete-id-badge">
                    <Award size={36} className="badge-icon" />
                    <div className="badge-details">
                      <span className="badge-label">OFFICIAL ATHLETE ID</span>
                      <span className="badge-value">{profile.athleteId}</span>
                    </div>
                  </div>
                )}

                <div className="details-list">
                  <p><strong>B-Form / CNIC Number:</strong> {profile.bFormNumber}</p>
                  <p><strong>Class Roll Number:</strong> {profile.rollNumber} (Class {profile.class}, Sec {profile.section})</p>
                  <p><strong>School:</strong> {profile.school?.schoolName || 'Linked School'}</p>
                  <p><strong>Emergency Contact:</strong> {profile.emergencyContact}</p>
                </div>

                {profile.status === 'PENDING_REVIEW' && (
                  <div className="alert alert-warning">
                    Your profile and uploads (B-Form and Consent document) are queued for government review.
                  </div>
                )}

                {profile.status === 'REJECTED' && (
                  <div className="alert alert-error">
                    <strong>Rejection Reason:</strong> {profile.rejectionReason}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
