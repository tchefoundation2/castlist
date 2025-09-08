import React, { useState } from 'react';
import { Page, Guide } from './types';
import { useAuth, AuthProvider } from './hooks/useAuth';
import { useFarcasterSDKSimple } from './hooks/useFarcasterSDKSimple';
import { ThemeProvider } from './hooks/useTheme';
import { DataProvider, useData } from './hooks/useData';
import LoginPage from './pages/LoginPage';
import MyGuidesPage from './pages/MyGuidesPage';
import DiscoverPage from './pages/DiscoverPage';
import CreateGuidePage from './pages/CreateGuidePage';
import GuideDetailPage from './pages/GuideDetailPage';
import EditGuidePage from './pages/EditGuidePage';
import ShareOptionsPage from './pages/ShareOptionsPage';
import ShareRankingPage from './pages/ShareRankingPage';
import ProfilePage from './pages/ProfilePage';
import RankingPage from './pages/RankingPage';
import FarcasterTestPage from './pages/FarcasterTestPage';
import BottomNav from './components/BottomNav';
import Header from './components/Header';
import Loader from './components/Loader';
import SDKDebug from './components/SDKDebug';
import OfficialFarcasterAuth from './components/OfficialFarcasterAuth';

const AppContent: React.FC = () => {
  const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth();
  const { isLoading: isDataLoading, refreshAllData } = useData();
  const { isLoaded: isSDKLoaded, isReady: isSDKReady, hasActions } = useFarcasterSDKSimple();
  
  // Check if we're in a Farcaster mini app environment
  const isMiniApp = window.farcaster && window.farcaster.actions && typeof window.farcaster.signIn === 'function';
  
  // Check if we're on farcaster.xyz web
  const isFarcasterWeb = window.location.hostname === 'farcaster.xyz' || 
                        window.location.hostname.includes('farcaster.xyz') ||
                        window.location.search.includes('farcaster.xyz');
  
  // Debug logs
  console.log("🔍 App.tsx - Environment detection:");
  console.log("🔍 window.farcaster:", window.farcaster);
  console.log("🔍 window.FarcasterAuthKit:", window.FarcasterAuthKit);
  console.log("🔍 isMiniApp:", isMiniApp);
  console.log("🔍 isAuthenticated:", isAuthenticated);
  console.log("🔍 isAuthLoading:", isAuthLoading);
  console.log("🔍 document.readyState:", document.readyState);
  const [page, setPage] = useState<Page>(Page.Home);
  const [activeTab, setActiveTab] = useState<Page>(Page.Home);
  const [selectedGuideId, setSelectedGuideId] = useState<number | null>(null);
  const [history, setHistory] = useState<Page[]>([Page.Home]);
  const [searchTerm, setSearchTerm] = useState('');


  const handleSetPage = (newPage: Page, id?: number | string) => {
    if (id) {
        setSelectedGuideId(Number(id));
    }
    // If the new page is one of the main tabs, update the active tab state
    if ([Page.Home, Page.MyGuides, Page.Create, Page.Profile, Page.Ranking].includes(newPage)) {
        setActiveTab(newPage);
        // Reset search term when navigating between main tabs
        if(newPage !== Page.Home) setSearchTerm('');
    }
    
    if (newPage !== page) {
      setHistory(prev => [...prev, newPage]);
    }
    setPage(newPage);
  };
  
  const handleBack = () => {
      const newHistory = [...history];
      newHistory.pop();
      const prevPage = newHistory[newHistory.length - 1] || Page.Home;
      
      // When going back, reset active tab if we are leaving a detail/edit flow
      if ([Page.GuideDetail, Page.EditGuide, Page.ShareOptions, Page.ShareRanking].includes(page)) {
          const parentTab = history.find(p => [Page.Home, Page.MyGuides, Page.Ranking].includes(p)) || Page.Home;
          setActiveTab(parentTab);
      } else {
        // also handle going back from create page
        const parentTab = [Page.Home, Page.MyGuides, Page.Profile, Page.Ranking].find(p => p === prevPage)
        if(parentTab) setActiveTab(parentTab)
      }


      setHistory(newHistory);
      setPage(prevPage);
  };
  
  const handleGuideSave = async (guide: Guide) => {
    await refreshAllData();
    setSelectedGuideId(guide.id);
    setPage(Page.GuideDetail);
  };
  
  const handleGuideDelete = async () => {
    await refreshAllData();
    setPage(Page.MyGuides);
  };


  const showSearch = page === Page.Home;

  const getHeaderTitle = (): string => {
    switch (page) {
      case Page.Create:
        return 'Create New Guide';
      case Page.EditGuide:
        return 'Edit Guide';
      case Page.GuideDetail:
        return 'Details';
      case Page.Profile:
        return 'Profile';
       case Page.ShareOptions:
        return 'Customize Share Card';
       case Page.ShareRanking:
        return 'Customize Ranking Card';
      default:
        return ''; // Main pages use built-in branding
    }
  };

  const renderPage = () => {
    switch (page) {
      case Page.Home:
        return <DiscoverPage setPage={handleSetPage} setSelectedGuideId={setSelectedGuideId} searchTerm={searchTerm} />;
      case Page.MyGuides:
        return <MyGuidesPage setPage={handleSetPage} setSelectedGuideId={setSelectedGuideId} />;
      case Page.Create:
        return <CreateGuidePage user={user!} onSave={handleGuideSave} onCancel={handleBack} />;
       case Page.Profile:
        return <ProfilePage setPage={handleSetPage} setSelectedGuideId={setSelectedGuideId} />;
      case Page.Ranking:
        return <RankingPage setPage={handleSetPage} setSelectedGuideId={setSelectedGuideId} />;
      case Page.GuideDetail:
        return <GuideDetailPage guideId={selectedGuideId!} user={user!} setPage={handleSetPage} onBack={handleBack} onDelete={handleGuideDelete} />;
      case Page.EditGuide:
        return <EditGuidePage guideId={selectedGuideId!} user={user!} onSave={handleGuideSave} onCancel={() => handleSetPage(Page.GuideDetail, selectedGuideId!)} />;
      case Page.ShareOptions:
        return <ShareOptionsPage guideId={selectedGuideId!} setPage={handleSetPage} onBack={handleBack} />;
      case Page.ShareRanking:
        return <ShareRankingPage setPage={handleSetPage} onBack={handleBack} />;
      case Page.FarcasterTest:
        return <FarcasterTestPage />;
      default:
        return <DiscoverPage setPage={handleSetPage} setSelectedGuideId={setSelectedGuideId} searchTerm={searchTerm} />;
    }
  };
  
  // AuthKit logic moved to the !isAuthenticated section below

  if (isAuthLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-purple-50 to-blue-100 dark:from-gray-900 dark:via-gray-900 dark:to-black">
            <div className="text-center">
              <Loader text="Authenticating..." />
              {isSDKLoaded && (
                <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                  <p>SDK Loaded: ✅</p>
                  <p>SDK Ready: {isSDKReady ? '✅' : '⏳'}</p>
                  <p>Has Actions: {hasActions ? '✅' : '❌'}</p>
                </div>
              )}
            </div>
        </div>
    );
  }

  if (!isAuthenticated) {
    // For mini app, use LoginPage (with Farcaster splash screen)
    // For farcaster.xyz web, use FarcasterAuthKit with QR code
    // For other web apps, use FarcasterAuthKit
    if (isMiniApp) {
      return <LoginPage />;
    } else if (isFarcasterWeb) {
      return <OfficialFarcasterAuth />;
    } else {
      return <OfficialFarcasterAuth />;
    }
  }
  
  const mainContentPadding = showSearch ? 'pt-36' : 'pt-24';

  return (
    <div className="text-gray-800 dark:text-gray-200 min-h-screen font-sans bg-gradient-to-br from-primary-50 via-purple-50 to-blue-100 bg-300% animate-gradient dark:from-gray-900 dark:via-gray-900 dark:to-black">
        <SDKDebug />
        <Header 
          page={page}
          onBack={handleBack}
          title={getHeaderTitle()}
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          showSearch={showSearch} 
        />
        <main className={`container mx-auto max-w-lg p-4 pb-28 ${mainContentPadding}`}>
          {isDataLoading && page === Page.Home ? <div className="flex justify-center mt-20"><Loader /></div> : renderPage()}
        </main>
        <BottomNav activePage={activeTab} setPage={handleSetPage} />
    </div>
  );
};

const CastlistApp: React.FC = () => (
  <ThemeProvider>
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  </ThemeProvider>
);

export default CastlistApp;