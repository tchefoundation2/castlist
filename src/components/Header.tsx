import React from 'react';
import { Page } from '../types';

interface HeaderProps {
  page: Page;
  onBack?: () => void;
  title?: string;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  showSearch: boolean;
}

const AppIcon = () => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="8" fill="url(#paint0_linear_1_2)"/>
        <path d="M10 9C10 8.44772 10.4477 8 11 8H22C22.5523 8 23 8.44772 23 9V22C23 23.1046 22.1046 24 21 24H11C10.4477 24 10 23.5523 10 23V9Z" fill="white" fillOpacity="0.8"/>
        <path d="M9 11C9 9.89543 9.89543 9 11 9H20C21.1046 9 22 9.89543 22 11V20C22 21.6569 20.6569 23 19 23H11C9.89543 23 9 22.1046 9 21V11Z" fill="url(#paint1_linear_1_2)"/>
        <defs>
            <linearGradient id="paint0_linear_1_2" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#A958EB"/>
                <stop offset="1" stopColor="#6020A0"/>
            </linearGradient>
            <linearGradient id="paint1_linear_1_2" x1="9" y1="9" x2="22" y2="23" gradientUnits="userSpaceOnUse">
                <stop stopColor="#D9B0FF"/>
                <stop offset="1" stopColor="#E9D0FF"/>
            </linearGradient>
        </defs>
    </svg>
);

const SearchIcon = () => (
    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
    </div>
);

const BackButton: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
    <button onClick={onClick} className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white p-2 -ml-2 rounded-full transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </button>
);


const Header: React.FC<HeaderProps> = ({ page, onBack, title, searchTerm, setSearchTerm, showSearch }) => {
  const isSubPage = [Page.GuideDetail, Page.Create, Page.EditGuide, Page.ShareOptions, Page.ShareRanking].includes(page);
  
  return (
    <header className="fixed top-0 left-0 right-0 z-40 animate-fadeIn">
      <div className="bg-white/70 backdrop-blur-xl border-b border-black/5 dark:bg-gray-900/70 dark:border-white/5">
        <div className="container mx-auto max-w-lg p-4 flex flex-col gap-4">
            <div className="relative flex items-center justify-center h-8">
                {isSubPage ? (
                    <>
                        <div className="absolute left-0">
                           <BackButton onClick={onBack} />
                        </div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
                    </>
                ) : (
                    <div className="flex items-center gap-3 w-full">
                        <AppIcon />
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Castlist</h1>
                    </div>
                )}
            </div>
             {showSearch && (
                <div className="relative">
                    <SearchIcon />
                    <input 
                        id="search-guides"
                        name="search-guides"
                        type="text" 
                        placeholder="Search guides..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/80 dark:bg-gray-800/80 border-2 border-transparent rounded-xl py-3 pl-11 pr-4 text-gray-800 dark:text-gray-200 focus:outline-none focus:bg-white dark:focus:bg-gray-700 focus:border-primary-500 transition-all" 
                    />
                </div>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;