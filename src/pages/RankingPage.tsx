import React from 'react';
import { TrophyIcon } from '@heroicons/react/24/solid';
import { Page } from '../types';
import Loader from '../components/Loader';
import Button from '../components/Button';
import { useData } from '../hooks/useData';

interface RankingPageProps {
  setPage: (page: Page, id?: number) => void;
  setSelectedGuideId: (id: number) => void;
}

const MedalIcon: React.FC<{ rank: number }> = ({ rank }) => {
  const medals = [
    { color: 'text-yellow-400 dark:text-yellow-300', shadow: 'drop-shadow-[0_2px_2px_rgba(250,204,21,0.4)]' }, // Gold
    { color: 'text-gray-400 dark:text-gray-300', shadow: 'drop-shadow-[0_2px_2px_rgba(156,163,175,0.4)]' },   // Silver
    { color: 'text-orange-500 dark:text-orange-400', shadow: 'drop-shadow-[0_2px_2px_rgba(249,115,22,0.4)]' }  // Bronze
  ];

  if (rank > 3) return null;

  const { color, shadow } = medals[rank - 1];

  return (
    <div className={`relative ${shadow}`}>
      <TrophyIcon className={`h-6 w-6 ${color}`} />
    </div>
  );
};


const RankingPage: React.FC<RankingPageProps> = ({ setPage, setSelectedGuideId }) => {
  const { rankedGuides, isLoading } = useData();

  const handleGuideClick = (id: number) => {
    setSelectedGuideId(id);
    setPage(Page.GuideDetail, id);
  };
  
  const handleShareRanking = () => {
    setPage(Page.ShareRanking);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center mt-20">
        <Loader text="Calculating rankings..." />
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">Top 10 Guides</h2>
      {rankedGuides.length > 0 ? (
        <>
            <div className="space-y-3">
            {rankedGuides.map((guide, index) => {
                const rank = index + 1;
                return (
                <div 
                    key={guide.id} 
                    onClick={() => handleGuideClick(guide.id)}
                    className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 shadow-md p-4 cursor-pointer transition-all duration-300 hover:shadow-xl hover:border-primary-300 dark:hover:border-primary-700 hover:-translate-y-1 flex items-center space-x-4"
                >
                    <div className="flex flex-col items-center justify-center w-12 text-center">
                    <span className="text-2xl font-bold text-gray-500 dark:text-gray-400">#{rank}</span>
                    <MedalIcon rank={rank} />
                    </div>
                    <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 truncate">{guide.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">by {guide.authorUsername}</p>
                    </div>
                    <div className="flex items-center space-x-2 text-red-500 flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                    </svg>
                    <span className="font-bold text-md">{guide.likes}</span>
                    </div>
                </div>
                )
            })}
            </div>

            <div className="mt-8">
                <Button onClick={handleShareRanking} className="w-full">
                    Share Ranking
                </Button>
            </div>
        </>
      ) : (
        <div className="text-center py-12 px-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">No guides available!</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">Check back later to see the top guides.</p>
        </div>
      )}
    </div>
  );
};

export default RankingPage;