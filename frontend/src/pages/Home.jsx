import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Activity, Users, School, HelpCircle, Award, User } from 'lucide-react';
import HowItWorks from '../components/HowItWorks';
import TutorialVideo from '../components/TutorialVideo';

export default function Home() {
  return (
    <div className="home-page animate-fade-in">
      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-bg-overlay"></div>
        <img src="/assets/girls-hockey-hero.jpg" alt="Girls Playing Field Hockey" className="hero-bg-img" />
        <div className="container hero-content">
          <span className="hero-badge">OFFICIAL REGISTRY INITIATIVE</span>
          <h1 className="hero-title font-serif">National U-15 Hockey Athlete Portal</h1>
          <p className="hero-subtitle">
            Establishing a unified digital pipeline to discover, register, and monitor young field hockey talent across all government and private schools nationwide.
          </p>
          <div className="hero-actions">
            <Link to="/register-principal" className="btn btn-accent btn-hero">
              <School size={18} />
              <span>Register Your School</span>
            </Link>
            
            <div className="tooltip-container">
              <Link to="/register-student" className="btn btn-accent btn-hero">
                <User size={18} />
                <span>Register as Athlete</span>
                <HelpCircle size={14} className="info-icon" />
              </Link>
              <div className="tooltip-text">
                Note: You can only self-register if your school has been approved. Please verify with your principal first.
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* How It Works Diagram & Student Workflow */}
      <HowItWorks />

      {/* Video Tutorial Section */}
      <TutorialVideo />

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-tag">ADVANTAGES</span>
            <h2 className="section-title font-serif">Why Register Your School?</h2>
            <p className="section-subtitle">
              Join the official network to provide your students with pathways to national selection and grants.
            </p>
          </div>
          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon">
                <TrendingUp size={28} />
              </div>
              <h3 className="benefit-title">National Selection Pathway</h3>
              <p className="benefit-desc">
                Direct visibility to national selectors and provincial scouts for talented under-15 field hockey players.
              </p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">
                <Activity size={28} />
              </div>
              <h3 className="benefit-title">Equipment & Training Grants</h3>
              <p className="benefit-desc">
                Eligible schools gain priority access to government field hockey equipment grants and coaching clinics.
              </p>
            </div>
            <div className="benefit-card">
              <div className="benefit-icon">
                <Users size={28} />
              </div>
              <h3 className="benefit-title">Verified Digital Registry</h3>
              <p className="benefit-desc">
                Secure, immutable record-keeping of athlete achievements, age verification, and tournament participation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section" id="about">
        <div className="container about-container">
          <div className="about-text">
            <span className="section-tag">BACKGROUND & VISION</span>
            <h2 className="section-title font-serif">Fostering the Future of National Sports</h2>
            <p>
              The Under-15 Talent Program is part of a nationwide mandate to institutionalize grassroots athlete tracking. By standardizing the school registration process and validation of documents (CNIC/B-Form, parent consent forms), we prevent age evasion and ensure that only qualified athletes access elite sports development camps.
            </p>
            <p>
              Once approved by regional authorities, athletes are assigned a permanent digital identification number allowing national federations to invite them to regional training academies.
            </p>
            <div className="about-stats">
              <div className="stat-item">
                <span className="stat-num">U-15</span>
                <span className="stat-label">Age Group Target</span>
              </div>
              <div className="stat-item">
                <span className="stat-num">100%</span>
                <span className="stat-label">Verified Profiles</span>
              </div>
              <div className="stat-item">
                <span className="stat-num">Signed</span>
                <span className="stat-label">Document Security</span>
              </div>
            </div>

            {/* Priority Kit Advantage Box */}
            <div className="kit-advantage-box animate-fade-in">
              <div className="kit-advantage-icon">
                <Award size={26} />
              </div>
              <div className="kit-advantage-content">
                <h4 className="kit-advantage-title">Priority Kit Distribution & Equipment Grants</h4>
                <p className="kit-advantage-desc">
                  Athletes who register through and link their profiles with an <strong>approved, affiliated school</strong> receive priority verification status—unlocking significantly higher eligibility and priority selection for <strong>Free Official National Hockey Kits</strong>, professional sticks, and training gear.
                </p>
              </div>
            </div>
          </div>
          <div className="about-visual">
            <div className="visual-card">
              <h4 className="visual-title">Verification Compliance</h4>
              <p>All athlete submissions are cross-referenced with B-Form records and parent consent documents. Signed Cloudinary URLs protect privacy and guarantee security.</p>
              <div className="visual-line"></div>
              <p className="visual-footnote">Governed under national youth sports directives.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
