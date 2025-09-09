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
      } catch (e) {
        console.log("⚠️ Could not check isInMiniApp:", e);
      }
      
      // Signal that the app is ready FIRST
      console.log("🚀 Calling sdk.actions.ready()...");
      sdk.actions.ready();
      console.log("✅ App is ready!");
      
      // Get context (user info) AFTER ready
      try {
        const context = await sdk.context.get();
        console.log("✅ Context:", context);
        
        if (context && context.user) {
          console.log("✅ User found in context:", context.user);
          // Store user info globally for easy access
          window.farcasterUser = context.user;
        }
      } catch (e) {
        console.log("⚠️ Could not get context:", e);
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
