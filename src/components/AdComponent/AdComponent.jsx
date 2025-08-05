import React, { useState, useEffect } from 'react';
import './AdComponent.css';

const AdComponent = ({
  onAdComplete,
  onShowUpgrade,
  translations,
  questionNumber,
  totalQuestions,
  language,
  userType = 'free' // NEU: 'free' | 'registered'
}) => {
  const [countdown, setCountdown] = useState(5);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
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
    return () => clearInterval(timer);
  }, []);

  const handleSkip = () => {
    if (canSkip) {
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

  // Hilfsfunktion für Texte mit Platzhaltern
  const getTextWithPlaceholders = (key, fallback, placeholders = {}) => {
    let text = getAdText(key, fallback);
    Object.keys(placeholders).forEach(placeholder => {
      text = text.replace(`{${placeholder}}`, placeholders[placeholder]);
    });
    return text;
  };

  // Text basierend auf User-Type anpassen
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
        </div>

        <div className="ad-content">
  <div className="ad-placeholder">
    <div className="ad-banner">
      <p>🎯 {getAdText('adPlaceholder', 'Advertisement')}</p>
      
      {/* ECHTE ADSENSE ANZEIGE */}
      <div className="adsense-container">
        <ins 
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client="ca-pub-9116212347384007"
          data-ad-slot="9159178792"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>

      {/* Fallback für den Fall dass AdSense nicht lädt */}
      <div className="ad-fallback" style={{ marginTop: '10px', fontSize: '12px', color: '#888' }}>
        {getAdText('adLoadingText', 'Loading advertisement...')}
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