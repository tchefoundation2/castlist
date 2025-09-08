import React from 'react';

interface LoaderProps {
  text?: string;
}

const Loader: React.FC<LoaderProps> = ({ text }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4" role="status" aria-live="polite">
      <div className="w-12 h-12 rounded-full animate-spin border-4 border-solid border-primary-500 border-t-transparent"></div>
      {text && <span className="text-lg font-semibold text-gray-600 dark:text-gray-300">{text}</span>}
    </div>
  );
};

export default Loader;