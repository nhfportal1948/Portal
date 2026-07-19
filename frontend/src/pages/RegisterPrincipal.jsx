import React, { useState } from 'react';
import { Landmark, ArrowLeft, Send, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';

// ─── Pakistan Geography Data (Province → District → Tehsils) ─────────────────
const geoData = {
  "Punjab": {
    "Lahore":           ["Lahore City", "Lahore Cantt", "Raiwind", "Shalimar"],
    "Rawalpindi":       ["Rawalpindi", "Gujar Khan", "Taxila", "Kahuta", "Murree", "Kotli Sattian"],
    "Faisalabad":       ["Faisalabad City", "Faisalabad Sadar", "Jaranwala", "Sammundri", "Tandlianwala", "Chak Jhumra"],
    "Multan":           ["Multan City", "Multan Sadar", "Shujabad", "Jalalpur Pirwala"],
    "Gujranwala":       ["Gujranwala City", "Gujranwala Sadar", "Kamoke", "Nowshera Virkan", "Wazirabad"],
    "Sialkot":          ["Sialkot City", "Sialkot Sadar", "Daska", "Pasrur", "Sambrial"],
    "Sargodha":         ["Sargodha City", "Bhalwal", "Sahiwal (Sargodha)", "Silanwali", "Kot Momin"],
    "Bahawalpur":       ["Bahawalpur City", "Hasilpur", "Yazman", "Khairpur Tamewali"],
    "Rahim Yar Khan":   ["Rahim Yar Khan", "Sadiqabad", "Liaqatpur", "Khanpur"],
    "Kasur":            ["Kasur", "Chunian", "Pattoki"],
    "Sheikhupura":      ["Sheikhupura", "Nankana Sahib", "Safdarabad", "Muridke"],
    "Jhang":            ["Jhang City", "Shorkot", "Ahmed Pur Sial"],
    "Gujrat":           ["Gujrat City", "Kharian", "Lalamusa"],
    "Narowal":          ["Narowal", "Shakargarh"],
    "Mandi Bahauddin":  ["Mandi Bahauddin", "Phalia", "Malikwal"],
    "Chakwal":          ["Chakwal", "Talagang", "Choa Saidan Shah"],
    "Jhelum":           ["Jhelum", "Sohawa", "Pind Dadan Khan"],
    "Hafizabad":        ["Hafizabad", "Pindi Bhattian"],
    "Okara":            ["Okara", "Renala Khurd", "Depalpur"],
    "Vehari":           ["Vehari", "Mailsi", "Burewala"],
    "Khanewal":         ["Khanewal", "Mian Channu", "Kabirwala"],
    "Lodhran":          ["Lodhran", "Kehror Pacca", "Dunyapur"],
    "Pakpattan":        ["Pakpattan", "Arifwala"],
    "Bahawalnagar":     ["Bahawalnagar", "Chishtian", "Fort Abbas", "Harunabad"],
    "Muzaffargarh":     ["Muzaffargarh", "Kot Adu", "Alipur", "Jatoi"],
    "Layyah":           ["Layyah", "Karor Lal Esan", "Chaubara"],
    "Bhakkar":          ["Bhakkar", "Mankera", "Darya Khan"],
    "Khushab":          ["Khushab", "Noorpur", "Quaidabad", "Joharabad"],
    "DG Khan":          ["DG Khan City", "Taunsa", "Kot Chutta"],
    "Rajanpur":         ["Rajanpur", "Jampur", "Rojhan"],
    "Mianwali":         ["Mianwali", "Piplan", "Isa Khel"],
    "Sahiwal":          ["Sahiwal City", "Chichawatni"],
    "Chiniot":          ["Chiniot", "Bhawana", "Lalian"],
    "Toba Tek Singh":   ["Toba Tek Singh", "Gojra", "Kamalia"],
    "Nankana Sahib":    ["Nankana Sahib", "Sangla Hill", "Sharaqpur"],
  },
  "Sindh": {
    "Karachi":              ["Karachi Central", "Karachi East", "Karachi South", "Karachi West", "Korangi", "Malir"],
    "Hyderabad":            ["Hyderabad City", "Latifabad", "Qasimabad"],
    "Sukkur":               ["Sukkur", "Rohri", "Salehpat"],
    "Larkana":              ["Larkana", "Dokri", "Ratodero"],
    "Mirpur Khas":          ["Mirpur Khas", "Jhuddo", "Kot Ghulam Muhammad"],
    "Nawabshah (SBA)":      ["Nawabshah", "Sakrand", "Qazi Ahmad"],
    "Jacobabad":            ["Jacobabad", "Thul", "Garhi Khairo"],
    "Khairpur":             ["Khairpur", "Kingri", "Gambat", "Kotdiji"],
    "Shikarpur":            ["Shikarpur", "Lakhi", "Garhi Yasin"],
    "Dadu":                 ["Dadu", "Johi", "Mehar"],
    "Thatta":               ["Thatta", "Sujawal", "Mirpur Sakro"],
    "Badin":                ["Badin", "Talhar", "Tando Bago"],
    "Sanghar":              ["Sanghar", "Shahdadpur", "Tando Adam"],
    "Umerkot":              ["Umerkot", "Kunri", "Samaro"],
    "Ghotki":               ["Ghotki", "Obaro", "Mirpur Mathelo"],
    "Kashmore":             ["Kashmore", "Kandhkot", "Tangwani"],
    "Naushahro Feroze":     ["Naushahro Feroze", "Moro", "Bhiria Road"],
    "Kambar-Shahdadkot":    ["Kambar", "Shahdadkot", "Warah"],
    "Jamshoro":             ["Jamshoro", "Kotri", "Manjhand"],
    "Matiari":              ["Matiari", "Hala", "Saeedabad"],
    "Tando Allahyar":       ["Tando Allahyar", "Chambar"],
    "Tharparkar":           ["Mithi", "Islamkot", "Diplo"],
  },
  "Khyber Pakhtunkhwa (KPK)": {
    "Peshawar":     ["Peshawar City", "Peshawar Sadar", "Nauthia Qadeem"],
    "Mardan":       ["Mardan", "Takht Bhai"],
    "Swat":         ["Saidu Sharif", "Matta", "Bahrain", "Kabal", "Khwazakhela", "Charbagh"],
    "Abbottabad":   ["Abbottabad", "Havelian", "Bagra"],
    "Nowshera":     ["Nowshera", "Pabbi", "Jehangira"],
    "Charsadda":    ["Charsadda", "Shabqadar", "Tangi"],
    "Mansehra":     ["Mansehra", "Balakot", "Oghi"],
    "Kohat":        ["Kohat", "Lachi", "Dara Adam Khel"],
    "Bannu":        ["Bannu", "Domel", "Miryan"],
    "DI Khan":      ["DI Khan City", "Paharpur", "Tank"],
    "Haripur":      ["Haripur", "Ghazi", "Tarbela"],
    "Malakand":     ["Malakand", "Batkhela"],
    "Shangla":      ["Alpuri", "Puran", "Bisham"],
    "Dir Lower":    ["Timergara", "Adenzai", "Balambat"],
    "Dir Upper":    ["Dir Upper City", "Kumrat"],
    "Buner":        ["Daggar", "Sowari", "Totalai"],
    "Swabi":        ["Swabi", "Razar", "Topi"],
    "Karak":        ["Karak", "Banda Daud Shah"],
    "Lakki Marwat": ["Lakki Marwat", "Serai Naurang"],
    "Hangu":        ["Hangu", "Thall"],
    "Chitral":      ["Chitral City", "Drosh", "Mastuj"],
    "Bajaur":       ["Khar", "Nawagai"],
    "Mohmand":      ["Ghalanai", "Ekka Ghund"],
  },
  "Balochistan": {
    "Quetta":           ["Quetta City", "Satellite Town", "Zarghoon Road"],
    "Khuzdar":          ["Khuzdar", "Wadh", "Ornach"],
    "Gwadar":           ["Gwadar City", "Pasni", "Ormara"],
    "Turbat (Kech)":    ["Turbat", "Mand", "Tump"],
    "Chagai":           ["Dalbandin", "Nok Kundi"],
    "Nasirabad":        ["Dera Murad Jamali", "Tamboo"],
    "Panjgur":          ["Panjgur City", "Gichk"],
    "Mastung":          ["Mastung", "Dasht"],
    "Pishin":           ["Pishin", "Karezat"],
    "Kalat":            ["Kalat", "Surab", "Mangochar"],
    "Loralai":          ["Loralai", "Barkhan", "Duki"],
    "Sibi":             ["Sibi", "Lehri", "Harnai"],
    "Zhob":             ["Zhob", "Muslim Bagh"],
    "Dera Bugti":       ["Dera Bugti", "Sui"],
    "Ziarat":           ["Ziarat", "Kawas"],
    "Lasbela":          ["Uthal", "Hub", "Bela"],
    "Jaffarabad":       ["Usta Muhammad", "Gandakha"],
    "Nushki":           ["Nushki City"],
    "Washuk":           ["Kharan", "Washuk City"],
    "Awaran":           ["Awaran City"],
  },
  "Azad Jammu & Kashmir (AJK)": {
    "Muzaffarabad":         ["Muzaffarabad City", "Hattian Bala", "Patika"],
    "Mirpur":               ["Mirpur City", "Dadyal", "Chakswari"],
    "Kotli":                ["Kotli", "Sehnsa", "Charhoi"],
    "Bagh":                 ["Bagh", "Dhirkot"],
    "Rawalakot (Poonch)":   ["Rawalakot", "Abbaspur", "Haveli"],
    "Neelum":               ["Athmuqam", "Sharda", "Kel"],
    "Sudhanoti":            ["Pallandri", "Tain"],
    "Hattian":              ["Hattian Bala City"],
  },
  "Gilgit-Baltistan": {
    "Gilgit":   ["Gilgit City", "Jutial", "Nomal"],
    "Skardu":   ["Skardu City", "Shigar", "Khaplu"],
    "Hunza":    ["Aliabad", "Karimabad", "Gulmit"],
    "Ghizer":   ["Gahkuch", "Yasin", "Phander"],
    "Diamer":   ["Chilas", "Darel", "Tangir"],
    "Astore":   ["Astore", "Gurez"],
    "Nagar":    ["Nagar Valley", "Hispar"],
  },
  "Islamabad Capital Territory": {
    "Islamabad": ["Islamabad City", "Margalla Hills", "Saidpur", "Rawat", "Kahuta (ICT)"],
  },
};

// ─── Complete List of Education Boards ────────────────────────────────────────
const educationBoards = [
  "Federal Board of Intermediate & Secondary Education (FBISE)",
  // Punjab
  "BISE Lahore",
  "BISE Rawalpindi",
  "BISE Gujranwala",
  "BISE Sargodha",
  "BISE Faisalabad",
  "BISE Multan",
  "BISE DG Khan",
  "BISE Sahiwal",
  "BISE Bahawalpur",
  // Sindh
  "BISE Karachi",
  "BISE Hyderabad",
  "BISE Sukkur",
  "BISE Larkana",
  "BISE Mirpurkhas",
  // KPK
  "BISE Peshawar",
  "BISE Swat",
  "BISE Mardan",
  "BISE Abbottabad",
  "BISE Kohat",
  "BISE DI Khan",
  "BISE Malakand",
  // Balochistan
  "BISE Quetta",
  // AJK & GB
  "BISE AJK (Mirpur)",
  "Gilgit-Baltistan Board of Intermediate & Secondary Education",
  // Private
  "Aga Khan University Examination Board (AKUEB)",
];

// ─── Password Strength Calculator ─────────────────────────────────────────────
function getPasswordStrength(password) {
  if (!password) return null;
  const hasLetter  = /[a-zA-Z]/.test(password);
  const hasNumber  = /\d/.test(password);
  const hasSpecial = /[!@#$%^&*()\-_=+[\]{};:'",.<>?/\\|`~]/.test(password);
  const isLong     = password.length >= 12;
  const isMedium   = password.length >= 8;

  if (!isMedium || !hasLetter || !hasNumber) {
    return { score: 1, label: 'Weak',   color: '#ef4444', bg: '#fef2f2' };
  }
  if (isLong && hasLetter && hasNumber && hasSpecial) {
    return { score: 3, label: 'Strong', color: '#16a34a', bg: '#f0fdf4' };
  }
  return { score: 2, label: 'Fair',   color: '#d97706', bg: '#fffbeb' };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function RegisterPrincipal() {
  const [formData, setFormData] = useState({
    email:                   '',
    password:                '',
    confirmPassword:         '',
    schoolName:              '',
    ownershipType:           'GOVERNMENT',
    province:                '',
    district:                '',
    tehsil:                  '',
    completeAddress:         '',
    officialEmail:           '',
    officialPhone:           '',
    principalName:           '',
    principalCNIC:           '',
    principalMobile:         '',
    emisCode:                '',
    schoolRegistrationNumber:'',
    affiliatedEducationBoard:'',
  });

  const [fieldErrors, setFieldErrors]           = useState({});
  const [loading, setLoading]                   = useState(false);
  const [errorMsg, setErrorMsg]                 = useState('');
  const [referenceNumber, setReferenceNumber]   = useState('');
  const [showPassword, setShowPassword]         = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ── Derived values ──────────────────────────────────────────────────────────
  const districts       = formData.province ? Object.keys(geoData[formData.province]) : [];
  const tehsils         = (formData.province && formData.district)
                            ? geoData[formData.province][formData.district]
                            : [];
  const passwordStrength = getPasswordStrength(formData.password);

  // ── Per-field validation ────────────────────────────────────────────────────
  const validateField = (name, value) => {
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const cnicRx  = /^\d{5}-\d{7}-\d{1}$/;
    const pwRx    = /^(?=.*[a-zA-Z])(?=.*\d).{8,}$/;

    switch (name) {
      case 'email':
        if (!value) return 'Login email is required.';
        if (!emailRx.test(value)) return 'Invalid email address format.';
        return '';
      case 'password':
        if (!value) return 'Password is required.';
        if (!pwRx.test(value)) return 'Min 8 characters with at least one letter and one number.';
        return '';
      case 'confirmPassword':
        if (!value) return 'Please confirm your password.';
        if (value !== formData.password) return 'Passwords do not match.';
        return '';
      case 'officialEmail':
        if (!value) return '';
        if (!emailRx.test(value)) return 'Invalid email address format.';
        return '';
      case 'officialPhone':
        return '';
      case 'principalCNIC':
        if (!value) return 'CNIC is required.';
        if (!cnicRx.test(value)) return 'Format must be: XXXXX-XXXXXXX-X';
        return '';
      case 'schoolName':        return !value ? 'School name is required.' : '';
      case 'province':          return !value ? 'Please select a province.' : '';
      case 'district':          return !value ? 'Please select a district.' : '';
      case 'tehsil':            return !value ? 'Please select a tehsil.' : '';
      case 'completeAddress':   return !value ? 'Complete address is required.' : '';
      case 'principalName':     return !value ? 'Principal / Head name is required.' : '';
      case 'principalMobile':   return !value ? 'Mobile number is required.' : '';
      case 'emisCode':          return !value ? 'EMIS Code is required.' : '';
      case 'affiliatedEducationBoard': return '';
      default: return '';
    }
  };

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'province') {
      setFormData((prev) => ({ ...prev, province: value, district: '', tehsil: '' }));
    } else if (name === 'district') {
      setFormData((prev) => ({ ...prev, district: value, tehsil: '' }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear the field error live once the user starts correcting
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const err = validateField(name, value);
    if (err) {
      setFieldErrors((prev) => ({ ...prev, [name]: err }));
    }
  };

  // CNIC format mask: XXXXX-XXXXXXX-X
  const handleCnicChange = (e) => {
    let raw = e.target.value.replace(/\D/g, '').substring(0, 13);
    let formatted = raw.substring(0, 5);
    if (raw.length > 5)  formatted += '-' + raw.substring(5, 12);
    if (raw.length > 12) formatted += '-' + raw.substring(12, 13);
    setFormData((prev) => ({ ...prev, principalCNIC: formatted }));
    if (fieldErrors.principalCNIC) {
      setFieldErrors((prev) => ({ ...prev, principalCNIC: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Run all field validations at once
    const requiredFields = [
      'email', 'password', 'confirmPassword',
      'schoolName', 'province', 'district', 'tehsil',
      'completeAddress',
      'principalName', 'principalCNIC', 'principalMobile',
      'emisCode',
    ];
    const errors = {};
    requiredFields.forEach((field) => {
      const err = validateField(field, formData[field]);
      if (err) errors[field] = err;
    });
    // Also format check optional fields if provided
    ['officialEmail', 'officialPhone'].forEach((field) => {
      if (formData[field]) {
        const err = validateField(field, formData[field]);
        if (err) errors[field] = err;
      }
    });

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setErrorMsg('Please correct the highlighted fields before submitting.');
      // Scroll to first error
      const firstErrEl = document.querySelector('.field-error-text');
      if (firstErrEl) firstErrEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setLoading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_BASE}/auth/register-principal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email:                    formData.email,
          password:                 formData.password,
          schoolName:               formData.schoolName,
          ownershipType:            formData.ownershipType,
          province:                 formData.province,
          district:                 formData.district,
          tehsil:                   formData.tehsil,
          completeAddress:          formData.completeAddress,
          officialEmail:            formData.officialEmail,
          officialPhone:            formData.officialPhone,
          principalName:            formData.principalName,
          principalCNIC:            formData.principalCNIC,
          principalMobile:          formData.principalMobile,
          emisCode:                 formData.emisCode,
          schoolRegistrationNumber: formData.schoolRegistrationNumber || null,
          affiliatedEducationBoard: formData.affiliatedEducationBoard,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to register. Please try again.');

      setReferenceNumber(result.data.school.id);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Field error helper ──────────────────────────────────────────────────────
  const FieldError = ({ name }) =>
    fieldErrors[name]
      ? <span className="field-error-text">{fieldErrors[name]}</span>
      : null;

  const fieldClass = (name) =>
    `form-group${fieldErrors[name] ? ' field-has-error' : ''}`;

  // ── Success / Confirmation Screen ───────────────────────────────────────────
  if (referenceNumber) {
    return (
      <div className="registration-page container animate-fade-in">
        <div className="form-container-card" style={{ textAlign: 'center' }}>
          <div className="form-header" style={{ marginBottom: '1.5rem' }}>
            <CheckCircle size={64} style={{ color: '#16a34a', margin: '0 auto 1.5rem auto', display: 'block' }} />
            <h2 className="form-title font-serif">Registration Submitted</h2>
            <p className="form-subtitle">
              Your credentials and school profile have been successfully queued for government verification.
            </p>
          </div>

          <div className="user-details-card" style={{ maxWidth: '480px', margin: '2rem auto' }}>
            <p style={{ textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.08em', color: 'var(--navy-primary)', marginBottom: '0.5rem' }}>
              Official Reference Number (School ID)
            </p>
            <code className="id-code" style={{ fontSize: '1.1rem', padding: '0.6rem 1.25rem', display: 'block', margin: '0.25rem 0 0.75rem', wordBreak: 'break-all' }}>
              {referenceNumber}
            </code>
            <p style={{ fontSize: '0.8rem', color: 'var(--slate-600)' }}>
              Please save this reference number for your records.
            </p>
          </div>

          <div className="alert alert-warning" style={{ maxWidth: '600px', margin: '0 auto 2.5rem auto', textAlign: 'left' }}>
            <strong>Access Notice:</strong> Your school registration is currently <strong>under review</strong>.
            You will be able to log in with your credentials once a regional administrator approves your application.
            Attempting to sign in before approval will return a pending notice.
          </div>

          <div className="form-actions" style={{ justifyContent: 'center', borderTop: 'none', paddingTop: 0 }}>
            <Link to="/" className="btn btn-primary">Return to Homepage</Link>
            <Link to="/track-status" className="btn btn-outline" style={{ marginLeft: '0.75rem' }}>Track Application Status</Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Registration Form ───────────────────────────────────────────────────────
  return (
    <div className="registration-page container animate-fade-in">
      <div className="form-container-card">

        {/* Header */}
        <div className="form-header">
          <Link to="/" className="back-link">
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Link>
          <Landmark className="form-icon" size={32} />
          <h2 className="form-title font-serif">School &amp; Principal Registration</h2>
          <p className="form-subtitle">
            Register your institution below. All applications require verification by government regional managers
            prior to portal access approval.
          </p>
        </div>

        {/* Global submission error */}
        {errorMsg && <div className="alert alert-error">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="registration-form" noValidate>

          {/* ── Section 1 — Account Credentials ─────────────────────────────── */}
          <h3 className="form-section-title">Section 1 — Portal Account Credentials</h3>
          <div className="form-grid">

            {/* Email */}
            <div className={fieldClass('email')}>
              <label htmlFor="reg-email">Portal Login Email *</label>
              <input
                type="email"
                id="reg-email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="principal@school.edu.pk"
                autoComplete="email"
              />
              <FieldError name="email" />
            </div>

            {/* Password with strength meter + show/hide */}
            <div className={fieldClass('password')}>
              <label htmlFor="reg-password">Password *</label>
              <div className="input-icon-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="reg-password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Min 8 characters, letters &amp; numbers"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="input-icon-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Live strength meter */}
              {formData.password && passwordStrength && (
                <div className="pw-strength-wrapper">
                  <div className="pw-strength-bar">
                    <div
                      className="pw-strength-fill"
                      style={{
                        width: `${(passwordStrength.score / 3) * 100}%`,
                        backgroundColor: passwordStrength.color,
                      }}
                    />
                  </div>
                  <span className="pw-strength-label" style={{ color: passwordStrength.color }}>
                    {passwordStrength.label}
                  </span>
                </div>
              )}
              <FieldError name="password" />
            </div>

            {/* Confirm Password */}
            <div className={fieldClass('confirmPassword')}>
              <label htmlFor="reg-confirm-password">Confirm Password *</label>
              <div className="input-icon-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="reg-confirm-password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="input-icon-btn"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Live match indicator */}
              {formData.confirmPassword && (
                <span
                  className="pw-strength-label"
                  style={{
                    color: formData.confirmPassword === formData.password ? '#16a34a' : '#ef4444',
                    marginTop: '0.35rem',
                    display: 'block',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                  }}
                >
                  {formData.confirmPassword === formData.password ? '✓ Passwords match' : '✗ Passwords do not match'}
                </span>
              )}
              <FieldError name="confirmPassword" />
            </div>

          </div>

          {/* ── Section 2 — School Information ──────────────────────────────── */}
          <h3 className="form-section-title">Section 2 — Official School Details</h3>
          <div className="form-grid">

            {/* School Name */}
            <div className={`${fieldClass('schoolName')} full-width`}>
              <label htmlFor="reg-schoolName">Official School Name *</label>
              <input
                type="text"
                id="reg-schoolName"
                name="schoolName"
                value={formData.schoolName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. Government High School No. 1, Lahore"
              />
              <FieldError name="schoolName" />
            </div>

            {/* Ownership Type */}
            <div className="form-group">
              <label>Ownership Type *</label>
              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                {['GOVERNMENT', 'PRIVATE'].map((type) => (
                  <label key={type} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500, cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="ownershipType"
                      value={type}
                      checked={formData.ownershipType === type}
                      onChange={handleChange}
                    />
                    <span>{type === 'GOVERNMENT' ? 'Government Owned' : 'Private Institution'}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* EMIS Code */}
            <div className={fieldClass('emisCode')}>
              <label htmlFor="reg-emisCode">EMIS Code *</label>
              <input
                type="text"
                id="reg-emisCode"
                name="emisCode"
                value={formData.emisCode}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="8-digit official school code"
              />
              <FieldError name="emisCode" />
            </div>

            {/* Province */}
            <div className={fieldClass('province')}>
              <label htmlFor="reg-province">Province *</label>
              <select
                id="reg-province"
                name="province"
                value={formData.province}
                onChange={handleChange}
                onBlur={handleBlur}
              >
                <option value="">— Select Province —</option>
                {Object.keys(geoData).map((prov) => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>
              <FieldError name="province" />
            </div>

            {/* District */}
            <div className={fieldClass('district')}>
              <label htmlFor="reg-district">District *</label>
              <select
                id="reg-district"
                name="district"
                value={formData.district}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={!formData.province}
              >
                <option value="">— Select District —</option>
                {districts.map((dist) => (
                  <option key={dist} value={dist}>{dist}</option>
                ))}
              </select>
              <FieldError name="district" />
            </div>

            {/* Tehsil */}
            <div className={fieldClass('tehsil')}>
              <label htmlFor="reg-tehsil">Tehsil *</label>
              <select
                id="reg-tehsil"
                name="tehsil"
                value={formData.tehsil}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={!formData.district}
              >
                <option value="">— Select Tehsil —</option>
                {tehsils.map((teh) => (
                  <option key={teh} value={teh}>{teh}</option>
                ))}
              </select>
              <FieldError name="tehsil" />
            </div>

            {/* Education Board */}
            <div className={fieldClass('affiliatedEducationBoard')}>
              <label htmlFor="reg-board">Affiliated Education Board (Optional)</label>
              <select
                id="reg-board"
                name="affiliatedEducationBoard"
                value={formData.affiliatedEducationBoard}
                onChange={handleChange}
                onBlur={handleBlur}
              >
                <option value="">— Select Board —</option>
                {educationBoards.map((board) => (
                  <option key={board} value={board}>{board}</option>
                ))}
              </select>
              <FieldError name="affiliatedEducationBoard" />
            </div>

            {/* Complete Address */}
            <div className={`${fieldClass('completeAddress')} full-width`}>
              <label htmlFor="reg-address">Complete Physical Address *</label>
              <textarea
                id="reg-address"
                name="completeAddress"
                value={formData.completeAddress}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Street address, block number, area details..."
                rows={2}
              />
              <FieldError name="completeAddress" />
            </div>

            {/* Official Email */}
            <div className={fieldClass('officialEmail')}>
              <label htmlFor="reg-officialEmail">Official School Email (Optional)</label>
              <input
                type="email"
                id="reg-officialEmail"
                name="officialEmail"
                value={formData.officialEmail}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="info@school.edu.pk"
              />
              <FieldError name="officialEmail" />
            </div>

            {/* Official Phone */}
            <div className={fieldClass('officialPhone')}>
              <label htmlFor="reg-officialPhone">Official Phone Number (Optional)</label>
              <input
                type="text"
                id="reg-officialPhone"
                name="officialPhone"
                value={formData.officialPhone}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Landline e.g. 042-35551234"
              />
              <FieldError name="officialPhone" />
            </div>

            {/* School Registration Number (optional) */}
            <div className="form-group">
              <label htmlFor="reg-regNum">School Registration Number <span style={{ fontWeight: 400, color: 'var(--slate-600)' }}>(if available)</span></label>
              <input
                type="text"
                id="reg-regNum"
                name="schoolRegistrationNumber"
                value={formData.schoolRegistrationNumber}
                onChange={handleChange}
                placeholder="e.g. REG-123456"
              />
            </div>

            {/* Principal Name */}
            <div className={fieldClass('principalName')}>
              <label htmlFor="reg-principalName">Principal / Head Name *</label>
              <input
                type="text"
                id="reg-principalName"
                name="principalName"
                value={formData.principalName}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Full Name"
              />
              <FieldError name="principalName" />
            </div>

            {/* Principal CNIC */}
            <div className={fieldClass('principalCNIC')}>
              <label htmlFor="reg-cnic">Principal CNIC *</label>
              <input
                type="text"
                id="reg-cnic"
                name="principalCNIC"
                value={formData.principalCNIC}
                onChange={handleCnicChange}
                onBlur={handleBlur}
                placeholder="XXXXX-XXXXXXX-X"
                maxLength={15}
                inputMode="numeric"
              />
              <FieldError name="principalCNIC" />
            </div>

            {/* Mobile */}
            <div className={fieldClass('principalMobile')}>
              <label htmlFor="reg-mobile">Mobile Number *</label>
              <input
                type="text"
                id="reg-mobile"
                name="principalMobile"
                value={formData.principalMobile}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="e.g. 0300-1234567"
              />
              <FieldError name="principalMobile" />
            </div>

          </div>

          {/* Submit */}
          <div className="form-actions">
            <button type="submit" className="btn btn-accent btn-submit" disabled={loading} id="btn-submit-registration">
              <Send size={18} />
              <span>{loading ? 'Submitting Application…' : 'Submit for Government Verification'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
