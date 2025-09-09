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
      console.log("✅ getUser function:", typeof window.farcaster.getUser);
      console.log("✅ signIn function:", typeof window.farcaster.signIn);
      console.log("✅ quickAuth:", !!window.farcaster.quickAuth);
      console.log("✅ actions:", !!window.farcaster.actions);
      
      // Try to access functions directly from the SDK
      console.log("🔍 Checking SDK methods directly:");
      console.log("  - sdk.getUser:", typeof sdk.getUser);
      console.log("  - sdk.signIn:", typeof sdk.signIn);
      console.log("  - sdk.quickAuth:", !!sdk.quickAuth);
      console.log("  - sdk.actions:", !!sdk.actions);
      
      // If functions are not available, try to access them differently
      if (typeof window.farcaster.getUser !== 'function') {
        console.log("🔧 Attempting to access getUser from different paths...");
        console.log("  - sdk.user?.getUser:", typeof sdk.user?.getUser);
        console.log("  - sdk.auth?.getUser:", typeof sdk.auth?.getUser);
        console.log("  - sdk.client?.getUser:", typeof sdk.client?.getUser);
        
        // Try to find getUser in nested objects
        if (sdk.user?.getUser) {
          window.farcaster.getUser = sdk.user.getUser;
          console.log("✅ Found getUser in sdk.user");
        } else if (sdk.auth?.getUser) {
          window.farcaster.getUser = sdk.auth.getUser;
          console.log("✅ Found getUser in sdk.auth");
        } else if (sdk.client?.getUser) {
          window.farcaster.getUser = sdk.client.getUser;
          console.log("✅ Found getUser in sdk.client");
        }
      }
      
      if (typeof window.farcaster.signIn !== 'function') {
        console.log("🔧 Attempting to access signIn from different paths...");
        console.log("  - sdk.user?.signIn:", typeof sdk.user?.signIn);
        console.log("  - sdk.auth?.signIn:", typeof sdk.auth?.signIn);
        console.log("  - sdk.client?.signIn:", typeof sdk.client?.signIn);
        
        // Try to find signIn in nested objects
        if (sdk.user?.signIn) {
          window.farcaster.signIn = sdk.user.signIn;
          console.log("✅ Found signIn in sdk.user");
        } else if (sdk.auth?.signIn) {
          window.farcaster.signIn = sdk.auth.signIn;
          console.log("✅ Found signIn in sdk.auth");
        } else if (sdk.client?.signIn) {
          window.farcaster.signIn = sdk.client.signIn;
          console.log("✅ Found signIn in sdk.client");
        }
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
