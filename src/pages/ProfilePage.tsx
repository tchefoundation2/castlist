import React from 'react';
import { TrophyIcon } from '@heroicons/react/24/solid';
import { Page } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useData } from '../hooks/useData';
import GuideCard from '../components/GuideCard';
import Loader from '../components/Loader';
import Button from '../components/Button';

interface ProfilePageProps {
  setPage: (page: Page, id?: number) => void;
  setSelectedGuideId: (id: number) => void;
}

// --- Helper Components & Functions ---

const formatTimeAgo = (isoString: string): string => {
    const date = new Date(isoString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    const years = Math.floor(days / 365);
    return `${years}y ago`;
};

const ActivityIcon: React.FC<{ action: string }> = ({ action }) => {
    const iconBaseClasses = "w-10 h-10 rounded-full flex items-center justify-center";
    if (action.includes('Liked')) {
        return (
            <div className={`${iconBaseClasses} bg-red-100 dark:bg-red-900/40`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
            </div>
        );
    }
    if (action.includes('Disliked')) {
        return (
             <div className={`${iconBaseClasses} bg-blue-100 dark:bg-blue-900/40`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 3.5a1.5 1.5 0 01.954 2.805l-4.18 6.335A1.5 1.5 0 015.5 14H5V8.5a1.5 1.5 0 011.5-1.5h2.5V3.5zM8 5.5H6.5V14h.672a3.5 3.5 0 003.26-4.971l4.18-6.335A3.501 3.501 0 0010 0a3.5 3.5 0 00-2 6.5v-1z" transform="translate(0 3)" />
                </svg>
            </div>
        )
    }
    if (action.includes('Shared')) {
         return (
             <div className={`${iconBaseClasses} bg-primary-100 dark:bg-primary-900/40`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-500" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
            </div>
        )
    }
    return null;
}

const ThemeSwitcher: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <div className="flex items-center justify-between">
            <span className="font-medium text-gray-800 dark:text-gray-200">Dark Mode</span>
            <button 
                onClick={toggleTheme} 
                className="relative inline-flex items-center h-8 w-14 rounded-full transition-colors bg-gray-200 dark:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800"
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
                <span className={`inline-block w-6 h-6 transform transition-transform rounded-full bg-white dark:bg-gray-300 ${theme === 'dark' ? 'translate-x-7' : 'translate-x-1'}`}></span>
                <span className={`absolute left-1.5 top-1.5 transition-opacity ${theme === 'light' ? 'opacity-100' : 'opacity-0'}`} aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 14.464A1 1 0 106.465 13.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zm-1.414-2.12a1 1 0 011.414 0l.707.707a1 1 0 11-1.414 1.414l-.707-.707a1 1 0 010-1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" />
                    </svg>
                </span>
                <span className={`absolute right-1.5 top-1.5 transition-opacity ${theme === 'dark' ? 'opacity-100' : 'opacity-0'}`} aria-hidden="true">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-400" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                     </svg>
                </span>
            </button>
        </div>
    );
};


const ProfilePage: React.FC<ProfilePageProps> = ({ setPage, setSelectedGuideId }) => {
  const { user, logout } = useAuth();
  const { myGuides: guides, activities, profileStats, isLoading } = useData();
  
  const handleGuideClick = (id: number) => {
    setSelectedGuideId(id);
    setPage(Page.GuideDetail, id);
  };
  
  if (isLoading) {
    return <div className="flex justify-center mt-20"><Loader /></div>;
  }
  
  if (!user) {
    return <div className="text-center text-gray-500 mt-20">User not found.</div>;
  }

  return (
    <div className="animate-fadeIn space-y-8">
      {/* Profile Header */}
      <section className="bg-white dark:bg-gray-800 rounded-3xl p-6 flex flex-col items-center text-center shadow-md border border-gray-200/80 dark:border-gray-700/80">
        <img 
          src={user.pfp_url} 
          alt={user.username} 
          className="w-24 h-24 rounded-full mb-4 ring-4 ring-primary-200 dark:ring-primary-900 shadow-lg"
        />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{user.username}</h2>
        
        {/* Stats */}
        <div className="flex justify-center items-center space-x-8 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 w-full">
            <div className="text-center">
                <p className="text-2xl font-bold text-primary-700 dark:text-primary-400">{guides.length}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Guides</p>
            </div>
            <div className="text-center">
                <p className="text-2xl font-bold text-primary-700 dark:text-primary-400">{profileStats.totalLikes}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Likes</p>
            </div>
        </div>
      </section>

      {/* Ranking Section */}
      <section>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 px-1">Your Rank</h3>
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-md border border-gray-200/80 dark:border-gray-700/80 flex items-center space-x-6">
          <div className="bg-primary-100 dark:bg-primary-900/40 p-4 rounded-full flex-shrink-0">
            <TrophyIcon className="h-8 w-8 text-primary-600 dark:text-primary-300" />
          </div>
          <div>
            {profileStats.rank ? (
                <>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Your Global Position</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">#{profileStats.rank}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        You're in the top {Math.ceil((profileStats.rank / profileStats.totalRankedUsers) * 100)}% of creators!
                    </p>
                </>
            ) : (
                 <>
                    <p className="text-lg font-semibold text-gray-800 dark:text-gray-100">You are not ranked yet</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Create public guides and get likes to join the leaderboard!</p>
                 </>
            )}
        </div>
        </div>
      </section>

      {/* Activity History Section */}
      <section>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 px-1">Activity History</h3>
        {activities.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-4 shadow-md border border-gray-200/80 dark:border-gray-700/80 space-y-2">
            {activities.slice(0, 5).map((activity, index) => ( // Show latest 5
              <div key={index} className="flex items-center p-2 rounded-xl">
                <div className="mr-4">
                  <ActivityIcon action={activity.action} />
                </div>
                <div className="flex-grow">
                  <p className="text-sm text-gray-800 dark:text-gray-200 leading-tight">
                    You {activity.action.toLowerCase()} the guide: <span className="font-semibold">"{activity.itemTitle}"</span>
                  </p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 ml-2 flex-shrink-0">
                  {formatTimeAgo(activity.timestamp)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 px-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-md font-semibold text-gray-800 dark:text-gray-100">No recent activity.</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Like or share a guide to see your activity here.</p>
          </div>
        )}
      </section>

      {/* Settings Section */}
      <section className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-md border border-gray-200/80 dark:border-gray-700/80">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">Settings</h3>
        <div className="space-y-4">
          <ThemeSwitcher />
          <div className="pt-2">
            <Button 
              onClick={() => setPage(Page.FarcasterTest)} 
              variant="secondary" 
              className="w-full"
            >
              🔑 Test Farcaster API
            </Button>
          </div>
        </div>
      </section>
      
      {/* User's Guides Section */}
      <section>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 px-1">My Guides</h3>
        {guides.length > 0 ? (
          <div className="space-y-4">
            {guides.map(guide => (
              <GuideCard key={guide.id} guide={guide} onClick={() => handleGuideClick(guide.id)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">No guides yet!</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-2">Tap the 'Create' tab to build your first reading guide.</p>
          </div>
        )}
      </section>

      <section className="pt-4">
         <Button
            variant="danger"
            onClick={logout}
            className="w-full"
        >
            Sign Out
        </Button>
      </section>
    </div>
  );
};

export default ProfilePage;