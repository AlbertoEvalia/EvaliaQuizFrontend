// src/components/LegalLink/LegalLink.jsx
import React, { useState } from 'react';
import './LegalLink.css';

const LegalLink = ({ 
  onNavigate, 
  translations, 
  userType, 
  onLogout,
  onRegister  // 🆕 NEU - aber optional!
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleLegalClick = (page) => {
    setShowMenu(false);
    onNavigate(page);
  };

  const handleToggleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleDropdownClick = (page) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleLegalClick(page);
  };

  const handleLogoutClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);
    onLogout();
  };

  // 🆕 NEU - Register Handler
  const handleRegisterClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu(false);
    if (onRegister) {
      onRegister();
    }
  };

  return (
    <div className="legal-link-container">
      <button
        type="button"
        className="legal-hamburger"
        onClick={handleToggleClick}
        aria-label="Menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {showMenu && (
        <div className="legal-dropdown">
          {/* 🆕 Register Button - nur wenn free UND onRegister verfügbar */}
          {userType === 'free' && onRegister && (
            <>
              <button
                type="button"
                className="register-button"
                onClick={handleRegisterClick}
              >
                 {translations?.register || 'Register'}
              </button>
              <div className="dropdown-divider"></div>
            </>
          )}

          {/* Logout Button - nur wenn registriert */}
          {(userType === 'registered' || userType === 'pending') && (
            <>
              <button
                type="button"
                className="logout-button"
                onClick={handleLogoutClick}
              >
                {translations?.logout || 'Logout'}
              </button>
              <div className="dropdown-divider"></div>
            </>
          )}

          {/* Legal Links - unverändert */}
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