import React from 'react';
import './ErrorScreen.css';

const ErrorScreen = ({ connectionError, translations }) => (
  <div className="app-container">
    <div className="error-container">
      <h2>{translations.connectionError}</h2>
      <button 
        className="retry-button"
        onClick={() => window.location.reload()}
      >
        {translations.startButton}
      </button>
    </div>
  </div>
);

export default ErrorScreen;