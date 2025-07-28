// src/components/Footer/Footer.jsx
import React from 'react';
import './Footer.css';

const Footer = ({ onNavigate, translations }) => {
  const handleLegalPageClick = (page) => {
    onNavigate(page);
  };

  return (
    <footer className="evalia-footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4 className="footer-title">EVALIA</h4>
          <p className="footer-description">
            {translations?.footerDescription || 'Your trusted source for honest product reviews and comparisons.'}
          </p>
        </div>

        <div className="footer-section">
          <h4 className="footer-title">{translations?.legal || 'Legal'}</h4>
          <div className="footer-links">
            <button 
              className="footer-link"
              onClick={() => handleLegalPageClick('impressum')}
            >
              {translations?.impressum || 'Impressum'}
            </button>
            <button 
              className="footer-link"
              onClick={() => handleLegalPageClick('datenschutz')}
            >
              {translations?.privacy || 'Datenschutz'}
            </button>
            <button 
              className="footer-link"
              onClick={() => handleLegalPageClick('agb')}
            >
              {translations?.terms || 'AGB'}
            </button>
            <button 
              className="footer-link"
              onClick={() => handleLegalPageClick('kontakt')}
            >
              {translations?.contact || 'Kontakt'}
            </button>
          </div>
        </div>

        <div className="footer-section">
          <h4 className="footer-title">{translations?.contact || 'Contact'}</h4>
          <div className="footer-contact">
            <p>info@evalia.de</p>
            <p>+49 (0) 123 456789</p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2025 EVALIA. {translations?.allRightsReserved || 'All rights reserved.'}</p>
      </div>
    </footer>
  );
};

export default Footer;