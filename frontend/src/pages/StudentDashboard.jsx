import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield, Clock, CheckCircle2, AlertCircle, RefreshCw, LogOut,
  Edit2, FileText, Award, MapPin, Phone, Heart, Activity,
  Lock, AlertTriangle, ChevronRight, X, Save
} from 'lucide-react';
import DigitalIDCardModal from '../components/DigitalIDCardModal';

const API_BASE = 'http://localhost:5000';

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-PK', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showIDCard, setShowIDCard] = useState(false);

  // Edit non-critical fields modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/students/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 401 || res.status === 403) {
        localStorage.clear();
        navigate('/');
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 404 && data.error?.includes('complete the registration')) {
          // Redirect to student registration wizard if they haven't completed step 1-7
          navigate('/register-student');
          return;
        }
        throw new Error(data.error || 'Failed to load profile');
      }
      setStudent(data.data);
      setEditForm({
        emergencyContact: data.data.emergencyContact || '',
        allergies: data.data.allergies || '',
        existingInjuries: data.data.existingInjuries || '',
        completeAddress: data.data.completeAddress || '',
        postalCode: data.data.postalCode || '',
        cityVillage: data.data.cityVillage || '',
        // height: data.data.height || '',
        weight: data.data.weight || '',
        preferredPosition: data.data.preferredPosition || '',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try { setUser(JSON.parse(savedUser)); } catch (e) { /* ignore */ }
    }
    fetchProfile();
  }, [fetchProfile]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');
    setEditSuccess('');
    const token = localStorage.getItem('token');

    try {
      const res = await fetch(`${API_BASE}/students/me`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update details');
      
      setStudent(data.data);
      setEditSuccess('Non-critical profile details updated successfully.');
      setTimeout(() => {
        setShowEditModal(false);
        setEditSuccess('');
      }, 1500);
    } catch (err) {
      setEditError(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handleResubmitClick = () => {
    navigate('/register-student', { state: { resubmitData: student } });
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: 'var(--font-sans, system-ui, sans-serif)', display: 'flex', flexDirection: 'column' }}>
      {/* ── Top Nav Shell ──────────────────────────────────────────────── */}
      <header style={{ background: '#0f172a', color: '#fff', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', padding: '0.5rem', borderRadius: '10px', display: 'flex' }}>
            <Award size={22} color="#fff" />
          </div>
          <div>
            <span style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'block' }}>Student Athlete Portal</span>
            <span style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>U-15 Government Registry</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', fontWeight: 700, color: '#f1f5f9' }}>
              {student?.photoUrl ? <img src={student.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : (user?.email?.[0] || 'S').toUpperCase()}
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f8fafc' }}>{student?.fullName || user?.email || 'Student'}</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Role: STUDENT</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: '#1e293b', border: '1px solid #334155', color: '#f87171', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
          >
            <LogOut size={15} /> <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* ── Main Area ──────────────────────────────────────────────────── */}
      <main style={{ flex: 1, padding: '2.5rem', maxWidth: '1100px', width: '100%', margin: '0 auto' }}>
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '1rem', borderRadius: '12px', color: '#b91c1c', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 500 }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: '#64748b', gap: '1rem' }}>
            <RefreshCw size={36} className="spin-icon" color="#10b981" />
            <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>Loading Athlete Profile...</span>
          </div>
        ) : student ? (
          <div className="animate-fade-in">
            {/* ── STATE 1: PENDING REVIEW ──────────────────────────────────────── */}
            {student.status === 'PENDING_REVIEW' && (
              <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '20px', padding: '2.5rem', color: '#fff', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)', marginBottom: '2rem', border: '1px solid #334155', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.05 }}>
                  <Clock size={280} />
                </div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#f59e0b', color: '#000', padding: '0.4rem 1rem', borderRadius: '999px', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.5rem' }}>
                    <Clock size={16} /> Under Government Review
                  </div>
                  <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>Application In Progress</h1>
                  <p style={{ color: '#cbd5e1', fontSize: '1.05rem', margin: '0 0 2rem 0', maxWidth: '650px', lineHeight: 1.6 }}>
                    Your registration has been submitted and is currently being verified by the Government Administration and your school principal. You will be notified once your National Athlete ID is issued.
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Reference Number</span>
                      <strong style={{ fontSize: '1.2rem', color: '#f8fafc', fontFamily: 'monospace' }}>REF-{student.id.slice(0, 8).toUpperCase()}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Submitted Date</span>
                      <strong style={{ fontSize: '1.2rem', color: '#f8fafc' }}>{fmtDate(student.createdAt)}</strong>
                    </div>
                    <div>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, display: 'block' }}>Selected Institution</span>
                      <strong style={{ fontSize: '1.1rem', color: '#f8fafc', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{student.school?.schoolName || 'Government School'}</strong>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── STATE 2: REJECTED ────────────────────────────────────────────── */}
            {student.status === 'REJECTED' && (
              <div style={{ background: '#fef2f2', border: '2px solid #fecaca', borderRadius: '20px', padding: '2rem', color: '#991b1b', marginBottom: '2rem', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626', flexShrink: 0 }}>
                    <AlertTriangle size={28} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem 0', color: '#991b1b' }}>Application Returned for Correction</h2>
                    <p style={{ margin: '0 0 1rem 0', fontSize: '0.95rem', color: '#7f1d1d' }}>
                      Your registration was reviewed by Government Administration and returned with the following feedback:
                    </p>
                    <div style={{ background: '#fff', padding: '1.25rem', borderRadius: '10px', border: '1px solid #f87171', color: '#b91c1c', fontWeight: 700, fontSize: '1rem', marginBottom: '1.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                      &ldquo;{student.rejectionReason || 'Please verify your uploaded documents and correct any typos.'}&rdquo;
                    </div>
                    <button
                      onClick={handleResubmitClick}
                      style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '0.8rem 1.75rem', borderRadius: '10px', fontWeight: 800, fontSize: '0.95rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.3)', transition: 'all 0.2s' }}
                    >
                      <RefreshCw size={18} /> <span>Resubmit Application Now</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── STATE 3: APPROVED ────────────────────────────────────────────── */}
            {student.status === 'APPROVED' && (
              <div style={{ background: 'linear-gradient(135deg, #064e3b 0%, #022c22 100%)', borderRadius: '20px', padding: '2.5rem', color: '#fff', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.15)', marginBottom: '2rem', border: '1px solid #059669', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.08 }}>
                  <Award size={280} />
                </div>
                <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                  <div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#10b981', color: '#fff', padding: '0.4rem 1rem', borderRadius: '999px', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1rem', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.4)' }}>
                      <CheckCircle2 size={16} /> Verified National Athlete
                    </div>
                    <h1 style={{ fontSize: '2.2rem', fontWeight: 900, margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>{student.fullName}</h1>
                    <p style={{ color: '#a7f3d0', fontSize: '1.05rem', margin: 0 }}>
                      Official U-15 Athlete Registry &bull; <strong style={{ color: '#fff' }}>{student.primarySport}</strong> ({student.preferredPosition || 'Player'})
                    </p>
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.25rem 1.75rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.15)', textAlign: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#6ee7b7', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.1em', display: 'block' }}>National Athlete ID</span>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'monospace', color: '#fff', margin: '0.3rem 0 0.8rem 0', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                      {student.athleteId || 'PENDING'}
                    </div>
                    <button
                      onClick={() => setShowIDCard(true)}
                      style={{ background: '#10b981', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 800, fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', boxShadow: '0 4px 6px -1px rgba(16, 185, 129, 0.3)' }}
                    >
                      <Award size={16} /> <span>View Digital Athlete Card</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Read-Only Profile & Non-Critical Edit Section ────────────── */}
            <div style={{ background: '#fff', borderRadius: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Registered Athlete Profile</h2>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>Institutional registration record and physical metrics</p>
                </div>

                {student.status === 'APPROVED' && (
                  <button
                    onClick={() => setShowEditModal(true)}
                    style={{ background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe', padding: '0.6rem 1.25rem', borderRadius: '10px', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', transition: 'all 0.2s' }}
                  >
                    <Edit2 size={16} /> <span>Edit Non-Critical Info</span>
                  </button>
                )}
              </div>

              {/* Core Identity Lock Warning for Approved Students */}
              {student.status === 'APPROVED' && (
                <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '0.85rem 1.25rem', borderRadius: '10px', color: '#475569', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
                  <Lock size={18} color="#64748b" className="flex-shrink-0" />
                  <div>
                    <strong style={{ color: '#1e293b' }}>Core Identity Fields Locked Post-Approval:</strong> Name, NADRA B-Form, Date of Birth, Gender, School, and Roll Number are permanently verified. To update core identity data, please request your school Principal or Government Admin.
                  </div>
                </div>
              )}

              {/* Data Cards Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
                {/* Personal & Academic Card */}
                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3b82f6', fontWeight: 700, fontSize: '0.9rem', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
                    <FileText size={18} /> <span>Personal & Academic Details</span>
                    {student.status === 'APPROVED' && <Lock size={14} color="#94a3b8" style={{ marginLeft: 'auto' }} title="Locked post-approval" />}
                  </div>
                  <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: 0, fontSize: '0.88rem' }}>
                    <div><dt style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>Full Name</dt><dd style={{ margin: '0.2rem 0 0 0', fontWeight: 700, color: '#0f172a' }}>{student.fullName}</dd></div>
                    <div><dt style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>Father/Guardian</dt><dd style={{ margin: '0.2rem 0 0 0', fontWeight: 700, color: '#0f172a' }}>{student.guardianName}</dd></div>
                    <div><dt style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>B-Form Number</dt><dd style={{ margin: '0.2rem 0 0 0', fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>{student.bFormNumber}</dd></div>
                    <div><dt style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>Date of Birth</dt><dd style={{ margin: '0.2rem 0 0 0', fontWeight: 700, color: '#0f172a' }}>{fmtDate(student.dateOfBirth)}</dd></div>
                    <div><dt style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>Gender</dt><dd style={{ margin: '0.2rem 0 0 0', fontWeight: 700, color: '#0f172a' }}>{student.gender}</dd></div>
                    {/* <div><dt style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>Class & Section</dt><dd style={{ margin: '0.2rem 0 0 0', fontWeight: 700, color: '#0f172a' }}>Class {student.class} ({student.section})</dd></div> */}
                    <div style={{ gridColumn: 'span 2' }}><dt style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>School Name</dt><dd style={{ margin: '0.2rem 0 0 0', fontWeight: 700, color: '#0f172a' }}>{student.school?.schoolName || 'Government School'}</dd></div>
                  </dl>
                </div>

                {/* Athletics & Physical Profile Card */}
                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 700, fontSize: '0.9rem', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
                    <Activity size={18} /> <span>Athletics & Physical Metrics</span>
                  </div>
                  <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', margin: 0, fontSize: '0.88rem' }}>
                    <div><dt style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>Primary Sport</dt><dd style={{ margin: '0.2rem 0 0 0', fontWeight: 800, color: '#059669', fontSize: '1rem' }}>{student.primarySport}</dd></div>
                    <div><dt style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>Preferred Position</dt><dd style={{ margin: '0.2rem 0 0 0', fontWeight: 700, color: '#0f172a' }}>{student.preferredPosition || '—'}</dd></div>
                    {/* <div><dt style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>Height</dt><dd style={{ margin: '0.2rem 0 0 0', fontWeight: 700, color: '#0f172a' }}>{student.height} cm</dd></div> */}
                    {/* <div><dt style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>Weight</dt><dd style={{ margin: '0.2rem 0 0 0', fontWeight: 700, color: '#0f172a' }}>{student.weight} kg</dd></div> */}
                    <div><dt style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>Dominant Hand/Foot</dt><dd style={{ margin: '0.2rem 0 0 0', fontWeight: 700, color: '#0f172a' }}>{student.dominantHandFoot}</dd></div>
                    <div><dt style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>Blood Group</dt><dd style={{ margin: '0.2rem 0 0 0', fontWeight: 800, color: '#dc2626' }}>{student.bloodGroup}</dd></div>
                    {student.secondarySport && <div style={{ gridColumn: 'span 2' }}><dt style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>Secondary Sport</dt><dd style={{ margin: '0.2rem 0 0 0', fontWeight: 700, color: '#0f172a' }}>{student.secondarySport}</dd></div>}
                  </dl>
                </div>

                {/* Health & Address Card */}
                <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', fontWeight: 700, fontSize: '0.9rem', marginBottom: '1.25rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
                    <Heart size={18} /> <span>Health & Address Profile</span>
                    {student.status === 'APPROVED' && <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: '#3b82f6', fontWeight: 700 }}>Editable</span>}
                  </div>
                  <dl style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', margin: 0, fontSize: '0.88rem' }}>
                    <div><dt style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>Emergency Contact</dt><dd style={{ margin: '0.2rem 0 0 0', fontWeight: 700, color: '#0f172a' }}>{student.emergencyContact}</dd></div>
                    <div><dt style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>Allergies & Medical Notes</dt><dd style={{ margin: '0.2rem 0 0 0', fontWeight: 600, color: '#475569' }}>{student.allergies || 'None reported'}</dd></div>
                    <div><dt style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>Existing Injuries</dt><dd style={{ margin: '0.2rem 0 0 0', fontWeight: 600, color: '#475569' }}>{student.existingInjuries || 'None reported'}</dd></div>
                    <div><dt style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 600 }}>Complete Address</dt><dd style={{ margin: '0.2rem 0 0 0', fontWeight: 700, color: '#0f172a' }}>{student.completeAddress}, {student.cityVillage} ({student.district})</dd></div>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>

      {/* ── Digital ID Card Modal ────────────────────────────────────────── */}
      {showIDCard && student && (
        <DigitalIDCardModal student={student} onClose={() => setShowIDCard(false)} />
      )}

      {/* ── Edit Non-Critical Fields Modal ───────────────────────────────── */}
      {showEditModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '20px', maxWidth: '600px', width: '100%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '1.5rem', background: '#0f172a', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>Edit Non-Critical Profile Info</h3>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Update contact numbers, medical notes, and physical metrics</span>
              </div>
              <button onClick={() => setShowEditModal(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>

            <form onSubmit={handleEditSubmit} style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {editError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '0.75rem', borderRadius: '8px', color: '#b91c1c', fontSize: '0.85rem' }}>{editError}</div>
              )}
              {editSuccess && (
                <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '0.75rem', borderRadius: '8px', color: '#047857', fontSize: '0.85rem', fontWeight: 600 }}>{editSuccess}</div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>Emergency Contact *</label>
                  <input
                    type="text"
                    required
                    value={editForm.emergencyContact || ''}
                    onChange={e => setEditForm({ ...editForm, emergencyContact: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>Preferred Position</label>
                  <input
                    type="text"
                    value={editForm.preferredPosition || ''}
                    onChange={e => setEditForm({ ...editForm, preferredPosition: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>Height (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editForm.height || ''}
                    onChange={e => setEditForm({ ...editForm, height: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>Weight (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editForm.weight || ''}
                    onChange={e => setEditForm({ ...editForm, weight: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>Allergies / Medical Conditions</label>
                <input
                  type="text"
                  placeholder="e.g., Peanuts, Asthma, or None"
                  value={editForm.allergies || ''}
                  onChange={e => setEditForm({ ...editForm, allergies: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>Existing Injuries / Limitations</label>
                <input
                  type="text"
                  placeholder="e.g., Previous knee strain, or None"
                  value={editForm.existingInjuries || ''}
                  onChange={e => setEditForm({ ...editForm, existingInjuries: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>Complete Street Address</label>
                  <input
                    type="text"
                    value={editForm.completeAddress || ''}
                    onChange={e => setEditForm({ ...editForm, completeAddress: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>City / Village</label>
                  <input
                    type="text"
                    value={editForm.cityVillage || ''}
                    onChange={e => setEditForm({ ...editForm, cityVillage: e.target.value })}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
                <button type="button" onClick={() => setShowEditModal(false)} className="btn btn-outline" style={{ padding: '0.65rem 1.25rem' }}>Cancel</button>
                <button type="submit" disabled={editLoading} className="btn btn-primary" style={{ padding: '0.65rem 1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Save size={16} /> {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
