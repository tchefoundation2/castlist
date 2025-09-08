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
  error: string | null;
  login: () => Promise<{error?: any}>;
  logout: () => Promise<void>;
  loginAsMockUser: (user: User) => void; // For development only
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check for an existing Farcaster session when the app loads
  useEffect(() => {
    const checkFarcasterSession = async () => {
      setIsLoading(true);
      try {
        // Check if we're in a Farcaster mini app environment
        const isMiniApp = window.farcaster && window.farcaster.signIn;
        // Check if we're in a standalone web app environment
        const isWebApp = window.FarcasterAuthKit && window.FarcasterAuthKit.AuthKitProvider;
        
        console.log("🔍 Environment detection:");
        console.log("  - isMiniApp:", isMiniApp);
        console.log("  - isWebApp:", isWebApp);
        console.log("  - window.farcaster:", !!window.farcaster);
        console.log("  - window.FarcasterAuthKit:", !!window.FarcasterAuthKit);
        
        if (isMiniApp && window.farcaster) {
          console.log("📱 Mini App environment detected - using window.farcaster");
          // Call sdk.actions.ready() to hide splash screen only for real SDK
          const isRealSDK = !window.farcaster?.signIn?.toString().includes('Mock') && 
                           !window.farcaster?.signIn?.toString().includes('Enhanced mock');
          
          if (window.farcaster.actions?.ready && isRealSDK) {
            window.farcaster.actions.ready();
            console.log("Called sdk.actions.ready() on REAL SDK");
          } else if (window.farcaster.actions?.ready && !isRealSDK) {
            console.log("Mock SDK detected - not calling ready() to avoid popup issues");
          }
          
          const farcasterUser = await window.farcaster.getUser();
          if (farcasterUser) {
            const profile = await getOrCreateUserProfile(farcasterUser);
            setUser(profile);
          }
        } else if (isWebApp && window.FarcasterAuthKit) {
          console.log("🌐 Web App environment detected - using FarcasterAuthKit");
          // Web app environment: use AuthKit
          try {
            // AuthKit doesn't have getUser() - it uses useProfile hook
            // This will be handled by the FarcasterAuthKit component
            console.log("AuthKit detected but getUser() not available - using component instead");
            // AuthKit user handling is done in the component
            console.log("AuthKit user handling done in component");
          } catch (error) {
            console.log("No user session in web app");
          }
        } else {
            // In dev mode, don't auto-login. Let the user choose from the login page.
            console.warn("Farcaster SDK not found. Displaying developer login options.");
        }
      } catch (e) {
        console.error("Error checking Farcaster session:", e);
      } finally {
        setIsLoading(false);
      }
    };
    checkFarcasterSession();
  }, []);

  const login = async () => {
    setIsLoading(true);
    try {
      // Check if user wants to use real Farcaster
      const useRealFarcaster = localStorage.getItem('useRealFarcaster') === 'true';
      
      // Check environment
      const isMiniApp = window.farcaster && window.farcaster.signIn;
      const isWebApp = window.FarcasterAuthKit && window.FarcasterAuthKit.AuthKitProvider;
      
      if (isMiniApp) {
        console.log("📱 Mini App login - using window.farcaster");
      } else if (isWebApp) {
        console.log("🌐 Web App login - using FarcasterAuthKit");
      }
      
      if (!isMiniApp && !isWebApp) {
          if (useRealFarcaster) {
            // Real Farcaster mode but SDK not available
            console.warn("Real Farcaster mode enabled but SDK not available. Please refresh the page.");
            setError("Real Farcaster SDK not available. Please refresh the page.");
            setIsLoading(false);
            return { error: "Real Farcaster SDK not available" };
          } else {
            // Development mode: use mock user
            console.warn("Farcaster SDK not available. Using development mode.");
            const mockUser: User = {
              id: 'dev-user-1',
              fid: 1,
              username: 'farcaster.eth',
              pfp_url: 'https://i.imgur.com/34Iodlt.jpg',
              email: 'dev@example.com'
            };
            setUser(mockUser);
            setIsLoading(false);
            return {};
          }
      }
      
      if (isMiniApp && window.farcaster) {
        // Mini App login
        // Call sdk.actions.ready() before sign in only for real SDK
        const isRealSDK = !window.farcaster?.signIn?.toString().includes('Mock') && 
                         !window.farcaster?.signIn?.toString().includes('Enhanced mock');
        
        if (window.farcaster.actions?.ready && isRealSDK) {
          window.farcaster.actions.ready();
          console.log("Called sdk.actions.ready() before login on REAL SDK");
        } else if (window.farcaster.actions?.ready && !isRealSDK) {
          console.log("Mock SDK detected - not calling ready() before login to avoid popup issues");
        }
        
        const result = await window.farcaster.signIn();
        
        if ('error' in result) {
          throw new Error(result.error);
        }
        
        const profile = await getOrCreateUserProfile(result);
        setUser(profile);
        
      } else if (isWebApp && window.FarcasterAuthKit) {
        // Web App login
        // AuthKit doesn't have signIn() - it uses SignInButton component
        // This will be handled by the FarcasterAuthKit component
        console.log("AuthKit detected but signIn() not available - using component instead");
        throw new Error("AuthKit login must be handled by component");
      } else {
        throw new Error("No Farcaster SDK available");
      }
      
      setIsLoading(false);
      return {};
    } catch (error) {
      console.error("Farcaster login failed:", error);
      setIsLoading(false);
      return { error };
    }
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
    error,
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