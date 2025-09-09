import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { sdk } from '@farcaster/miniapp-sdk';

const SDKDebug: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sdkStatus, setSdkStatus] = useState({
    isInMiniApp: false,
    isReady: false,
    hasQuickAuth: false
  });
  
  useEffect(() => {
    const checkSdkStatus = async () => {
      try {
        const isInMiniApp = await sdk.isInMiniApp();
        const hasQuickAuth = !!sdk.quickAuth;
        
        setSdkStatus({
          isInMiniApp,
          isReady: true,
          hasQuickAuth
        });
      } catch (error) {
        console.error("Error checking SDK status:", error);
      }
    };
    
    checkSdkStatus();
  }, []);

  // Only show in development
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 bg-black/80 text-white text-xs rounded-lg z-50 font-mono max-w-xs transition-all duration-300 ease-in-out">
      {/* Header with toggle button */}
      <div 
        className="flex items-center justify-between p-2 cursor-pointer hover:bg-black/60 rounded-t-lg"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="font-bold text-yellow-400">SDK Debug Panel</div>
        <div className="text-gray-400 hover:text-white transition-colors">
          {isCollapsed ? '▼' : '▲'}
        </div>
      </div>
      
      {/* Collapsible content */}
      <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isCollapsed ? 'max-h-0 opacity-0' : 'max-h-96 opacity-100'
      }`}>
        <div className="p-2 pt-0 space-y-1">
          <div className="font-bold text-blue-400">SDK Status:</div>
          <div>In Mini App: {sdkStatus.isInMiniApp ? '✅' : '❌'}</div>
          <div>SDK Ready: {sdkStatus.isReady ? '✅' : '⏳'}</div>
          <div>Quick Auth: {sdkStatus.hasQuickAuth ? '✅' : '❌'}</div>
          
          <div className="border-t border-gray-600 pt-1 mt-1">
            <div className="font-bold text-green-400">User Info:</div>
            <div>Authenticated: {isAuthenticated ? '✅' : '❌'}</div>
            {user && (
              <>
                <div>FID: {user.fid}</div>
                <div>Username: {user.username}</div>
                <div>ID: {user.id}</div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SDKDebug;
