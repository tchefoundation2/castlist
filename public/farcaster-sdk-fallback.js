// Farcaster SDK Fallback
// This script provides a fallback mechanism if the Farcaster SDK fails to load

console.log("🔄 Farcaster SDK Fallback - Loading");

// Set a timeout to check if the SDK has loaded
const TIMEOUT_MS = 5000; // 5 seconds

setTimeout(() => {
  // Check if the SDK is loaded
  if (!window.farcaster) {
    console.warn("⚠️ Farcaster SDK not loaded after timeout - applying fallback");
    
    // Create a minimal mock SDK to prevent app from crashing
    window.farcaster = {
      signIn: async () => ({ error: "SDK not available - fallback mode" }),
      getUser: async () => null,
      actions: {
        ready: () => console.log("Mock SDK ready() called")
      },
      quickAuth: {
        getToken: async () => ({ token: "mock-token" }),
        fetch: async (url, options) => fetch(url, options)
      },
      wallet: {
        getEthereumProvider: async () => {
          console.log("Mock getEthereumProvider called");
          return {
            request: async ({ method, params }) => {
              console.log(`Mock provider request: ${method}`, params);
              if (method === "eth_chainId") return "0x1";
              if (method === "eth_requestAccounts") return ["0x0000000000000000000000000000000000000000"];
              return null;
            },
            addEventListener: (event, listener) => {
              console.log(`Mock provider addEventListener: ${event}`);
            },
            removeEventListener: (event, listener) => {
              console.log(`Mock provider removeEventListener: ${event}`);
            }
          };
        }
      }
    };
    
    console.log("✅ Farcaster SDK Fallback - Applied");
    
    // Dispatch an event to notify the app
    const event = new CustomEvent("farcaster-sdk-fallback");
    window.dispatchEvent(event);
  } else {
    console.log("✅ Farcaster SDK loaded successfully - fallback not needed");
  }
}, TIMEOUT_MS);