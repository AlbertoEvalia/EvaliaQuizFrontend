import React, { useState, useEffect } from 'react';
import './AdComponent.css';

// 🎯 AD NETWORK KONFIGURATION - MONETAG INTERSTITIAL (OPTIMIERT)
const MONETAG_ZONES = {
  interstitial: "9695605", // Bewährte Zone für Interstitials
  script_domain: "groleegni.net" // Funktionierende Domain
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

  // ⚡ Monetag Interstitial Integration - FORCE RELOAD
  const loadMonetagInterstitial = () => {
    // AGGRESSIVE Reset - IMMER neu laden in Development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Development mode - forcing fresh load');
      delete window.MonetagInterstitialLoaded;
      delete window.MonetagInterstitialShown;
      
      // Entferne alte Scripts
      const oldScripts = document.querySelectorAll(`script[src*="${MONETAG_ZONES.script_domain}"]`);
      oldScripts.forEach(script => {
        console.log('🗑️ Removing old Monetag script');
        script.remove();
      });
    }
    
    // Verhindere mehrfaches Laden (nur in Production)
    if (window.MonetagInterstitialLoaded && process.env.NODE_ENV !== 'development') {
      console.log('⚠️ Monetag Interstitial already loaded, skipping...');
      setAdLoaded(true);
      return;
    }

    try {
      console.log('🚀 Starting Monetag Interstitial load (FRESH)...');
      
      // Original Monetag Methode - AUTOMATISCHER TRIGGER
      const script = document.createElement('script');
      script.innerHTML = `(function(d,z,s){s.src='https://'+d+'/401/'+z;try{(document.body||document.documentElement).appendChild(s)}catch(e){}})('${MONETAG_ZONES.script_domain}',${MONETAG_ZONES.interstitial},document.createElement('script'))`;
      
      // Script zu Head hinzufügen
      document.head.appendChild(script);
      
      // Sofort als geladen markieren
      setAdLoaded(true);
      window.MonetagInterstitialLoaded = true;
      window.MonetagInterstitialShown = true; // Assume success
      
      console.log('📤 Monetag Interstitial (Original Method) injected - Zone:', MONETAG_ZONES.interstitial);
      console.log('✅ Using automatic trigger - no API calls needed');
      
    } catch (error) {
      console.error('❌ Monetag Interstitial integration error:', error);
      setAdLoaded(true);
      window.MonetagInterstitialLoaded = false;
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
      loadMonetagInterstitial();
    }, 300);

    // TIMEOUT optimiert - nur 4 Sekunden!
    const adTimeout = setTimeout(() => {
      if (!window.MonetagInterstitialShown) {
        console.log('⏰ Monetag Interstitial timeout (4s) - proceeding without ad');
        setCanSkip(true);
      }
    }, 4000); // NUR 4 Sekunden Timeout!

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
      console.log(`📊 Ad completed - Monetag Interstitial (Optimiert), Language: ${language}, Expected CPM: ${targetingInfo.expectedCPM}`);
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
                    <div className="loading-spinner">⚡</div>
                    <p>Loading Interstitial...</p>
                  </div>
                ) : (
                  <div className="ad-status">
                    <h3>⚡ Interstitial Ready</h3>
                    <p>Zone ID: {MONETAG_ZONES.interstitial}</p>
                    <small>Ad will appear automatically</small>
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