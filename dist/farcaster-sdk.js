console.log("🚀 Farcaster SDK Helper - Simplified Version");

// Simple detection and ready() call
const initializeFarcaster = () => {
  console.log("🔍 Environment check:");
  console.log("  - Location:", window.location.href);
  console.log("  - In iframe:", window !== window.top);
  console.log("  - Referrer:", document.referrer);
  console.log("  - window.farcaster:", !!window.farcaster);
  
  // If Farcaster SDK is already injected, call ready()
  if (window.farcaster && window.farcaster.actions && window.farcaster.actions.ready) {
    try {
      console.log("✅ Calling window.farcaster.actions.ready()...");
      window.farcaster.actions.ready();
      console.log("✅ Ready called successfully");
    } catch (error) {
      console.warn("⚠️ Error calling ready():", error);
    }
  } else {
    console.log("ℹ️ No Farcaster SDK detected - component will handle initialization");
  }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeFarcaster);
} else {
  initializeFarcaster();
}
