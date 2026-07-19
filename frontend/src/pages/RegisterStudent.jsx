import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  User, Mail, Lock, Shield, CheckCircle, AlertCircle, Upload, Check, Eye, EyeOff,
  MapPin, School, Award, FileText, ArrowLeft, Calendar, Search, Phone
} from 'lucide-react';
import { geoData, sportsOptions } from '../utils/geoData';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function CalendarDatePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const todayYear = new Date().getFullYear();
  const [viewYear, setViewYear] = useState(value ? parseInt(value.split('-')[0], 10) : 2012);
  const [viewMonth, setViewMonth] = useState(value ? parseInt(value.split('-')[1], 10) - 1 : 3);

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const years = [];
  for (let y = todayYear - 22; y <= todayYear - 4; y++) years.push(y);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const handleSelectDay = (day) => {
    const formatted = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(formatted);
    setOpen(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          padding: '0.75rem 1rem',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          background: '#fff',
          textAlign: 'left',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          fontWeight: 600,
          color: value ? '#0f172a' : '#64748b',
          fontSize: '0.95rem'
        }}
      >
        <span>{value || '📅 Select Date of Birth...'}</span>
        <Calendar size={18} color="#3b82f6" />
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          zIndex: 50,
          marginTop: '0.4rem',
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15)',
          padding: '1rem',
          width: '310px'
        }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <select
              value={viewMonth}
              onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
              style={{ flex: 1, padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 600 }}
            >
              {months.map((m, idx) => <option key={m} value={idx}>{m}</option>)}
            </select>
            <select
              value={viewYear}
              onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
              style={{ width: '95px', padding: '0.4rem', borderRadius: '6px', border: '1px solid #cbd5e1', fontWeight: 600 }}
            >
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '6px' }}>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d}>{d}</div>)}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
            {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isSelected = value === dateStr;
              return (
                <button
                  key={dayNum}
                  type="button"
                  onClick={() => handleSelectDay(dayNum)}
                  style={{
                    padding: '0.5rem 0',
                    border: 'none',
                    borderRadius: '6px',
                    background: isSelected ? '#2563eb' : '#f8fafc',
                    color: isSelected ? '#fff' : '#0f172a',
                    fontWeight: isSelected ? 800 : 600,
                    cursor: 'pointer',
                    fontSize: '0.85rem'
                  }}
                >
                  {dayNum}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setOpen(false)}
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.4rem', border: 'none', background: '#f1f5f9', borderRadius: '6px', color: '#64748b', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}

export default function RegisterStudent() {
  const navigate = useNavigate();
  const location = useLocation();
  const resubmitData = location.state?.resubmitData;
  const token = localStorage.getItem('token');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successData, setSuccessData] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  // Section 1: Account Credentials
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);

  // Section 2: Personal Information
  const [fullName, setFullName] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [bFormNumber, setBFormNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('Male');
  const [phoneNumber, setPhoneNumber] = useState('');

  // Section 3: Address Information
  const [province, setProvince] = useState('Punjab');
  const [district, setDistrict] = useState('Lahore');
  const [tehsil, setTehsil] = useState('Lahore City');
  const [cityVillage, setCityVillage] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [completeAddress, setCompleteAddress] = useState('');

  // Section 4: School Information (Searchable Autocomplete - Optional)
  const [approvedSchools, setApprovedSchools] = useState([]);
  const [schoolsLoading, setSchoolsLoading] = useState(false);
  const [schoolSearchTerm, setSchoolSearchTerm] = useState('');
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [rollNumber, setRollNumber] = useState('');

  // Section 5: Sports Information
  const [primarySport, setPrimarySport] = useState('Hockey');
  const [secondarySport, setSecondarySport] = useState('');
  const [preferredPosition, setPreferredPosition] = useState('');
  const [dominantHandFoot, setDominantHandFoot] = useState('Right');

  // Section 6: Required Documents
  const [bFormDocUrl, setBFormDocUrl] = useState('');
  const [bFormUploading, setBFormUploading] = useState(false);
  const [consentFormDocUrl, setConsentFormDocUrl] = useState('');
  const [consentUploading, setConsentUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);

  // Cascading dropdown logic
  const provinces = useMemo(() => Object.keys(geoData), []);
  const districts = useMemo(() => (province && geoData[province] ? Object.keys(geoData[province]) : []), [province]);
  const tehsils = useMemo(() => (province && district && geoData[province]?.[district] ? geoData[province][district] : []), [province, district]);

  useEffect(() => {
    if (districts.length > 0 && !districts.includes(district)) {
      setDistrict(districts[0]);
    }
  }, [province, districts, district]);

  useEffect(() => {
    if (tehsils.length > 0 && !tehsils.includes(tehsil)) {
      setTehsil(tehsils[0]);
    }
  }, [district, tehsils, tehsil]);

  // Prefill form if resubmitting rejected application
  useEffect(() => {
    if (resubmitData) {
      setFullName(resubmitData.fullName || '');
      setGuardianName(resubmitData.guardianName || '');
      setBFormNumber(resubmitData.bFormNumber || '');
      if (resubmitData.dateOfBirth) setDateOfBirth(resubmitData.dateOfBirth.split('T')[0]);
      setGender(resubmitData.gender || 'Male');
      setPhoneNumber(resubmitData.phoneNumber || '');
      setProvince(resubmitData.province || 'Punjab');
      setDistrict(resubmitData.district || 'Lahore');
      setTehsil(resubmitData.tehsil || 'Lahore City');
      setCityVillage(resubmitData.cityVillage || '');
      setPostalCode(resubmitData.postalCode || '');
      setCompleteAddress(resubmitData.completeAddress || '');
      setSelectedSchool(resubmitData.school || null);
      setRollNumber(resubmitData.rollNumber || '');
      setPrimarySport(resubmitData.primarySport || 'Hockey');
      setSecondarySport(resubmitData.secondarySport || '');
      setPreferredPosition(resubmitData.preferredPosition || '');
      setDominantHandFoot(resubmitData.dominantHandFoot || 'Right');
      setBFormDocUrl(resubmitData.bFormDocUrl || '');
      setConsentFormDocUrl(resubmitData.consentFormDocUrl || '');
      setPhotoUrl(resubmitData.photoUrl || '');
    }
  }, [resubmitData]);

  useEffect(() => {
    fetchApprovedSchools();
  }, []);

  const fetchApprovedSchools = async () => {
    setSchoolsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/schools`);
      if (res.ok) {
        const data = await res.json();
        setApprovedSchools(data.schools || []);
      }
    } catch (err) {
      console.error('Failed to fetch approved schools:', err);
    } finally {
      setSchoolsLoading(false);
    }
  };

  // Filtered schools for autocomplete
  const filteredSchools = useMemo(() => {
    if (!schoolSearchTerm.trim()) return [];
    return approvedSchools.filter(s =>
      s.schoolName.toLowerCase().includes(schoolSearchTerm.toLowerCase()) ||
      (s.emisCode && s.emisCode.includes(schoolSearchTerm))
    ).slice(0, 5);
  }, [approvedSchools, schoolSearchTerm]);

  // Format B-Form automatically
  const handleBFormChange = (e) => {
    const raw = e.target.value.replace(/\D/g, '');
    let formatted = raw;
    if (raw.length > 5 && raw.length <= 12) {
      formatted = `${raw.slice(0, 5)}-${raw.slice(5)}`;
    } else if (raw.length > 12) {
      formatted = `${raw.slice(0, 5)}-${raw.slice(5, 12)}-${raw.slice(12, 13)}`;
    }
    setBFormNumber(formatted);
  };

  // Cloudinary upload handler
  const handleFileUpload = async (file, setUrl, setUploadingFlag) => {
    if (!file) return;
    setUploadingFlag(true);
    setErrorMsg('');
    try {
      const sigRes = await fetch(`${BASE_URL}/upload/signature`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: 'u15_athletes' }),
      });
      if (!sigRes.ok) throw new Error('Failed to get upload signature from server.');
      const sigData = await sigRes.json();

      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', sigData.apiKey);
      formData.append('timestamp', sigData.timestamp);
      formData.append('signature', sigData.signature);
      if (sigData.folder) formData.append('folder', sigData.folder);

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${sigData.cloudName}/auto/upload`, {
        method: 'POST',
        body: formData,
      });
      if (!uploadRes.ok) throw new Error('Cloudinary file upload failed.');
      const uploadData = await uploadRes.json();
      setUrl(uploadData.secure_url);
    } catch (err) {
      console.error('Upload Error:', err);
      setErrorMsg(err.message || 'File upload failed. Please try again.');
    } finally {
      setUploadingFlag(false);
    }
  };

  // Password strength calculation
  const getPasswordStrength = () => {
    if (!password) return { label: '', color: '', pct: 0 };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    if (score <= 1) return { label: 'Weak', color: '#ef4444', pct: 25 };
    if (score === 2) return { label: 'Fair', color: '#f59e0b', pct: 50 };
    if (score === 3) return { label: 'Good', color: '#3b82f6', pct: 75 };
    return { label: 'Strong', color: '#10b981', pct: 100 };
  };
  const strength = getPasswordStrength();

  const FieldError = ({ name }) => (
    fieldErrors[name] ? (
      <span className="field-error-msg animate-fade-in">{fieldErrors[name]}</span>
    ) : null
  );

  const fieldClass = (name) => (
    fieldErrors[name] ? 'form-group has-error' : 'form-group'
  );

  const validateForm = () => {
    const errs = {};

    if (!resubmitData) {
      if (!identifier.trim()) {
        errs.identifier = 'Mobile number or email address is required.';
      } else if (identifier.includes('@')) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(identifier)) errs.identifier = 'Invalid email address format.';
      } else if (identifier.replace(/\D/g, '').length < 10) {
        errs.identifier = 'Please enter a valid mobile number.';
      }
      if (!password) errs.password = 'Password is required.';
      else if (password.length < 8) errs.password = 'Password must be at least 8 characters long.';
      if (confirmPassword !== password) errs.confirmPassword = 'Passwords do not match.';
    }

    if (!fullName.trim()) errs.fullName = 'Full Name is required.';
    if (!guardianName.trim()) errs.guardianName = 'Guardian Name is required.';
    const bFormRegex = /^\d{5}-\d{7}-\d{1}$/;
    if (!bFormNumber) errs.bFormNumber = 'NADRA B-Form / CNIC number is required.';
    else if (!bFormRegex.test(bFormNumber)) errs.bFormNumber = 'Format must be XXXXX-XXXXXXX-X.';
    if (!dateOfBirth) errs.dateOfBirth = 'Date of Birth is required.';
    if (!phoneNumber.trim()) errs.phoneNumber = 'Contact phone number is required.';
    if (!province) errs.province = 'Province is required.';
    if (!district) errs.district = 'District is required.';
    if (!tehsil) errs.tehsil = 'Tehsil is required.';
    if (!completeAddress.trim()) errs.completeAddress = 'Complete Address is required.';
    if (!primarySport) errs.primarySport = 'Primary Sport is required.';
    if (!bFormDocUrl) errs.bFormDocUrl = 'NADRA B-Form document upload is required.';

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!validateForm()) {
      setErrorMsg('Please fix the errors marked below before submitting.');
      return;
    }

    setLoading(true);
    try {
      const isEmail = identifier.includes('@');
      const payload = {
        email: isEmail ? identifier.trim() : undefined,
        phone: !isEmail ? identifier.trim() : undefined,
        password: !resubmitData ? password : undefined,
        fullName,
        guardianName,
        bFormNumber,
        dateOfBirth,
        gender,
        phoneNumber,
        photoUrl: photoUrl || undefined,
        province,
        district,
        tehsil,
        cityVillage: cityVillage || undefined,
        postalCode: postalCode || undefined,
        completeAddress,
        schoolId: selectedSchool?.id || undefined,
        rollNumber: selectedSchool ? (rollNumber || undefined) : undefined,
        primarySport,
        secondarySport: secondarySport || undefined,
        preferredPosition: preferredPosition || undefined,
        dominantHandFoot: dominantHandFoot || undefined,
        bFormDocUrl,
        consentFormDocUrl: consentFormDocUrl || undefined,
      };

      const endpoint = resubmitData ? `${BASE_URL}/students/me/resubmit` : `${BASE_URL}/auth/register-student`;
      const method = resubmitData ? 'PUT' : 'POST';
      const headers = { 'Content-Type': 'application/json' };
      if (resubmitData && token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(endpoint, {
        method,
        headers,
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit athlete registration.');
      }
      setSuccessData(data);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <div className="registration-page container animate-fade-in">
        <div className="form-container-card" style={{ textAlign: 'center', padding: '3.5rem 2rem' }}>
          <div style={{
            width: '74px', height: '74px', background: 'var(--success-soft, #dcfce7)', color: 'var(--success-primary, #16a34a)',
            borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem'
          }}>
            <CheckCircle size={40} />
          </div>
          <h2 className="form-title font-serif" style={{ marginBottom: '0.75rem' }}>
            {resubmitData ? 'Application Resubmitted!' : 'Registration Submitted Successfully!'}
          </h2>
          <p className="form-subtitle" style={{ maxWidth: '580px', margin: '0 auto 2rem auto' }}>
            Your National Athlete U-15 registration has been successfully recorded. Your profile is now pending administrative verification.
          </p>
          <div className="form-actions" style={{ justifyContent: 'center', borderTop: 'none', paddingTop: 0 }}>
            <Link to="/login" className="btn btn-primary">Go to Sign In</Link>
            <Link to="/" className="btn btn-outline" style={{ marginLeft: '0.75rem' }}>Return to Homepage</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="registration-page container animate-fade-in">
      <div className="form-container-card">

        {/* Header */}
        <div className="form-header">
          <Link to="/" className="back-link">
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Link>
          <Award className="form-icon" size={32} />
          <h2 className="form-title font-serif">National Athlete (U-15) Registration</h2>
          <p className="form-subtitle">
            Complete the single-page application form below. Ensure your NADRA B-Form and sports discipline details are accurate.
          </p>
        </div>

        {errorMsg && <div className="alert alert-error">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="registration-form" noValidate>

          {/* Section 1: Portal Account Credentials (Only when creating new account) */}
          {!resubmitData && (
            <>
              <h3 className="form-section-title">Section 1 — Portal Account Credentials</h3>
              <div className="form-grid">
                <div className={`${fieldClass('identifier')} full-width`}>
                  <label htmlFor="reg-identifier">Mobile number or email address *</label>
                  <input
                    type="text"
                    id="reg-identifier"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Mobile number or email address"
                  />
                  <FieldError name="identifier" />
                </div>

                <div className={fieldClass('password')}>
                  <label htmlFor="reg-pw">Password (Min. 8 chars) *</label>
                  <div className="input-with-icon">
                    <input
                      type={showPass ? 'text' : 'password'}
                      id="reg-pw"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                    />
                    <button
                      type="button"
                      className="input-icon-btn"
                      onClick={() => setShowPass(!showPass)}
                      tabIndex={-1}
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {password && (
                    <div className="pw-strength-bar">
                      <div className="pw-strength-track">
                        <div className="pw-strength-fill" style={{ width: `${strength.pct}%`, backgroundColor: strength.color }} />
                      </div>
                      <span className="pw-strength-label" style={{ color: strength.color }}>{strength.label}</span>
                    </div>
                  )}
                  <FieldError name="password" />
                </div>

                <div className={fieldClass('confirmPassword')}>
                  <label htmlFor="reg-cpw">Confirm Password *</label>
                  <div className="input-with-icon">
                    <input
                      type={showConf ? 'text' : 'password'}
                      id="reg-cpw"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                    />
                    <button
                      type="button"
                      className="input-icon-btn"
                      onClick={() => setShowConf(!showConf)}
                      tabIndex={-1}
                    >
                      {showConf ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <FieldError name="confirmPassword" />
                </div>
              </div>
            </>
          )}

          {/* Section 2: Personal Information */}
          <h3 className="form-section-title">Section 2 — Athlete Personal Information</h3>
          <div className="form-grid">
            <div className={fieldClass('fullName')}>
              <label>Athlete Full Name *</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="As per B-Form"
              />
              <FieldError name="fullName" />
            </div>

            <div className={fieldClass('guardianName')}>
              <label>Father / Guardian Name *</label>
              <input
                type="text"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                placeholder="Guardian Full Name"
              />
              <FieldError name="guardianName" />
            </div>

            <div className={fieldClass('bFormNumber')}>
              <label>NADRA B-Form Number *</label>
              <input
                type="text"
                value={bFormNumber}
                onChange={handleBFormChange}
                placeholder="XXXXX-XXXXXXX-X"
                maxLength={15}
              />
              <FieldError name="bFormNumber" />
            </div>

            <div className={fieldClass('dateOfBirth')}>
              <label>Date of Birth *</label>
              <CalendarDatePicker value={dateOfBirth} onChange={setDateOfBirth} />
              <FieldError name="dateOfBirth" />
            </div>

            <div className="form-group">
              <label>Gender *</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className={fieldClass('phoneNumber')}>
              <label>Contact Phone Number *</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. 0300-1234567"
              />
              <FieldError name="phoneNumber" />
            </div>
          </div>

          {/* Section 3: Address Information */}
          <h3 className="form-section-title">Section 3 — Address Information</h3>
          <div className="form-grid">
            <div className={fieldClass('province')}>
              <label>Province *</label>
              <select value={province} onChange={(e) => setProvince(e.target.value)}>
                {provinces.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <FieldError name="province" />
            </div>

            <div className={fieldClass('district')}>
              <label>District *</label>
              <select value={district} onChange={(e) => setDistrict(e.target.value)}>
                {districts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <FieldError name="district" />
            </div>

            <div className={fieldClass('tehsil')}>
              <label>Tehsil *</label>
              <select value={tehsil} onChange={(e) => setTehsil(e.target.value)}>
                {tehsils.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <FieldError name="tehsil" />
            </div>

            <div className="form-group">
              <label>City / Village (Optional)</label>
              <input
                type="text"
                value={cityVillage}
                onChange={(e) => setCityVillage(e.target.value)}
                placeholder="Town / Village"
              />
            </div>

            <div className={`${fieldClass('completeAddress')} full-width`}>
              <label>Complete Street Address *</label>
              <input
                type="text"
                value={completeAddress}
                onChange={(e) => setCompleteAddress(e.target.value)}
                placeholder="House #, Street, Colony / Area..."
              />
              <FieldError name="completeAddress" />
            </div>
          </div>

          {/* Section 4: School Information */}
          <h3 className="form-section-title">Section 4 — School & Academic Affiliation (Optional)</h3>
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Search & Select Approved School (Optional)</label>
              {selectedSchool ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px' }}>
                  <div>
                    <strong style={{ color: '#1e40af' }}>{selectedSchool.schoolName}</strong>
                    <div style={{ fontSize: '0.8rem', color: '#3b82f6' }}>EMIS: {selectedSchool.emisCode || 'N/A'}</div>
                  </div>
                  <button type="button" onClick={() => setSelectedSchool(null)} className="btn btn-outline" style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}>
                    Remove
                  </button>
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={schoolSearchTerm}
                    onChange={(e) => setSchoolSearchTerm(e.target.value)}
                    placeholder="Search approved school by name or EMIS code..."
                  />
                  {filteredSchools.length > 0 && (
                    <div style={{
                      position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 30,
                      background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', marginTop: '4px'
                    }}>
                      {filteredSchools.map(school => (
                        <div
                          key={school.id}
                          onClick={() => { setSelectedSchool(school); setSchoolSearchTerm(''); }}
                          style={{ padding: '0.75rem', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}
                        >
                          <div style={{ fontWeight: 600 }}>{school.schoolName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>EMIS: {school.emisCode} • {school.district}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {selectedSchool && (
              <div className="form-group">
                <label>Roll Number / Admission ID (Optional)</label>
                <input
                  type="text"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  placeholder="School roll # or admission ID"
                />
              </div>
            )}
          </div>

          {/* Section 5: Sports & Discipline */}
          <h3 className="form-section-title">Section 5 — Sports Discipline</h3>
          <div className="form-grid">
            <div className={fieldClass('primarySport')}>
              <label>Primary Sport / Discipline *</label>
              <select value={primarySport} onChange={(e) => setPrimarySport(e.target.value)}>
                {sportsOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <FieldError name="primarySport" />
            </div>

            <div className="form-group">
              <label>Secondary Sport (Optional)</label>
              <select value={secondarySport} onChange={(e) => setSecondarySport(e.target.value)}>
                <option value="">— None —</option>
                {sportsOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Preferred Playing Position / Discipline (Optional)</label>
              <input
                type="text"
                value={preferredPosition}
                onChange={(e) => setPreferredPosition(e.target.value)}
                placeholder="e.g. Forward, Midfielder, 100m Sprint"
              />
            </div>

            <div className="form-group">
              <label>Dominant Hand / Foot *</label>
              <select value={dominantHandFoot} onChange={(e) => setDominantHandFoot(e.target.value)}>
                <option value="Right">Right</option>
                <option value="Left">Left</option>
                <option value="Ambidextrous">Ambidextrous</option>
              </select>
            </div>
          </div>

          {/* Section 6: Verification Documents */}
          <h3 className="form-section-title">Section 6 — Verification Document Uploads</h3>
          <div className="form-grid">
            <div className={fieldClass('bFormDocUrl')}>
              <label>NADRA B-Form / Birth Certificate *</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <label className="btn btn-outline" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Upload size={16} />
                  <span>{bFormUploading ? 'Uploading...' : bFormDocUrl ? 'Replace Document' : 'Upload Document'}</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    hidden
                    onChange={(e) => handleFileUpload(e.target.files[0], setBFormDocUrl, setBFormUploading)}
                  />
                </label>
                {bFormDocUrl && <span style={{ color: '#16a34a', fontWeight: 600, fontSize: '0.85rem' }}>✓ Uploaded</span>}
              </div>
              <FieldError name="bFormDocUrl" />
            </div>

            <div className="form-group">
              <label>Parental Consent Form (Optional)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <label className="btn btn-outline" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Upload size={16} />
                  <span>{consentUploading ? 'Uploading...' : consentFormDocUrl ? 'Replace Document' : 'Upload Consent Form'}</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    hidden
                    onChange={(e) => handleFileUpload(e.target.files[0], setConsentFormDocUrl, setConsentUploading)}
                  />
                </label>
                {consentFormDocUrl && <span style={{ color: '#16a34a', fontWeight: 600, fontSize: '0.85rem' }}>✓ Uploaded</span>}
              </div>
            </div>

            <div className="form-group">
              <label>Athlete Passport Photograph (Optional)</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <label className="btn btn-outline" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Upload size={16} />
                  <span>{photoUploading ? 'Uploading...' : photoUrl ? 'Replace Photo' : 'Upload Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => handleFileUpload(e.target.files[0], setPhotoUrl, setPhotoUploading)}
                  />
                </label>
                {photoUrl && <span style={{ color: '#16a34a', fontWeight: 600, fontSize: '0.85rem' }}>✓ Uploaded</span>}
              </div>
            </div>
          </div>

          <div className="form-actions" style={{ marginTop: '2.5rem' }}>
            <Link to="/" className="btn btn-outline">Cancel</Link>
            <button type="submit" className="btn btn-primary" disabled={loading || bFormUploading || consentUploading || photoUploading}>
              {loading ? 'Submitting Application...' : resubmitData ? 'Resubmit Athlete Application' : 'Submit Athlete Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
