import React, { useState, useEffect, useRef } from 'react';
import './AdComponent.css';

// 🎯 A-ADS CONFIGURATION
const A_ADS_CONFIG = {
  dataAa: '2406370',
  iframeSrc: '//acceptable.a-ads.com/2406370/?size=Adaptive&background_color=FF6B35',
  position: 'bottom', // 'bottom' oder 'top'
  backgroundColor: 'FF6B35', // Orange passend zu deinem Design
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
  const [stickyAdVisible, setStickyAdVisible] = useState(true);
  const adContainerRef = useRef(null);

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

  // 🚀 Load A-Ads Sticky Banner
  const loadAAdsSticky = () => {
    try {
      console.log(`🎯 Loading A-Ads Sticky Banner for question ${questionNumber}...`);
      
      // A-Ads iframe lädt automatisch
      setAdLoaded(true);
      console.log('✅ A-Ads Sticky Banner ready');
      
    } catch (error) {
      console.error('❌ A-Ads error:', error);
      setAdLoaded(true);
    }
  };

  // Close sticky ad handler
  const handleCloseStickyAd = () => {
    setStickyAdVisible(false);
    console.log('📊 Sticky ad closed by user');
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
      loadAAdsSticky();
    }, 300);

    // Cleanup
    return () => {
      clearInterval(timer);
      clearTimeout(adTimer);
    };
  }, []); // Keine Dependencies

  const handleSkip = () => {
    if (canSkip) {
      console.log(`📊 Ad completed - A-Ads Sticky, Question: ${questionNumber}, Language: ${language}`);
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
    <>
      {/* Main Ad Component Modal */}
      <div className="ad-component">
        <div className="ad-container" ref={adContainerRef}>
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
                  🎯 A-Ads Sticky | Lang: {language} | Expected CPM: {targetingInfo.expectedCPM}
                </small>
              </div>
            )}
          </div>

          <div className="ad-content">
            <div className="ad-placeholder">
              <div className="ad-banner">
                <p>🎯 {getAdText('adPlaceholder', 'Advertisement')}</p>
                
                {/* Info Container */}
                <div className="a-ads-info-container">
                  <div className="ad-icon">💼</div>
                  <div className="ad-text">
                    <h3>{getAdText('sponsoredContent', 'Sponsored Content')}</h3>
                    <p>{getAdText('stickyAdInfo', 'Ad banner appears at the bottom of your screen')}</p>
                  </div>
                </div>

                <div className="ad-disclaimer">
                  <small>Powered by A-Ads Network • Sticky Banner Active</small>
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

      {/* A-Ads Sticky Banner */}
      {stickyAdVisible && (
        <div className="aads-sticky-wrapper" style={{ position: 'absolute', zIndex: 99999 }}>
          <input 
            autoComplete="off" 
            type="checkbox" 
            id="aadsstickyme71ksrg" 
            hidden 
            onChange={handleCloseStickyAd}
          />
          <div style={{ paddingTop: 0, paddingBottom: 'auto' }}>
            <div className="aads-sticky-container">
              <label 
                htmlFor="aadsstickyme71ksrg" 
                className="aads-close-btn"
                onClick={handleCloseStickyAd}
              >
                <svg fill="#000000" height="16px" width="16px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 490 490">
                  <polygon points="456.851,0 245,212.564 33.149,0 0.708,32.337 212.669,245.004 0.708,457.678 33.149,490 245,277.443 456.851,490 489.292,457.678 277.331,245.004 489.292,32.337"/>
                </svg>
              </label>
              <div id="frame" className="aads-frame">
                <iframe 
                  data-aa={A_ADS_CONFIG.dataAa}
                  src={A_ADS_CONFIG.iframeSrc}
                  className="aads-iframe"
                  title="A-Ads Advertisement"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdComponent;