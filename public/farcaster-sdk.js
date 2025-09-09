console.log("🚀 Farcaster SDK Helper - MiniApp SDK Version");

// Import and initialize the real Farcaster MiniApp SDK
import { sdk } from "https://esm.sh/@farcaster/miniapp-sdk";

const initializeFarcaster = async () => {
  console.log("🔍 Environment check:");
  console.log("  - Location:", window.location.href);
  console.log("  - In iframe:", window !== window.top);
  console.log("  - Referrer:", document.referrer);
  console.log("  - window.farcaster:", !!window.farcaster);
  
  try {
    // Initialize the real Farcaster SDK
    console.log("🔧 Initializing real Farcaster MiniApp SDK...");
    
    // Check if we're in a Farcaster environment
    if (window !== window.top || document.referrer.includes('farcaster.xyz')) {
      console.log("📱 Farcaster environment detected");
      
      // Wait a bit for SDK to fully load
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Make SDK available globally - use the actual SDK object directly
      window.farcaster = sdk;
      console.log("✅ Farcaster SDK made available globally");
      console.log("✅ Available methods:", Object.keys(window.farcaster));
      console.log("✅ SDK object:", window.farcaster);
      console.log("✅ quickAuth:", !!window.farcaster.quickAuth);
      console.log("✅ actions:", !!window.farcaster.actions);
      console.log("✅ context:", !!window.farcaster.context);
      console.log("✅ wallet:", !!window.farcaster.wallet);
      
      // SDK v2 uses different API - let's implement the correct methods
      console.log("🔧 Implementing v2 API methods...");
      
      // Create getUser function using context
      if (window.farcaster.context) {
        window.farcaster.getUser = async () => {
          try {
            console.log("🔍 Getting user from context...");
            const context = await window.farcaster.context.get();
            console.log("✅ Context received:", context);
            
            if (context && context.user) {
              return {
                fid: context.user.fid,
                username: context.user.username,
                pfp_url: context.user.pfp_url
              };
            }
            return null;
          } catch (error) {
            console.error("❌ Error getting user from context:", error);
            return null;
          }
        };
        console.log("✅ getUser function implemented using context");
      }
      
      // Create signIn function using quickAuth
      if (window.farcaster.quickAuth) {
        window.farcaster.signIn = async () => {
          try {
            console.log("🔍 Signing in using quickAuth...");
            const token = await window.farcaster.quickAuth.getToken();
            console.log("✅ QuickAuth token received:", token);
            
            // After getting token, get user info
            const user = await window.farcaster.getUser();
            if (user) {
              return {
                fid: user.fid,
                username: user.username,
                pfp_url: user.pfp_url,
                message: "Signed in successfully",
                signature: "quickAuth",
                nonce: "quickAuth"
              };
            }
            return { error: "Failed to get user after sign in" };
          } catch (error) {
            console.error("❌ Error signing in:", error);
            return { error: error.message };
          }
        };
        console.log("✅ signIn function implemented using quickAuth");
      }
      
      console.log("🔍 Final check:");
      console.log("  - getUser function:", typeof window.farcaster.getUser);
      console.log("  - signIn function:", typeof window.farcaster.signIn);
      
      // Call ready() to signal the app is ready
      if (window.farcaster.actions?.ready) {
        window.farcaster.actions.ready();
        console.log("✅ Real Farcaster SDK ready() called successfully");
      }
    } else {
      console.log("ℹ️ Not in Farcaster environment - SDK not initialized");
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
