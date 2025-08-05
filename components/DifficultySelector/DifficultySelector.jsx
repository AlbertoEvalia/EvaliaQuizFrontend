import React, { useState } from 'react';
import EvaliaLogo from '../../assets/evalia_logo.svg';
import LegalLink from '../LegalLink/LegalLink';
import './DifficultySelector.css';

const DifficultySelector = ({
  onSelect,
  translations,
  showLegalLink = false,
  onNavigateToLegal,
  userType = 'free' // NEU: 'free', 'registered', 'premium'
}) => {
  const [showFullText, setShowFullText] = useState(false);

  const handleClick = (count) => {
    // Premium-Features blockieren für Free/Registered Users
    if ((count === 50 || count === 100) && userType !== 'premium') {
      console.log(`Premium feature blocked: ${count} questions require premium account`);
      // TODO: Hier könnte ein Upgrade-Modal gezeigt werden
      return;
    }
    
    console.log("Schwierigkeit gewählt:", count);
    onSelect(count);
  };

  // Prüfen ob Button verfügbar ist
  const isButtonAvailable = (count) => {
    if (count === 20) return true; // 20 Fragen immer verfügbar
    return userType === 'premium'; // 50/100 nur für Premium
  };

  // Button-Klassen bestimmen
  const getButtonClass = (count) => {
    const baseClass = "difficulty-button";
    if (!isButtonAvailable(count)) {
      return `${baseClass} difficulty-button-disabled`;
    }
    return baseClass;
  };

  // Premium-Label für deaktivierte Buttons
  const getPremiumLabel = (count) => {
    if (!isButtonAvailable(count)) {
      return " 🔒 Premium";
    }
    return "";
  };

  // Texto corto (primeras ~150 caracteres)
  const getShortText = (fullText) => {
    if (!fullText) return '';
    const words = fullText.split(' ');
    let shortText = '';
    for (let word of words) {
      if ((shortText + word).length > 150) break;
      shortText += (shortText ? ' ' : '') + word;
    }
    return shortText;
  };

  const shortText = getShortText(translations.introText);
  const hasMore = translations.introText && translations.introText.length > shortText.length;

  return (
    <div className="app-container">
      <div className="difficulty-container">
        <div className="evalia-header">
          <img
            src={EvaliaLogo}
            alt="EVALIA"
            style={{
              height: '60px',
              width: 'auto',
              marginBottom: '16px'
            }}
          />
          <p className="evalia-subtitle">{translations.subtitle}</p>
        </div>

        <div className="difficulty-content">
          <div className="intro-text">
            {showFullText ? (
              <>
                {translations.introText}
                <br />
                <button
                  className="text-toggle-button"
                  onClick={() => setShowFullText(false)}
                >
                  {translations.showLess || "... weniger"}
                </button>
              </>
            ) : (
              <>
                {shortText}
                {hasMore && (
                  <>
                    ...
                    <br />
                    <button
                      className="text-toggle-button"
                      onClick={() => setShowFullText(true)}
                    >
                      {translations.showMore || "mehr ..."}
                    </button>
                  </>
                )}
              </>
            )}
          </div>

          {/* 20 Fragen - Immer verfügbar */}
          <button
            className={getButtonClass(20)}
            onClick={() => handleClick(20)}
          >
            {translations.difficulty20}
          </button>

          {/* 50 Fragen - Nur Premium */}
          <button
            className={getButtonClass(50)}
            onClick={() => handleClick(50)}
            disabled={!isButtonAvailable(50)}
            title={!isButtonAvailable(50) ? "Premium feature - upgrade to unlock" : ""}
          >
            {translations.difficulty50}{getPremiumLabel(50)}
          </button>

          {/* 100 Fragen - Nur Premium */}
          <button
            className={getButtonClass(100)}
            onClick={() => handleClick(100)}
            disabled={!isButtonAvailable(100)}
            title={!isButtonAvailable(100) ? "Premium feature - upgrade to unlock" : ""}
          >
            {translations.difficulty100}{getPremiumLabel(100)}
          </button>

          {/* Legal Link */}
          {showLegalLink && onNavigateToLegal && (
            <LegalLink onNavigate={onNavigateToLegal} translations={translations} />
          )}
        </div>
      </div>
    </div>
  );
};

export default DifficultySelector;