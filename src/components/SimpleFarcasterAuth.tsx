import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const SimpleFarcasterAuth: React.FC = () => {
  const { loginAsMockUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if we're in Farcaster environment
  const isFarcasterWeb = window.location.hostname === 'farcaster.xyz' || 
                        window.location.hostname.includes('farcaster.xyz') ||
                        window.location.search.includes('farcaster.xyz') ||
                        window.location.href.includes('farcaster.xyz') ||
                        document.referrer.includes('farcaster.xyz');
  
  const hasFarcasterSDK = window.farcaster && window.farcaster.signIn;
  
  console.log("🔍 SimpleFarcasterAuth - Environment detection:");
  console.log("🔍 window.location.hostname:", window.location.hostname);
  console.log("🔍 window.location.href:", window.location.href);
  console.log("🔍 window.location.search:", window.location.search);
  console.log("🔍 document.referrer:", document.referrer);
  console.log("🔍 isFarcasterWeb:", isFarcasterWeb);
  console.log("🔍 hasFarcasterSDK:", hasFarcasterSDK);
  console.log("🔍 window.farcaster:", window.farcaster);
  console.log("🔍 window.farcaster keys:", window.farcaster ? Object.keys(window.farcaster) : 'undefined');

  const handleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Always try Farcaster SDK first if available
      if (window.farcaster && typeof window.farcaster.signIn === 'function') {
        console.log("🔍 Attempting Farcaster SDK authentication");
        
        try {
          const result = await (window.farcaster as any).signIn();
          console.log("🔍 Farcaster SDK result:", result);

          if (result && 'fid' in result && result.fid) {
            console.log("✅ Farcaster SDK authentication successful:", result);
            loginAsMockUser({
              id: result.fid.toString(),
              fid: result.fid,
              username: result.username || `user_${result.fid}`,
              pfp_url: result.pfp_url || '',
              email: `${result.username || `user_${result.fid}`}@farcaster.xyz`
            });
            return; // Success, exit early
          }
        } catch (sdkError) {
          console.warn("⚠️ Farcaster SDK failed, falling back to mock user:", sdkError);
        }
      }
      
      // Fallback to mock user
      console.log("🔍 Using mock user for testing");
      loginAsMockUser({
        id: '12345',
        fid: 12345,
        username: 'preview_user',
        pfp_url: 'https://i.imgur.com/34Iodlt.jpg',
        email: 'preview_user@farcaster.xyz'
      });
      
    } catch (err) {
      console.error("❌ Authentication error:", err);
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <button
        onClick={handleSignIn}
        disabled={isLoading}
        className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center space-x-2"
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Signing in...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span>Sign in with Farcaster</span>
          </>
        )}
      </button>
      
      {error && (
        <div className="text-red-500 text-sm text-center max-w-md">
          {error}
        </div>
      )}
      
      <div className="text-xs text-gray-400 text-center max-w-md">
        <div>Environment: {isFarcasterWeb ? 'Farcaster' : 'Web Browser'}</div>
        <div>SDK: {hasFarcasterSDK ? 'Available' : 'Not Available'}</div>
        <div>Mode: {hasFarcasterSDK ? 'Real Auth' : 'Mock User'}</div>
      </div>
    </div>
  );
};

export default SimpleFarcasterAuth;
