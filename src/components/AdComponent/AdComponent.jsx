import React, { useState, useEffect, useRef } from 'react';
import './AdComponent.css';

// 🎯 AD NETWORK KONFIGURATION
const PROPELLERADS_ZONES = {
  banner: "YOUR_PROPELLER_BANNER_ZONE_ID",        // Hier deine PropellerAds Zone ID einfügen
  interstitial: "YOUR_PROPELLER_INTERSTITIAL_ID", // Für Vollbild-Ads
  popup: "YOUR_PROPELLER_POPUP_ID",               // Für Popup-Ads
  native: "YOUR_PROPELLER_NATIVE_ID"              // Für Native-Ads
};

const ADSTERRA_ZONES = {
  banner: "YOUR_ADSTERRA_BANNER_KEY",             // Hier deine Adsterra Key einfügen
  interstitial: "YOUR_ADSTERRA_INTERSTITIAL_KEY",// Für Vollbild-Ads
  popup: "YOUR_ADSTERRA_POPUP_KEY",               // Für Popup-Ads
  native: "YOUR_ADSTERRA_NATIVE_KEY"              // Für Native-Ads
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
  const [adNetwork, setAdNetwork] = useState('propellerads'); // 'propellerads' | 'adsterra'
  const [adLoaded, setAdLoaded] = useState(false);
  const adRef = useRef(null);

  // 🌍 Language-basierte Ad-Network-Auswahl für bessere Performance
  const selectOptimalAdNetwork = (lang) => {
    const networkPreferences = {
      'en': 'propellerads', // PropellerAds stark in EN-Märkten
      'de': 'adsterra',     // Adsterra stark in DE-Markt
      'es': 'propellerads', // PropellerAds stark in LATAM
      'fr': 'adsterra',     // Adsterra stark in FR-Markt
      'it': 'propellerads'  // PropellerAds für IT-Markt
    };
    return networkPreferences[lang] || 'propellerads';
  };

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

  // 🔄 A/B Testing zwischen Networks
  const shouldUseAlternativeNetwork = () => {
    // 30% Chance für das alternative Network zum Testing
    return Math.random() < 0.3;
  };

  useEffect(() => {
    // Smart Network Selection
    let selectedNetwork = selectOptimalAdNetwork(language);
    
    // A/B Testing
    if (shouldUseAlternativeNetwork()) {
      selectedNetwork = selectedNetwork === 'propellerads' ? 'adsterra' : 'propellerads';
      console.log(`🧪 A/B Test: Using alternative network ${selectedNetwork} for ${language}`);
    }
    
    setAdNetwork(selectedNetwork);
    console.log(`🎯 Selected ad network: ${selectedNetwork} for language: ${language}`);
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

  // 📱 PropellerAds Integration
  const loadPropellerAds = () => {
    if (window.PropellerAdsLoaded) {
      initializePropellerAd();
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://cdn.propellerads.com/script.js';
    script.onload = () => {
      window.PropellerAdsLoaded = true;
      initializePropellerAd();
    };
    script.onerror = () => {
      console.error('❌ PropellerAds script failed to load');
      setAdNetwork('adsterra'); // Fallback
    };
    document.head.appendChild(script);
  };

  const initializePropellerAd = () => {
    if (!adRef.current) return;

    try {
      const adContainer = adRef.current;
      adContainer.innerHTML = ''; // Clear previous ads

      // Create PropellerAds banner
      const adElement = document.createElement('div');
      adElement.id = `propeller-banner-${Date.now()}`;
      adElement.style.cssText = 'min-height: 250px; width: 100%; text-align: center;';
      
      // PropellerAds Banner Code
      const adScript = document.createElement('script');
      adScript.type = 'text/javascript';
      adScript.innerHTML = `
        (function(d, s, id) {
          var js, pjs = d.getElementsByTagName(s)[0];
          if (d.getElementById(id)) return;
          js = d.createElement(s); js.id = id;
          js.src = "//cdn.propellerads.com/script.js";
          js.async = true;
          js.onload = function() {
            if (window.PropellerAds) {
              PropellerAds.displayAd({
                zoneId: "${PROPELLERADS_ZONES.banner}",
                width: "auto",
                height: "auto",
                format: "banner"
              });
            }
          };
          pjs.parentNode.insertBefore(js, pjs);
        }(document, 'script', 'propeller-ads-sdk'));
      `;
      
      adElement.appendChild(adScript);
      adContainer.appendChild(adElement);
      setAdLoaded(true);
      console.log('✅ PropellerAds banner loaded with Zone ID:', PROPELLERADS_ZONES.banner);
    } catch (error) {
      console.error('❌ PropellerAds initialization error:', error);
      setAdNetwork('adsterra'); // Fallback
    }
  };

  // 🎯 Adsterra Integration
  const loadAdsterra = () => {
    if (window.AdsterraLoaded) {
      initializeAdsterraAd();
      return;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://a.exdynsrv.com/ads.js';
    script.onload = () => {
      window.AdsterraLoaded = true;
      initializeAdsterraAd();
    };
    script.onerror = () => {
      console.error('❌ Adsterra script failed to load');
      setAdNetwork('propellerads'); // Fallback
    };
    document.head.appendChild(script);
  };

  const initializeAdsterraAd = () => {
    if (!adRef.current) return;

    try {
      const adContainer = adRef.current;
      adContainer.innerHTML = ''; // Clear previous ads

      // Create Adsterra banner
      const adElement = document.createElement('div');
      adElement.style.cssText = 'min-height: 250px; width: 100%; text-align: center;';
      
      // Adsterra Banner Code
      const adScript = document.createElement('script');
      adScript.type = 'text/javascript';
      adScript.innerHTML = `
        atOptions = {
          'key' : '${ADSTERRA_ZONES.banner}',
          'format' : 'iframe',
          'height' : 250,
          'width' : 300,
          'params' : {}
        };
      `;
      
      const adScript2 = document.createElement('script');
      adScript2.type = 'text/javascript';
      adScript2.src = '//a.exdynsrv.com/ads.js';
      
      adElement.appendChild(adScript);
      adElement.appendChild(adScript2);
      adContainer.appendChild(adElement);
      setAdLoaded(true);
      console.log('✅ Adsterra banner loaded with Key:', ADSTERRA_ZONES.banner);
    } catch (error) {
      console.error('❌ Adsterra initialization error:', error);
      setAdNetwork('propellerads'); // Fallback
    }
  };

  const loadAdScript = () => {
    if (adNetwork === 'propellerads') {
      loadPropellerAds();
    } else if (adNetwork === 'adsterra') {
      loadAdsterra();
    }
  };

  const cleanupAds = () => {
    if (adRef.current) {
      adRef.current.innerHTML = '';
    }
    setAdLoaded(false);
  };

  const handleSkip = () => {
    if (canSkip) {
      // Analytics für Ad Performance
      const targetingInfo = getAdTargetingInfo();
      console.log(`📊 Ad completed - Network: ${adNetwork}, Language: ${language}, Expected CPM: ${targetingInfo.expectedCPM}`);
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
    return adNetwork === 'propellerads' ? 'PropellerAds' : 'Adsterra';
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
              
              {/* Multi-Network Ad Container */}
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