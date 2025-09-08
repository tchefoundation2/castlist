import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const DebugFarcasterAuth: React.FC = () => {
  const { loginAsMockUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    // Collect debug information
    const info = {
      hostname: window.location.hostname,
      href: window.location.href,
      search: window.location.search,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      hasFarcaster: !!window.farcaster,
      farcasterKeys: window.farcaster ? Object.keys(window.farcaster) : [],
      isInIframe: window !== window.top,
      parentWindow: window.parent !== window,
      readyState: document.readyState,
      timestamp: new Date().toISOString()
    };
    
    setDebugInfo(info);
    console.log("🔍 Debug Info:", info);
  }, []);

  const handleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("🔍 Starting authentication process...");
      console.log("🔍 Debug info:", debugInfo);

      // Try Farcaster SDK if available
      if (window.farcaster && typeof window.farcaster.signIn === 'function') {
        console.log("🔍 Farcaster SDK detected, attempting authentication...");
        
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
            return;
          }
        } catch (sdkError) {
          console.warn("⚠️ Farcaster SDK failed:", sdkError);
          setError(`SDK Error: ${sdkError instanceof Error ? sdkError.message : 'Unknown error'}`);
        }
      }

      // Fallback to mock user
      console.log("🔍 Using mock user fallback");
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
      
      <div className="text-xs text-gray-400 text-center max-w-md space-y-1">
        <div><strong>Environment:</strong> {debugInfo.hostname}</div>
        <div><strong>SDK Available:</strong> {debugInfo.hasFarcaster ? 'Yes' : 'No'}</div>
        <div><strong>In Iframe:</strong> {debugInfo.isInIframe ? 'Yes' : 'No'}</div>
        <div><strong>Referrer:</strong> {debugInfo.referrer || 'None'}</div>
        <div><strong>Farcaster Keys:</strong> {debugInfo.farcasterKeys.join(', ') || 'None'}</div>
      </div>
    </div>
  );
};

export default DebugFarcasterAuth;
