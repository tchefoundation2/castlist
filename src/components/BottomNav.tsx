import React from 'react';
import { motion } from 'framer-motion';
import { Page } from '../types';
import { NAV_ITEMS } from '../constants';
import { useHapticFeedback } from '../hooks/useHapticFeedback';

interface BottomNavProps {
  activePage: Page;
  setPage: (page: Page) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activePage, setPage }) => {
  const { trigger } = useHapticFeedback();

  const handleNavClick = (page: Page) => {
    trigger('light');
    setPage(page);
  };

  return (
    <div className="fixed bottom-4 left-0 right-0 z-50 px-4">
      <nav className="flex items-center justify-around h-16 bg-white/70 backdrop-blur-xl dark:bg-gray-900/70 rounded-3xl shadow-lg max-w-lg mx-auto ring-1 ring-black/5 dark:ring-white/5">
        {NAV_ITEMS.map(({ page, label, icon }) => {
          const isActive = activePage === page;
          const activeClass = 'text-primary-700 dark:text-primary-400';
          const inactiveClass = 'text-gray-500 dark:text-gray-400 group-hover:text-primary-700 dark:group-hover:text-primary-400';
          return (
            <motion.button
              key={page}
              onClick={() => handleNavClick(page)}
              className="flex flex-col items-center justify-center w-20 h-full rounded-2xl space-y-1 group focus:outline-none relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              {isActive && (
                <motion.div
                  className="absolute inset-0 bg-primary-100 dark:bg-primary-900/40 rounded-2xl"
                  layoutId="activeTab"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <div className="relative z-10 flex flex-col items-center space-y-1">
                {React.createElement(icon, {
                  className: `h-6 w-6 transition-colors duration-300 ${isActive ? activeClass : inactiveClass}`
                })}
                <span className={`text-xs font-bold transition-colors duration-300 ${isActive ? activeClass : inactiveClass}`}>{label}</span>
              </div>
            </motion.button>
          );
        })}
      </nav>
    </div>
  );
};

export default BottomNav;