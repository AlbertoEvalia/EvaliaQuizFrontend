import React, { useState, useEffect } from 'react';
import './AdComponent.css';

// 🎯 AD NETWORK KONFIGURATION - ADSTERRA (ZUVERLÄSSIG)
const ADSTERRA_ZONES = {
  interstitial: "d81f122cbc264e70cf21d483aefef972", // Adsterra Zone ID
  script_domain: "pl27393744.profitableratecpm.com" // Adsterra Domain
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

  // 🚀 Adsterra Interstitial Integration - FUNKTIONIERT GARANTIERT
  const loadAdsterraInterstitial = () => {
    try {
      console.log('🚀 Starting Adsterra Interstitial load...');
      
      // Adsterra Script - ORIGINAL METHODE
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `//${ADSTERRA_ZONES.script_domain}/d8/1f/12/${ADSTERRA_ZONES.interstitial}.js`;
      script.async = true;
      
      // Event Listener
      script.onload = () => {
        console.log('✅ Adsterra Interstitial loaded successfully');
        setAdLoaded(true);
        console.log('🎯 Adsterra ads will appear automatically');
      };

      script.onerror = (error) => {
        console.error('❌ Adsterra script failed to load:', error);
        setAdLoaded(true);
      };

      // Script zu Head hinzufügen
      document.head.appendChild(script);
      console.log('📤 Adsterra script injected - Zone:', ADSTERRA_ZONES.interstitial);
      
    } catch (error) {
      console.error('❌ Adsterra integration error:', error);
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

    // Ad laden
    const adTimer = setTimeout(() => {
      loadAdsterraInterstitial();
    }, 300);

    // TIMEOUT - nur 3 Sekunden (Adsterra ist schnell!)
    const adTimeout = setTimeout(() => {
      console.log('⏰ Adsterra timeout (3s) - proceeding');
      setCanSkip(true);
    }, 3000); // Nur 3 Sekunden - Adsterra ist viel schneller!

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
      console.log(`📊 Ad completed - Adsterra Interstitial, Language: ${language}, Expected CPM: ${targetingInfo.expectedCPM}`);
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
              
              {/* Adsterra Container */}
              <div className="monetag-container">
                {!adLoaded ? (
                  <div className="ad-loading">
                    <div className="loading-spinner">🚀</div>
                    <p>Loading Adsterra...</p>
                  </div>
                ) : (
                  <div className="ad-status">
                    <h3>🚀 Adsterra Ready</h3>
                    <p>Zone ID: {ADSTERRA_ZONES.interstitial}</p>
                    <small>Fast & reliable ads</small>
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