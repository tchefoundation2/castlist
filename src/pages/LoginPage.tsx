import React from 'react';
import { sdk } from '@farcaster/miniapp-sdk';

const LoginPage: React.FC = () => {
  const handleLogin = async () => {
    try {
      // Use Quick Auth to initiate authentication
      const { token } = await sdk.quickAuth.getToken();
      console.log("✅ Quick Auth token:", token);
    } catch (error) {
      console.error('Quick Auth failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome to CastList
          </h1>
          <p className="text-xl text-purple-200 mb-8">
            Connect with Farcaster to get started
          </p>
        </div>
        
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 shadow-2xl">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0012 11z" clipRule="evenodd" />
              </svg>
            </div>
            
            <div>
              <h2 className="text-2xl font-semibold text-white mb-2">
                Sign in with Farcaster
              </h2>
              <p className="text-purple-200">
                Join the decentralized social network
              </p>
            </div>
            
            <button
              onClick={handleLogin}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
            >
              Connect Farcaster
            </button>
            
            <div className="text-sm text-purple-200">
              <p>
                This will open Farcaster to authenticate your account
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;