import React from 'react';
import './LoadingScreen.css';

const LoadingScreen = ({ isLoading, backendError, translations }) => (
  <div className="app-container">
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>{translations.loading}</p>
      {backendError && (
        <div className="backend-warning">
          {translations.backendWarning}
        </div>
      )}
    </div>
  </div>
);

export default LoadingScreen;