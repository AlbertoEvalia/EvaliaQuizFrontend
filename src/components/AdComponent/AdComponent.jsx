import React, { useState, useEffect, useRef } from 'react';
import './AdComponent.css';

const A_ADS_CONFIG = {
  dataAa: '2406370',
  iframeSrc: '//acceptable.a-ads.com/2406370/?size=Adaptive&background_color=FF6B35',
  position: 'bottom',
  backgroundColor: 'FF6B35',
};

const WITTY_AD_TEXTS = [
  "Evalia wird durch Werbeeinnahmen finanziert. Du guckst, wir kassieren. Win-win!",
  "Evalia ist 100% kapitalistisch finanziert. Klick, konsumier, repeat.",
  "Evalia lebt von Werbung. Also iss, trink, rauch, kauf … was immer hier unten steht.",
  "Ohne Werbung wären wir nur ein leeres Quiz. Und du wärst viel produktiver.",
  "Das ist eine Werbeunterbrechung. Weil wir Miete zahlen müssen."
];

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
  const [wittyText, setWittyText] = useState('');
  const adContainerRef = useRef(null);

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * WITTY_AD_TEXTS.length);
    setWittyText(WITTY_AD_TEXTS[randomIndex]);
    
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

    const adTimer = setTimeout(() => {
      loadAAdsSticky();
    }, 300);

    return () => {
      clearInterval(timer);
      clearTimeout(adTimer);
    };
  }, []);

  const loadAAdsSticky = () => {
    try {
      console.log(`Loading A-Ads for question ${questionNumber}`);
      setAdLoaded(true);
    } catch (error) {
      console.error('A-Ads error:', error);
      setAdLoaded(true);
    }
  };

  const handleCloseStickyAd = () => {
    setStickyAdVisible(false);
  };

  const handleSkip = () => {
    if (canSkip) {
      onAdComplete();
    }
  };

  const handleUpgradeClick = () => {
    onShowUpgrade?.();
  };

  return (
    <>
      <div className="ad-component">
        <div className="ad-container" ref={adContainerRef}>
          <div className="ad-header">
            <h2>Kurze Werbepause</h2>
            <div className="progress-info">
              Frage {questionNumber} von {totalQuestions}
            </div>
          </div>

          <div className="ad-content">
            <div className="ad-placeholder">
              <div className="ad-info-minimal">
                <p>Powered by A-Ads Network — Sticky banner active</p>
              </div>

              <div className="ad-actions">
                <button 
                  onClick={handleSkip} 
                  className="action-btn continue-btn"
                  disabled={!canSkip}
                >
                  {!canSkip ? `Quiz fortsetzen (${countdown}s)` : 'Quiz fortsetzen'}
                </button>
                <button 
                  onClick={handleUpgradeClick} 
                  className="action-btn"
                >
                  Kostenlos registrieren
                </button>
              </div>

              <div className="witty-text-box">
                <div className="witty-text">
                  {wittyText}
                </div>
                {userType === 'free' && (
                  <div className="upgrade-hint-inline">
                    Weniger Werbung mit kostenloser Registrierung
                  </div>
                )}
              </div>

              {/* PFEIL NACH UNTEN */}
              <div className="arrow-down">
                <svg viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg">
                  <path d="M30 40L0 0H60L30 40Z" fill="currentColor"/>
                </svg>
              </div>
            </div>
          </div>

          <div className="ad-footer">
            {/* Footer-Inhalte bei Bedarf */}
          </div>
        </div>
      </div>

      {stickyAdVisible && (
        <div className="aads-sticky-wrapper">
          <input 
            type="checkbox" 
            id="aadsstickyme71ksrg" 
            hidden 
            onChange={handleCloseStickyAd}
          />
          <div>
            <div className="aads-sticky-container">
              <label 
                htmlFor="aadsstickyme71ksrg" 
                className="aads-close-btn"
              >
                <svg fill="#000000" height="16px" width="16px" viewBox="0 0 490 490">
                  <polygon points="456.851,0 245,212.564 33.149,0 0.708,32.337 212.669,245.004 0.708,457.678 33.149,490 245,277.443 456.851,490 489.292,457.678 277.331,245.004 489.292,32.337"/>
                </svg>
              </label>
              <div className="aads-frame">
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