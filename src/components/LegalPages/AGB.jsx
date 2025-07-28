// src/components/LegalPages/AGB.jsx
import React from 'react';
import { getLegalTranslation } from '../../data/legalTranslations';
import { TRANSLATIONS } from '../../data/translations';

const AGB = ({ onBack, translations }) => {
  // Sprache aus translations ableiten durch Vergleich mit TRANSLATIONS
  const getCurrentLanguage = () => {
    // Vergleiche das übergebene translations Objekt mit den bekannten Übersetzungen
    for (const [langCode, langTranslations] of Object.entries(TRANSLATIONS)) {
      if (translations === langTranslations) {
        console.log('Language detected:', langCode);
        return langCode;
      }
    }
    
    // Fallback: Versuche über bestimmte Schlüssel zu erkennen
    console.log('Direct comparison failed, trying text comparison');
    
    if (translations?.startButton === 'Start Quiz') return 'en';
    if (translations?.startButton === 'Quiz starten') return 'de';
    if (translations?.startButton === 'Commencer le quiz') return 'fr';
    if (translations?.startButton === 'Iniciar Quiz') return 'es';
    if (translations?.startButton === 'Inizia Quiz') return 'it';
    
    console.log('Language detection failed, using fallback: de');
    return 'de';
  };

  const language = getCurrentLanguage();
  console.log('AGB - Final detected language:', language);
  
  // Body-Layout für AGB überschreiben
  React.useEffect(() => {
    document.body.style.display = 'block';
    document.body.style.alignItems = 'unset';
    document.body.style.justifyContent = 'unset';
    
    return () => {
      // Zurücksetzen beim Verlassen
      document.body.style.display = 'flex';
      document.body.style.alignItems = 'center';
      document.body.style.justifyContent = 'center';
    };
  }, []);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'white',
      overflow: 'auto',
      zIndex: 9999
    }}>
      {/* BUTTON OBEN */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 40px 0 40px' }}>
        <button 
          onClick={onBack}
          style={{
            backgroundColor: '#0075BE',
            color: 'white',
            padding: '15px 20px',
            fontSize: '18px',
            fontWeight: 'bold',
            width: '100%',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'Helvetica, Arial, sans-serif'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#005B97'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#0075BE'}
        >
          ← {getLegalTranslation(language, 'backToQuiz')}
        </button>
      </div>
      
      {/* INHALT */}
      <div style={{ 
        padding: '40px', 
        backgroundColor: 'white',
        color: '#005B97',
        fontFamily: 'Helvetica, Arial, sans-serif',
        textAlign: 'left',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <h1 style={{ 
          color: '#005B97', 
          fontSize: 'clamp(28px, 5vw, 44px)', 
          fontWeight: 'bold', 
          marginBottom: '40px',
          marginTop: '0',
          textAlign: 'left'
        }}>
          {getLegalTranslation(language, 'agbTitle')}
        </h1>
        
        <div style={{
          marginBottom: '30px',
          padding: '20px',
          background: 'rgba(204, 224, 244, 0.1)',
          borderLeft: '4px solid #0075BE',
          textAlign: 'left'
        }}>
          <h2 style={{ 
            color: '#005B97', 
            fontSize: '28px', 
            fontWeight: 'bold', 
            marginBottom: '20px',
            textAlign: 'left'
          }}>
            {getLegalTranslation(language, 'scopeHeading')}
          </h2>
          <p style={{ 
            color: '#005B97', 
            fontSize: '18px', 
            lineHeight: '1.6',
            textAlign: 'left'
          }}>
            {getLegalTranslation(language, 'scopeText')}
          </p>
        </div>

        <div style={{
          marginBottom: '30px',
          padding: '20px',
          background: 'rgba(204, 224, 244, 0.1)',
          borderLeft: '4px solid #0075BE',
          textAlign: 'left'
        }}>
          <h2 style={{ 
            color: '#005B97', 
            fontSize: '28px', 
            fontWeight: 'bold', 
            marginBottom: '20px',
            textAlign: 'left'
          }}>
            {getLegalTranslation(language, 'servicesHeading')}
          </h2>
          <p style={{ 
            color: '#005B97', 
            fontSize: '18px', 
            lineHeight: '1.6',
            textAlign: 'left'
          }}>
            {getLegalTranslation(language, 'servicesText')}
          </p>
        </div>

        <div style={{
          marginBottom: '30px',
          padding: '20px',
          background: 'rgba(204, 224, 244, 0.1)',
          borderLeft: '4px solid #0075BE',
          textAlign: 'left'
        }}>
          <h2 style={{ 
            color: '#005B97', 
            fontSize: '28px', 
            fontWeight: 'bold', 
            marginBottom: '20px',
            textAlign: 'left'
          }}>
            {getLegalTranslation(language, 'userObligationsHeading')}
          </h2>
          <p style={{ 
            color: '#005B97', 
            fontSize: '18px', 
            lineHeight: '1.6',
            textAlign: 'left'
          }}>
            {getLegalTranslation(language, 'userObligationsText')}
          </p>
        </div>

        <div style={{
          marginBottom: '30px',
          padding: '20px',
          background: 'rgba(204, 224, 244, 0.1)',
          borderLeft: '4px solid #0075BE',
          textAlign: 'left'
        }}>
          <h2 style={{ 
            color: '#005B97', 
            fontSize: '28px', 
            fontWeight: 'bold', 
            marginBottom: '20px',
            textAlign: 'left'
          }}>
            {getLegalTranslation(language, 'liabilityHeading')}
          </h2>
          <p style={{ 
            color: '#005B97', 
            fontSize: '18px', 
            lineHeight: '1.6',
            textAlign: 'left'
          }}>
            {getLegalTranslation(language, 'liabilityText')}
          </p>
        </div>

        <div style={{
          marginBottom: '30px',
          padding: '20px',
          background: 'rgba(204, 224, 244, 0.1)',
          borderLeft: '4px solid #0075BE',
          textAlign: 'left'
        }}>
          <h2 style={{ 
            color: '#005B97', 
            fontSize: '28px', 
            fontWeight: 'bold', 
            marginBottom: '20px',
            textAlign: 'left'
          }}>
            {getLegalTranslation(language, 'modificationHeading')}
          </h2>
          <p style={{ 
            color: '#005B97', 
            fontSize: '18px', 
            lineHeight: '1.6',
            textAlign: 'left'
          }}>
            {getLegalTranslation(language, 'modificationText')}
          </p>
        </div>

        <div style={{
          marginBottom: '30px',
          padding: '20px',
          background: 'rgba(204, 224, 244, 0.1)',
          borderLeft: '4px solid #0075BE',
          textAlign: 'left'
        }}>
          <h2 style={{ 
            color: '#005B97', 
            fontSize: '28px', 
            fontWeight: 'bold', 
            marginBottom: '20px',
            textAlign: 'left'
          }}>
            {getLegalTranslation(language, 'finalProvisionsHeading')}
          </h2>
          <p style={{ 
            color: '#005B97', 
            fontSize: '18px', 
            lineHeight: '1.6',
            textAlign: 'left'
          }}>
            {getLegalTranslation(language, 'finalProvisionsText')}
          </p>
        </div>
        
        {/* BUTTON UNTEN */}
        <button 
          onClick={onBack}
          style={{
            backgroundColor: '#0075BE',
            color: 'white',
            padding: '15px 20px',
            fontSize: '18px',
            fontWeight: 'bold',
            width: '100%',
            border: 'none',
            cursor: 'pointer',
            fontFamily: 'Helvetica, Arial, sans-serif',
            marginTop: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#005B97'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#0075BE'}
        >
          ← {getLegalTranslation(language, 'backToQuiz')}
        </button>
      </div>
    </div>
  );
};

export default AGB;