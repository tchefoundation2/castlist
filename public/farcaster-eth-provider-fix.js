// Farcaster Ethereum Provider Fix
// This script fixes the issue with chainChanged events being emitted repeatedly

console.log("🔧 Farcaster Ethereum Provider Fix - Loading");

// Add a global flag to track if the fix has been applied
window.__farcasterEthProviderFixApplied = false;

// Wait for the Farcaster SDK to be available
const waitForFarcasterSDK = () => {
  return new Promise((resolve) => {
    const checkSDK = () => {
      if (window.farcaster && window.farcaster.wallet) {
        console.log("✅ Farcaster SDK detected - applying ethProvider fix");
        resolve();
      } else {
        setTimeout(checkSDK, 100);
      }
    };
    checkSDK();
  });
};

// Apply the fix
waitForFarcasterSDK().then(() => {
  // Check if fix is already applied
  if (window.__farcasterEthProviderFixApplied) {
    console.log("⚠️ Farcaster Ethereum Provider Fix already applied - skipping");
    return;
  }
  
  // Store the original getEthereumProvider method
  const originalGetEthereumProvider = window.farcaster.wallet.getEthereumProvider;
  
  // Keep track of event listeners to prevent duplicates
  const chainChangedListeners = new Map();
  
  // Create a wrapper for the Ethereum provider
  const createProviderWrapper = (provider) => {
    if (!provider) return null;
    
    // Create a proxy to intercept addEventListener calls
    const providerProxy = new Proxy(provider, {
      get(target, prop) {
        if (prop === 'addEventListener') {
          // Return a wrapped addEventListener function
          return function(eventName, listener) {
            if (eventName === 'chainChanged') {
              console.log("🔗 Intercepted chainChanged event listener");
              
              // Create a wrapper for the listener to ensure it's only called once per unique chain ID
              let lastChainId = null;
              const wrappedListener = (chainId) => {
                // Only call the listener if the chain ID has actually changed
                if (chainId !== lastChainId) {
                  console.log(`🔄 Chain changed from ${lastChainId} to ${chainId}`);
                  lastChainId = chainId;
                  listener(chainId);
                } else {
                  console.log(`🚫 Ignored duplicate chainChanged event for ${chainId}`);
                }
              };
              
              // Store the original and wrapped listeners
              chainChangedListeners.set(listener, wrappedListener);
              
              // Call the original addEventListener with our wrapped listener
              return target.addEventListener(eventName, wrappedListener);
            }
            
            // For all other events, pass through to the original method
            return target.addEventListener(eventName, listener);
          };
        } else if (prop === 'removeEventListener') {
          // Return a wrapped removeEventListener function
          return function(eventName, listener) {
            if (eventName === 'chainChanged') {
              // Get the wrapped listener
              const wrappedListener = chainChangedListeners.get(listener);
              if (wrappedListener) {
                // Remove the wrapped listener
                const result = target.removeEventListener(eventName, wrappedListener);
                // Clean up our map
                chainChangedListeners.delete(listener);
                return result;
              }
            }
            
            // For all other events, pass through to the original method
            return target.removeEventListener(eventName, listener);
          };
        }
        
        // For all other properties, return the original value
        return target[prop];
      }
    });
    
    return providerProxy;
  };
  
  // Override the getEthereumProvider method
  window.farcaster.wallet.getEthereumProvider = async function() {
    try {
      // Call the original method
      const provider = await originalGetEthereumProvider.apply(this, arguments);
      
      // If we got a provider, wrap it
      if (provider) {
        console.log("🔧 Wrapping Ethereum provider to fix chainChanged events");
        return createProviderWrapper(provider);
      }
      
      return provider;
    } catch (error) {
      console.error("❌ Error in getEthereumProvider:", error);
      throw error;
    }
  };
  
  // Set the flag to indicate the fix has been applied
  window.__farcasterEthProviderFixApplied = true;
  console.log("✅ Farcaster Ethereum Provider Fix - Applied");
}).catch(error => {
  console.error("❌ Error applying Farcaster Ethereum Provider Fix:", error);
});