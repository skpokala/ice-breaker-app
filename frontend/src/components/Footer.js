import React from 'react';
import { useVersion } from '../hooks/useVersion';

const Footer = () => {
  const { version, buildDate, loading } = useVersion();

  const formatBuildDate = (dateString) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-left">
            <p>&copy; 2025 Team Ice Breaker App. All rights reserved.</p>
          </div>
          <div className="footer-right">
            {!loading && (
              <div className="version-info">
                <span className="version-badge">v{version}</span>
                {buildDate && (
                  <span className="build-date">
                    Built: {formatBuildDate(buildDate)}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 