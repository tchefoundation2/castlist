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
