import React from 'react';
import { Mail, Phone, MapPin, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="brand-logo-container">
            <img src="/assets/logo-emblem.jpg" alt="Government Crest" className="footer-logo" />
            <div className="footer-brand-text">
              <span className="footer-title">HOCKEY ATHLETE PORTAL</span>
              <span className="footer-subtitle">Government of Pakistan</span>
            </div>
          </div>
          <p className="footer-desc">
            An official digital registry overseen by the Ministry of Inter Provincial Coordination to systematically identify and monitor U-15 hockey athletic talent.
          </p>
        </div>

        <div className="footer-links">
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-links-list">
            <li><Link to="/">Home Dashboard</Link></li>
            <li><Link to="/#about">About the Initiative</Link></li>
            <li><Link to="/register-principal">School Sign Up</Link></li>
            <li><Link to="/register-student">Athlete Registry</Link></li>
            <li><Link to="/track-status">Track Status</Link></li>
          </ul>
        </div>

        <div className="footer-contact">
          <h4 className="footer-heading">Contact & Helpdesk</h4>
          <ul className="footer-contact-list">
            <li>
              <MapPin size={18} className="contact-icon" />
              <span>Ministry of IPC, Block D, Pakistan Secretariat, Islamabad</span>
            </li>
            <li>
              <Phone size={18} className="contact-icon" />
              <span>+92-51-9201234 (Mon - Fri, 9 AM - 5 PM)</span>
            </li>
            <li>
              <Mail size={18} className="contact-icon" />
              <span>support@sportsportal.gov.pk</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-container">
          <p>&copy; {new Date().getFullYear()} Hockey Athlete Portal, Ministry of IPC. All rights reserved.</p>
          <div className="footer-policies">
            <a href="#privacy">Privacy Policy</a>
            <span className="policy-divider">|</span>
            <a href="#terms">Terms & Conditions</a>
            <span className="policy-divider">|</span>
            <span className="official-badge">
              <Shield size={12} />
              <span>Official Government Portal</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
