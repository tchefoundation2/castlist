import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { getOrCreateUserProfile } from '../services/supabaseService';

// Define the Farcaster SDK type on the window object for TypeScript
declare global {
  interface Window {
    // Mini App SDK v2 (inside Farcaster mobile/web app)
    farcaster?: {
      isInMiniApp: () => Promise<boolean>;
      context: {
        get: () => Promise<{ user?: { fid: number; username: string; pfp_url: string; } } | null>;
      };
      actions: {
        ready: () => Promise<void>;
      };
      getCapabilities: () => Promise<string[]>;
      getChains: () => Promise<any[]>;
    };
    farcasterUser?: { fid: number; username: string; pfp_url: string; };
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
      console.log("🔍 Starting Farcaster v2 authentication...");
      setIsLoading(true);
      
      try {
        // Wait for SDK to load
        let attempts = 0;
        while (!window.farcaster && attempts < 10) {
          console.log(`⏳ Waiting for SDK... attempt ${attempts + 1}`);
          await new Promise(resolve => setTimeout(resolve, 1000));
          attempts++;
        }
        
        if (!window.farcaster) {
          console.warn("⚠️ Farcaster SDK not found after 10 seconds");
          setIsLoading(false);
          return;
        }
        
        console.log("✅ Farcaster SDK found");
        
        // Check if we're in a mini app
        const isInMiniApp = await window.farcaster.isInMiniApp();
        console.log("🔍 Is in Mini App:", isInMiniApp);
        
        if (isInMiniApp) {
          console.log("📱 Mini App environment detected");
          
          // Check if user data is available from SDK
          if (window.farcasterUser) {
            console.log("✅ User data found from SDK:", window.farcasterUser);
            
            // Create user profile
            const profile = await getOrCreateUserProfile(window.farcasterUser);
            setUser(profile);
            console.log("✅ User authenticated successfully");
          } else {
            console.warn("⚠️ No user data available from SDK");
            console.log("ℹ️ User may need to authenticate first");
          }
        } else {
          console.log("🌐 Web browser detected - QR code authentication needed");
          console.log("ℹ️ User needs to scan QR code with Farcaster mobile app");
          console.log("ℹ️ This is normal behavior for web browsers");
        }
        
      } catch (e) {
        console.error("❌ Error in authentication check:", e);
      } finally {
        console.log("🔍 Authentication check complete");
        setIsLoading(false);
      }
    };
    
    // Listen for user ready event
    const handleUserReady = async (event: CustomEvent) => {
      console.log("🎉 User ready event received:", event.detail);
      const userData = event.detail;
      
      try {
        const profile = await getOrCreateUserProfile(userData);
        setUser(profile);
        console.log("✅ User authenticated successfully via event");
      } catch (error) {
        console.error("❌ Error creating user profile:", error);
      }
    };
    
    window.addEventListener('farcasterUserReady', handleUserReady as EventListener);
    
    checkFarcasterSession();
    
    // Cleanup
    return () => {
      window.removeEventListener('farcasterUserReady', handleUserReady as EventListener);
    };
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