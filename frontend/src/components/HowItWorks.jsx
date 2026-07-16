import React, { useState } from 'react';
import { School, ClipboardCheck, UserCheck, Award, ArrowRight, FileText, Shield, Users } from 'lucide-react';

export default function HowItWorks() {
  const [activeWorkflow, setActiveWorkflow] = useState('student');

  const studentSteps = [
    {
      id: 1,
      title: "Select School & Profile",
      description: "Enter your date of birth, sports profile (playing position, fitness benchmarks), and select your school.",
      icon: UserCheck,
    },
    {
      id: 2,
      title: "Upload Birth & Consent Forms",
      description: "Securely attach a clear scan of your B-Form / CNIC and the signed Parent Consent document.",
      icon: FileText,
    },
    {
      id: 3,
      title: "Government Review and Verify",
      description: "Government officials review your submitted documents and digitally validate your athletic eligibility.",
      icon: Shield,
    },
    {
      id: 4,
      title: "Athlete ID Issued & Tracking",
      description: "Receive your official U-15 Tracking ID to track status online and get discovered by national scouts.",
      icon: Award,
    },
  ];

  const schoolSteps = [
    {
      id: 1,
      title: "Principal Registers School",
      description: "School administrators input EMIS code, official contact details, and credentials.",
      icon: School,
    },
    {
      id: 2,
      title: "Government Audits Registry",
      description: "Ministry admins cross-check institutional records and approve the school account.",
      icon: ClipboardCheck,
    },
    {
      id: 3,
      title: "Student Roster Activation",
      description: "Approved schools unlock athlete registration and review incoming student profiles.",
      icon: Users,
    },
    {
      id: 4,
      title: "National Scouting Access",
      description: "Verified school talent pools are made accessible to provincial and national federation coaches.",
      icon: Award,
    },
  ];

  const currentSteps = activeWorkflow === 'student' ? studentSteps : schoolSteps;

  return (
    <section className="how-it-works-section" id="how-it-works">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">VERIFICATION PIPELINE</span>
          <h2 className="section-title font-serif">Registration & Verification Workflows</h2>
          <p className="section-description">
            Streamlined procedures designed to ensure simplicity for students and rigorous integrity for institutions.
          </p>

          {/* Workflow Switcher Tabs */}
          <div className="workflow-tabs">
            <button
              onClick={() => setActiveWorkflow('student')}
              className={`workflow-tab-btn ${activeWorkflow === 'student' ? 'active' : ''}`}
            >
              <UserCheck size={18} />
              <span>Simple Student Workflow</span>
            </button>
            <button
              onClick={() => setActiveWorkflow('school')}
              className={`workflow-tab-btn ${activeWorkflow === 'school' ? 'active' : ''}`}
            >
              <School size={18} />
              <span>School Verification Pipeline</span>
            </button>
          </div>
        </div>

        <div className="steps-container animate-fade-in" key={activeWorkflow}>
          {currentSteps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <React.Fragment key={step.id}>
                <div className="step-card">
                  <div className="step-icon-wrapper">
                    <IconComponent className="step-icon" size={28} />
                    <span className="step-number">{step.id}</span>
                  </div>
                  <h3 className="step-title">{step.title}</h3>
                  <p className="step-desc">{step.description}</p>
                </div>
                {index < currentSteps.length - 1 && (
                  <div className="step-divider">
                    <ArrowRight className="divider-icon" size={24} />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </section>
  );
}
