import React, { useState } from 'react';
import { useFarcaster } from '../hooks/useFarcaster';
import Button from './Button';

const FarcasterTest: React.FC = () => {
  const {
    user,
    userCasts,
    searchResults,
    trendingCasts,
    isLoading,
    isSearching,
    isCreatingCast,
    fetchUser,
    searchUsers,
    fetchTrending,
    shareGuide,
    createNewCast,
    error,
    clearError
  } = useFarcaster();

  const [searchQuery, setSearchQuery] = useState('');
  const [castText, setCastText] = useState('');
  const [testFid, setTestFid] = useState('1'); // Test with FID 1 (dwr.eth)

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      await searchUsers(searchQuery);
    }
  };

  const handleFetchUser = async () => {
    const fid = parseInt(testFid);
    if (!isNaN(fid)) {
      await fetchUser(fid);
    }
  };

  const handleCreateCast = async () => {
    if (castText.trim()) {
      const cast = await createNewCast(castText);
      if (cast) {
        setCastText('');
        alert('Cast created successfully!');
      }
    }
  };

  const handleShareGuide = async () => {
    const mockGuide = {
      title: "Test Guide",
      description: "This is a test guide from Castlist",
      tags: ["test", "farcaster", "books"]
    };
    
    const cast = await shareGuide(mockGuide);
    if (cast) {
      alert('Guide shared as cast successfully!');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          🔑 Farcaster API Test
        </h2>
        
        {error && (
          <div className="bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-4 mb-4">
            <p className="text-red-700 dark:text-red-300">{error}</p>
            <Button onClick={clearError} variant="secondary" className="mt-2">
              Clear Error
            </Button>
          </div>
        )}

        {/* User Fetch Test */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Test User Fetch
          </h3>
          <div className="flex gap-2">
            <input
              id="test-fid"
              name="test-fid"
              type="number"
              value={testFid}
              onChange={(e) => setTestFid(e.target.value)}
              placeholder="Enter FID (e.g., 1)"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <Button onClick={handleFetchUser} isLoading={isLoading}>
              Fetch User
            </Button>
          </div>
          
          {user && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200">User Data:</h4>
              <p><strong>FID:</strong> {user.fid}</p>
              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>Display Name:</strong> {user.display_name}</p>
              <p><strong>Followers:</strong> {user.follower_count}</p>
              <p><strong>Following:</strong> {user.following_count}</p>
              <img src={user.pfp_url} alt="Profile" className="w-16 h-16 rounded-full mt-2" />
            </div>
          )}
        </div>

        {/* Search Test */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Test User Search
          </h3>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-3 mb-4">
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Note:</strong> The Farcaster API doesn't have a search endpoint. 
              This searches through popular users (FIDs 1-20) and filters by username match.
            </p>
          </div>
          <div className="flex gap-2">
            <input
              id="search-query"
              name="search-query"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users (e.g., 'farcaster', 'dwr')"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <Button onClick={handleSearch} isLoading={isSearching}>
              Search
            </Button>
          </div>
          
          {searchResults.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Search Results:</h4>
              <div className="space-y-2">
                {searchResults.map((user) => (
                  <div key={user.fid} className="flex items-center gap-3 p-2 bg-white dark:bg-gray-600 rounded">
                    <img src={user.pfp_url} alt={user.username} className="w-8 h-8 rounded-full" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{user.username}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">FID: {user.fid}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Trending Test */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Test Trending Casts
          </h3>
          <Button onClick={fetchTrending} isLoading={isLoading}>
            Fetch Trending
          </Button>
          
          {trendingCasts.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Trending Casts:</h4>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {trendingCasts.slice(0, 5).map((cast) => (
                  <div key={cast.hash} className="p-3 bg-white dark:bg-gray-600 rounded">
                    <div className="flex items-center gap-2 mb-2">
                      <img src={cast.author.pfp_url} alt={cast.author.username} className="w-6 h-6 rounded-full" />
                      <span className="font-medium text-gray-900 dark:text-white">{cast.author.username}</span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm">{cast.text}</p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>❤️ {cast.reactions.count}</span>
                      <span>🔄 {cast.recasts.count}</span>
                      <span>💬 {cast.replies.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Cast Creation Test */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Test Cast Creation
          </h3>
          <div className="space-y-2">
            <textarea
              value={castText}
              onChange={(e) => setCastText(e.target.value)}
              placeholder="Enter your cast text..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white h-20"
            />
            <div className="flex gap-2">
              <Button onClick={handleCreateCast} isLoading={isCreatingCast}>
                Create Cast
              </Button>
              <Button onClick={handleShareGuide} isLoading={isCreatingCast} variant="secondary">
                Share Test Guide
              </Button>
            </div>
          </div>
        </div>

        {/* User Casts */}
        {userCasts.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
              User's Recent Casts
            </h3>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {userCasts.slice(0, 5).map((cast) => (
                  <div key={cast.hash} className="p-3 bg-white dark:bg-gray-600 rounded">
                    <p className="text-gray-700 dark:text-gray-300 text-sm">{cast.text}</p>
                    <div className="flex gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>❤️ {cast.reactions.count}</span>
                      <span>🔄 {cast.recasts.count}</span>
                      <span>💬 {cast.replies.count}</span>
                      <span>{new Date(cast.timestamp).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FarcasterTest;
