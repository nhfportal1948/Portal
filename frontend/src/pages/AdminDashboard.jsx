import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard, School, Users, Award, LogOut,
  ChevronRight, X, CheckCircle, XCircle, Clock,
  RefreshCw, Shield, Building2, ExternalLink,
} from 'lucide-react';

// ─── Shared API helper ────────────────────────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const apiFetch = async (path, options = {}) => {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed.');
  return data;
};

const fmtDate = (str) =>
  str ? new Date(str).toLocaleDateString('en-PK', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

// ─── Shared UI primitives ─────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    PENDING:        { cls: 'pending',  label: 'Pending' },
    PENDING_REVIEW: { cls: 'pending',  label: 'Pending Review' },
    APPROVED:       { cls: 'approved', label: 'Approved' },
    REJECTED:       { cls: 'rejected', label: 'Rejected' },
  };
  const { cls, label } = map[status] || { cls: '', label: status };
  return <span className={`status-badge ${cls}`}>{label}</span>;
}

function DetailRow({ label, value, mono = false, link = false }) {
  if (!value) return (
    <div className="adm-detail-row">
      <dt className="adm-detail-label">{label}</dt>
      <dd className="adm-detail-value"><span className="adm-none">—</span></dd>
    </div>
  );
  return (
    <div className="adm-detail-row">
      <dt className="adm-detail-label">{label}</dt>
      <dd className={`adm-detail-value${mono ? ' adm-mono' : ''}`}>
        {link
          ? <a href={value} target="_blank" rel="noopener noreferrer" className="adm-doc-link">View Document <ExternalLink size={11} /></a>
          : value}
      </dd>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────
const COLORS = {
  amber: { bg: '#fffbeb', border: '#fcd34d', val: '#b45309', ico: '#f59e0b' },
  green: { bg: '#f0fdf4', border: '#bbf7d0', val: '#16a34a', ico: '#22c55e' },
  red:   { bg: '#fef2f2', border: '#fecaca', val: '#dc2626', ico: '#ef4444' },
  navy:  { bg: '#eff6ff', border: '#bfdbfe', val: '#1d4ed8', ico: '#3b82f6' },
};
function StatCard({ label, value, color, icon }) {
  const c = COLORS[color];
  return (
    <div className="adm-stat-card" style={{ background: c.bg, borderColor: c.border }}>
      <span className="adm-stat-icon" style={{ color: c.ico }}>{icon}</span>
      <span className="adm-stat-value" style={{ color: c.val }}>{value}</span>
      <span className="adm-stat-label">{label}</span>
    </div>
  );
}

// ─── Approve / Reject action zone (shared between Schools and Students) ────────
function ActionZone({ entityId, entityType, status, onApproved, onRejected }) {
  const [rejecting,  setRejecting]  = useState(false);
  const [reason,     setReason]     = useState('');
  const [loading,    setLoading]    = useState(false);
  const [result,     setResult]     = useState(null);

  const approve = async () => {
    setLoading(true); setResult(null);
    try {
      const r = await apiFetch(`/admin/${entityType}/${entityId}/approve`, { method: 'PATCH' });
      setResult({ ok: true, msg: r.message, athleteId: r.data?.athleteId });
      onApproved(r.data);
    } catch (e) { setResult({ ok: false, msg: e.message }); }
    finally { setLoading(false); }
  };

  const reject = async () => {
    if (!reason.trim()) return;
    setLoading(true); setResult(null);
    try {
      const r = await apiFetch(`/admin/${entityType}/${entityId}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ reason }),
      });
      setResult({ ok: false, msg: r.message });
      onRejected(reason);
      setRejecting(false);
    } catch (e) { setResult({ ok: false, msg: e.message }); }
    finally { setLoading(false); }
  };

  if (status !== 'PENDING' && status !== 'PENDING_REVIEW') return null;

  return (
    <div className="adm-drawer__actions">
      {result && (
        <>
          <div className={`alert ${result.ok ? 'alert-success' : 'alert-error'}`}
            style={{ fontSize: '0.82rem', marginBottom: '0.75rem' }}>
            {result.msg}
          </div>
          {result.ok && result.athleteId && (
            <div className="adm-athlete-id-box">
              <Award size={18} />
              <div>
                <span className="adm-athlete-id-label">ATHLETE ID ISSUED</span>
                <span className="adm-athlete-id-value">{result.athleteId}</span>
              </div>
            </div>
          )}
        </>
      )}

      {!rejecting && !result?.ok && (
        <div className="adm-action-row">
          <button className="btn adm-btn-approve" onClick={approve} disabled={loading}
            id={`btn-approve-${entityId}`}>
            <CheckCircle size={16} />
            <span>{loading ? 'Approving…' : 'Approve'}</span>
          </button>
          <button className="btn adm-btn-reject" onClick={() => setRejecting(true)} disabled={loading}
            id={`btn-reject-${entityId}`}>
            <XCircle size={16} />
            <span>Reject</span>
          </button>
        </div>
      )}

      {rejecting && (
        <div className="adm-reject-form">
          <label className="adm-reject-label">
            Rejection Reason <span style={{ color: '#ef4444' }}>*</span>
          </label>
          <textarea className="adm-reject-textarea" value={reason}
            onChange={e => setReason(e.target.value)} autoFocus rows={3}
            placeholder="Provide a clear reason — shown to the applicant…" />
          <div className="adm-action-row" style={{ marginTop: '0.65rem' }}>
            <button className="btn adm-btn-reject" onClick={reject}
              disabled={loading || !reason.trim()} id={`btn-confirm-reject-${entityId}`}>
              <XCircle size={16} />
              <span>{loading ? 'Rejecting…' : 'Confirm Rejection'}</span>
            </button>
            <button className="btn btn-outline" onClick={() => { setRejecting(false); setReason(''); }}
              disabled={loading}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Dashboard overview ───────────────────────────────────────────────────────
function DashboardView() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [sr, ar] = await Promise.all([apiFetch('/admin/schools'), apiFetch('/admin/students')]);
        const sc = sr.data, at = ar.data;
        setStats({
          sPending:  sc.filter(x => x.status === 'PENDING').length,
          sApproved: sc.filter(x => x.status === 'APPROVED').length,
          sRejected: sc.filter(x => x.status === 'REJECTED').length,
          sTotal:    sc.length,
          aPending:  at.filter(x => x.status === 'PENDING_REVIEW').length,
          aApproved: at.filter(x => x.status === 'APPROVED').length,
          aRejected: at.filter(x => x.status === 'REJECTED').length,
          aTotal:    at.length,
        });
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  return (
    <div className="adm-view">
      <div className="adm-view-header">
        <h1 className="adm-view-title">Dashboard Overview</h1>
        <p className="adm-view-sub">Registry snapshot — all registrations to date</p>
      </div>
      {loading ? (
        <div className="adm-loading"><RefreshCw size={20} className="spin-icon" /> Loading stats…</div>
      ) : stats ? (
        <>
          <h3 className="adm-section-heading">Schools</h3>
          <div className="adm-stats-grid">
            <StatCard label="Pending Review" value={stats.sPending}  color="amber" icon={<Clock size={20}/>} />
            <StatCard label="Approved"       value={stats.sApproved} color="green" icon={<CheckCircle size={20}/>} />
            <StatCard label="Rejected"       value={stats.sRejected} color="red"   icon={<XCircle size={20}/>} />
            <StatCard label="Total"          value={stats.sTotal}    color="navy"  icon={<Building2 size={20}/>} />
          </div>
          <h3 className="adm-section-heading" style={{ marginTop: '2rem' }}>Athlete Registrations</h3>
          <div className="adm-stats-grid">
            <StatCard label="Pending Review" value={stats.aPending}  color="amber" icon={<Clock size={20}/>} />
            <StatCard label="Approved"       value={stats.aApproved} color="green" icon={<CheckCircle size={20}/>} />
            <StatCard label="Rejected"       value={stats.aRejected} color="red"   icon={<XCircle size={20}/>} />
            <StatCard label="Total Athletes" value={stats.aTotal}    color="navy"  icon={<Users size={20}/>} />
          </div>
        </>
      ) : (
        <div className="adm-empty">Could not load statistics.</div>
      )}
    </div>
  );
}

// ─── Schools management ───────────────────────────────────────────────────────
function SchoolsView() {
  const TABS = ['PENDING', 'APPROVED', 'REJECTED'];
  const [tab, setTab] = useState('PENDING');
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchErr, setFetchErr] = useState('');
  const [selected, setSelected] = useState(null);

  const fetchSchools = useCallback(async () => {
    setLoading(true); setFetchErr('');
    try { const d = await apiFetch(`/admin/schools?status=${tab}`); setSchools(d.data); }
    catch (e) { setFetchErr(e.message); }
    finally { setLoading(false); }
  }, [tab]);

  useEffect(() => { fetchSchools(); setSelected(null); }, [fetchSchools]);

  const handleApproved = (data) => setSelected(s => ({ ...s, status: 'APPROVED' }));
  const handleRejected = (reason) => setSelected(s => ({ ...s, status: 'REJECTED', rejectionReason: reason }));

  return (
    <div className="adm-view">
      <div className="adm-view-header">
        <h1 className="adm-view-title">School Registrations</h1>
        <p className="adm-view-sub">Review, approve or reject school applications</p>
      </div>

      <div className="adm-tabbar">
        {TABS.map(t => (
          <button key={t} className={`adm-tab${tab === t ? ' adm-tab--active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0) + t.slice(1).toLowerCase()}
          </button>
        ))}
        <button className="adm-tab-refresh" onClick={fetchSchools} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spin-icon' : ''} />
        </button>
      </div>

      <div className={`adm-content${selected ? ' adm-content--split' : ''}`}>
        <div className="adm-table-wrap">
          {fetchErr && <div className="alert alert-error" style={{ margin: '1rem' }}>{fetchErr}</div>}
          {loading ? (
            <div className="adm-loading"><RefreshCw size={20} className="spin-icon" /> Loading…</div>
          ) : schools.length === 0 ? (
            <div className="adm-empty"><Building2 size={40} /><p>No {tab.toLowerCase()} schools.</p></div>
          ) : (
            <table className="adm-table">
              <thead><tr>
                <th>School Name</th><th>District</th><th>Principal Name</th>
                <th>Submitted</th><th>Status</th><th></th>
              </tr></thead>
              <tbody>
                {schools.map(s => (
                  <tr key={s.id}
                    className={`adm-table__row${selected?.id === s.id ? ' adm-table__row--active' : ''}`}
                    onClick={() => setSelected(s)}>
                    <td className="adm-table__primary">{s.schoolName}</td>
                    <td>{s.district}</td>
                    <td>{s.principalName}</td>
                    <td className="adm-table__muted">{fmtDate(s.createdAt)}</td>
                    <td><StatusBadge status={s.status} /></td>
                    <td><ChevronRight size={16} className="adm-row-arrow" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {selected && (
          <aside className="adm-drawer">
            <div className="adm-drawer__head">
              <div>
                <p className="adm-drawer__head-label">School Detail</p>
                <h3 className="adm-drawer__head-name">{selected.schoolName}</h3>
              </div>
              <button className="adm-drawer__close" onClick={() => setSelected(null)}><X size={18} /></button>
            </div>
            <div className="adm-drawer__status-row">
              <StatusBadge status={selected.status} />
              <span className="adm-drawer__submitted">Submitted {fmtDate(selected.createdAt)}</span>
            </div>
            <div className="adm-drawer__body">
              <section className="adm-drawer__section">
                <h4 className="adm-drawer__section-title">School Information</h4>
                <dl className="adm-detail-list">
                  <DetailRow label="Ownership"      value={selected.ownershipType} />
                  <DetailRow label="EMIS Code"      value={selected.emisCode} mono />
                  <DetailRow label="Reg. Number"    value={selected.schoolRegistrationNumber} />
                  <DetailRow label="Education Board" value={selected.affiliatedEducationBoard} />
                  <DetailRow label="Province"       value={selected.province} />
                  <DetailRow label="District"       value={selected.district} />
                  <DetailRow label="Tehsil"         value={selected.tehsil} />
                  <DetailRow label="Address"        value={selected.completeAddress} />
                  <DetailRow label="Official Email" value={selected.officialEmail} />
                  <DetailRow label="Official Phone" value={selected.officialPhone} />
                </dl>
              </section>
              <section className="adm-drawer__section">
                <h4 className="adm-drawer__section-title">Principal</h4>
                <dl className="adm-detail-list">
                  <DetailRow label="Name"   value={selected.principalName} />
                  <DetailRow label="CNIC"   value={selected.principalCNIC} mono />
                  <DetailRow label="Mobile" value={selected.principalMobile} />
                </dl>
              </section>
              <section className="adm-drawer__section">
                <h4 className="adm-drawer__section-title">Record</h4>
                <dl className="adm-detail-list">
                  <DetailRow label="School ID"    value={selected.id} mono />
                  <DetailRow label="Last Updated" value={fmtDate(selected.updatedAt)} />
                </dl>
              </section>
              {selected.status === 'REJECTED' && selected.rejectionReason && (
                <div className="alert alert-error" style={{ fontSize: '0.82rem' }}>
                  <strong>Rejection Reason:</strong> {selected.rejectionReason}
                </div>
              )}
            </div>
            <ActionZone entityId={selected.id} entityType="schools" status={selected.status}
              onApproved={handleApproved} onRejected={handleRejected} />
          </aside>
        )}
      </div>
    </div>
  );
}

// ─── Digital ID Card Modal ────────────────────────────────────────────────────
function DigitalIDCardModal({ student, onClose }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px', maxWidth: '480px', width: '100%', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', position: 'relative'
      }}>
        <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)', padding: '1.5rem', color: '#fff', textAlign: 'center', position: 'relative' }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>×</button>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.15em', color: '#93c5fd', textTransform: 'uppercase' }}>Government of Pakistan</div>
          <h3 style={{ margin: '0.3rem 0 0', fontSize: '1.25rem', fontWeight: 900 }}>OFFICIAL U-15 ATHLETE CARD</h3>
        </div>

        <div style={{ padding: '1.75rem', textAlign: 'center' }}>
          <div style={{ width: '110px', height: '130px', margin: '-40px auto 1rem', borderRadius: '8px', overflow: 'hidden', border: '4px solid #fff', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)', background: '#f1f5f9' }}>
            <img src={student.photoUrl} alt={student.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '0.75rem', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>NATIONAL ATHLETE ID NUMBER</span>
            <span style={{ fontFamily: 'monospace', fontSize: '1.6rem', fontWeight: 900, color: '#1e3a8a' }}>{student.athleteId}</span>
          </div>

          <h2 style={{ fontSize: '1.4rem', color: '#0f172a', margin: '0 0 0.25rem', fontWeight: 800 }}>{student.fullName}</h2>
          <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600, marginBottom: '1.25rem' }}>{student.school?.schoolName}</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', textAlign: 'left', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
            <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>PRIMARY SPORT</span><strong style={{ color: '#0f172a', fontWeight: 800 }}>{student.primarySport}</strong></div>
            <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>POSITION</span><strong style={{ color: '#0f172a', fontWeight: 800 }}>{student.preferredPosition || '—'}</strong></div>
            <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>DATE OF BIRTH</span><strong style={{ color: '#0f172a', fontWeight: 800 }}>{fmtDate(student.dateOfBirth)}</strong></div>
            <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>BLOOD GROUP</span><strong style={{ color: '#ef4444', fontWeight: 800 }}>{student.bloodGroup}</strong></div>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #cbd5e1', paddingTop: '1rem', fontSize: '0.75rem', color: '#64748b' }}>
            <span>Issued: {fmtDate(student.athleteIdIssuedAt || new Date())}</span>
            <span style={{ background: '#dcfce7', color: '#166534', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '99px' }}>✓ VERIFIED BY GOVT</span>
          </div>
        </div>

        <div style={{ background: '#f8fafc', padding: '1rem', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
          <button onClick={() => window.print()} className="btn btn-primary" style={{ width: '100%', padding: '0.75rem', fontWeight: 800 }}>🖨️ Print Digital ID Card</button>
        </div>
      </div>
    </div>
  );
}

// ─── Student Verification Drawer ──────────────────────────────────────────────
function StudentVerificationDrawer({ student, onClose, onApproved, onRejected }) {
  const [bformVerified, setBformVerified] = useState(false);
  const [photoVerified, setPhotoVerified] = useState(false);
  const [consentVerified, setConsentVerified] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const isAppr = student.status === 'APPROVED';
    setBformVerified(isAppr);
    setPhotoVerified(isAppr || !student.photoUrl);
    setConsentVerified(isAppr || !student.consentFormDocUrl);
    setShowCardModal(false);
    setShowRejectForm(false);
    setRejectionReason('');
    setErrorMsg('');
  }, [student.id, student.status, student.photoUrl, student.consentFormDocUrl]);

  const allVerified = bformVerified && photoVerified && consentVerified;

  const handleApproveClick = async () => {
    if (!allVerified) return;
    setLoading(true); setErrorMsg('');
    try {
      const r = await apiFetch(`/admin/students/${student.id}/approve`, { method: 'PATCH' });
      onApproved(r.data);
    } catch (e) {
      setErrorMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) return;
    setLoading(true); setErrorMsg('');
    try {
      const r = await apiFetch(`/admin/students/${student.id}/reject`, {
        method: 'PATCH',
        body: JSON.stringify({ reason: rejectionReason }),
      });
      onRejected(rejectionReason);
      setShowRejectForm(false);
    } catch (e) {
      setErrorMsg(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside className="adm-drawer" style={{ width: '560px', maxWidth: '100%' }}>
      {showCardModal && <DigitalIDCardModal student={student} onClose={() => setShowCardModal(false)} />}

      <div className="adm-drawer__head">
        <div>
          <p className="adm-drawer__head-label">Student Verification Panel</p>
          <h3 className="adm-drawer__head-name">{student.fullName}</h3>
        </div>
        <button className="adm-drawer__close" onClick={onClose}><X size={18} /></button>
      </div>

      <div className="adm-drawer__status-row" style={{ justifyContent: 'space-between' }}>
        <StatusBadge status={student.status} />
        <span className="adm-drawer__submitted">Submitted {fmtDate(student.createdAt)}</span>
      </div>

      <div className="adm-drawer__body" style={{ paddingBottom: '2rem' }}>
        {errorMsg && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{errorMsg}</div>}

        {/* Post-Approval Confirmation Banner */}
        {student.status === 'APPROVED' && student.athleteId && (
          <div style={{ background: '#dcfce7', border: '2px solid #22c55e', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem', textAlign: 'center' }}>
            <div style={{ color: '#15803d', fontWeight: 800, fontSize: '0.95rem', marginBottom: '0.3rem' }}>
              ✓ STUDENT APPROVED & ATHLETE ID ISSUED
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '1.5rem', fontWeight: 900, color: '#166534', margin: '0.5rem 0' }}>
              {student.athleteId}
            </div>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setShowCardModal(true)}
              style={{ background: '#15803d', borderColor: '#15803d', padding: '0.6rem 1.2rem', fontWeight: 700, fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}
            >
              🪪 View Digital Athlete Card
            </button>
          </div>
        )}

        {/* Clean Two-Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.3rem', margin: '0 0 0.6rem 0' }}>
              👤 Personal & Academic
            </h4>
            <dl className="adm-detail-list" style={{ margin: 0 }}>
              <DetailRow label="Full Name" value={student.fullName} />
              <DetailRow label="Guardian" value={student.guardianName} />
              <DetailRow label="B-Form No." value={student.bFormNumber} mono />
              <DetailRow label="DOB / Gender" value={`${fmtDate(student.dateOfBirth)} (${student.gender})`} />
              <DetailRow label="Phone Number" value={student.phoneNumber} />
              <DetailRow label="School Name" value={student.school?.schoolName || 'Unaffiliated / Independent Athlete'} />
              {student.rollNumber && <DetailRow label="Roll Number" value={student.rollNumber} />}
            </dl>
          </div>

          <div style={{ background: '#f8fafc', padding: '0.85rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.6rem', borderBottom: '1px solid #cbd5e1', paddingBottom: '0.3rem', margin: '0 0 0.6rem 0' }}>
              🏅 Athletics & Location
            </h4>
            <dl className="adm-detail-list" style={{ margin: 0 }}>
              <DetailRow label="Primary Sport" value={student.primarySport} />
              <DetailRow label="Position" value={student.preferredPosition} />
              <DetailRow label="Secondary Sport" value={student.secondarySport || 'None'} />
              <DetailRow label="Dominant Side" value={student.dominantHandFoot || 'Not specified'} />
              <DetailRow label="Location" value={`${student.cityVillage ? student.cityVillage + ', ' : ''}${student.district}, ${student.province}`} />
              <DetailRow label="Full Address" value={student.completeAddress} />
            </dl>
          </div>
        </div>

        {/* 3 Preview Thumbnails & Checklist */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem', margin: '0 0 0.75rem 0' }}>
            🗂️ Documents Verification Checklist
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
            {/* B-Form */}
            <div style={{ border: '2px solid #cbd5e1', borderRadius: '8px', padding: '0.6rem', textAlign: 'center', background: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#475569', marginBottom: '0.4rem', textTransform: 'uppercase' }}>NADRA B-Form</div>
                <a href={student.bFormDocUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textDecoration: 'none' }}>
                  <div style={{ height: '70px', background: '#f1f5f9', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', fontWeight: 700, fontSize: '0.75rem', border: '1px dashed #94a3b8', marginBottom: '0.5rem' }}>
                    📄 View B-Form ↗
                  </div>
                </a>
              </div>
              {student.status === 'PENDING_REVIEW' ? (
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 700, color: bformVerified ? '#16a34a' : '#1e293b', cursor: 'pointer', background: bformVerified ? '#f0fdf4' : '#f8fafc', padding: '0.35rem', borderRadius: '4px', border: `1px solid ${bformVerified ? '#22c55e' : '#cbd5e1'}` }}>
                  <input type="checkbox" checked={bformVerified} onChange={e => setBformVerified(e.target.checked)} style={{ width: '15px', height: '15px' }} />
                  B-Form Verified
                </label>
              ) : (
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a' }}>✓ Verified</div>
              )}
            </div>

            {/* Photo */}
            <div style={{ border: '2px solid #cbd5e1', borderRadius: '8px', padding: '0.6rem', textAlign: 'center', background: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#475569', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Student Photo</div>
                {student.photoUrl ? (
                  <a href={student.photoUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textDecoration: 'none' }}>
                    <img src={student.photoUrl} alt="Athlete" style={{ width: '100%', height: '70px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #cbd5e1', marginBottom: '0.5rem' }} />
                  </a>
                ) : (
                  <div style={{ height: '70px', background: '#f8fafc', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.75rem', border: '1px dashed #cbd5e1', marginBottom: '0.5rem' }}>
                    Optional — Not Uploaded
                  </div>
                )}
              </div>
              {student.photoUrl ? (
                student.status === 'PENDING_REVIEW' ? (
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 700, color: photoVerified ? '#16a34a' : '#1e293b', cursor: 'pointer', background: photoVerified ? '#f0fdf4' : '#f8fafc', padding: '0.35rem', borderRadius: '4px', border: `1px solid ${photoVerified ? '#22c55e' : '#cbd5e1'}` }}>
                    <input type="checkbox" checked={photoVerified} onChange={e => setPhotoVerified(e.target.checked)} style={{ width: '15px', height: '15px' }} />
                    Photo Verified
                  </label>
                ) : (
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a' }}>✓ Verified</div>
                )
              ) : (
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Optional / N/A</div>
              )}
            </div>

            {/* Consent Form */}
            <div style={{ border: '2px solid #cbd5e1', borderRadius: '8px', padding: '0.6rem', textAlign: 'center', background: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#475569', marginBottom: '0.4rem', textTransform: 'uppercase' }}>Parent Consent</div>
                {student.consentFormDocUrl ? (
                  <a href={student.consentFormDocUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block', textDecoration: 'none' }}>
                    <div style={{ height: '70px', background: '#f1f5f9', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', fontWeight: 700, fontSize: '0.75rem', border: '1px dashed #94a3b8', marginBottom: '0.5rem' }}>
                      📄 View Consent ↗
                    </div>
                  </a>
                ) : (
                  <div style={{ height: '70px', background: '#f8fafc', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.75rem', border: '1px dashed #cbd5e1', marginBottom: '0.5rem' }}>
                    Optional — Not Uploaded
                  </div>
                )}
              </div>
              {student.consentFormDocUrl ? (
                student.status === 'PENDING_REVIEW' ? (
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', fontSize: '0.75rem', fontWeight: 700, color: consentVerified ? '#16a34a' : '#1e293b', cursor: 'pointer', background: consentVerified ? '#f0fdf4' : '#f8fafc', padding: '0.35rem', borderRadius: '4px', border: `1px solid ${consentVerified ? '#22c55e' : '#cbd5e1'}` }}>
                    <input type="checkbox" checked={consentVerified} onChange={e => setConsentVerified(e.target.checked)} style={{ width: '15px', height: '15px' }} />
                    Consent Verified
                  </label>
                ) : (
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#16a34a' }}>✓ Verified</div>
                )
              ) : (
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#64748b' }}>Optional / N/A</div>
              )}
            </div>
          </div>
        </div>

        {student.status === 'REJECTED' && student.rejectionReason && (
          <div className="alert alert-error" style={{ fontSize: '0.82rem', marginBottom: '1rem' }}>
            <strong>Rejection Reason:</strong> {student.rejectionReason}
          </div>
        )}
      </div>

      {/* Action Zone for PENDING_REVIEW */}
      {student.status === 'PENDING_REVIEW' && (
        <div style={{ background: '#f8fafc', borderTop: '2px solid #e2e8f0', padding: '1rem', marginTop: 'auto' }}>
          {!allVerified && (
            <div style={{ fontSize: '0.78rem', color: '#b45309', fontWeight: 700, marginBottom: '0.6rem' }}>
              🔒 Check and verify all 3 documents above to activate the Approve button.
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              type="button"
              disabled={!allVerified || loading}
              onClick={handleApproveClick}
              className="btn btn-primary"
              style={{
                flex: 1, padding: '0.75rem', fontWeight: 800, fontSize: '0.9rem',
                background: allVerified ? '#16a34a' : '#94a3b8',
                borderColor: allVerified ? '#16a34a' : '#94a3b8',
                cursor: allVerified ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
              }}
            >
              {loading ? 'Issuing ID...' : '✓ Approve & Generate Athlete ID'}
            </button>
            <button
              type="button"
              onClick={() => setShowRejectForm(!showRejectForm)}
              disabled={loading}
              className="btn btn-outline"
              style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#dc2626', borderColor: '#fca5a5' }}
            >
              Reject...
            </button>
          </div>

          {showRejectForm && (
            <div style={{ marginTop: '0.75rem', background: '#fef2f2', padding: '0.75rem', borderRadius: '6px', border: '1px solid #fecaca' }}>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#991b1b', marginBottom: '0.3rem' }}>
                Mandatory Rejection Reason:
              </label>
              <textarea
                rows="2"
                placeholder="Specify why the documents were rejected..."
                value={rejectionReason}
                onChange={e => setRejectionReason(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #f87171', borderRadius: '4px', marginBottom: '0.4rem', fontSize: '0.8rem' }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                <button type="button" onClick={() => setShowRejectForm(false)} className="btn btn-outline" style={{ padding: '0.3rem 0.7rem', fontSize: '0.75rem' }}>Cancel</button>
                <button type="button" onClick={handleRejectSubmit} disabled={!rejectionReason.trim() || loading} className="btn" style={{ background: '#dc2626', color: '#fff', padding: '0.3rem 0.8rem', fontSize: '0.75rem', fontWeight: 700 }}>Confirm Rejection</button>
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}

// ─── Students management ──────────────────────────────────────────────────────
function StudentsView() {
  const TABS = ['PENDING_REVIEW', 'APPROVED', 'REJECTED'];
  const tabLabel = (t) => t === 'PENDING_REVIEW' ? 'Pending Review' : t.charAt(0) + t.slice(1).toLowerCase();

  const [tab, setTab] = useState('PENDING_REVIEW');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchErr, setFetchErr] = useState('');
  const [selected, setSelected] = useState(null);

  const fetchStudents = useCallback(async () => {
    setLoading(true); setFetchErr('');
    try { const d = await apiFetch(`/admin/students?status=${tab}`); setStudents(d.data); }
    catch (e) { setFetchErr(e.message); }
    finally { setLoading(false); }
  }, [tab]);

  useEffect(() => { fetchStudents(); setSelected(null); }, [fetchStudents]);

  const handleApproved = (data) => setSelected(s => ({ ...s, status: 'APPROVED', athleteId: data.athleteId, athleteIdIssuedAt: data.athleteIdIssuedAt || new Date() }));
  const handleRejected = (reason) => setSelected(s => ({ ...s, status: 'REJECTED', rejectionReason: reason }));

  return (
    <div className="adm-view">
      <div className="adm-view-header">
        <h1 className="adm-view-title">Student Athlete Registrations</h1>
        <p className="adm-view-sub">Review applications, verify documents, and issue Athlete IDs</p>
      </div>

      <div className="adm-tabbar">
        {TABS.map(t => (
          <button key={t} className={`adm-tab${tab === t ? ' adm-tab--active' : ''}`} onClick={() => setTab(t)}>
            {tabLabel(t)}
          </button>
        ))}
        <button className="adm-tab-refresh" onClick={fetchStudents} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spin-icon' : ''} />
        </button>
      </div>

      <div className={`adm-content${selected ? ' adm-content--split' : ''}`}>
        <div className="adm-table-wrap">
          {fetchErr && <div className="alert alert-error" style={{ margin: '1rem' }}>{fetchErr}</div>}
          {loading ? (
            <div className="adm-loading"><RefreshCw size={20} className="spin-icon" /> Loading…</div>
          ) : students.length === 0 ? (
            <div className="adm-empty"><Users size={40} /><p>No {tabLabel(tab).toLowerCase()} students.</p></div>
          ) : (
            <table className="adm-table">
              <thead><tr>
                <th>Student Name</th><th>School</th><th>Submitted Date</th>
                {tab === 'APPROVED' && <th>Athlete ID</th>}
                <th>Status</th><th>Action</th>
              </tr></thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id}
                    className={`adm-table__row${selected?.id === s.id ? ' adm-table__row--active' : ''}`}
                    onClick={() => setSelected(s)}>
                    <td className="adm-table__primary" style={{ fontWeight: 700 }}>{s.fullName}</td>
                    <td>{s.school?.schoolName || '—'}</td>
                    <td className="adm-table__muted">{fmtDate(s.createdAt)}</td>
                    {tab === 'APPROVED' && (
                      <td><span className="adm-athlete-id-pill">{s.athleteId || '—'}</span></td>
                    )}
                    <td><StatusBadge status={s.status} /></td>
                    <td>
                      <button className="btn btn-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#fff' }}>
                        {tab === 'PENDING_REVIEW' ? 'Verify' : 'View'} <ChevronRight size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {selected && (
          <StudentVerificationDrawer
            student={selected}
            onClose={() => setSelected(null)}
            onApproved={handleApproved}
            onRejected={handleRejected}
          />
        )}
      </div>
    </div>
  );
}

// ─── Athlete IDs registry ─────────────────────────────────────────────────────
function AthleteIDsView() {
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchErr, setFetchErr] = useState('');
  const [selected, setSelected] = useState(null);

  const fetchAthletes = async () => {
    setLoading(true); setFetchErr('');
    try { const d = await apiFetch('/admin/students?status=APPROVED'); setAthletes(d.data); }
    catch (e) { setFetchErr(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAthletes(); }, []);

  return (
    <div className="adm-view">
      <div className="adm-view-header">
        <h1 className="adm-view-title">Athlete ID Registry</h1>
        <p className="adm-view-sub">All issued official Athlete IDs (PK-ATH-YYYY-XXXXX)</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.25rem' }}>
        <button className="adm-tab-refresh btn btn-outline" onClick={fetchAthletes} disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', padding: '0.4rem 0.85rem' }}>
          <RefreshCw size={14} className={loading ? 'spin-icon' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      <div className={`adm-content${selected ? ' adm-content--split' : ''}`}>
        <div className="adm-table-wrap">
          {fetchErr && <div className="alert alert-error" style={{ margin: '1rem' }}>{fetchErr}</div>}
          {loading ? (
            <div className="adm-loading"><RefreshCw size={20} className="spin-icon" /> Loading…</div>
          ) : athletes.length === 0 ? (
            <div className="adm-empty"><Award size={40} /><p>No Athlete IDs have been issued yet.</p></div>
          ) : (
            <table className="adm-table">
              <thead><tr>
                <th>Athlete ID</th><th>Full Name</th><th>School</th>
                <th>Primary Sport</th><th>Issued Date</th><th></th>
              </tr></thead>
              <tbody>
                {athletes.map(a => (
                  <tr key={a.id}
                    className={`adm-table__row${selected?.id === a.id ? ' adm-table__row--active' : ''}`}
                    onClick={() => setSelected(a)}>
                    <td>
                      <span className="adm-athlete-id-pill">{a.athleteId || '—'}</span>
                    </td>
                    <td className="adm-table__primary">{a.fullName}</td>
                    <td>{a.school?.schoolName || '—'}</td>
                    <td>{a.primarySport}</td>
                    <td className="adm-table__muted">{fmtDate(a.athleteIdIssuedAt)}</td>
                    <td><ChevronRight size={16} className="adm-row-arrow" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {selected && (
          <aside className="adm-drawer">
            <div className="adm-drawer__head">
              <div>
                <p className="adm-drawer__head-label">Athlete ID Card</p>
                <h3 className="adm-drawer__head-name">{selected.fullName}</h3>
              </div>
              <button className="adm-drawer__close" onClick={() => setSelected(null)}><X size={18} /></button>
            </div>
            <div className="adm-drawer__status-row">
              <StatusBadge status={selected.status} />
              <span className="adm-drawer__submitted">Issued {fmtDate(selected.athleteIdIssuedAt)}</span>
            </div>
            <div className="adm-drawer__body">
              <div className="adm-athlete-id-box" style={{ marginBottom: '1.25rem' }}>
                <Award size={20} />
                <div>
                  <span className="adm-athlete-id-label">OFFICIAL ATHLETE ID</span>
                  <span className="adm-athlete-id-value">{selected.athleteId}</span>
                </div>
              </div>
              <section className="adm-drawer__section">
                <h4 className="adm-drawer__section-title">Athlete Details</h4>
                <dl className="adm-detail-list">
                  <DetailRow label="Full Name"    value={selected.fullName} />
                  <DetailRow label="B-Form No."   value={selected.bFormNumber} mono />
                  <DetailRow label="School"       value={selected.school?.schoolName} />
                  <DetailRow label="Class"        value={`${selected.class} — ${selected.section}`} />
                  <DetailRow label="Primary Sport" value={selected.primarySport} />
                  <DetailRow label="Position"     value={selected.preferredPosition} />
                  <DetailRow label="Height"       value={selected.height ? `${selected.height} cm` : null} />
                  <DetailRow label="Weight"       value={selected.weight ? `${selected.weight} kg` : null} />
                  <DetailRow label="Blood Group"  value={selected.bloodGroup} />
                  <DetailRow label="Province"     value={selected.province} />
                  <DetailRow label="District"     value={selected.district} />
                </dl>
              </section>
              <section className="adm-drawer__section">
                <h4 className="adm-drawer__section-title">Documents</h4>
                <dl className="adm-detail-list">
                  <DetailRow label="Profile Photo" value={selected.photoUrl}          link />
                  <DetailRow label="B-Form Doc"    value={selected.bFormDocUrl}       link />
                  <DetailRow label="Consent Form"  value={selected.consentFormDocUrl} link />
                </dl>
              </section>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

// ─── Root AdminDashboard ──────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [view, setView] = useState('schools');
  const user = (() => { try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; } })();

  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/'; };

  const NAV = [
    { id: 'dashboard',  label: 'Dashboard',   Icon: LayoutDashboard },
    { id: 'schools',    label: 'Schools',      Icon: School },
    { id: 'students',   label: 'Students',     Icon: Users },
    { id: 'athleteids', label: 'Athlete IDs',  Icon: Award },
  ];

  return (
    <div className="adm-layout">
      <aside className="adm-sidebar">
        <div className="adm-sidebar__brand">
          <Shield size={22} className="adm-sidebar__brand-icon" />
          <div>
            <span className="adm-sidebar__brand-name">Admin Portal</span>
            <span className="adm-sidebar__brand-sub">U-15 Athlete Registry</span>
          </div>
        </div>

        <nav className="adm-sidebar__nav">
          {NAV.map(({ id, label, Icon }) => (
            <button key={id}
              className={`adm-nav-item${view === id ? ' adm-nav-item--active' : ''}`}
              onClick={() => setView(id)}>
              <Icon size={18} className="adm-nav-icon" />
              <span>{label}</span>
              {view === id && <span className="adm-nav-indicator" />}
            </button>
          ))}
        </nav>

        <div className="adm-sidebar__footer">
          <div className="adm-sidebar__user">
            <div className="adm-sidebar__avatar">{(user.email?.[0] || 'A').toUpperCase()}</div>
            <div className="adm-sidebar__user-text">
              <span className="adm-sidebar__user-email" title={user.email}>{user.email}</span>
              <span className="adm-sidebar__user-role">Government Admin</span>
            </div>
          </div>
          <button className="adm-sidebar__logout" onClick={logout} id="btn-admin-logout">
            <LogOut size={15} /><span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="adm-main">
        {view === 'dashboard'  && <DashboardView />}
        {view === 'schools'    && <SchoolsView />}
        {view === 'students'   && <StudentsView />}
        {view === 'athleteids' && <AthleteIDsView />}
      </main>
    </div>
  );
}
