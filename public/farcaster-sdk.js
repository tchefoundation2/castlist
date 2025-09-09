console.log("🚀 Farcaster SDK Helper - MiniApp SDK v2");

// Import and initialize the real Farcaster MiniApp SDK
import { sdk } from "https://esm.sh/@farcaster/miniapp-sdk";

const initializeFarcaster = async () => {
  console.log("🔍 Environment check:");
  console.log("  - Location:", window.location.href);
  console.log("  - In iframe:", window !== window.top);
  console.log("  - Referrer:", document.referrer);

  try {
    // Check if we're in a Farcaster environment
    if (window !== window.top || document.referrer.includes('farcaster.xyz')) {
      console.log("📱 Farcaster environment detected - initializing SDK");
      
      // Make SDK available globally
      window.farcaster = sdk;
      console.log("✅ Farcaster SDK v2 loaded");
      console.log("✅ Available methods:", Object.keys(window.farcaster));
      
      // Check capabilities
      try {
        const capabilities = await sdk.getCapabilities();
        console.log("✅ Capabilities:", capabilities);
      } catch (e) {
        console.log("⚠️ Could not get capabilities:", e);
      }
      
      // Check chains
      try {
        const chains = await sdk.getChains();
        console.log("✅ Chains:", chains);
      } catch (e) {
        console.log("⚠️ Could not get chains:", e);
      }
      
      // Check if we're in a mini app
      try {
        const isInMiniApp = await sdk.isInMiniApp();
        console.log("✅ Is in Mini App:", isInMiniApp);
        
        if (isInMiniApp) {
          // We're in a Mini App - try to get user via quickAuth
          console.log("📱 In Mini App - attempting authentication");
          try {
            // Try quickAuth first
            if (sdk.quickAuth) {
              console.log("🔍 Trying quickAuth...");
              const tokenResult = await sdk.quickAuth.getToken();
              console.log("✅ QuickAuth token:", tokenResult);
              
              // Store token for later use
              window.farcasterToken = tokenResult.token;
            }
            
            // Try to get user info via actions.signIn
            if (sdk.actions && sdk.actions.signIn) {
              console.log("🔍 Trying actions.signIn...");
              try {
                const signInResult = await sdk.actions.signIn({
                  nonce: Math.random().toString(36).substring(2, 15),
                  acceptAuthAddress: true
                });
                console.log("✅ SignIn result:", signInResult);
                
                if (signInResult && signInResult.user) {
                  console.log("✅ User found via signIn:", signInResult.user);
                  window.farcasterUser = signInResult.user;
                }
              } catch (signInError) {
                console.log("⚠️ SignIn failed:", signInError);
              }
            }
          } catch (e) {
            console.log("⚠️ Authentication failed:", e);
          }
        } else {
          // We're in web browser - need QR code authentication
          console.log("🌐 In web browser - QR code authentication needed");
          console.log("ℹ️ User needs to scan QR code with Farcaster mobile app");
        }
        
        // Signal that the app is ready
        console.log("🚀 Calling sdk.actions.ready()...");
        sdk.actions.ready();
        console.log("✅ App is ready!");
        
      } catch (e) {
        console.log("⚠️ Could not check isInMiniApp:", e);
        // Still call ready even if check fails
        sdk.actions.ready();
      }
      
    } else {
      console.log("ℹ️ Not in Farcaster environment - running standalone");
      // For standalone mode, create a mock SDK
      window.farcaster = {
        isInMiniApp: () => Promise.resolve(false),
        context: {
          get: () => Promise.resolve(null)
        },
        actions: {
          ready: () => console.log("Mock ready() called")
        }
      };
    }
  } catch (error) {
    console.error("❌ Error initializing Farcaster SDK:", error);
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeFarcaster);
} else {
  initializeFarcaster();
}
