// src/components/LegalPages/CookieBanner.jsx
import React, { useState, useEffect } from 'react';
import './CookieBanner.css';

const CookieBanner = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem('cookieConsent', JSON.stringify({
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString()
    }));
    setShowBanner(false);
    // Hier würden Sie die entsprechenden Scripts laden
    loadAnalytics();
    loadMarketing();
  };

  const acceptNecessary = () => {
    localStorage.setItem('cookieConsent', JSON.stringify({
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString()
    }));
    setShowBanner(false);
  };

  const saveSettings = (settings) => {
    localStorage.setItem('cookieConsent', JSON.stringify({
      ...settings,
      timestamp: new Date().toISOString()
    }));
    setShowBanner(false);
    setShowSettings(false);
    
    if (settings.analytics) loadAnalytics();
    if (settings.marketing) loadMarketing();
  };

  const loadAnalytics = () => {
    // Google Analytics laden
    console.log('Loading Google Analytics...');
  };

  const loadMarketing = () => {
    // AdSense und Marketing Scripts laden
    console.log('Loading Marketing Scripts...');
  };

  if (!showBanner) return null;

  return (
    <>
      <div className="cookie-banner">
        <div className="cookie-content">
          <div className="cookie-text">
            <h3>🍪 Cookie-Einstellungen</h3>
            <p>
              Wir verwenden Cookies, um Ihnen die bestmögliche Nutzung unserer Website zu ermöglichen. 
              Einige sind technisch notwendig, andere helfen uns, die Website zu verbessern und Ihnen 
              personalisierte Werbung anzuzeigen.
            </p>
          </div>
          <div className="cookie-buttons">
            <button 
              className="btn-settings"
              onClick={() => setShowSettings(true)}
            >
              Einstellungen
            </button>
            <button 
              className="btn-necessary"
              onClick={acceptNecessary}
            >
              Nur Notwendige
            </button>
            <button 
              className="btn-accept"
              onClick={acceptAll}
            >
              Alle akzeptieren
            </button>
          </div>
        </div>
      </div>

      {showSettings && (
        <CookieSettings 
          onSave={saveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </>
  );
};

const CookieSettings = ({ onSave, onClose }) => {
  const [settings, setSettings] = useState({
    necessary: true,
    analytics: false,
    marketing: false
  });

  const handleSave = () => {
    onSave(settings);
  };

  return (
    <div className="cookie-overlay">
      <div className="cookie-modal">
        <div className="cookie-modal-header">
          <h2>Cookie-Einstellungen</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="cookie-modal-body">
          <div className="cookie-category">
            <div className="cookie-category-header">
              <h3>Notwendige Cookies</h3>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.necessary}
                  disabled
                />
                <span className="slider"></span>
              </label>
            </div>
            <p>Diese Cookies sind für das Funktionieren der Website erforderlich.</p>
          </div>

          <div className="cookie-category">
            <div className="cookie-category-header">
              <h3>Analyse-Cookies</h3>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.analytics}
                  onChange={(e) => setSettings({...settings, analytics: e.target.checked})}
                />
                <span className="slider"></span>
              </label>
            </div>
            <p>Google Analytics zur Verbesserung der Website-Performance.</p>
          </div>

          <div className="cookie-category">
            <div className="cookie-category-header">
              <h3>Marketing-Cookies</h3>
              <label className="toggle-switch">
                <input 
                  type="checkbox" 
                  checked={settings.marketing}
                  onChange={(e) => setSettings({...settings, marketing: e.target.checked})}
                />
                <span className="slider"></span>
              </label>
            </div>
            <p>Google AdSense für personalisierte Werbung.</p>
          </div>
        </div>

        <div className="cookie-modal-footer">
          <button className="btn-cancel" onClick={onClose}>Abbrechen</button>
          <button className="btn-save" onClick={handleSave}>Speichern</button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;