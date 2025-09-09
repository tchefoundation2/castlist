import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { getOrCreateUserProfile } from '../services/supabaseService';

// Define the Farcaster SDK type on the window object for TypeScript
declare global {
  interface Window {
    // Mini App SDK (inside Farcaster mobile/web app)
    farcaster?: {
      signIn: () => Promise<{ fid: number; username: string; pfp_url: string; message: string; signature: string; nonce: string; } | { error: string }>;
      getUser: () => Promise<{ fid: number; username: string; pfp_url: string; } | null>;
      actions?: {
        ready: () => void;
      };
      quickAuth?: {
        getToken: () => Promise<{ token: string; }>;
        fetch: (url: string, options?: RequestInit) => Promise<Response>;
      };
    };
  // Web App SDK (standalone web app)
  FarcasterAuthKit?: {
    AuthKitProvider: any;
    SignInButton: any;
    useProfile: any;
    useSignIn: any;
    QRCode: any;
  };
  }
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<{error?: any}>;
  logout: () => Promise<void>;
  loginAsMockUser: (user: User) => void; // For development only
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check for an existing Farcaster session when the app loads
  useEffect(() => {
    const checkFarcasterSession = async () => {
      console.log("🔍 Starting authentication check...");
      setIsLoading(true);
      
      // Wait a bit to see if SDK loads
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      try {
        // Check if we're in a Farcaster mini app environment
        const isMiniApp = window.farcaster && (window.farcaster.actions || window.farcaster.quickAuth);
        
        console.log("🔍 Environment detection:");
        console.log("  - isMiniApp:", isMiniApp);
        console.log("  - window.farcaster:", !!window.farcaster);
        console.log("  - window.farcaster.getUser:", typeof window.farcaster?.getUser);
        console.log("  - window.farcaster.quickAuth:", !!window.farcaster?.quickAuth);
        console.log("  - window.farcaster.actions:", !!window.farcaster?.actions);
        
        if (isMiniApp && window.farcaster) {
          console.log("📱 Mini App environment detected - using Quick Auth");
          
          // Try to authenticate with multiple approaches
          let authenticated = false;
          
          // Approach 1: Quick Auth
          if (window.farcaster.quickAuth?.getToken && typeof window.farcaster.getUser === 'function') {
            try {
              console.log("🔍 Attempting Quick Auth...");
              const tokenResult = await window.farcaster.quickAuth.getToken();
              console.log("✅ Quick Auth token received:", tokenResult);
              
              const farcasterUser = await window.farcaster.getUser();
              if (farcasterUser) {
                console.log("✅ User info received:", farcasterUser);
                const profile = await getOrCreateUserProfile(farcasterUser);
                setUser(profile);
                authenticated = true;
                console.log("✅ Authentication successful via Quick Auth");
              }
            } catch (quickAuthError) {
              console.warn("⚠️ Quick Auth failed:", quickAuthError);
            }
          }
          
          // Approach 2: Direct getUser if Quick Auth failed
          if (!authenticated && typeof window.farcaster.getUser === 'function') {
            try {
              console.log("🔍 Attempting direct getUser...");
              const farcasterUser = await window.farcaster.getUser();
              if (farcasterUser) {
                console.log("✅ User info received via direct getUser:", farcasterUser);
                const profile = await getOrCreateUserProfile(farcasterUser);
                setUser(profile);
                authenticated = true;
                console.log("✅ Authentication successful via direct getUser");
              }
            } catch (getUserError) {
              console.warn("⚠️ Direct getUser failed:", getUserError);
            }
          }
          
          // Approach 3: Wait and retry if functions not available
          if (!authenticated) {
            console.warn("⚠️ Functions not available, waiting and retrying...");
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            if (typeof window.farcaster.getUser === 'function') {
              try {
                console.log("🔍 Retrying getUser after wait...");
                const farcasterUser = await window.farcaster.getUser();
                if (farcasterUser) {
                  console.log("✅ User info received after retry:", farcasterUser);
                  const profile = await getOrCreateUserProfile(farcasterUser);
                  setUser(profile);
                  authenticated = true;
                  console.log("✅ Authentication successful after retry");
                }
              } catch (retryError) {
                console.warn("⚠️ Retry failed:", retryError);
              }
            }
          }
          
          if (authenticated) {
            // Call ready() AFTER successful authentication
            if (window.farcaster.actions?.ready) {
              window.farcaster.actions.ready();
              console.log("✅ Called sdk.actions.ready() after auth");
            }
          } else {
            console.warn("⚠️ All authentication attempts failed");
          }
        } else {
          // No Farcaster SDK - show splash screen only
          console.warn("Farcaster SDK not found. Showing splash screen only.");
        }
        
      } catch (e) {
        console.error("Error checking Farcaster session:", e);
      } finally {
        console.log("🔍 Authentication check complete, setting loading to false");
        setIsLoading(false);
      }
      
      // Add a timeout as backup to prevent infinite loading
      setTimeout(() => {
        console.warn("⚠️ Backup timeout - forcing loading to false");
        setIsLoading(false);
      }, 15000); // 15 second backup timeout
    };
    checkFarcasterSession();
  }, []);

  const login = async () => {
    // Login is now handled automatically via Quick Auth in useEffect
    // This function is kept for compatibility but should not be called
    console.warn("Manual login is not supported in v2 compliance mode. Authentication is automatic.");
    return { error: "Manual login not supported" };
  };

  const logout = async () => {
    // In a Farcaster context, "logging out" just means clearing local state.
    setUser(null);
  };
  
  const loginAsMockUser = (mockUser: User) => {
    console.log("🔍 loginAsMockUser called with:", mockUser);
    console.log("🔍 Mock user details:", {
      id: mockUser.id,
      fid: mockUser.fid,
      username: mockUser.username,
      pfp_url: mockUser.pfp_url,
      email: mockUser.email
    });
    setUser(mockUser);
    console.log("✅ User set in context:", mockUser.username);
  };


  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    loginAsMockUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};