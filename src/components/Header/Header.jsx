import React from 'react';
import EvaliaLogo from '../../assets/evalia_logo.svg';
import './Header.css';

const Header = ({ currentIndex, questionCount, translations, language }) => {
  
  const getProgressText = () => {
    // Template strings für jede Sprache
    const templates = {
      en: `Question ${currentIndex + 1} of ${questionCount}`,
      de: `Frage ${currentIndex + 1} von ${questionCount}`,
      fr: `Question ${currentIndex + 1} sur ${questionCount}`,
      es: `Pregunta ${currentIndex + 1} de ${questionCount}`,
      it: `Domanda ${currentIndex + 1} di ${questionCount}`
    };
    
    return templates[language] || templates.en;
  };

  return (
    <div className="header-safe">
      <div className="header-top">
        <img src={EvaliaLogo} alt="EVALIA" className="header-logo-safe" />
        <div className="progress-info-safe">
          {getProgressText()}
        </div>
      </div>
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${((currentIndex + 1) / questionCount) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default Header;