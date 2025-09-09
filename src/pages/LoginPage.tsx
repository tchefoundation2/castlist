import React from 'react';
import Loader from '../components/Loader';

const LoginPage: React.FC = () => {
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
        
        <div className="mt-10">
          <Loader text="Loading..." />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;