import React, { useState, useEffect } from 'react';
import './AdComponent.css';

// 🎯 AD NETWORK KONFIGURATION - ADSTERRA MIX (OPTIMAL)
const ADSTERRA_ZONES = {
  // Banner für Frage 5 + 10 (user-freundlich)
  banner: {
    key: "727a12d85692a72c89847e0c843a42b6",
    domain: "www.highperformanceformat.com"
  },
  // Popunder für Frage 15 (höhere CPM)
  popunder: {
    id: "d81f122cbc264e70cf21d483aefef972",
    domain: "pl27393744.profitableratecpm.com"
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

  // 🚀 Adsterra Smart Mix - Banner + Popunder
  const loadAdsterraAd = () => {
    // Bestimme Ad-Typ basierend auf Frage-Position
    const isPopunderPosition = questionNumber === 15; // Nur bei Frage 15
    const adType = isPopunderPosition ? 'popunder' : 'banner';
    
    try {
      console.log(`🚀 Loading Adsterra ${adType} for question ${questionNumber}...`);
      
      if (adType === 'banner') {
        // Banner laden (300x250)
        loadAdsterraBanner();
      } else {
        // Popunder laden 
        loadAdsterraPopunder();
      }
      
    } catch (error) {
      console.error('❌ Adsterra integration error:', error);
      setAdLoaded(true);
    }
  };

  // Banner Integration
  const loadAdsterraBanner = () => {
    // Banner Options
    const script1 = document.createElement('script');
    script1.innerHTML = `
      atOptions = {
        'key' : '${ADSTERRA_ZONES.banner.key}',
        'format' : 'iframe',
        'height' : 250,
        'width' : 300,
        'params' : {}
      };
    `;
    document.head.appendChild(script1);

    // Banner Script
    const script2 = document.createElement('script');
    script2.type = 'text/javascript';
    script2.src = `//${ADSTERRA_ZONES.banner.domain}/${ADSTERRA_ZONES.banner.key}/invoke.js`;
    script2.async = true;
    
    script2.onload = () => {
      console.log('✅ Adsterra Banner loaded successfully');
      setAdLoaded(true);
    };

    script2.onerror = () => {
      console.error('❌ Adsterra Banner failed to load');
      setAdLoaded(true);
    };

    document.head.appendChild(script2);
    console.log('📤 Adsterra Banner injected (300x250)');
  };

  // Popunder Integration  
  const loadAdsterraPopunder = () => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = `//${ADSTERRA_ZONES.popunder.domain}/d8/1f/12/${ADSTERRA_ZONES.popunder.id}.js`;
    script.async = true;
    
    script.onload = () => {
      console.log('✅ Adsterra Popunder loaded successfully');
      setAdLoaded(true);
    };

    script.onerror = () => {
      console.error('❌ Adsterra Popunder failed to load');
      setAdLoaded(true);
    };

    document.head.appendChild(script);
    console.log('📤 Adsterra Popunder injected');
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
      const adType = questionNumber === 15 ? 'Popunder' : 'Banner';
      console.log(`📊 Ad completed - Adsterra ${adType}, Question: ${questionNumber}, Language: ${language}`);
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
                    <p>Loading {questionNumber === 15 ? 'Popunder' : 'Banner'}...</p>
                  </div>
                ) : (
                  <div className="ad-status">
                    <h3>🚀 Adsterra Ready</h3>
                    <p>Type: {questionNumber === 15 ? 'Popunder (High CPM)' : 'Banner (300x250)'}</p>
                    <small>Question {questionNumber} • Fast & reliable</small>
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