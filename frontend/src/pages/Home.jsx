import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Activity, Users, School, HelpCircle } from 'lucide-react';
import HowItWorks from '../components/HowItWorks';

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
              <Link to="/register-student" className="btn btn-white-outline btn-hero">
                <span>Register as Student</span>
                <HelpCircle size={14} className="info-icon" />
              </Link>
              <div className="tooltip-text">
                Note: You can only self-register if your school has been approved. Please verify with your principal first.
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* How It Works Diagram */}
      <HowItWorks />

      {/* Benefits Section */}
      <section className="benefits-section">
        <div className="container">
          <div className="section-header">
            <span className="section-tag">PROGRAM BENEFITS</span>
            <h2 className="section-title font-serif">Key Objectives & Capabilities</h2>
            <p className="section-description">
              Our registry serves as a single source of truth for sports scouts and coaches to track and support rising stars.
            </p>
          </div>

          <div className="benefits-grid">
            <div className="benefit-card">
              <div className="benefit-icon-wrapper">
                <TrendingUp size={24} className="benefit-icon" />
              </div>
              <h3 className="benefit-title">Talent Identification</h3>
              <p className="benefit-desc">
                Discovers and profiles potential junior champions through structured metrics, school records, and physical attributes.
              </p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon-wrapper">
                <Activity size={24} className="benefit-icon" />
              </div>
              <h3 className="benefit-title">National Tracking</h3>
              <p className="benefit-desc">
                Monitors growth indices, injury records, preferred sport positions, and fitness benchmarks under a unified registry.
              </p>
            </div>

            <div className="benefit-card">
              <div className="benefit-icon-wrapper">
                <Users size={24} className="benefit-icon" />
              </div>
              <h3 className="benefit-title">Equal Opportunity</h3>
              <p className="benefit-desc">
                Ensures fair access and support for both boys and girls, removing structural barriers to provincial and national representation.
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
