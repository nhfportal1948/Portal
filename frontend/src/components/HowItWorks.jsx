import React from 'react';
import { School, ClipboardCheck, UserCheck, Award, ArrowRight } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      id: 1,
      title: "Principal Registers School",
      description: "School administrators input EMIS code, official contacts, and credentials.",
      icon: School,
    },
    {
      id: 2,
      title: "Government Verifies School",
      description: "Ministry admins audit the application and approve the registry.",
      icon: ClipboardCheck,
    },
    {
      id: 3,
      title: "Student Registers Profile",
      description: "Young athletes upload birth forms, parent consents, and athletic stats.",
      icon: UserCheck,
    },
    {
      id: 4,
      title: "Athlete ID Issued",
      description: "Upon approval, a unique tracking ID is generated for talent scouting.",
      icon: Award,
    },
  ];

  return (
    <section className="how-it-works-section" id="how-it-works">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">VERIFICATION PIPELINE</span>
          <h2 className="section-title font-serif">Registration & Verification Process</h2>
          <p className="section-description">
            Four simple phases ensure the integrity of the national U-15 athletic talent registry.
          </p>
        </div>

        <div className="steps-container">
          {steps.map((step, index) => {
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
                {index < steps.length - 1 && (
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
