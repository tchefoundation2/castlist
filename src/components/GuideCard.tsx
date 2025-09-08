import React from 'react';
import { motion } from 'framer-motion';
import { Guide } from '../types';

interface GuideCardProps {
  guide: Guide;
  onClick: () => void;
}

const BookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v11.494m-9-5.747h18" />
    </svg>
);

const HeartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
);


const GuideCard: React.FC<GuideCardProps> = ({ guide, onClick }) => {
  return (
    <motion.div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700/80 shadow-md p-5 cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        scale: 1.02, 
        y: -4,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 20 
      }}
    >
      <div className="flex items-start mb-4 space-x-4">
        <img src={guide.authorPfpUrl} alt={guide.authorUsername} className="w-11 h-11 rounded-full" />
        <div className="flex-1">
             <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 line-clamp-1">{guide.title}</h3>
             <p className="text-sm text-gray-500 dark:text-gray-400">by {guide.authorUsername}</p>
        </div>
      </div>
     
      <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 min-h-[40px]">{guide.description}</p>
      
      {guide.tags && guide.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {guide.tags.slice(0, 3).map((tag, index) => (
            <span key={index} className="bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-300 text-xs font-medium px-2.5 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center space-x-4">
            <span className="flex items-center font-medium"><BookIcon/> {guide.books.length} books</span>
            <span className="flex items-center font-medium"><HeartIcon/> {guide.likes}</span>
        </div>
        <span className="text-xs">{new Date(guide.createdAt).toLocaleDateString('en-GB')}</span>
      </div>
    </motion.div>
  );
};

export default GuideCard;