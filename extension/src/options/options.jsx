import { useState, useEffect } from 'react';
import WebPlatform from './WebPlatform.jsx';
import Landing from '../components/Landing.jsx';

export default function OptionsApp() {
  const [hasProfile, setHasProfile] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if the user has already onboarded
    chrome.storage.local.get(['default_profile'], (result) => {
      if (result.default_profile) {
        setHasProfile(true);
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="min-h-screen bg-surface flex items-center justify-center">Loading Concierge...</div>;

  return hasProfile ? 
    <WebPlatform onReset={() => setHasProfile(false)} /> : 
    <Landing onUploadSuccess={() => setHasProfile(true)} />;
}