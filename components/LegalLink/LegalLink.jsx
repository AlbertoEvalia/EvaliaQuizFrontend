// src/components/LegalLink/LegalLink.jsx
import React, { useState } from 'react';
import './LegalLink.css';

const LegalLink = ({ onNavigate, translations }) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleLegalClick = (page) => {
    setShowMenu(false);
    onNavigate(page);
  };

  const handleToggleClick = (e) => {
    e.preventDefault(); // Verhindert Form-Submit
    e.stopPropagation(); // Stoppt Event-Bubbling
    setShowMenu(!showMenu);
  };

  const handleDropdownClick = (page) => (e) => {
    e.preventDefault(); // Verhindert Form-Submit
    e.stopPropagation(); // Stoppt Event-Bubbling
    handleLegalClick(page);
  };

  return (
    <div className="legal-link-container">
      <button
        type="button" // WICHTIG: type="button" verhindert Form-Submit
        className="legal-hamburger"
        onClick={handleToggleClick}
        aria-label="Legal Menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      
      {showMenu && (
        <div className="legal-dropdown">
          <button
            type="button"
            onClick={handleDropdownClick('impressum')}
          >
            {translations?.impressum || 'Impressum'}
          </button>
          <button
            type="button"
            onClick={handleDropdownClick('datenschutz')}
          >
            {translations?.datenschutz || 'Datenschutz'}
          </button>
          <button
            type="button"
            onClick={handleDropdownClick('agb')}
          >
            {translations?.agb || 'AGB'}
          </button>
          <button
            type="button"
            onClick={handleDropdownClick('kontakt')}
          >
            {translations?.kontakt || 'Kontakt'}
          </button>
        </div>
      )}
    </div>
  );
};

export default LegalLink;