import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

const OfficialFarcasterAuth: React.FC = () => {
  const { loginAsMockUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isReady, setIsReady] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  useEffect(() => {
    const initializeSDK = async () => {
      console.log("🚀 Initializing Farcaster Mini App...");
      
      try {
        // Try to dynamically import the SDK
        const { sdk } = await import('@farcaster/miniapp-sdk');
        setSdkLoaded(true);
        
        console.log("✅ Farcaster SDK loaded:", sdk);
        
        // Call ready() to hide splash screen
        await sdk.actions.ready();
        setIsReady(true);
        console.log("✅ sdk.actions.ready() called successfully");
        
      } catch (error) {
        console.warn("⚠️ Farcaster SDK not available, checking window.farcaster...", error);
        
        // Fallback to window.farcaster if it exists
        if (window.farcaster && window.farcaster.actions && window.farcaster.actions.ready) {
          try {
            window.farcaster.actions.ready();
            setIsReady(true);
            setSdkLoaded(true);
            console.log("✅ window.farcaster.actions.ready() called successfully");
          } catch (fallbackError) {
            console.error("❌ Error with fallback ready():", fallbackError);
            setError(`SDK Error: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`);
          }
        } else {
          console.log("ℹ️ No Farcaster SDK available - running in standalone mode");
          setError("Running in standalone mode (no Farcaster SDK)");
        }
      }
    };

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
    console.log("🔍 OfficialFarcasterAuth Debug Info:", info);
    
    initializeSDK();
  }, []);

  const handleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      console.log("🔍 Starting Farcaster authentication...");
      console.log("🔍 Debug info:", debugInfo);

      // Try to use the real Farcaster authentication
      if (sdkLoaded) {
        try {
          console.log("🔍 Attempting Farcaster authentication...");
          
          // Import SDK and try to authenticate
          const { sdk } = await import('@farcaster/miniapp-sdk');
          
          // Check if we have signIn method (it might be in actions)
          if (sdk && sdk.actions && typeof (sdk.actions as any).signIn === 'function') {
            console.log("🔍 Using sdk.actions.signIn()...");
            const result = await (sdk.actions as any).signIn();
            console.log("✅ Farcaster authentication result:", result);
            
            if (result && 'fid' in result) {
              // Success - convert to our user format
              const user = {
                id: result.fid.toString(),
                fid: result.fid,
                username: result.username || 'unknown',
                pfp_url: result.pfp_url || '',
                email: `${result.username}@farcaster.xyz`
              };
              loginAsMockUser(user);
              return;
            }
          } else if (window.farcaster && typeof window.farcaster.signIn === 'function') {
            console.log("🔍 Using window.farcaster.signIn()...");
            const result = await window.farcaster.signIn();
            console.log("✅ Farcaster authentication result:", result);
            
            if (result && 'fid' in result) {
              // Success - convert to our user format
              const user = {
                id: result.fid.toString(),
                fid: result.fid,
                username: result.username || 'unknown',
                pfp_url: result.pfp_url || '',
                email: `${result.username}@farcaster.xyz`
              };
              loginAsMockUser(user);
              return;
            }
          }
          
          console.log("⚠️ No signIn method available, using mock user");
          
        } catch (authError) {
          console.warn("⚠️ Farcaster authentication failed:", authError);
          setError(`Authentication Error: ${authError instanceof Error ? authError.message : 'Unknown error'}`);
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
        <div><strong>SDK Loaded:</strong> {sdkLoaded ? '✅' : '❌'}</div>
        <div><strong>Ready Called:</strong> {isReady ? '✅' : '⏳'}</div>
        <div><strong>Farcaster:</strong> {debugInfo.hasFarcaster ? '✅' : '❌'}</div>
        <div><strong>In Iframe:</strong> {debugInfo.isInIframe ? 'Yes' : 'No'}</div>
        <div><strong>Referrer:</strong> {debugInfo.referrer || 'None'}</div>
      </div>
    </div>
  );
};

export default OfficialFarcasterAuth;
