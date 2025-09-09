import React, { useEffect, useState } from 'react';
import Loader from '../components/Loader';

const LoginPage: React.FC = () => {
  const [isWebBrowser, setIsWebBrowser] = useState(false);

  useEffect(() => {
    // Check if we're in a web browser (not in Mini App)
    const checkEnvironment = async () => {
      if (window.farcaster) {
        try {
          const isInMiniApp = await window.farcaster.isInMiniApp();
          setIsWebBrowser(!isInMiniApp);
        } catch (e) {
          // If we can't check, assume web browser
          setIsWebBrowser(true);
        }
      } else {
        // No SDK loaded, assume web browser
        setIsWebBrowser(true);
      }
    };

    checkEnvironment();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-gray-800 dark:text-gray-200 p-4 bg-gradient-to-br from-primary-50 via-purple-50 to-blue-100 bg-300% animate-gradient dark:from-gray-900 dark:via-gray-900 dark:to-black">
      <div className="text-center animate-fadeIn w-full max-w-sm">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-50 mb-3">
          Castlist
        </h1>
        <h2 className="text-xl font-medium text-primary-700 dark:text-primary-400 mb-4">
          Transform your Readings into a Social Journey
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-10 text-base">
          The Castlist platform is your gateway to creating, sharing, and discovering curated lists within the Farcaster ecosystem.
        </p>
        
        {isWebBrowser ? (
          <div className="mt-10 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-blue-600 dark:text-blue-400 mb-4">
              <svg className="w-12 h-12 mx-auto mb-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-2">
              Open in Farcaster Mobile App
            </h3>
            <p className="text-sm text-blue-600 dark:text-blue-300 mb-4">
              To use this Mini App, please open it in the Farcaster mobile app on your phone.
            </p>
            <div className="text-xs text-blue-500 dark:text-blue-400">
              <p>• Open Farcaster app on your phone</p>
              <p>• Search for "Castlist" or scan QR code</p>
              <p>• Enjoy the full experience!</p>
            </div>
          </div>
        ) : (
          <div className="mt-10">
            <Loader text="Loading..." />
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;