// src/components/LanguageSelector/LanguageSelector.jsx
import React from 'react';
import PropTypes from 'prop-types';
import EvaliaLogo from '../../assets/evalia_logo.svg';
import LegalLink from '../LegalLink/LegalLink';
import './LanguageSelector.css';

const LanguageSelector = ({
  selectedLanguage,
  onLanguageSelect,
  onStart,
  translations,
  showLegalLink = false,
  onNavigateToLegal,
  onTestUpgrade
}) => {
  const LANGUAGES = [
    { value: 'en', label: 'English' },
    { value: 'de', label: 'Deutsch' },
    { value: 'fr', label: 'Français' },
    { value: 'es', label: 'Español' },
    { value: 'it', label: 'Italiano' }
  ];

  const handleLanguageChange = (e) => {
    console.log('Sprache geändert:', e.target.value);
    onLanguageSelect(e.target.value);
  };

  const handleStartClick = () => {
    console.log('Start mit Sprache:', selectedLanguage);
    if (selectedLanguage) onStart();
  };

  return (
    <div className="app-container">
      <div className="language-container">
        <header className="evalia-header">
          <img
            src={EvaliaLogo}
            alt="EVALIA"
            style={{
              height: '60px',
              width: 'auto',
              marginBottom: '8px'
            }}
          />
          <p className="evalia-subtitle">
            {translations.subtitle || 'Test your knowledge'}
          </p>
        </header>

        <div className="form-container">
          <select
            className="language-select"
            value={selectedLanguage}
            onChange={handleLanguageChange}
            aria-label="Select language"
            autoFocus
          >
            <option value="" disabled>
              {translations.chooseLanguage || 'Choose language'}
            </option>
            {LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>

          <button
            onClick={onTestUpgrade}
            style={{
              margin: '10px',
              padding: '10px',
              background: 'red',
              color: 'white'
            }}
          >
            TEST REGISTRATION
          </button>

          <button
            className={`start-button ${!selectedLanguage ? 'disabled' : ''}`}
            onClick={handleStartClick}
            disabled={!selectedLanguage}
            aria-disabled={!selectedLanguage}
          >
            {translations.startButton || 'Start Quiz'}
          </button>

          {showLegalLink && onNavigateToLegal && (
            <LegalLink onNavigate={onNavigateToLegal} translations={translations} 
            userType={userType}        // ← NEU
            onLogout={handleLogout}   />
          )}
        </div>
      </div>
    </div>
  );
};

LanguageSelector.propTypes = {
  selectedLanguage: PropTypes.string.isRequired,
  onLanguageSelect: PropTypes.func.isRequired,
  onStart: PropTypes.func.isRequired,
  translations: PropTypes.shape({
    title: PropTypes.string,
    subtitle: PropTypes.string,
    chooseLanguage: PropTypes.string,
    startButton: PropTypes.string
  }).isRequired,
  showLegalLink: PropTypes.bool,
  onNavigateToLegal: PropTypes.func,
  onTestUpgrade: PropTypes.func
};

export default LanguageSelector;