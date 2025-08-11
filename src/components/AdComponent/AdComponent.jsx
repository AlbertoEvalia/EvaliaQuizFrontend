import React, { useState, useEffect } from 'react';
import './AdComponent.css';

// 🎯 AD NETWORK KONFIGURATION - ADSTERRA NATIVE (OPTIMAL)
const ADSTERRA_ZONES = {
  // Banner für Frage 5 + 10 (user-freundlich)
  banner: {
    key: "727a12d85692a72c89847e0c843a42b6",
    domain: "www.highperformanceformat.com"
  },
  // Direct Link für alle Positionen (native integration)
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

  // 🎯 Native Ad Integration - Clean & Elegant
  const handleNativeAdClick = () => {
    // Track click für Analytics
    console.log('📊 Native ad clicked - Direct Link');
    
    // Öffne Direct Link in neuem Tab
    window.open(ADSTERRA_ZONES.directLink, '_blank', 'noopener,noreferrer');
    
    // Optional: Continue Quiz automatisch nach Click
    setTimeout(() => {
      onAdComplete();
    }, 1000);
  };

  // 🚀 Adsterra Smart System - Native First
  const loadAdsterraAd = () => {
    try {
      console.log(`🎯 Loading Native Ad for question ${questionNumber}...`);
      
      // Sofort als geladen markieren (kein Script nötig für Direct Link)
      setAdLoaded(true);
      console.log('✅ Native Ad ready - Direct Link integration');
      
    } catch (error) {
      console.error('❌ Native Ad error:', error);
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
              
              {/* Native Ad Container - Elegant Integration */}
              <div className="monetag-container">
                <div className="native-ad-content">
                  <div className="ad-icon">📚</div>
                  <div className="ad-text">
                    <h3>Verbessere deine Fähigkeiten!</h3>
                    <p>Entdecke effektive Lernmethoden und erweitere dein Wissen</p>
                  </div>
                </div>
                
                <button 
                  onClick={handleNativeAdClick}
                  className="native-ad-button"
                >
                  Mehr erfahren →
                </button>
                
                <div className="ad-disclaimer">
                  <small>Gesponserte Inhalte</small>
                </div>
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