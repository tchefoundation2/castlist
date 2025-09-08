import { useState, useCallback } from 'react';
import { 
  getFarcasterUser, 
  getUserCasts, 
  searchFarcasterUsers, 
  getTrendingCasts,
  createCast,
  shareGuideAsCast,
  FarcasterUser,
  FarcasterCast
} from '../services/farcasterService';

export interface UseFarcasterReturn {
  // User data
  user: FarcasterUser | null;
  userCasts: FarcasterCast[];
  
  // Search and discovery
  searchResults: FarcasterUser[];
  trendingCasts: FarcasterCast[];
  
  // Loading states
  isLoading: boolean;
  isSearching: boolean;
  isCreatingCast: boolean;
  
  // Actions
  fetchUser: (fid: number) => Promise<void>;
  searchUsers: (query: string) => Promise<void>;
  fetchTrending: () => Promise<void>;
  shareGuide: (guide: any) => Promise<FarcasterCast | null>;
  createNewCast: (text: string, parentHash?: string) => Promise<FarcasterCast | null>;
  
  // Error handling
  error: string | null;
  clearError: () => void;
}

export const useFarcaster = (): UseFarcasterReturn => {
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [userCasts, setUserCasts] = useState<FarcasterCast[]>([]);
  const [searchResults, setSearchResults] = useState<FarcasterUser[]>([]);
  const [trendingCasts, setTrendingCasts] = useState<FarcasterCast[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreatingCast, setIsCreatingCast] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchUser = useCallback(async (fid: number) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [userData, casts] = await Promise.all([
        getFarcasterUser(fid),
        getUserCasts(fid, 25)
      ]);
      
      if (userData) {
        setUser(userData);
        setUserCasts(casts);
      } else {
        setError('User not found');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const searchUsers = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    setError(null);
    
    try {
      const results = await searchFarcasterUsers(query, 10);
      setSearchResults(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search users');
    } finally {
      setIsSearching(false);
    }
  }, []);

  const fetchTrending = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const casts = await getTrendingCasts(25);
      setTrendingCasts(casts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch trending casts');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const shareGuide = useCallback(async (guide: any): Promise<FarcasterCast | null> => {
    setIsCreatingCast(true);
    setError(null);
    
    try {
      const cast = await shareGuideAsCast(guide);
      if (cast) {
        // Refresh user casts to show the new one
        if (user) {
          await fetchUser(user.fid);
        }
      }
      return cast;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share guide');
      return null;
    } finally {
      setIsCreatingCast(false);
    }
  }, [user, fetchUser]);

  const createNewCast = useCallback(async (text: string, parentHash?: string): Promise<FarcasterCast | null> => {
    setIsCreatingCast(true);
    setError(null);
    
    try {
      const cast = await createCast(text, parentHash);
      if (cast && user) {
        // Refresh user casts to show the new one
        await fetchUser(user.fid);
      }
      return cast;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create cast');
      return null;
    } finally {
      setIsCreatingCast(false);
    }
  }, [user, fetchUser]);

  return {
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
    clearError,
  };
};
