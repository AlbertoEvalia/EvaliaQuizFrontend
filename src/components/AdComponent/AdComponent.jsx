import React, { useState, useEffect } from 'react';
import './AdComponent.css';

// 🎯 AD NETWORK KONFIGURATION - MONETAG INTERSTITIAL
const MONETAG_ZONES = {
  interstitial: "9695605",
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

  // 📱 Monetag Integration - KOMPLETT ISOLIERT
  const loadMonetagInterstitial = () => {
    // Verhindere mehrfaches Laden
    if (window.MonetagInterstitialActive) {
      setAdLoaded(true);
      return;
    }

    try {
      // Sauberer Script-Load
      const script = document.createElement('script');
      script.innerHTML = `(function(d,z,s){s.src='https://'+d+'/401/'+z;try{(document.body||document.documentElement).appendChild(s)}catch(e){}})('${MONETAG_ZONES.script_domain}',${MONETAG_ZONES.interstitial},document.createElement('script'))`;
      
      document.head.appendChild(script);
      
      setAdLoaded(true);
      window.MonetagInterstitialActive = true;
      console.log('✅ Monetag Interstitial loaded - Zone:', MONETAG_ZONES.interstitial);
    } catch (error) {
      console.error('❌ Monetag error:', error);
      setAdLoaded(true);
    }
  };

  // EINMALIGER EFFECT - kein Cleanup, kein DOM-Handling
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
    loadMonetagInterstitial();

    // Nur Timer cleanup
    return () => {
      clearInterval(timer);
    };
  }, []); // Keine Dependencies

  const handleSkip = () => {
    if (canSkip) {
      const targetingInfo = getAdTargetingInfo();
      console.log(`📊 Ad completed - Monetag Interstitial, Language: ${language}, Expected CPM: ${targetingInfo.expectedCPM}`);
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
              
              {/* Statischer Monetag Container */}
              <div style={{ 
                minHeight: '250px', 
                width: '100%', 
                textAlign: 'center',
                border: '2px solid #0075BE',
                borderRadius: '8px',
                padding: '20px',
                margin: '10px 0',
                background: 'linear-gradient(135deg, #f0f8ff 0%, #e6f3ff 100%)'
              }}>
                {!adLoaded ? (
                  <div className="ad-loading">
                    <div className="loading-spinner">⚡</div>
                    <p>Loading Monetag Interstitial...</p>
                  </div>
                ) : (
                  <div>
                    <h3 style={{ color: '#0075BE', margin: '0 0 10px 0' }}>⚡ Monetag Interstitial Active</h3>
                    <p style={{ color: '#666', margin: '0' }}>Zone ID: {MONETAG_ZONES.interstitial}</p>
                    <small style={{ color: '#999' }}>Interstitial ads will appear automatically</small>
                  </div>
                )}
              </div>

              {/* Fallback Message */}
              <div style={{ marginTop: '10px', fontSize: '12px', color: '#888' }}>
                <p>Powered by Monetag</p>
                <small>Revenue optimization for {language.toUpperCase()} users</small>
              </div>
            </div>
          </div>
        </div>

        <div className="ad-footer">
          <div className="countdown">
            {!canSkip ? (
              <span>
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