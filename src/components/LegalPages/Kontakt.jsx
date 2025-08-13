// src/components/LegalPages/Kontakt.jsx
import React, { useState } from 'react';
import { getLegalTranslation } from '../../data/legalTranslations';
import { TRANSLATIONS } from '../../data/translations';

const Kontakt = ({ onBack, translations }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

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
  console.log('Kontakt - Final detected language:', language);

  // Body-Layout für Kontakt überschreiben
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Kontaktformular gesendet:', formData);
    
    // Übersetzter Alert-Text
    const alertTexts = {
      en: 'Thank you for your message! We will get back to you soon.',
      de: 'Vielen Dank für Ihre Nachricht! Wir werden uns bald bei Ihnen melden.',
      fr: 'Merci pour votre message! Nous vous répondrons bientôt.',
      es: 'Gracias por su mensaje! Nos pondremos en contacto con usted pronto.',
      it: 'Grazie per il suo messaggio! La contatteremo presto.'
    };
    
    alert(alertTexts[language] || alertTexts.de);
    
    // Form zurücksetzen
    setFormData({ name: '', email: '', message: '' });
  };

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
          {getLegalTranslation(language, 'backToQuiz')}
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
          {getLegalTranslation(language, 'kontaktTitle')}
        </h1>
        
        {/* CONTACT INFO SECTION */}
        <div style={{
          marginBottom: '40px',
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
            {getLegalTranslation(language, 'contactInfoHeading')}
          </h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#005B97', fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>
                📧 {getLegalTranslation(language, 'emailHeading')}
              </h3>
              <p style={{ color: '#005B97', fontSize: '16px', lineHeight: '1.6' }}>
                kontakt@evaliaquiz.com
              </p>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#005B97', fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>
                📞 {getLegalTranslation(language, 'phoneHeading')}
              </h3>
              <p style={{ color: '#005B97', fontSize: '16px', lineHeight: '1.6' }}>
                +49 170 967 0950
              </p>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <h3 style={{ color: '#005B97', fontSize: '20px', fontWeight: 'bold', marginBottom: '10px' }}>
                📍 {getLegalTranslation(language, 'addressHeading')}
              </h3>
              <p style={{ color: '#005B97', fontSize: '16px', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                EVAL(IA) - Alberto Sejas Knapp{'\n'}Einsteinstrasse 59{'\n'}DE71229, Leonberg{'\n'}Deutschland
              </p>
            </div>
          </div>
        </div>

        {/* CONTACT FORM SECTION */}
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
            {getLegalTranslation(language, 'contactFormHeading')}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label 
                htmlFor="name" 
                style={{ 
                  display: 'block', 
                  color: '#005B97', 
                  fontSize: '16px', 
                  fontWeight: 'bold', 
                  marginBottom: '8px' 
                }}
              >
                {getLegalTranslation(language, 'nameLabel')} *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #CCE0F4',
                  borderRadius: '4px',
                  fontSize: '16px',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  outline: 'none',
                  transition: 'border-color 0.3s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#0075BE'}
                onBlur={(e) => e.target.style.borderColor = '#CCE0F4'}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label 
                htmlFor="email" 
                style={{ 
                  display: 'block', 
                  color: '#005B97', 
                  fontSize: '16px', 
                  fontWeight: 'bold', 
                  marginBottom: '8px' 
                }}
              >
                {getLegalTranslation(language, 'emailLabel')} *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #CCE0F4',
                  borderRadius: '4px',
                  fontSize: '16px',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  outline: 'none',
                  transition: 'border-color 0.3s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#0075BE'}
                onBlur={(e) => e.target.style.borderColor = '#CCE0F4'}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label 
                htmlFor="message" 
                style={{ 
                  display: 'block', 
                  color: '#005B97', 
                  fontSize: '16px', 
                  fontWeight: 'bold', 
                  marginBottom: '8px' 
                }}
              >
                {getLegalTranslation(language, 'messageLabel')} *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #CCE0F4',
                  borderRadius: '4px',
                  fontSize: '16px',
                  fontFamily: 'Helvetica, Arial, sans-serif',
                  outline: 'none',
                  transition: 'border-color 0.3s ease',
                  resize: 'vertical',
                  minHeight: '120px',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#0075BE'}
                onBlur={(e) => e.target.style.borderColor = '#CCE0F4'}
              />
            </div>

            <button 
              type="submit"
              style={{
                backgroundColor: '#0075BE',
                color: 'white',
                padding: '15px 30px',
                fontSize: '16px',
                fontWeight: 'bold',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: 'Helvetica, Arial, sans-serif',
                transition: 'background-color 0.3s ease',
                width: '100%',
                boxSizing: 'border-box'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#005B97'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#0075BE'}
            >
              {getLegalTranslation(language, 'sendButton')}
            </button>
          </form>
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
           {getLegalTranslation(language, 'backToQuiz')}
        </button>
      </div>
    </div>
  );
};

export default Kontakt;