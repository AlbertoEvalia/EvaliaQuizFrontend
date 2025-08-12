// src/components/UpgradePrompt/UpgradePrompt.jsx
import React, { useState } from 'react';
import './UpgradePrompt.css';

const UpgradePrompt = ({
  onRegister,
  onClose,
  translations,
  isVisible,
  userScore = 0,
  totalQuestions = 20,
  userType = 'free' // NEU: 'free' | 'registered'
}) => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newsletterOptIn, setNewsletterOptIn] = useState(false); // 🆕 Newsletter Opt-in

  // Nur für Free Users anzeigen (Registered Users sehen kein UpgradePrompt)
  if (!isVisible || userType !== 'free') return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('https://evaliaquizbackend.onrender.com/api/auth/magic-link',  {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim(),
          newsletterOptIn: newsletterOptIn // 🆕 Newsletter Preference senden
        })
      });
      
      if (response.ok) {
        console.log('Magic link sent!');
        onRegister(email.trim()); // Existing function
      } else {
        console.error('Failed to send magic link');
      }
    } catch (error) {
      console.error('Network error:', error);
    }
    
    setIsSubmitting(false);
  };

  const getScoreMessage = () => {
    const percentage = (userScore / totalQuestions) * 100;
    if (percentage >= 80) return translations.excellentScore || "Excellent! You're a knowledge champion! 🏆";
    if (percentage >= 60) return translations.goodScore || "Great job! You know your stuff! 👏";
    return translations.keepLearning || "Keep learning and improving! 📚";
  };

  return (
    <div className="upgrade-prompt-overlay">
      <div className="upgrade-prompt">
        <button onClick={onClose} className="close-btn">×</button>
        
        <div className="upgrade-content">
          <div className="upgrade-header">
            <h2>{translations.upgradeTitle || "Join our Community!"}</h2>
            <p className="score-message">{getScoreMessage()}</p>
          </div>

          <div className="upgrade-benefits">
            <h3>{translations.upgradeSubtitle || "Register FREE to get:"}</h3>
            <ul>
              <li>
                <span className="benefit-icon">🚫</span>
                {translations.benefitFewerAds || "Fewer ads"}
              </li>
              <li>
                <span className="benefit-icon">📈</span>
                {translations.benefitProgressTracking || "Track your progress locally"}
              </li>
              <li>
                <span className="benefit-icon">💾</span>
                {translations.benefitSessionHistory || "Save your quiz history"}
              </li>
              <li>
                <span className="benefit-icon">🔔</span>
                {translations.benefitPremiumUpdates || "Get notified about Premium features"}
              </li>
              <li>
                <span className="benefit-icon">⚡</span>
                {translations.benefitEarlyAccess || "Early access to new features"}
              </li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="registration-form">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={translations.emailPlaceholder || "Enter your email"}
              required
              disabled={isSubmitting}
              className="email-input"
            />
            
            {/* 🆕 Newsletter Opt-in Checkbox */}
            <div className="newsletter-optin">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={newsletterOptIn}
                  onChange={(e) => setNewsletterOptIn(e.target.checked)}
                  className="newsletter-checkbox"
                />
                <span className="checkbox-text">
                  {translations.newsletterOptinLabel || "I would like to receive newsletters about new features and our upcoming Premium service"}
                </span>
              </label>
              <small className="newsletter-note">
                {translations.newsletterOptinRequired || "Newsletter subscription is optional but helps us keep you informed about important updates"}
              </small>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !email.trim()}
              className="register-btn"
            >
              {isSubmitting
                ? (translations.registering || "Registering...")
                : (translations.registerFree || "Register FREE")
              }
            </button>
          </form>

          <div className="upgrade-footer">
            <p className="privacy-note">
              {translations.privacyNote || "We respect your privacy. No spam, ever."}
            </p>
            <button onClick={onClose} className="maybe-later-btn">
              {translations.maybeLater || "Maybe later"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradePrompt;