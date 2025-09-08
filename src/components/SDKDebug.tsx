import React, { useState } from 'react';
import { useFarcasterSDK } from '../hooks/useFarcasterSDK';
import { useAuth } from '../hooks/useAuth';

const SDKDebug: React.FC = () => {
  const [useRealFarcaster, setUseRealFarcaster] = useState(() => {
    return localStorage.getItem('useRealFarcaster') === 'true';
  });
  const { isLoaded, isReady, hasActions } = useFarcasterSDK(useRealFarcaster);
  const { user, isAuthenticated } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleRealFarcaster = () => {
    const newValue = !useRealFarcaster;
    setUseRealFarcaster(newValue);
    localStorage.setItem('useRealFarcaster', newValue.toString());
    
    if (newValue) {
      console.log("🔄 Switched to Real Farcaster mode - reload page to apply");
      // Reload page to apply changes
      setTimeout(() => window.location.reload(), 1000);
    } else {
      console.log("🔄 Switched to Mock Farcaster mode - reload page to apply");
      // Reload page to apply changes
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  // Check if we're in Farcaster preview
  const isInFarcasterPreview = document.referrer.includes('farcaster.xyz') || 
                               window.location.href.includes('farcaster.xyz') ||
                               window.location.href.includes('ngrok');

  // Only show in development or when there are issues
  if (process.env.NODE_ENV === 'production' && isReady) {
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
          <div className="flex items-center justify-between">
            <span>Use Real Farcaster:</span>
            <button
              onClick={toggleRealFarcaster}
              className={`px-2 py-1 text-xs rounded ${
                useRealFarcaster 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-600 text-gray-300'
              }`}
            >
              {useRealFarcaster ? 'ON' : 'OFF'}
            </button>
          </div>
          <div>SDK Loaded: {isLoaded ? '✅' : (useRealFarcaster ? '⏳' : '❌')}</div>
          <div>Has Actions: {hasActions ? '✅' : (useRealFarcaster ? '⏳' : '❌')}</div>
          <div>SDK Ready: {isReady ? '✅' : (useRealFarcaster ? '⏳' : '⏳')}</div>
          <div>Farcaster: {window.farcaster ? '✅' : (useRealFarcaster ? '⏳' : '❌')}</div>
          <div>Preview Mode: {isInFarcasterPreview ? '✅' : '❌'}</div>
          <div>Mode: {useRealFarcaster ? '🔴 Real' : '🟡 Mock'}</div>
          {useRealFarcaster && !isLoaded && (
            <div className="text-yellow-400 text-xs">
              ⏳ Waiting for real Farcaster SDK...
            </div>
          )}
                 <div className="border-t border-gray-600 pt-1 mt-1">
                   <div className="font-bold text-green-400">User Info:</div>
                   <div>Authenticated: {isAuthenticated ? '✅' : '❌'}</div>
                   {user && (
                     <>
                       <div>FID: {user.fid}</div>
                       <div>Username: {user.username}</div>
                       <div>ID: {user.id}</div>
                       <div className="text-xs text-gray-400">
                         User Type: {
                           user.fid === 99999 ? '🟠 Enhanced Mock' :
                           (user.id === 'dev-user-1' || user.fid === 12345 || user.username === 'preview_user') ? '🟡 Mock' : 
                           '🔴 Real'
                         }
                       </div>
                       <div className="text-xs text-red-400">
                         SDK Source: {
                           window.farcaster?.signIn?.toString().includes('Enhanced mock') ? '🟠 Enhanced Mock SDK' :
                           window.farcaster?.signIn?.toString().includes('Mock') ? '🟡 Mock SDK' : 
                           '🔴 Real SDK'
                         }
                       </div>
                     </>
                   )}
                 </div>
                 {window.farcaster?.actions && (
                   <div>Actions: {Object.keys(window.farcaster.actions).join(', ')}</div>
                 )}
                 <div className="text-xs text-gray-400">
                   URL: {window.location.href.substring(0, 30)}...
                 </div>
                 <div className="text-xs text-gray-400">
                   Referrer: {document.referrer.substring(0, 30)}...
                 </div>
        </div>
      </div>
    </div>
  );
};

export default SDKDebug;
