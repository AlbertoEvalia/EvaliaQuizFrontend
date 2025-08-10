import React, { useState, useEffect, useRef } from 'react';
import './AdComponent.css';

// 🎯 AD NETWORK KONFIGURATION - MONETAG INTERSTITIAL
const MONETAG_ZONES = {
  interstitial: "9695605",        // Deine Monetag Interstitial Zone ID
  fallback: "9695447",            // Fallback Zone ID
  script_domain: "groleegni.net"  // Monetag Interstitial Domain
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
  const [adNetwork, setAdNetwork] = useState('monetag');
  const [adLoaded, setAdLoaded] = useState(false);
  const adRef = useRef(null);

  // 🎯 Geo + Language Detection für Smart Targeting
  const getAdTargetingInfo = () => {
    const geoLangMap = {
      'en': { geos: ['US', 'UK', 'CA', 'AU'], expectedCPM: '$3-6' },
      'de': { geos: ['DE', 'AT', 'CH'], expectedCPM: '$2-4' },
      'es': { geos: ['ES', 'MX', 'AR', 'CO', 'CL'], expectedCPM: '$1-3' },
      'fr': { geos: ['FR', 'BE', 'CH', 'CA'], expectedCPM: '$2-4' },
      'it': { geos: ['IT', 'CH'], expectedCPM: '$2-3' }
    };
    return geoLangMap[language] || geoLangMap['en'];
  };

  useEffect(() => {
    // Monetag verwenden
    setAdNetwork('monetag');
    console.log('🎯 Using Monetag for ads');
  }, [language]);

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

    // Load Interstitial nur einmal pro Mount
    if (!window.MonetagInterstitialLoaded) {
      loadAdScript();
    } else {
      setAdLoaded(true);
    }

    return () => {
      clearInterval(timer);
      // Kein DOM cleanup für Interstitials
    };
  }, []); // Dependency array leer - nur beim ersten Mount

  // 📱 Monetag Integration
  const loadMonetag = () => {
    if (window.MonetagInterstitialLoaded) {
      setAdLoaded(true);
      return;
    }

    try {
      if (!adRef.current) return;
      
      // Monetag Interstitial Script - sauberer als In-Page Push
      const script = document.createElement('script');
      script.innerHTML = `(function(d,z,s){s.src='https://'+d+'/401/'+z;try{(document.body||document.documentElement).appendChild(s)}catch(e){}})('${MONETAG_ZONES.script_domain}',${MONETAG_ZONES.interstitial},document.createElement('script'))`;
      
      document.head.appendChild(script);
      
      // Sauberer Placeholder für Interstitial
      const adContainer = adRef.current;
      adContainer.innerHTML = `
        <div style="background: #f0f8ff; border: 2px solid #0075BE; border-radius: 8px; padding: 20px; margin: 10px 0; text-align: center;">
          <h3 style="color: #0075BE; margin: 0 0 10px 0;">⚡ Monetag Interstitial</h3>
          <p style="color: #666; margin: 0;">Zone ID: ${MONETAG_ZONES.interstitial} | Loading ad...</p>
          <small style="color: #999;">Interstitial will appear automatically</small>
        </div>
      `;
      
      setAdLoaded(true);
      window.MonetagInterstitialLoaded = true;
      console.log('✅ Monetag Interstitial integration complete');
    } catch (error) {
      console.error('❌ Monetag Interstitial error:', error);
      setAdLoaded(true);
    }
  };

  const loadAdScript = () => {
    if (adNetwork === 'monetag') {
      loadMonetag();
    }
  };

  const cleanupAds = () => {
    // Kein DOM-Cleanup bei Monetag - das Script managed sich selbst
    setAdLoaded(false);
  };

  const handleSkip = () => {
    if (canSkip) {
      // Analytics für Ad Performance
      const targetingInfo = getAdTargetingInfo();
      console.log(`📊 Ad completed - Network: ${adNetwork}, Language: ${language}, Expected CPM: ${targetingInfo.expectedCPM}`);
      
      // Direkt weiter ohne DOM-Cleanup (Monetag managed sich selbst)
      onAdComplete();
    }
  };

  const handleUpgradeClick = () => {
    if (onShowUpgrade) {
      onShowUpgrade();
    }
  };

  // Fallback-Texte falls translations fehlen
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

  // Network Display Name für User
  const getNetworkDisplayName = () => {
    return 'Monetag';
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
          
          {/* Debug Info - nur in Development */}
          {process.env.NODE_ENV === 'development' && (
            <div className="ad-debug-info">
              <small style={{ color: '#888', fontSize: '11px' }}>
                🎯 Network: {getNetworkDisplayName()} | Lang: {language} | Expected CPM: {targetingInfo.expectedCPM}
              </small>
            </div>
          )}
        </div>

        <div className="ad-content">
          <div className="ad-placeholder">
            <div className="ad-banner">
              <p>🎯 {getAdText('adPlaceholder', 'Advertisement')}</p>
              
              {/* Monetag Ad Container */}
              <div 
                ref={adRef}
                className={`ad-network-container ${adNetwork}-container`}
                style={{ 
                  minHeight: '250px', 
                  width: '100%', 
                  textAlign: 'center',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '10px',
                  backgroundColor: '#f9f9f9'
                }}
              >
                {!adLoaded && (
                  <div className="ad-loading">
                    <div className="loading-spinner">⏳</div>
                    <p>{getAdText('adLoadingText', `Loading ${getNetworkDisplayName()} advertisement...`)}</p>
                  </div>
                )}
              </div>

              {/* Fallback Message */}
              {!adLoaded && (
                <div className="ad-fallback" style={{ marginTop: '10px', fontSize: '12px', color: '#888' }}>
                  <p>Powered by {getNetworkDisplayName()}</p>
                  <small>Revenue optimization for {language.toUpperCase()} users</small>
                </div>
              )}
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