import React from 'react';

function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-PK', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

export default function DigitalIDCardModal({ student, onClose }) {
  if (!student) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px', maxWidth: '480px', width: '100%', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', position: 'relative'
      }}>
        <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)', padding: '1.5rem', color: '#fff', textAlign: 'center', position: 'relative' }}>
          {onClose && (
            <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(255,255,255,0.2)', border: 'none', color: '#fff', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold' }}>×</button>
          )}
          <div style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.15em', color: '#93c5fd', textTransform: 'uppercase' }}>Government of Pakistan</div>
          <h3 style={{ margin: '0.3rem 0 0', fontSize: '1.25rem', fontWeight: 900 }}>OFFICIAL U-15 ATHLETE CARD</h3>
        </div>

        <div style={{ padding: '1.75rem', textAlign: 'center' }}>
          <div style={{ width: '110px', height: '130px', margin: '-40px auto 1rem', borderRadius: '8px', overflow: 'hidden', border: '4px solid #fff', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.2)', background: '#f1f5f9' }}>
            {student.photoUrl ? (
              <img src={student.photoUrl} alt={student.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 800, color: '#64748b' }}>{student.fullName?.[0]}</div>
            )}
          </div>

          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', padding: '0.75rem', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>NATIONAL ATHLETE ID NUMBER</span>
            <span style={{ fontFamily: 'monospace', fontSize: '1.6rem', fontWeight: 900, color: '#1e3a8a' }}>{student.athleteId || 'PENDING'}</span>
          </div>

          <h2 style={{ fontSize: '1.4rem', color: '#0f172a', margin: '0 0 0.25rem', fontWeight: 800 }}>{student.fullName}</h2>
          <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 600, marginBottom: '1.25rem' }}>{student.school?.schoolName || 'Unaffiliated / Independent Athlete'}</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', textAlign: 'left', background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}>
            <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>PRIMARY SPORT</span><strong style={{ color: '#0f172a', fontWeight: 800 }}>{student.primarySport}</strong></div>
            <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>POSITION</span><strong style={{ color: '#0f172a', fontWeight: 800 }}>{student.preferredPosition || '—'}</strong></div>
            <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>DATE OF BIRTH</span><strong style={{ color: '#0f172a', fontWeight: 800 }}>{fmtDate(student.dateOfBirth)}</strong></div>
            <div><span style={{ color: '#64748b', display: 'block', fontSize: '0.75rem' }}>DISTRICT</span><strong style={{ color: '#1d4ed8', fontWeight: 800 }}>{student.district || '—'}</strong></div>
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
