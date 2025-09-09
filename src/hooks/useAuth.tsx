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
          
          // Check if getUser function is available
          if (typeof window.farcaster.getUser === 'function') {
            console.log("✅ getUser function is available");
            
            // Use Quick Auth for automatic authentication
            if (window.farcaster.quickAuth?.getToken) {
              try {
                console.log("🔍 Attempting Quick Auth...");
                const tokenResult = await window.farcaster.quickAuth.getToken();
                console.log("✅ Quick Auth token received:", tokenResult);
                
                // Get user info using the token
                const farcasterUser = await window.farcaster.getUser();
                if (farcasterUser) {
                  console.log("✅ User info received:", farcasterUser);
                  const profile = await getOrCreateUserProfile(farcasterUser);
                  setUser(profile);
                  
                  // Call ready() AFTER successful authentication
                  if (window.farcaster.actions?.ready) {
                    window.farcaster.actions.ready();
                    console.log("✅ Called sdk.actions.ready() after auth");
                  }
                }
              } catch (quickAuthError) {
                console.warn("⚠️ Quick Auth failed, falling back to manual auth:", quickAuthError);
                // Fallback to manual authentication if Quick Auth fails
                const farcasterUser = await window.farcaster.getUser();
                if (farcasterUser) {
                  const profile = await getOrCreateUserProfile(farcasterUser);
                  setUser(profile);
                  
                  // Call ready() AFTER successful authentication
                  if (window.farcaster.actions?.ready) {
                    window.farcaster.actions.ready();
                    console.log("✅ Called sdk.actions.ready() after fallback auth");
                  }
                }
              }
            } else {
              // Fallback to manual authentication if Quick Auth not available
              console.log("🔍 Quick Auth not available, using manual auth");
              const farcasterUser = await window.farcaster.getUser();
              if (farcasterUser) {
                const profile = await getOrCreateUserProfile(farcasterUser);
                setUser(profile);
                
                // Call ready() AFTER successful authentication
                if (window.farcaster.actions?.ready) {
                  window.farcaster.actions.ready();
                  console.log("✅ Called sdk.actions.ready() after manual auth");
                }
              }
            }
          } else {
            console.warn("⚠️ getUser function not available yet, waiting...");
            // Wait a bit more and try again
            await new Promise(resolve => setTimeout(resolve, 2000));
            if (typeof window.farcaster.getUser === 'function') {
              console.log("✅ getUser function now available, retrying...");
              const farcasterUser = await window.farcaster.getUser();
              if (farcasterUser) {
                const profile = await getOrCreateUserProfile(farcasterUser);
                setUser(profile);
                
                if (window.farcaster.actions?.ready) {
                  window.farcaster.actions.ready();
                  console.log("✅ Called sdk.actions.ready() after retry");
                }
              }
            } else {
              console.warn("⚠️ getUser function still not available after waiting");
            }
          }
        } else {
          // No Farcaster SDK - show splash screen only
          console.warn("Farcaster SDK not found. Showing splash screen only.");
        }
        
        // Add a timeout to prevent infinite loading
        setTimeout(() => {
          if (isLoading) {
            console.warn("⚠️ Authentication timeout - stopping loading");
            setIsLoading(false);
          }
        }, 10000); // 10 second timeout
      } catch (e) {
        console.error("Error checking Farcaster session:", e);
      } finally {
        console.log("🔍 Authentication check complete, setting loading to false");
        setIsLoading(false);
      }
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