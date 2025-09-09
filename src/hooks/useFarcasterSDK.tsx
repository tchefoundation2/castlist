import { useEffect, useState } from 'react';

export interface FarcasterSDKInfo {
  isLoaded: boolean;
  isReady: boolean;
  hasActions: boolean;
}

export const useFarcasterSDK = (useRealFarcaster: boolean = false): FarcasterSDKInfo => {
  const [sdkInfo, setSdkInfo] = useState<FarcasterSDKInfo>({
    isLoaded: false,
    isReady: false,
    hasActions: false
  });

    useEffect(() => {
      // Initialize wait timer for real Farcaster SDK
      if (useRealFarcaster && !(window as any).farcasterWaitStart) {
        (window as any).farcasterWaitStart = Date.now();
        console.log("⏰ Started waiting for real Farcaster SDK...");
      }

      const checkSDK = () => {
      console.log("🔍 Checking Farcaster SDK...");
      console.log("window.farcaster:", window.farcaster);
      console.log("window.location:", window.location.href);
      console.log("document.referrer:", document.referrer);
      
      // Check if we're in Farcaster preview
      const isInFarcasterPreview = document.referrer.includes('farcaster.xyz') || 
                                   window.location.href.includes('farcaster.xyz') ||
                                   window.location.href.includes('ngrok');
      
      console.log("isInFarcasterPreview:", isInFarcasterPreview);
      
      const isLoaded = !!window.farcaster;
      const hasActions = !!(window.farcaster?.actions);
      
      console.log("isLoaded:", isLoaded);
      console.log("hasActions:", hasActions);
      console.log("actions:", window.farcaster?.actions);
      
      setSdkInfo({
        isLoaded,
        isReady: false,
        hasActions
      });

      // If we're in Farcaster preview but SDK is not loaded, try to inject it
      if (isInFarcasterPreview && !isLoaded && !useRealFarcaster) {
        console.log("🔄 Attempting to inject Mock Farcaster SDK...");
        console.log("Debug - isInFarcasterPreview:", isInFarcasterPreview);
        console.log("Debug - isLoaded:", isLoaded);
        console.log("Debug - useRealFarcaster:", useRealFarcaster);
        injectFarcasterSDK();
      } else if (isInFarcasterPreview && !isLoaded && useRealFarcaster) {
        console.log("🔄 Real Farcaster mode - waiting for real SDK to load...");
        console.log("Debug - isInFarcasterPreview:", isInFarcasterPreview);
        console.log("Debug - isLoaded:", isLoaded);
        console.log("Debug - useRealFarcaster:", useRealFarcaster);
        
        // Check if we've been waiting too long (5+ seconds)
        const waitTime = Date.now() - (window as any).farcasterWaitStart || 0;
        if (waitTime > 5000) {
          console.log("⚠️ Real Farcaster SDK not loading after 5s - checking if in production");
          // Only inject enhanced mock in development/preview, not in production
          if (window.location.hostname.includes('localhost') || window.location.hostname.includes('ngrok')) {
            console.log("🔄 Development environment - using enhanced mock for preview");
            injectEnhancedMockSDK();
          } else {
            console.log("🚫 Production environment - not injecting mock SDK, waiting for real SDK");
          }
        }
      } else if (isInFarcasterPreview && isLoaded && useRealFarcaster) {
        console.log("🔄 Real Farcaster mode - SDK already loaded, checking if it's real...");
        console.log("Debug - window.farcaster:", window.farcaster);
        console.log("Debug - signIn contains Mock:", window.farcaster?.signIn?.toString().includes('Mock'));
        console.log("Debug - signIn contains Enhanced mock:", window.farcaster?.signIn?.toString().includes('Enhanced mock'));
        console.log("Debug - getUser:", window.farcaster?.getUser);
        console.log("Debug - actions:", window.farcaster?.actions);
        
        // CRITICAL: Remove mock SDK if it was injected incorrectly
        if (window.farcaster?.signIn?.toString().includes('Mock') || window.farcaster?.signIn?.toString().includes('Enhanced mock')) {
          console.log("🚫 Mock SDK detected in Real Farcaster mode - REMOVING IT");
          delete window.farcaster;
          setSdkInfo({
            isLoaded: false,
            isReady: false,
            hasActions: false
          });
          return;
        }
        
        // Check if this is a real Farcaster SDK
        if (window.farcaster && !window.farcaster?.signIn?.toString().includes('Mock') && !window.farcaster?.signIn?.toString().includes('Enhanced mock')) {
          console.log("✅ Real Farcaster SDK detected!");
        }
      }

      // Call ready() if SDK is available
      if (isLoaded && hasActions && window.farcaster?.actions?.ready) {
        // Check if this is a real SDK (not mock)
        const isRealSDK = !window.farcaster?.signIn?.toString().includes('Mock') && 
                         !window.farcaster?.signIn?.toString().includes('Enhanced mock');
        
        if (isRealSDK) {
          try {
            console.log("🚀 Calling sdk.actions.ready() on REAL SDK...");
            window.farcaster.actions.ready();
            console.log("✅ Real Farcaster SDK ready() called successfully");
            setSdkInfo(prev => ({ ...prev, isReady: true }));
          } catch (error) {
            console.error("❌ Error calling Real Farcaster SDK ready():", error);
          }
        } else {
          console.log("⚠️ Mock SDK detected - not calling ready() to avoid popup issues");
          setSdkInfo(prev => ({ ...prev, isReady: true }));
        }
      } else if (isLoaded && hasActions && window.farcaster?.actions?.ready) {
        // Fallback: if we can't determine if it's real or mock, call ready() anyway
        try {
          console.log("🚀 Calling sdk.actions.ready() (fallback)...");
          window.farcaster.actions.ready();
          console.log("✅ Farcaster SDK ready() called successfully (fallback)");
          setSdkInfo(prev => ({ ...prev, isReady: true }));
        } catch (error) {
          console.error("❌ Error calling Farcaster SDK ready() (fallback):", error);
        }
      } else if (useRealFarcaster && !isLoaded) {
        console.log("⏳ Real Farcaster mode - waiting for real SDK to load...");
        // Don't set isReady to true until real SDK loads
      } else {
        console.log("⚠️ SDK not ready yet or actions not available");
      }
    };

    // Function to inject Farcaster SDK - DISABLED FOR TESTING
    const injectFarcasterSDK = () => {
      // DISABLED: No longer injecting mock SDK
      console.log("🚫 Mock SDK injection disabled for testing");
      return;
    };

    // Function to inject enhanced mock SDK for preview when real SDK fails
    const injectEnhancedMockSDK = () => {
      if (window.farcaster) return; // Already exists

      console.log("🔄 Injecting enhanced mock Farcaster SDK for preview...");

      (window as any).farcaster = {
        signIn: async () => {
          console.log("🔐 Enhanced mock signIn called");
          return {
            fid: 99999, // Different FID to distinguish from regular mock
            username: "farcaster_preview_user",
            pfp_url: "https://via.placeholder.com/100x100/8A63D2/FFFFFF?text=FP",
            message: "Enhanced mock message",
            signature: "enhanced_mock_signature",
            nonce: "enhanced_mock_nonce"
          };
        },
        getUser: async () => {
          console.log("👤 Enhanced mock getUser called");
          return {
            fid: 99999,
            username: "farcaster_preview_user",
            pfp_url: "https://via.placeholder.com/100x100/8A63D2/FFFFFF?text=FP"
          };
        },
        actions: {
          ready: () => {
            console.log("✅ Enhanced mock sdk.actions.ready() called");
          }
        }
      };

      console.log("✅ Enhanced mock Farcaster SDK injected");
    };

    // Check immediately
    checkSDK();

    // Check multiple times with increasing delays
        const timeouts = [
          setTimeout(checkSDK, 100),
          setTimeout(checkSDK, 500),
          setTimeout(checkSDK, 1000),
          setTimeout(checkSDK, 2000),
          setTimeout(checkSDK, 3000),
          setTimeout(checkSDK, 5000),
          setTimeout(checkSDK, 10000),
          setTimeout(checkSDK, 15000),
          setTimeout(checkSDK, 20000)
        ];

    // Also check when window loads
    const handleLoad = () => {
      setTimeout(checkSDK, 100);
    };

    // Listen for SDK injection events
    const handleSDKInjection = () => {
      console.log("🔍 SDK injection detected, checking...");
      setTimeout(checkSDK, 100);
    };

    // Monitor for SDK changes
    const observer = new MutationObserver(() => {
      if (window.farcaster && !window.farcaster?.signIn?.toString().includes('Mock')) {
        console.log("🔍 Real Farcaster SDK detected via mutation observer");
        handleSDKInjection();
      }
    });

    // Start observing
    observer.observe(document.body, { childList: true, subtree: true });

    window.addEventListener('load', handleLoad);
    
    return () => {
      window.removeEventListener('load', handleLoad);
      timeouts.forEach(clearTimeout);
    };
  }, []);

  return sdkInfo;
};
