import React, { useState, useEffect } from 'react';
import './AdComponent.css';

// 🎯 AD NETWORK KONFIGURATION - MONETAG VIGNETTE BANNER
const MONETAG_ZONES = {
  vignette: "9695605", // Gleiche Zone ID für Vignette
  script_domain: "groleegni.net"
};

const AdComponent = ({
  onAdComplete,
  onShowUpgrade,
  translations,
  questionNumber,
  totalQuestions,
  language,
  userType = 'free'
}) => {
  const [countdown, setCountdown] = useState(5);
  const [canSkip, setCanSkip] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);

  // 🎯 Geo + Language Detection
  const getAdTargetingInfo = () => {
    const geoLangMap = {
      'en': { expectedCPM: '$3-6' },
      'de': { expectedCPM: '$2-4' },
      'es': { expectedCPM: '$1-3' },
      'fr': { expectedCPM: '$2-4' },
      'it': { expectedCPM: '$2-3' }
    };
    return geoLangMap[language] || geoLangMap['en'];
  };

  // 📱 Monetag Vignette Banner Integration - ZUVERLÄSSIGER
  const loadMonetagVignette = () => {
    // Verhindere mehrfaches Laden
    if (window.MonetagVignetteLoaded) {
      console.log('⚠️ Monetag Vignette already loaded, skipping...');
      setAdLoaded(true);
      return;
    }

    try {
      // Prüfe ob Script bereits existiert
      const existingScript = document.querySelector(`script[src*="${MONETAG_ZONES.script_domain}"]`);
      if (existingScript) {
        console.log('📝 Monetag script already exists');
        setAdLoaded(true);
        window.MonetagVignetteLoaded = true;
        return;
      }

      // Erstelle Script Element für Vignette Banner
      const script = document.createElement('script');
      script.src = `https://${MONETAG_ZONES.script_domain}/400/${MONETAG_ZONES.vignette}`;
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      
      // Event Listener für Script Load
      script.onload = () => {
        console.log('✅ Monetag Vignette script loaded successfully');
        setAdLoaded(true);
        window.MonetagVignetteLoaded = true;
        window.MonetagVignetteShown = true; // Flag für Timeout
        console.log('🎯 Vignette Banner ready - loads automatically on user interaction');
      };

      script.onerror = (error) => {
        console.error('❌ Monetag Vignette script failed to load:', error);
        setAdLoaded(true);
      };

      // Script zu Head hinzufügen
      document.head.appendChild(script);
      console.log('📤 Monetag Vignette script injected - Zone:', MONETAG_ZONES.vignette);
      
    } catch (error) {
      console.error('❌ Monetag Vignette integration error:', error);
      setAdLoaded(true);
    }
  };

  // EINMALIGER EFFECT 
  useEffect(() => {
    // Countdown Timer
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setCanSkip(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Ad laden nach kurzem Delay
    const adTimer = setTimeout(() => {
      loadMonetagVignette();
    }, 500);

    // TIMEOUT für langsame Ads - nach 8 Sekunden automatisch weiter (kürzer für Vignette)
    const adTimeout = setTimeout(() => {
      if (!window.MonetagVignetteShown) {
        console.log('⏰ Monetag Vignette timeout - proceeding without ad');
        setCanSkip(true);
      }
    }, 8000); // 8 Sekunden Timeout für Vignette

    // Cleanup
    return () => {
      clearInterval(timer);
      clearTimeout(adTimer);
      clearTimeout(adTimeout);
    };
  }, []); // Keine Dependencies

  const handleSkip = () => {
    if (canSkip) {
      const targetingInfo = getAdTargetingInfo();
      console.log(`📊 Ad completed - Monetag Vignette Banner, Language: ${language}, Expected CPM: ${targetingInfo.expectedCPM}`);
      onAdComplete();
    }
  };

  const handleUpgradeClick = () => {
    if (onShowUpgrade) {
      onShowUpgrade();
    }
  };

  // Fallback-Texte
  const getAdText = (key, fallback) => {
    return translations?.[key] || fallback;
  };

  const getTextWithPlaceholders = (key, fallback, placeholders = {}) => {
    let text = getAdText(key, fallback);
    Object.keys(placeholders).forEach(placeholder => {
      text = text.replace(`{${placeholder}}`, placeholders[placeholder]);
    });
    return text;
  };

  const getUpgradeHintText = () => {
    if (userType === 'registered') {
      return getAdText('registeredMessage', 'Thanks for being registered! 🎉');
    }
    return getAdText('registerFree', 'Register for free to reduce ads!');
  };

  const getAdTitle = () => {
    if (userType === 'registered') {
      return getAdText('shortBreak', 'Short Break');
    }
    return getAdText('adTitle', 'Quick Break');
  };

  const targetingInfo = getAdTargetingInfo();

  return (
    <div className="ad-component">
      <div className="ad-container">
        <div className="ad-header">
          <h2>{getAdTitle()}</h2>
          <div className="progress-info">
            {getTextWithPlaceholders(
              'progressInfo',
              `Question ${questionNumber} of ${totalQuestions}`,
              { questionNumber, totalQuestions }
            )}
          </div>
          
          {/* Debug Info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="ad-debug-info">
              <small style={{ color: '#888', fontSize: '11px' }}>
                🎯 Monetag Interstitial | Lang: {language} | Expected CPM: {targetingInfo.expectedCPM}
              </small>
            </div>
          )}
        </div>

        <div className="ad-content">
          <div className="ad-placeholder">
            <div className="ad-banner">
              <p>🎯 {getAdText('adPlaceholder', 'Advertisement')}</p>
              
              {/* Monetag Container - CLEAN DESIGN */}
              <div className="monetag-container">
                {!adLoaded ? (
                  <div className="ad-loading">
                    <div className="loading-spinner">🎯</div>
                    <p>Loading Vignette Banner...</p>
                  </div>
                ) : (
                  <div className="ad-status">
                    <h3>🎯 Vignette Banner Ready</h3>
                    <p>Zone ID: {MONETAG_ZONES.vignette}</p>
                    <small>Native banner will appear on user interaction</small>
                  </div>
                )}
              </div>

              {/* Fallback Message */}
              <div className="ad-footer-info">
                <p>Powered by Monetag</p>
                <small>Revenue optimization for {language.toUpperCase()} users</small>
              </div>
            </div>
          </div>
        </div>

        <div className="ad-footer">
          <div className="countdown">
            {!canSkip ? (
              <span className="countdown-text">
                {getTextWithPlaceholders(
                  'countdownText',
                  `Continue in ${countdown}s`,
                  { countdown }
                )}
              </span>
            ) : (
              <button onClick={handleSkip} className="continue-btn">
                {getAdText('continueQuiz', 'Continue Quiz')} →
              </button>
            )}
          </div>

          {/* Upgrade Hint - nur für Free Users */}
          {userType === 'free' && (
            <div className="upgrade-hint">
              <button onClick={handleUpgradeClick} className="upgrade-hint-btn">
                💡 {getUpgradeHintText()}
              </button>
            </div>
          )}

          {/* Thank you message für Registered Users */}
          {userType === 'registered' && (
            <div className="upgrade-hint">
              <div className="registered-message">
                🎉 {getUpgradeHintText()}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdComponent;