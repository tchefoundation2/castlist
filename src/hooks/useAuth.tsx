import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User } from '../types';
import { getOrCreateUserProfile } from '../services/supabaseService';

// Import the official Farcaster Miniapp SDK
import { sdk } from '@farcaster/miniapp-sdk';

// Define the Farcaster SDK type on the window object for TypeScript
declare global {
  interface Window {
    // Mini App SDK v2 (inside Farcaster mobile/web app)
    farcaster?: typeof sdk;
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
    const authenticateWithQuickAuth = async () => {
      console.log("🔍 Starting Farcaster v2 Quick Auth...");
      setIsLoading(true);
      
      try {
        // Check if we're in a mini app
        const isInMiniApp = await sdk.isInMiniApp();
        console.log("🔍 Is in Mini App:", isInMiniApp);
        
        if (isInMiniApp) {
          console.log("📱 Mini App environment detected");
          
          try {
            // Use Quick Auth to get authenticated user
            const { token } = await sdk.quickAuth.getToken();
            console.log("✅ Quick Auth token received");
            
            // Get user context
            const context = await sdk.context.get();
            if (context?.user) {
              const userData = context.user;
              console.log("✅ User data from context:", userData);
              
              // Create user profile
              const profile = await getOrCreateUserProfile(userData);
              setUser(profile);
              console.log("✅ User authenticated successfully");
              
              // Call ready when authenticated
              await sdk.actions.ready();
              console.log("✅ SDK ready called");
            } else {
              console.warn("⚠️ No user data in context");
            }
          } catch (authError) {
            console.error("❌ Quick Auth error:", authError);
          }
        } else {
          console.log("🌐 Web browser detected");
          // For web browser, we'll use development mode
          setIsLoading(false);
        }
        
      } catch (e) {
        console.error("❌ Error in Quick Auth:", e);
      } finally {
        console.log("🔍 Quick Auth check complete");
        setIsLoading(false);
      }
    };
    
    authenticateWithQuickAuth();
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