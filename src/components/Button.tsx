import React from 'react';
import { motion } from 'framer-motion';
import { useHapticFeedback } from '../hooks/useHapticFeedback';

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onDrag' | 'onDragEnd' | 'onDragStart' | 'onAnimationStart' | 'onAnimationEnd' | 'onAnimationIteration'> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading = false,
  className = '',
  ...props
}) => {
  const { trigger } = useHapticFeedback();

  const baseStyles = 'w-full text-lg px-8 py-4 font-semibold rounded-xl focus:outline-none focus:ring-4 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'text-white bg-primary-700 hover:bg-primary-800 focus:ring-primary-300 shadow-lg shadow-primary-500/30',
    secondary: 'text-gray-800 bg-gray-200 hover:bg-gray-300 focus:ring-gray-300 dark:text-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-gray-600',
    danger: 'text-white bg-red-600 hover:bg-red-700 focus:ring-red-300 shadow-lg shadow-red-500/30',
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    trigger('light');
    if (props.onClick) {
      props.onClick(e);
    }
  };
  
  const loadingSpinner = (
    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  return (
    <motion.button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      {...props}
    >
      {isLoading && loadingSpinner}
      {children}
    </motion.button>
  );
};

export default Button;