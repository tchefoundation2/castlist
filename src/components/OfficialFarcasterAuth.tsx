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
        console.log("🔍 SDK structure:", {
          hasActions: !!sdk.actions,
          actionsKeys: sdk.actions ? Object.keys(sdk.actions) : [],
          hasWallet: !!sdk.wallet,
          walletKeys: sdk.wallet ? Object.keys(sdk.wallet) : [],
          allKeys: Object.keys(sdk)
        });
        
        // Call ready() to hide splash screen
        await sdk.actions.ready();
        setIsReady(true);
        console.log("✅ sdk.actions.ready() called successfully");
        
        // Don't call addMiniApp automatically - let user do it manually
        console.log("ℹ️ SDK ready - user can now click 'Sign in with Farcaster' to add mini app");
        
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
      console.log("🔍 Starting Farcaster Mini-App authentication...");
      
      if (sdkLoaded) {
        try {
          // Import SDK and try to authenticate
          const { sdk } = await import('@farcaster/miniapp-sdk');
          
          console.log("🔍 Available SDK methods:", {
            actions: sdk.actions ? Object.keys(sdk.actions) : [],
            wallet: sdk.wallet ? Object.keys(sdk.wallet) : [],
            all: Object.keys(sdk)
          });
          
          // Try to get user info directly (mini-app should have user context)
          if (sdk.actions && typeof sdk.actions.getUser === 'function') {
            console.log("🔍 Trying sdk.actions.getUser()...");
            const userInfo = await sdk.actions.getUser();
            console.log("✅ Farcaster user info:", userInfo);
            
            if (userInfo && 'fid' in userInfo) {
              const user = {
                id: userInfo.fid.toString(),
                fid: userInfo.fid,
                username: userInfo.username || 'unknown',
                pfp_url: userInfo.pfp_url || '',
                email: `${userInfo.username}@farcaster.xyz`
              };
              console.log("✅ Mini-app user login successful:", user);
              loginAsMockUser(user);
              return;
            }
          }
          
          // Try other possible user methods
          if (sdk.actions && typeof sdk.actions.getCurrentUser === 'function') {
            console.log("🔍 Trying sdk.actions.getCurrentUser()...");
            const userInfo = await sdk.actions.getCurrentUser();
            console.log("✅ Farcaster current user:", userInfo);
            
            if (userInfo && 'fid' in userInfo) {
              const user = {
                id: userInfo.fid.toString(),
                fid: userInfo.fid,
                username: userInfo.username || 'unknown',
                pfp_url: userInfo.pfp_url || '',
                email: `${userInfo.username}@farcaster.xyz`
              };
              console.log("✅ Mini-app current user login successful:", user);
              loginAsMockUser(user);
              return;
            }
          }
          
          console.log("⚠️ No user methods available in mini-app context");
          
        } catch (authError) {
          console.warn("⚠️ Farcaster mini-app authentication failed:", authError);
          setError(`Mini-app Auth Error: ${authError instanceof Error ? authError.message : 'Unknown error'}`);
        }
      }

      // Fallback to mock user for mini-app
      console.log("🔍 Using mock user for mini-app fallback");
      loginAsMockUser({
        id: '12345',
        fid: 12345,
        username: 'mini_app_user',
        pfp_url: 'https://i.imgur.com/34Iodlt.jpg',
        email: 'mini_app_user@farcaster.xyz'
      });
      
    } catch (err) {
      console.error("❌ Mini-app authentication error:", err);
      setError(err instanceof Error ? err.message : 'Mini-app authentication failed');
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
