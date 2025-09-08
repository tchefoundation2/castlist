import React from 'react';
import { Page } from '../types';
import GuideCard from '../components/GuideCard';
import Loader from '../components/Loader';
import { useData } from '../hooks/useData';

interface MyGuidesPageProps {
  setPage: (page: Page, id?: number) => void;
  setSelectedGuideId: (id: number) => void;
}

const MyGuidesPage: React.FC<MyGuidesPageProps> = ({ setPage, setSelectedGuideId }) => {
  const { myGuides: guides, isLoading } = useData();
  
  const handleGuideClick = (id: number) => {
    setSelectedGuideId(id);
    setPage(Page.GuideDetail);
  };

  return (
    <div className="animate-fadeIn">
      {isLoading ? (
        <div className="flex justify-center mt-20">
          <Loader />
        </div>
      ) : guides.length > 0 ? (
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
    </div>
  );
};

export default MyGuidesPage;