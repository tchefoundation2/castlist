import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AuthKitProvider, useSignIn, QRCode } from '@farcaster/auth-kit';

// Types are declared in useAuth.tsx

// Configure AuthKit
const config = {
  domain: 'castlist.netlify.app',
  siweUri: 'https://castlist.netlify.app/login',
  rpcUrl: 'https://mainnet.optimism.io',
  relay: 'https://relay.farcaster.xyz',
};

const LoginWithQR: React.FC = () => {
  const { loginAsMockUser } = useAuth();
  const [showQR, setShowQR] = useState(false);
  
  // Check if we're on farcaster.xyz and have the SDK
  const isFarcasterWeb = window.location.hostname === 'farcaster.xyz' || 
                        window.location.hostname.includes('farcaster.xyz') ||
                        window.location.search.includes('farcaster.xyz');
  
  const hasFarcasterSDK = window.farcaster && window.farcaster.signIn;
  
  console.log("🔍 LoginWithQR - Environment detection:");
  console.log("🔍 isFarcasterWeb:", isFarcasterWeb);
  console.log("🔍 hasFarcasterSDK:", hasFarcasterSDK);
  console.log("🔍 window.farcaster:", window.farcaster);
  
  // Use AuthKit hooks directly - following official documentation
  const { signIn, url, data } = useSignIn({
    onSuccess: ({ fid, username, pfpUrl }) => {
      console.log('🔍 AuthKit onSuccess called:', { fid, username, pfpUrl });
      // Set user in context with real data
      if (fid && username) {
        console.log('✅ Setting user in context:', { fid, username, pfpUrl });
        loginAsMockUser({
          id: fid.toString(),
          fid: fid,
          username: username,
          pfp_url: pfpUrl || '',
          email: `${username}@farcaster.xyz`
        });
        console.log('✅ User set in context successfully');
      } else {
        console.error('❌ Missing fid or username in response:', { fid, username });
      }
    },
    onError: (error: any) => {
      console.error('❌ AuthKit onError called:', error);
      console.error('❌ Error details:', error.message);
      console.error('❌ Error stack:', error.stack);
      alert(`AuthKit error: ${error.message}`);
    },
  });
  
  console.log('🔍 useSignIn hook result:', { signIn, url, data });
  console.log('🔍 AuthKit config:', config);
  console.log('🔍 showQR state:', showQR);
  
  // Monitor URL changes
  useEffect(() => {
    console.log('🔍 URL changed:', url);
    console.log('🔍 Data changed:', data);
    if (url) {
      console.log('✅ QR Code URL generated:', url);
    }
  }, [url, data]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-gray-800 dark:text-gray-200 p-4 bg-gradient-to-br from-primary-50 via-purple-50 to-blue-100 bg-300% animate-gradient dark:from-gray-900 dark:via-gray-900 dark:to-black">
      <div className="text-center animate-fadeIn w-full max-w-sm">
        <h1 className="text-5xl font-bold text-gray-900 dark:text-gray-50 mb-3">
          Castlist
        </h1>
        <h2 className="text-xl font-medium text-primary-700 dark:text-primary-400 mb-4">
          Transform your Readings into a Social Journey
        </h2>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-10 text-base">
          Please sign in with Farcaster to continue.
        </p>
        
        <div className="mt-10">
          {hasFarcasterSDK ? (
            <button
              onClick={async () => {
                console.log("🔍 Using Farcaster SDK for login");
                console.log("🔍 Button clicked - starting authentication");
                try {
                  if (window.farcaster && window.farcaster.signIn) {
                    console.log("🔍 Calling window.farcaster.signIn()...");
                    const result = await window.farcaster.signIn();
                    console.log("🔍 Farcaster SDK login result:", result);
                    console.log("🔍 Result type:", typeof result);
                    console.log("🔍 Result keys:", Object.keys(result || {}));
                    
                    if (result && 'error' in result) {
                      console.error("❌ Farcaster SDK login error:", result.error);
                      alert(`Login error: ${result.error}`);
                    } else if (result) {
                      console.log("✅ Farcaster SDK login success:", result);
                      // Set user in context
                      loginAsMockUser({
                        id: result.fid?.toString() || 'unknown',
                        fid: result.fid || 0,
                        username: result.username || 'unknown',
                        pfp_url: result.pfp_url || '',
                        email: `${result.username || 'unknown'}@farcaster.xyz`
                      });
                      console.log("✅ User set in context");
                    } else {
                      console.error("❌ No result from signIn");
                      alert("No result from signIn");
                    }
                  } else {
                    console.error("❌ Farcaster SDK not available");
                    console.log("🔍 window.farcaster:", window.farcaster);
                    alert("Farcaster SDK not available");
                  }
                } catch (error) {
                  console.error("❌ Farcaster SDK login error:", error);
                  console.error("❌ Error details:", (error as Error).message);
                  alert(`Login error: ${(error as Error).message}`);
                }
              }}
              className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center gap-3 mx-auto"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
              Sign in with Farcaster (SDK)
            </button>
                 ) : (
                   <button
                     onClick={() => {
                       console.log("🔍 Using AuthKit for login");
                       console.log("🔍 Button clicked - starting AuthKit authentication");
                       console.log("🔍 signIn function:", signIn);
                       console.log("🔍 Calling signIn() to generate QR code...");
                       setShowQR(true);
                       signIn();
                     }}
                     className="bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center gap-3 mx-auto"
                   >
                     <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                       <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                     </svg>
                     Sign in with Farcaster
                   </button>
                 )}
          
          {url && (
            <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <p className="text-gray-700 dark:text-gray-300 mb-4 text-sm">
                Escaneie este QR code com o aplicativo Farcaster no seu celular:
              </p>
              <div className="flex justify-center">
                <QRCode uri={url} />
              </div>
            </div>
          )}
          
          {showQR && !url && (
            <div className="mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Gerando QR code...
                </p>
              </div>
            </div>
          )}
          
          {data?.username && (
            <div className="mt-4 p-4 bg-green-100 dark:bg-green-900 rounded-lg">
              <p className="text-green-800 dark:text-green-200">
                Olá, {data.username}!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const FarcasterAuthKit: React.FC = () => {
  console.log("🔍 FarcasterAuthKit component loaded");
  
  return (
    <AuthKitProvider config={config}>
      <LoginWithQR />
    </AuthKitProvider>
  );
};

export default FarcasterAuthKit;
