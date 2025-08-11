import React, { useState, useEffect } from 'react';
import './AdComponent.css';

// 🎯 AD NETWORK KONFIGURATION - ADSTERRA NATIVE BANNER (OPTIMAL)
const ADSTERRA_ZONES = {
  // Native Banner - echte Ad-Daten + AdBlock Bypass
  nativeBanner: {
    scriptId: "66ab811edaaaf94d149b2215a8fac2f2",
    containerId: "container-66ab811edaaaf94d149b2215a8fac2f2",
    domain: "pl27394166.profitableratecpm.com"
  }
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

  // 🎯 Native Banner Integration - Force Fresh Load
  const loadAdsterraNativeBanner = () => {
    try {
      console.log(`🎯 Loading Native Banner for question ${questionNumber}...`);
      
      // Immer Container leeren
      const container = document.getElementById(ADSTERRA_ZONES.nativeBanner.containerId);
      if (container) {
        container.innerHTML = '';
        console.log('🧹 Container cleared for fresh ads');
      }
      
      // FORCE: Altes Script komplett entfernen
      const existingScript = document.querySelector(`script[src*="${ADSTERRA_ZONES.nativeBanner.scriptId}"]`);
      if (existingScript) {
        console.log('🗑️ Removing old script for fresh reload');
        existingScript.remove();
        
        // Cleanup window objects
        try {
          delete window.atAsyncOptions;
        } catch (e) {}
      }
      
      // IMMER neues Script erstellen
      const script = document.createElement('script');
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = `//${ADSTERRA_ZONES.nativeBanner.domain}/${ADSTERRA_ZONES.nativeBanner.scriptId}/invoke.js?q=${questionNumber}&t=${Date.now()}`;
      
      script.onload = () => {
        console.log(`✅ Native Banner script loaded successfully for question ${questionNumber}`);
        setAdLoaded(true);
      };

      script.onerror = () => {
        console.error(`❌ Native Banner script failed to load for question ${questionNumber}`);
        setAdLoaded(true);
      };

      // Script zu Head hinzufügen
      document.head.appendChild(script);
      console.log(`📤 Fresh Native Banner script injected for question ${questionNumber}`);
      
    } catch (error) {
      console.error('❌ Native Banner integration error:', error);
      setAdLoaded(true);
    }
  };

  // 🚀 Smart Ad Loading
  const loadAdsterraAd = () => {
    loadAdsterraNativeBanner();
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

    // Ad laden
    const adTimer = setTimeout(() => {
      loadAdsterraAd();
    }, 300);

    // TIMEOUT - 3 Sekunden
    const adTimeout = setTimeout(() => {
      console.log('⏰ Adsterra timeout (3s) - proceeding');
      setCanSkip(true);
    }, 3000);

    // Cleanup
    return () => {
      clearInterval(timer);
      clearTimeout(adTimer);
      clearTimeout(adTimeout);
    };
  }, []); // Keine Dependencies

  const handleSkip = () => {
    if (canSkip) {
      console.log(`📊 Ad completed - Native Direct Link, Question: ${questionNumber}, Language: ${language}`);
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
              
              {/* Native Banner Container - Real Ad Content */}
              <div className="monetag-container">
                <div className="native-banner-wrapper">
                  {/* Original Container ID - Adsterra erwartet diese exakte ID */}
                  <div 
                    id={ADSTERRA_ZONES.nativeBanner.containerId}
                    className="adsterra-native-container"
                    key={`native-ad-${questionNumber}`}
                  ></div>
                  
                  {!adLoaded && (
                    <div className="ad-loading-overlay">
                      <div className="loading-spinner">🎯</div>
                      <p>Loading Native Ad...</p>
                    </div>
                  )}
                </div>
                
                <div className="ad-disclaimer">
                  <small>Gesponserte Inhalte</small>
                </div>
              </div>

              {/* Fallback Message */}
              <div className="ad-footer-info" style={{ display: 'none' }}>
                {/* Powered by Text entfernt */}
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