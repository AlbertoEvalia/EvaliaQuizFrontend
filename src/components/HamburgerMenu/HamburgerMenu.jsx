// src/components/HamburgerMenu/HamburgerMenu.jsx
import React, { useState } from 'react';
import './HamburgerMenu.css';

const HamburgerMenu = ({ onNavigate, translations, userType, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLegalClick = (page) => {
    setIsOpen(false); // Menü schließen
    onNavigate(page);
  };

  const handleLogoutClick = () => {
    setIsOpen(false); // Menü schließen
    onLogout();
  };

  return (
    <>
      {/* Hamburger Button */}
      <button
        className={`hamburger-button ${isOpen ? 'active' : ''}`}
        onClick={toggleMenu}
        aria-label="Menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div className="hamburger-overlay" onClick={toggleMenu}></div>
      )}

      {/* Slide-out Menu */}
      <div className={`hamburger-menu ${isOpen ? 'open' : ''}`}>
        <div className="menu-header">
          <h3>EVALIA</h3>
        </div>
        
        <nav className="menu-content">
          {/* User Status Section */}
          {userType === 'registered' && (
            <div className="menu-section">
              <h4>{translations?.account || 'Account'}</h4>
              <p className="user-status">✅ {translations?.loggedIn || 'Logged in'}</p>
              <button 
                className="logout-button"
                onClick={handleLogoutClick}
              >
                🚪 {translations?.logout || 'Logout'}
              </button>
            </div>
          )}

          <div className="menu-section">
            <h4>{translations?.legal || 'Legal'}</h4>
            <button onClick={() => handleLegalClick('impressum')}>
              {translations?.impressum || 'Impressum'}
            </button>
            <button onClick={() => handleLegalClick('datenschutz')}>
              {translations?.privacy || 'Datenschutz'}
            </button>
            <button onClick={() => handleLegalClick('agb')}>
              {translations?.terms || 'AGB'}
            </button>
            <button onClick={() => handleLegalClick('kontakt')}>
              {translations?.contact || 'Kontakt'}
            </button>
          </div>

          <div className="menu-section">
            <h4>{translations?.about || 'About'}</h4>
            <p className="menu-description">
              {translations?.aboutText || 'EVALIA - Your trusted source for honest product reviews and comparisons.'}
            </p>
          </div>

          <div className="menu-footer">
            <p>&copy; 2025 EVALIA</p>
            <p>info@evalia.de</p>
          </div>
        </nav>
      </div>
    </>
  );
};

export default HamburgerMenu;