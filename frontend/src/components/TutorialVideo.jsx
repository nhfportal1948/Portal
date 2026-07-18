import React from 'react';
import { Link } from 'react-router-dom';
import { Play, ExternalLink, CheckCircle2, FileText, School, UserCheck, ArrowRight } from 'lucide-react';

export default function TutorialVideo() {
  const checklist = [
    {
      icon: FileText,
      title: "Prepare Your Documents",
      desc: "Have a clear scan or photo of your B-Form / CNIC and signed Parent Consent Form ready before starting."
    },
    {
      icon: School,
      title: "Verify School Enrolment",
      desc: "Select your school from our approved registry list during registration so your principal can verify you."
    },
    {
      icon: UserCheck,
      title: "Fill Sports Profile",
      desc: "Accurately enter your date of birth, preferred playing position, and physical benchmarks."
    }
  ];

  return (
    <section className="tutorial-video-section" id="tutorial-video">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">OFFICIAL VIDEO GUIDE</span>
          <h2 className="section-title font-serif">How to Fill Out the Athlete Registration Form</h2>
          <p className="section-description">
            Watch our comprehensive step-by-step video guide to learn how young athletes and parents can easily complete the online application and upload mandatory verification documents.
          </p>
        </div>

        <div className="tutorial-grid">
          {/* Left / Top: Video Player Card */}
          <div className="tutorial-video-card">
            <div className="video-responsive-wrapper">
              <iframe
                src="https://www.youtube.com/embed/NK0UKMG-IJ8?rel=0&modestbranding=1"
                title="National U-15 Hockey Portal - How to Fill Form Tutorial"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="video-iframe"
              ></iframe>
            </div>
            
            <div className="video-card-footer">
              <div className="video-info">
                <span className="video-badge"><Play size={14} /> Full Walkthrough</span>
                <span className="video-title-small">Step-by-Step Athlete Form Guidance</span>
              </div>
              <a
                href="https://youtu.be/NK0UKMG-IJ8"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-youtube-link"
              >
                <span>Watch on YouTube</span>
                <ExternalLink size={16} />
              </a>
            </div>
          </div>

          {/* Right / Bottom: Checklist & CTA */}
          <div className="tutorial-sidebar">
            <div className="tutorial-sidebar-header">
              <h3 className="sidebar-title">Before You Begin</h3>
              <p className="sidebar-subtitle">Keep these 3 essentials ready for a smooth 5-minute registration process:</p>
            </div>

            <div className="checklist-items">
              {checklist.map((item, idx) => {
                const IconComp = item.icon;
                return (
                  <div key={idx} className="checklist-card">
                    <div className="checklist-icon">
                      <IconComp size={22} />
                    </div>
                    <div className="checklist-content">
                      <h4 className="checklist-title">{item.title}</h4>
                      <p className="checklist-desc">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="tutorial-cta-box">
              <div className="cta-text">
                <strong>Ready to submit your profile?</strong>
                <span>Join the national U-15 talent discovery pipeline.</span>
              </div>
              <Link to="/register-student" className="btn btn-primary btn-tutorial-cta">
                <span>Start Registration</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
