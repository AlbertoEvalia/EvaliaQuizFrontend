import React, { useState, useEffect, useRef } from 'react';
import './AdComponent.css';

// 🎯 AD NETWORK KONFIGURATION - MONETAG
const MONETAG_ZONES = {
  banner: "9695448",        // Deine Monetag In-Page Push Zone ID
  fallback: "9695447",      // Fallback Zone ID
  script_domain: "ileeckut.com"  // Monetag Script Domain
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

    // Load Ad Scripts
    loadAdScript();

    return () => {
      clearInterval(timer);
      cleanupAds();
    };
  }, [adNetwork]);

  // 📱 Monetag Integration
  const loadMonetag = () => {
    if (window.MonetagLoaded) {
      setAdLoaded(true);
      return;
    }

    try {
      if (!adRef.current) return;
      
      const adContainer = adRef.current;
      adContainer.innerHTML = ''; // Clear previous ads

      // Monetag Script
      const script = document.createElement('script');
      script.innerHTML = `(function(d,z,s,c){s.src='//'+d+'/400/'+z;s.onerror=s.onload=E;function E(){c&&c();c=null}try{(document.body||document.documentElement).appendChild(s)}catch(e){E()}})('${MONETAG_ZONES.script_domain}',${MONETAG_ZONES.banner},document.createElement('script'),function(){console.log('✅ Monetag loaded');});`;
      
      document.head.appendChild(script);
      
      // Ad Container
      const adElement = document.createElement('div');
      adElement.style.cssText = 'min-height: 250px; width: 100%; text-align: center; padding: 20px;';
      adElement.innerHTML = `
        <div style="background: #f0f8ff; border: 2px dashed #0075BE; border-radius: 8px; padding: 20px;">
          <h3 style="color: #0075BE; margin: 0 0 10px 0;">💡 Monetag In-Page Push</h3>
          <p style="color: #666; margin: 0;">Zone ID: ${MONETAG_ZONES.banner}</p>
          <small style="color: #999;">Ads will appear automatically</small>
        </div>
      `;
      
      adContainer.appendChild(adElement);
      setAdLoaded(true);
      window.MonetagLoaded = true;
      console.log('✅ Monetag integration complete');
    } catch (error) {
      console.error('❌ Monetag error:', error);
      setAdLoaded(true); // Prevent infinite loading
    }
  };

  const loadAdScript = () => {
    if (adNetwork === 'monetag') {
      loadMonetag();
    }
  };

  const cleanupAds = () => {
    try {
      if (adRef.current) {
        adRef.current.innerHTML = '';
      }
    } catch (error) {
      console.log('Cleanup completed');
    }
    setAdLoaded(false);
  };

  const handleSkip = () => {
    if (canSkip) {
      // Analytics für Ad Performance
      const targetingInfo = getAdTargetingInfo();
      console.log(`📊 Ad completed - Network: ${adNetwork}, Language: ${language}, Expected CPM: ${targetingInfo.expectedCPM}`);
      
      // Cleanup before continuing
      try {
        cleanupAds();
      } catch (error) {
        console.log('Cleanup during skip completed');
      }
      
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