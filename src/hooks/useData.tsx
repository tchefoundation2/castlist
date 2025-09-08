import React, { createContext, useState, useContext, ReactNode, useEffect, useCallback, useMemo } from 'react';
import { Guide, Activity } from '../types';
import { getPublicGuides, getRecommendedGuides, getMyGuides } from '../services/supabaseService';
import { getActivityLog } from '../services/activityService';
import { useAuth } from './useAuth';

interface ProfileStats {
  totalLikes: number;
  rank: number | null;
  totalRankedUsers: number;
}

interface DataContextType {
  // Data
  allGuides: Guide[];
  myGuides: Guide[];
  recommendedGuides: Guide[];
  rankedGuides: Guide[];
  activities: Activity[];
  profileStats: ProfileStats;
  
  // Loading states
  isLoading: boolean; // General loading for initial fetch
  
  // Actions
  refreshAllData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  // Raw Data
  const [allGuides, setAllGuides] = useState<Guide[]>([]);
  const [myGuides, setMyGuides] = useState<Guide[]>([]);
  const [recommendedGuides, setRecommendedGuides] = useState<Guide[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);

  // Derived Data
  const [rankedGuides, setRankedGuides] = useState<Guide[]>([]);
  const [profileStats, setProfileStats] = useState<ProfileStats>({ totalLikes: 0, rank: null, totalRankedUsers: 0 });

  // Loading State
  const [isLoading, setIsLoading] = useState(true);

  const calculateRankingsAndStats = useCallback((publicGuides: Guide[], myFid: number | null) => {
      // Calculate rankings
      const sorted = [...publicGuides].sort((a, b) => b.likes - a.likes);
      setRankedGuides(sorted.slice(0, 10));

      // Calculate profile stats
      if (!myFid) {
          setProfileStats({ totalLikes: 0, rank: null, totalRankedUsers: 0 });
          return;
      }

      const authorLikes = new Map<number, number>();
      publicGuides.forEach(guide => {
          if (guide.authorFid) {
              const currentLikes = authorLikes.get(guide.authorFid) || 0;
              authorLikes.set(guide.authorFid, currentLikes + guide.likes);
          }
      });
      
      const rankedAuthors = Array.from(authorLikes.entries())
        .map(([fid, totalLikes]) => ({ fid, totalLikes }))
        .sort((a, b) => b.totalLikes - a.totalLikes);
        
      const myRankIndex = rankedAuthors.findIndex(author => author.fid === myFid);
      
      let totalPublicLikes = 0;
      let myRank = null;
      if (myRankIndex !== -1) {
          myRank = myRankIndex + 1;
          totalPublicLikes = rankedAuthors[myRankIndex].totalLikes;
      }
      
      setProfileStats({
          totalLikes: totalPublicLikes,
          rank: myRank,
          totalRankedUsers: rankedAuthors.length > 0 ? rankedAuthors.length : 1
      });
  }, []);

  const fetchAllData = useCallback(async () => {
    if (!user) {
        setIsLoading(false);
        return;
    }
    setIsLoading(true);
    try {
      const [publicGuides, recGuides, userGuides, userActivities] = await Promise.all([
          getPublicGuides(),
          getRecommendedGuides(),
          getMyGuides(user.id),
          getActivityLog(user.id)
      ]);

      setAllGuides(publicGuides);
      setRecommendedGuides(recGuides);
      setMyGuides(userGuides);
      setActivities(userActivities);
      
      calculateRankingsAndStats(publicGuides, user.fid);

    } catch (error) {
        console.error("Failed to fetch app data:", error);
    } finally {
        setIsLoading(false);
    }
  }, [user, calculateRankingsAndStats]);

  useEffect(() => {
    if (user) {
        fetchAllData();
    }
  }, [user, fetchAllData]);

  const value = useMemo(() => ({
    allGuides,
    myGuides,
    recommendedGuides,
    rankedGuides,
    activities,
    profileStats,
    isLoading,
    refreshAllData: fetchAllData,
  }), [allGuides, myGuides, recommendedGuides, rankedGuides, activities, profileStats, isLoading, fetchAllData]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};