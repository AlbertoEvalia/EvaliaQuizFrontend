import React, { useState, useEffect } from 'react';
import './AdComponent.css';

// 🎯 AD NETWORK KONFIGURATION - ADSTERRA DIRECT LINK (ZUVERLÄSSIG)
const ADSTERRA_ZONES = {
  // Direct Link - funktioniert IMMER
  directLink: "https://www.profitableratecpm.com/x7cacaya?key=9c1b093376fca84f315125d6dd3ca7fb"
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

  // 🎯 Direct Link Integration - EHRLICH & ZUVERLÄSSIG
  const handleDirectLinkClick = () => {
    // Track click für Analytics
    console.log(`📊 Direct link clicked - Question ${questionNumber}`);
    
    // Öffne Direct Link in neuem Tab
    window.open(ADSTERRA_ZONES.directLink, '_blank', 'noopener,noreferrer');
    
    // Continue Quiz nach Click
    setTimeout(() => {
      onAdComplete();
    }, 1000);
  };

  // 🚀 Simple & Reliable Loading
  const loadAdsterraAd = () => {
    try {
      console.log(`🎯 Loading Direct Link Ad for question ${questionNumber}...`);
      
      // Sofort als geladen markieren (kein Script nötig)
      setAdLoaded(true);
      console.log('✅ Direct Link ready - 100% reliable');
      
    } catch (error) {
      console.error('❌ Direct Link error:', error);
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
              
              {/* Direct Link Container - Ehrlich & Clean */}
              <div className="monetag-container">
                <div className="direct-link-content">
                  <div className="ad-icon">💼</div>
                  <div className="ad-text">
                    <h3>Gesponserte Angebote</h3>
                    <p>Interessante Deals und Angebote unserer Partner</p>
                  </div>
                </div>
                
                <button 
                  onClick={handleDirectLinkClick}
                  className="direct-link-button"
                >
                  Angebote ansehen →
                </button>
                
                <div className="ad-disclaimer">
                  <small>Gesponserte Inhalte • Adsterra Partner</small>
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