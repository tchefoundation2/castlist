import { useEffect, useState } from 'react';

declare global {
  interface Window {
    farcaster?: {
      signIn: () => Promise<{ fid: number; username: string; pfp_url: string; message: string; signature: string; nonce: string; } | { error: string; }>;
      getUser: () => Promise<{ fid: number; username: string; pfp_url: string; } | null>;
      actions?: {
        ready: () => void;
      };
      quickAuth?: {
        getToken: () => Promise<{ token: string; }>;
        fetch: (url: string, options?: RequestInit) => Promise<Response>;
      };
    };
  }
}

export interface FarcasterSDKInfo {
  isLoaded: boolean;
  isReady: boolean;
  hasActions: boolean;
}

export const useFarcasterSDKSimple = (): FarcasterSDKInfo => {
  const [sdkInfo, setSdkInfo] = useState<FarcasterSDKInfo>({
    isLoaded: false,
    isReady: false,
    hasActions: false
  });

  useEffect(() => {
    const checkSDK = () => {
      console.log("🔍 Checking Farcaster SDK...");
      console.log("window.farcaster:", window.farcaster);

      const isLoaded = !!window.farcaster;
      const hasActions = !!(window.farcaster?.actions);

      console.log("isLoaded:", isLoaded);
      console.log("hasActions:", hasActions);

      setSdkInfo({
        isLoaded,
        isReady: false,
        hasActions
      });

      // Call ready() if SDK is available
      if (isLoaded && hasActions && window.farcaster?.actions?.ready) {
        try {
          console.log("🚀 Calling sdk.actions.ready()...");
          window.farcaster.actions.ready();
          console.log("✅ Farcaster SDK ready() called successfully");
          setSdkInfo(prev => ({ ...prev, isReady: true }));
        } catch (error) {
          console.error("❌ Error calling Farcaster SDK ready():", error);
        }
      } else {
        console.log("⚠️ SDK not ready yet or actions not available");
      }
    };
    
    // Handle fallback event
    const handleFallback = () => {
      console.log("⚠️ Farcaster SDK fallback triggered");
      // Even with fallback, we consider the SDK as loaded
      setSdkInfo({
        isLoaded: true,
        isReady: true,
        hasActions: true
      });
    };

    // Check immediately
    checkSDK();

    // Check when window loads
    const handleLoad = () => {
      setTimeout(checkSDK, 100);
    };

    // Add event listeners
    window.addEventListener('load', handleLoad);
    window.addEventListener('farcaster-sdk-fallback', handleFallback);
    
    return () => {
      window.removeEventListener('load', handleLoad);
      window.removeEventListener('farcaster-sdk-fallback', handleFallback);
    };
  }, []);

  return sdkInfo;
};
