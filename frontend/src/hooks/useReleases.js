import { useState, useEffect } from 'react';

export const useReleases = () => {
  const [releases, setReleases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReleases = async () => {
      try {
        const response = await fetch('/releases.json');
        if (!response.ok) {
          throw new Error('Failed to fetch releases');
        }
        const releasesData = await response.json();
        setReleases(releasesData || []);
      } catch (error) {
        console.warn('Could not load releases:', error);
        setError(error.message);
        setReleases([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReleases();
  }, []);

  const getLatestRelease = () => releases[0] || null;
  
  const getReleaseByVersion = (version) => 
    releases.find(release => release.version === version) || null;

  const getReleasesCount = () => releases.length;

  const getTotalChanges = () => 
    releases.reduce((total, release) => total + (release.summary?.total || 0), 0);

  return {
    releases,
    loading,
    error,
    getLatestRelease,
    getReleaseByVersion,
    getReleasesCount,
    getTotalChanges
  };
}; 