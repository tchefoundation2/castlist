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
      setIsLoading(true);
      try {
        // Check if we're in a Farcaster mini app environment
        const isMiniApp = window.farcaster && window.farcaster.actions && window.farcaster.actions.ready;
        
        console.log("🔍 Environment detection:");
        console.log("  - isMiniApp:", isMiniApp);
        console.log("  - window.farcaster:", !!window.farcaster);
        
        if (isMiniApp && window.farcaster) {
          console.log("📱 Mini App environment detected - using Quick Auth");
          
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
          // Development mode: use mock user for testing
          console.warn("Farcaster SDK not found. Using development mode.");
          const mockUser: User = {
            id: 'dev-user-1',
            fid: 1,
            username: 'farcaster.eth',
            pfp_url: 'https://i.imgur.com/34Iodlt.jpg',
            email: 'dev@example.com'
          };
          setUser(mockUser);
          
          // Call ready() even in development mode if SDK is available
          if (window.farcaster?.actions?.ready) {
            window.farcaster.actions.ready();
            console.log("✅ Called sdk.actions.ready() in development mode");
          }
        }
      } catch (e) {
        console.error("Error checking Farcaster session:", e);
        // In case of error, use mock user for development
        const mockUser: User = {
          id: 'dev-user-1',
          fid: 1,
          username: 'farcaster.eth',
          pfp_url: 'https://i.imgur.com/34Iodlt.jpg',
          email: 'dev@example.com'
        };
        setUser(mockUser);
        
        // Call ready() even in error case if SDK is available
        if (window.farcaster?.actions?.ready) {
          window.farcaster.actions.ready();
          console.log("✅ Called sdk.actions.ready() in error case");
        }
      } finally {
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