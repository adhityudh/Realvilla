'use client';

import './PartnerSection.css';

const PartnerSection = () => {
  return (
    <section className="partner-section">
      <div className="partner-container">
        <div className="partner-title-wrapper">
          <h2 className="partner-title">Collaborating<br/>with Excellence</h2>
        </div>
        <div className="partner-logos">
          {[1, 2, 3, 4, 5].map((num) => (
            <div className="partner-logo-item" key={num}>
              <img src={`/images/logo-dummy-${num}.png`} alt={`Partner ${num}`} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnerSection;
