import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useFarcasterPreview } from '../hooks/useFarcasterPreview';
import Button from '../components/Button';
import { MOCK_USERS } from '../services/mockData';
// Removed unused User import

const FarcasterIcon = () => (
    <svg
        width="24"
        height="24"
        viewBox="0 0 1000 1000"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M257.778 155.556H742.222V844.445H671.111V528.889H670.414C662.554 441.677 589.258 373.333 500 373.333C410.742 373.333 337.446 441.677 329.586 528.889H328.889V844.445H257.778V155.556Z" fill="currentColor"/>
        <path d="M128.889 253.333L157.778 351.111H182.222V746.667C169.949 746.667 160 756.616 160 768.889V795.556H155.556C143.283 795.556 133.333 805.505 133.333 817.778V844.445H382.222V817.778C382.222 805.505 372.273 795.556 360 795.556H355.556V768.889C355.556 756.616 345.606 746.667 333.333 746.667H306.667V253.333H128.889Z" fill="currentColor"/>
        <path d="M675.556 746.667C663.282 746.667 653.333 756.616 653.333 768.889V795.556H648.889C636.616 795.556 626.667 805.505 626.667 817.778V844.445H875.556V817.778C875.556 805.505 865.606 795.556 853.333 795.556H848.889V768.889C848.889 756.616 838.94 746.667 826.667 746.667V351.111H851.111L880 253.333H702.222V746.667H675.556Z" fill="currentColor"/>
    </svg>
);


const LoginPage: React.FC = () => {
  const { login, loginAsMockUser, isLoading } = useAuth();
  const { isInPreview } = useFarcasterPreview();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setError(null);
    const { error } = await login();
    if (error) {
        setError(error.message || 'Failed to sign in with Farcaster.');
    }
  };

  // Check if we're in development mode (no Farcaster SDK)
  const isDevelopmentMode = !window.farcaster;

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
            The Castlist platform is your gateway to creating, sharing, and discovering curated lists within the Farcaster ecosystem.
        </p>
        
        <div className="mt-10">
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            {isInPreview && (
              <p className="text-green-600 text-sm mb-4 text-center">
                <strong>🎉 Farcaster Preview Mode:</strong> Testing in official Farcaster preview tool!
              </p>
            )}
            {isDevelopmentMode && !isInPreview && (
              <p className="text-blue-600 text-sm mb-4 text-center">
                <strong>Development Mode:</strong> Farcaster SDK not detected. 
                Click "Sign in with Farcaster" to use mock user for testing.
              </p>
            )}
            <Button onClick={handleLogin} isLoading={isLoading} className="w-full">
              <FarcasterIcon />
              <span className="ml-3">Sign In with Farcaster</span>
            </Button>
        </div>

      </div>

      {/* --- Developer Login Panel --- */}
      {!window.farcaster && (
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700/80 w-full max-w-sm">
          <p className="text-center text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4">Developer Login</p>
          <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide pr-2">
            {Object.values(MOCK_USERS).map((mockUser) => (
              <button
                key={mockUser.id}
                onClick={() => loginAsMockUser({ ...mockUser, email: `${mockUser.username}@dev.com` })}
                className="w-full flex items-center p-2 rounded-xl bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-700/80 transition-colors text-left focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <img src={mockUser.pfp_url} alt={mockUser.username} className="w-10 h-10 rounded-full mr-4 shadow-sm" />
                <div className="flex-1">
                  <p className="font-semibold text-gray-800 dark:text-gray-100">{mockUser.username}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">FID: {mockUser.fid}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

export default LoginPage;