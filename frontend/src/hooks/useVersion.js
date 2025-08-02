import { useState, useEffect } from 'react';

export const useVersion = () => {
  const [version, setVersion] = useState({
    version: '1.0.0',
    buildDate: null,
    buildNumber: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const response = await fetch('/version.json');
        if (!response.ok) {
          throw new Error('Failed to fetch version info');
        }
        const versionData = await response.json();
        setVersion({
          ...versionData,
          loading: false,
          error: null
        });
      } catch (error) {
        console.warn('Could not load version info:', error);
        setVersion(prev => ({
          ...prev,
          loading: false,
          error: error.message
        }));
      }
    };

    fetchVersion();
  }, []);

  return version;
}; 