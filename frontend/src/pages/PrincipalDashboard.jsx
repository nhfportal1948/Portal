import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Building2, Users, LogOut, RefreshCw,
  Search, ShieldCheck, Award, ChevronRight, CheckCircle2,
  AlertCircle, Clock, MapPin, Phone, Mail, UserCheck, FileText
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-PK', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

function StatusBadge({ status }) {
  const map = {
    PENDING_REVIEW: { label: 'Under Review', cls: 'badge-pending', icon: Clock },
    APPROVED:       { label: 'Approved',     cls: 'badge-approved', icon: CheckCircle2 },
    REJECTED:       { label: 'Rejected',     cls: 'badge-rejected', icon: AlertCircle },
    PENDING:        { label: 'Pending Admin Review', cls: 'badge-pending', icon: Clock },
  };
  const { label, cls, icon: Icon } = map[status] || { label: status, cls: 'badge-pending', icon: Clock };
  return (
    <span className={`status-badge ${cls}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.3rem 0.7rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
      <Icon size={13} /> {label}
    </span>
  );
}

export default function PrincipalDashboard() {
  const navigate = useNavigate();
  const [view, setView] = useState('dashboard'); // 'dashboard' | 'myschool' | 'students'
  const [user, setUser] = useState(null);
  const [school, setSchool] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    try {
      // 1. Fetch School
      const schRes = await fetch(`${API_BASE}/principal/school`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (schRes.status === 401 || schRes.status === 403) {
        localStorage.clear();
        navigate('/');
        return;
      }
      const schData = await schRes.json();
      if (!schRes.ok) throw new Error(schData.error || 'Failed to load school data');
      setSchool(schData.data);

      // 2. Fetch Students
      const stdRes = await fetch(`${API_BASE}/principal/students`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const stdData = await stdRes.json();
      if (!stdRes.ok) throw new Error(stdData.error || 'Failed to load students data');
      setStudents(stdData.data || []);
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
    fetchData();
  }, [fetchData]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const approvedCount = students.filter(s => s.status === 'APPROVED').length;
  const pendingCount  = students.filter(s => s.status === 'PENDING_REVIEW').length;

  const filteredStudents = students.filter(s => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      s.fullName?.toLowerCase().includes(q) ||
      s.rollNumber?.toLowerCase().includes(q) ||
      s.class?.toLowerCase().includes(q) ||
      s.primarySport?.toLowerCase().includes(q)
    );
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: 'var(--font-sans, system-ui, sans-serif)' }}>
      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside style={{ width: '260px', background: '#0f172a', color: '#fff', display: 'flex', flexDirection: 'column', flexShrink: 0, boxShadow: '4px 0 24px rgba(0,0,0,0.1)' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid #1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', padding: '0.6rem', borderRadius: '12px', display: 'flex' }}>
              <Building2 size={24} color="#fff" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>School Portal</h2>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Principal View</span>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '1.5rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          <button
            onClick={() => { setView('dashboard'); setSelectedStudent(null); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', border: 'none',
              background: view === 'dashboard' ? '#1e293b' : 'transparent',
              color: view === 'dashboard' ? '#38bdf8' : '#cbd5e1',
              fontWeight: view === 'dashboard' ? 700 : 500, fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
            }}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard Home</span>
          </button>

          <button
            onClick={() => { setView('myschool'); setSelectedStudent(null); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', border: 'none',
              background: view === 'myschool' ? '#1e293b' : 'transparent',
              color: view === 'myschool' ? '#38bdf8' : '#cbd5e1',
              fontWeight: view === 'myschool' ? 700 : 500, fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
            }}
          >
            <Building2 size={18} />
            <span>My School Profile</span>
          </button>

          <button
            onClick={() => { setView('students'); setSelectedStudent(null); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: '8px', border: 'none',
              background: view === 'students' ? '#1e293b' : 'transparent',
              color: view === 'students' ? '#38bdf8' : '#cbd5e1',
              fontWeight: view === 'students' ? 700 : 500, fontSize: '0.9rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s'
            }}
          >
            <Users size={18} />
            <span style={{ flex: 1 }}>Student Athletes</span>
            <span style={{ background: '#3b82f6', color: '#fff', fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '999px', fontWeight: 700 }}>{students.length}</span>
          </button>
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid #1e293b', background: '#090e1a' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>
              {(user?.email?.[0] || 'P').toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email || 'Principal'}</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Role: PRINCIPAL</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.5rem', borderRadius: '6px', border: '1px solid #334155', background: 'transparent', color: '#f87171', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
          >
            <LogOut size={15} /> <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main Area ────────────────────────────────────────────────────── */}
      <main style={{ flex: 1, padding: '2.5rem', overflowY: 'auto' }}>
        {error && (
          <div style={{ background: '#fef2f2', border: '1px solid #fecaca', padding: '1rem', borderRadius: '12px', color: '#b91c1c', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 500 }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: '#64748b', gap: '1rem' }}>
            <RefreshCw size={36} className="spin-icon" color="#3b82f6" />
            <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>Loading Principal Portal...</span>
          </div>
        ) : (
          <>
            {/* ── View 1: Dashboard Home ────────────────────────────────────────── */}
            {view === 'dashboard' && school && (
              <div className="animate-fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                  <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Principal Dashboard</h1>
                    <p style={{ color: '#64748b', margin: '0.3rem 0 0 0', fontSize: '0.95rem' }}>Welcome back, Principal of <strong style={{ color: '#1e293b' }}>{school.schoolName}</strong></p>
                  </div>
                  <button onClick={fetchData} className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: '#fff' }}>
                    <RefreshCw size={16} /> <span>Refresh Data</span>
                  </button>
                </div>

                {/* Hero School Summary Card */}
                <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)', borderRadius: '20px', padding: '2rem', color: '#fff', boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.15)', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.07 }}>
                    <Building2 size={240} />
                  </div>
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                      <span style={{ background: 'rgba(255,255,255,0.15)', padding: '0.35rem 0.85rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                        {school.ownershipType || 'Government'} School
                      </span>
                      <StatusBadge status={school.status || 'APPROVED'} />
                    </div>
                    <h2 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>{school.schoolName}</h2>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#cbd5e1', fontSize: '0.95rem', margin: '0 0 1.5rem 0' }}>
                      <MapPin size={16} /> {school.district}, {school.tehsil} &bull; EMIS: <code style={{ background: 'rgba(0,0,0,0.3)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>{school.emisCode}</code>
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '1.25rem' }}>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Principal Name</span>
                        <strong style={{ fontSize: '1rem', color: '#f8fafc' }}>{school.principalName}</strong>
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Official Phone</span>
                        <strong style={{ fontSize: '1rem', color: '#f8fafc' }}>{school.officialPhone || '—'}</strong>
                      </div>
                      <div>
                        <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>Education Board</span>
                        <strong style={{ fontSize: '1rem', color: '#f8fafc' }}>{school.affiliatedEducationBoard || 'Standard Board'}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stat Tiles */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                  {/* Primary Stat Tile requested by user */}
                  <div style={{ background: '#fff', padding: '1.75rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '6px solid #3b82f6' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Students Registered</span>
                      <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem', lineHeight: 1 }}>{students.length}</div>
                      <span style={{ fontSize: '0.8rem', color: '#3b82f6', fontWeight: 600, display: 'block', marginTop: '0.5rem' }}>From This School</span>
                    </div>
                    <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                      <Users size={32} />
                    </div>
                  </div>

                  {/* Approved Athletes Stat Tile */}
                  <div style={{ background: '#fff', padding: '1.75rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '6px solid #10b981' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Approved Athletes</span>
                      <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem', lineHeight: 1 }}>{approvedCount}</div>
                      <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 600, display: 'block', marginTop: '0.5rem' }}>National IDs Issued</span>
                    </div>
                    <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
                      <Award size={32} />
                    </div>
                  </div>

                  {/* Pending Review Stat Tile */}
                  <div style={{ background: '#fff', padding: '1.75rem', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '6px solid #f59e0b' }}>
                    <div>
                      <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Review</span>
                      <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginTop: '0.25rem', lineHeight: 1 }}>{pendingCount}</div>
                      <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 600, display: 'block', marginTop: '0.5rem' }}>Awaiting Admin Check</span>
                    </div>
                    <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: '#fffbeb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                      <Clock size={32} />
                    </div>
                  </div>
                </div>

                {/* Recent Registrations Preview */}
                <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Recent Student Applications</h3>
                      <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>Latest athletes registered from your institution</p>
                    </div>
                    <button onClick={() => setView('students')} style={{ background: 'transparent', border: 'none', color: '#3b82f6', fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                      View All Students <ChevronRight size={16} />
                    </button>
                  </div>

                  {students.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#64748b' }}>
                      <Users size={40} style={{ margin: '0 auto 0.75rem auto', opacity: 0.5 }} />
                      <p style={{ fontWeight: 600, margin: 0 }}>No student registrations found yet.</p>
                      <span style={{ fontSize: '0.85rem' }}>Students register their own accounts via the Student Registration portal.</span>
                    </div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          <th style={{ padding: '0.75rem' }}>Student Name</th>
                          <th style={{ padding: '0.75rem' }}>Class & Roll No</th>
                          <th style={{ padding: '0.75rem' }}>Primary Sport</th>
                          <th style={{ padding: '0.75rem' }}>Submitted Date</th>
                          <th style={{ padding: '0.75rem' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {students.slice(0, 5).map(s => (
                          <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '0.85rem 0.75rem', fontWeight: 700, color: '#0f172a' }}>{s.fullName}</td>
                            <td style={{ padding: '0.85rem 0.75rem', color: '#475569' }}>Class {s.class} <span style={{ color: '#94a3b8' }}>({s.rollNumber})</span></td>
                            <td style={{ padding: '0.85rem 0.75rem', color: '#334155' }}>{s.primarySport}</td>
                            <td style={{ padding: '0.85rem 0.75rem', color: '#64748b', fontSize: '0.85rem' }}>{fmtDate(s.createdAt)}</td>
                            <td style={{ padding: '0.85rem 0.75rem' }}><StatusBadge status={s.status} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

            {/* ── View 2: My School Profile ─────────────────────────────────────── */}
            {view === 'myschool' && school && (
              <div className="animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div style={{ marginBottom: '2rem' }}>
                  <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>School Profile Record</h1>
                  <p style={{ color: '#64748b', margin: '0.3rem 0 0 0' }}>Official verified details submitted to Government Administration</p>
                </div>

                <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                  <div style={{ background: '#0f172a', padding: '1.5rem', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>{school.schoolName}</h2>
                      <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>EMIS: {school.emisCode} &bull; {school.district}</span>
                    </div>
                    <StatusBadge status={school.status} />
                  </div>

                  <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div>
                      <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#3b82f6', fontWeight: 700, letterSpacing: '0.05em', margin: '0 0 1rem 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Institutional Details</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', fontSize: '0.9rem' }}>
                        <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.8rem' }}>Ownership Type</span><strong style={{ color: '#0f172a' }}>{school.ownershipType}</strong></div>
                        <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.8rem' }}>Education Board</span><strong style={{ color: '#0f172a' }}>{school.affiliatedEducationBoard || 'Standard Board'}</strong></div>
                        <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.8rem' }}>Registration No.</span><strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>{school.schoolRegistrationNumber || 'N/A'}</strong></div>
                        <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.8rem' }}>Province / Region</span><strong style={{ color: '#0f172a' }}>{school.province}</strong></div>
                        <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.8rem' }}>District & Tehsil</span><strong style={{ color: '#0f172a' }}>{school.district}, {school.tehsil}</strong></div>
                        <div style={{ gridColumn: 'span 2' }}><span style={{ color: '#64748b', display: 'block', fontSize: '0.8rem' }}>Complete Address</span><strong style={{ color: '#0f172a' }}>{school.completeAddress}</strong></div>
                      </div>
                    </div>

                    <div>
                      <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: '#3b82f6', fontWeight: 700, letterSpacing: '0.05em', margin: '0 0 1rem 0', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem' }}>Principal & Official Contact</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', fontSize: '0.9rem' }}>
                        <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.8rem' }}>Principal Name</span><strong style={{ color: '#0f172a' }}>{school.principalName}</strong></div>
                        <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.8rem' }}>Principal CNIC</span><strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>{school.principalCNIC}</strong></div>
                        <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.8rem' }}>Principal Mobile</span><strong style={{ color: '#0f172a' }}>{school.principalMobile}</strong></div>
                        <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.8rem' }}>Official Phone</span><strong style={{ color: '#0f172a' }}>{school.officialPhone || '—'}</strong></div>
                        <div style={{ gridColumn: 'span 2' }}><span style={{ color: '#64748b', display: 'block', fontSize: '0.8rem' }}>Official Email</span><strong style={{ color: '#0f172a' }}>{school.officialEmail}</strong></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── View 3: Students Page ─────────────────────────────────────────── */}
            {view === 'students' && (
              <div className="animate-fade-in">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <div>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Student Athletes Registry</h1>
                    <p style={{ color: '#64748b', margin: '0.3rem 0 0 0' }}>Read-only monitoring of all students linked to your school</p>
                  </div>
                  <div style={{ position: 'relative', width: '300px' }}>
                    <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      placeholder="Search name, roll no, sport..."
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.4rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '0.9rem', outline: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                    />
                  </div>
                </div>

                {/* Read-only notification banner */}
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '1rem 1.25rem', borderRadius: '12px', color: '#1e3a8a', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.88rem' }}>
                  <ShieldCheck size={20} className="flex-shrink-0" color="#2563eb" />
                  <div>
                    <strong>Read-Only Monitoring Access:</strong> Principals view and track student registrations and Athlete IDs issued by Government Administration. Students create and submit their own registrations independently via the Student Registration wizard.
                  </div>
                </div>

                <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.02)', overflow: 'hidden' }}>
                  {filteredStudents.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#64748b' }}>
                      <Users size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.4 }} />
                      <p style={{ fontWeight: 700, fontSize: '1.1rem', margin: '0 0 0.5rem 0' }}>No matching students found</p>
                      <span style={{ fontSize: '0.9rem' }}>{searchTerm ? 'Try adjusting your search terms.' : 'When students select your school during registration, they will appear here.'}</span>
                    </div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                      <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          <th style={{ padding: '1rem' }}>Student Athlete</th>
                          <th style={{ padding: '1rem' }}>Class & Roll No</th>
                          <th style={{ padding: '1rem' }}>Sport & Position</th>
                          <th style={{ padding: '1rem' }}>Status</th>
                          <th style={{ padding: '1rem' }}>National Athlete ID</th>
                          <th style={{ padding: '1rem', textAlign: 'right' }}>Details</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.map(s => (
                          <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }} className="hover:bg-slate-50">
                            <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#e2e8f0', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#475569', flexShrink: 0 }}>
                                {s.photoUrl ? <img src={s.photoUrl} alt={s.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : s.fullName[0]}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, color: '#0f172a' }}>{s.fullName}</div>
                                <div style={{ fontSize: '0.78rem', color: '#64748b' }}>DOB: {fmtDate(s.dateOfBirth)}</div>
                              </div>
                            </td>
                            <td style={{ padding: '1rem', color: '#334155' }}>
                              <div style={{ fontWeight: 600 }}>{s.rollNumber ? `Roll #: ${s.rollNumber}` : 'Independent'}</div>
                              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>Phone: {s.phoneNumber || '—'}</div>
                            </td>
                            <td style={{ padding: '1rem', color: '#334155' }}>
                              <div style={{ fontWeight: 600, color: '#1e293b' }}>{s.primarySport}</div>
                              <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{s.preferredPosition}</div>
                            </td>
                            <td style={{ padding: '1rem' }}>
                              <StatusBadge status={s.status} />
                            </td>
                            <td style={{ padding: '1rem' }}>
                              {s.athleteId ? (
                                <span style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '0.3rem 0.75rem', borderRadius: '6px', fontWeight: 700, fontFamily: 'monospace', fontSize: '0.85rem', display: 'inline-block' }}>
                                  {s.athleteId}
                                </span>
                              ) : (
                                <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.85rem' }}>Not Issued Yet</span>
                              )}
                            </td>
                            <td style={{ padding: '1rem', textAlign: 'right' }}>
                              <button
                                onClick={() => setSelectedStudent(s)}
                                style={{ background: '#fff', border: '1px solid #cbd5e1', padding: '0.4rem 0.8rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, color: '#334155', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                              >
                                View <ChevronRight size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* ── Student Detail Drawer (Read-Only) ────────────────────────────── */}
      {selectedStudent && (
        <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, width: '450px', background: '#fff', boxShadow: '-10px 0 30px rgba(0,0,0,0.15)', zIndex: 100, display: 'flex', flexDirection: 'column', animation: 'slideInRight 0.2s ease-out' }}>
          <div style={{ padding: '1.25rem 1.5rem', background: '#0f172a', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700 }}>Student Profile Details</h3>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Read-Only Institutional Record</span>
            </div>
            <button onClick={() => setSelectedStudent(null)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}>&times;</button>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '1rem' }}>
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#e2e8f0', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.5rem', color: '#475569', flexShrink: 0 }}>
                {selectedStudent.photoUrl ? <img src={selectedStudent.photoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : selectedStudent.fullName[0]}
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.3rem 0', fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>{selectedStudent.fullName}</h4>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <StatusBadge status={selectedStudent.status} />
                  {selectedStudent.athleteId && <span style={{ background: '#ecfdf5', color: '#047857', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 700, fontFamily: 'monospace' }}>{selectedStudent.athleteId}</span>}
                </div>
              </div>
            </div>

            <div>
              <h5 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, margin: '0 0 0.75rem 0', letterSpacing: '0.05em' }}>Personal & Academic</h5>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', fontSize: '0.88rem', background: '#f8fafc', padding: '1rem', borderRadius: '10px' }}>
                <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Father/Guardian</span><strong>{selectedStudent.guardianName}</strong></div>
                <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>B-Form Number</span><strong style={{ fontFamily: 'monospace' }}>{selectedStudent.bFormNumber}</strong></div>
                <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Date of Birth</span><strong>{fmtDate(selectedStudent.dateOfBirth)}</strong></div>
                <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Gender</span><strong>{selectedStudent.gender}</strong></div>
                <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Phone Number</span><strong>{selectedStudent.phoneNumber}</strong></div>
                {selectedStudent.rollNumber && <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Roll Number</span><strong style={{ fontFamily: 'monospace' }}>{selectedStudent.rollNumber}</strong></div>}
              </div>
            </div>

            <div>
              <h5 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, margin: '0 0 0.75rem 0', letterSpacing: '0.05em' }}>Athletic & Location Profile</h5>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', fontSize: '0.88rem', background: '#f8fafc', padding: '1rem', borderRadius: '10px' }}>
                <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Primary Sport</span><strong style={{ color: '#2563eb' }}>{selectedStudent.primarySport}</strong></div>
                <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Position / Discipline</span><strong>{selectedStudent.preferredPosition}</strong></div>
                <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>District</span><strong>{selectedStudent.district}</strong></div>
                <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>Province</span><strong>{selectedStudent.province}</strong></div>
              </div>
            </div>

            <div>
              <h5 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, margin: '0 0 0.75rem 0', letterSpacing: '0.05em' }}>Complete Address</h5>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0.85rem', fontSize: '0.88rem', background: '#f8fafc', padding: '1rem', borderRadius: '10px' }}>
                <div><strong>{selectedStudent.completeAddress}{selectedStudent.cityVillage ? `, ${selectedStudent.cityVillage}` : ''}</strong></div>
              </div>
            </div>
          </div>

          <div style={{ padding: '1rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc', textAlign: 'right' }}>
            <button onClick={() => setSelectedStudent(null)} className="btn btn-primary" style={{ padding: '0.5rem 1.25rem' }}>Close Panel</button>
          </div>
        </div>
      )}
    </div>
  );
}
