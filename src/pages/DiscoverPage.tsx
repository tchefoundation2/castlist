import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Guide, Page } from '../types';
import GuideCard from '../components/GuideCard';
import Loader from '../components/Loader';
import { useDraggableScroll } from '../hooks/useDraggableScroll';
import { useData } from '../hooks/useData';

interface DiscoverPageProps {
  setPage: (page: Page, id?: number) => void;
  setSelectedGuideId: (id: number) => void;
  searchTerm: string;
}

// A new, compact card component designed for the horizontal carousel
interface RecommendedGuideCardProps {
  guide: Guide;
  onClick: () => void;
}
const RecommendedGuideCard: React.FC<RecommendedGuideCardProps> = ({ guide, onClick }) => {
  return (
    <motion.div
      onClick={onClick}
      className="flex-shrink-0 w-48 bg-white dark:bg-gray-700 rounded-2xl border border-gray-200/80 dark:border-gray-600/80 shadow-md p-4 cursor-pointer"
      whileHover={{ 
        scale: 1.05, 
        y: -2,
        boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <img src={guide.authorPfpUrl} alt={guide.authorUsername} className="w-12 h-12 rounded-full mb-3 shadow-sm pointer-events-none" />
      <h4 className="font-bold text-gray-800 dark:text-gray-100 text-md line-clamp-2 mb-1 h-12">{guide.title}</h4>
      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">by {guide.authorUsername}</p>
    </motion.div>
  );
};

const DiscoverPage: React.FC<DiscoverPageProps> = ({ setPage, setSelectedGuideId, searchTerm }) => {
  const { allGuides: guides, recommendedGuides, isLoading } = useData();
  const scrollRef = useDraggableScroll();
  
  const [totalPages, setTotalPages] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);

  // Effect to calculate pagination based on carousel content and window size
  useEffect(() => {
    const calculatePages = () => {
      const el = scrollRef.current;
      if (el && el.scrollWidth > el.clientWidth) {
        // Calculate pages based on the visible width of the container
        const pages = Math.ceil(el.scrollWidth / el.clientWidth);
        setTotalPages(pages);
      } else {
        setTotalPages(0);
      }
    };
    
    // Recalculate after a short delay to ensure content is rendered, and on window resize
    const timer = setTimeout(calculatePages, 100);
    window.addEventListener('resize', calculatePages);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', calculatePages);
    };
  }, [isLoading, recommendedGuides]); // Rerun if the guides or loading state changes

  const handleGuideClick = (id: number) => {
    setSelectedGuideId(id);
    setPage(Page.GuideDetail);
  };
  
  const filteredGuides = guides.filter(guide => {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      return (
          guide.title.toLowerCase().includes(lowerCaseSearchTerm) ||
          guide.description.toLowerCase().includes(lowerCaseSearchTerm) ||
          guide.authorUsername.toLowerCase().includes(lowerCaseSearchTerm) ||
          (guide.tags && guide.tags.some(tag => tag.toLowerCase().includes(lowerCaseSearchTerm)))
      );
  });
  
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (el) {
      const index = Math.round(el.scrollLeft / el.clientWidth);
      setActiveIndex(index);
    }
  }, []);

  const scrollToIndex = (index: number) => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({
        left: el.clientWidth * index,
        behavior: 'smooth'
      });
    }
  };


  return (
    <div className="animate-fadeIn">
      {isLoading ? (
        <div className="flex justify-center mt-20">
          <Loader />
        </div>
      ) : (
        <div className="space-y-8">
          {/* --- Recommended Section --- */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 px-1">Recommended for You</h2>
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide cursor-grab active:cursor-grabbing select-none"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {recommendedGuides.map(guide => (
                <RecommendedGuideCard key={`rec-${guide.id}`} guide={guide} onClick={() => handleGuideClick(guide.id)} />
              ))}
            </div>
             {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2 mt-4">
                    {Array.from({ length: totalPages }).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => scrollToIndex(index)}
                            className={`h-2.5 rounded-full transition-all duration-300 ease-in-out ${
                                activeIndex === index ? 'w-6 bg-primary-700' : 'w-2.5 bg-gray-300 dark:bg-gray-600'
                            }`}
                            aria-label={`Go to page ${index + 1}`}
                        />
                    ))}
                </div>
            )}
          </section>

          {/* --- All Guides Section --- */}
          <section>
             <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 px-1">All Guides</h2>
              {filteredGuides.length > 0 ? (
                <motion.div 
                  className="space-y-4"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.1
                      }
                    }
                  }}
                >
                  {filteredGuides.map((guide, index) => (
                    <motion.div
                      key={guide.id}
                      variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0 }
                      }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <GuideCard guide={guide} onClick={() => handleGuideClick(guide.id)} />
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-12 px-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">No Results Found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your search term.</p>
                </div>
              )}
          </section>
        </div>
      )}
    </div>
  );
};

export default DiscoverPage;