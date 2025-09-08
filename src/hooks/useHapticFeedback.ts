
import { useCallback } from 'react';

export const useHapticFeedback = () => {
  const trigger = useCallback((intensity: 'light' | 'medium' | 'heavy' = 'light') => {
    if (window.navigator && window.navigator.vibrate) {
      switch (intensity) {
        case 'light':
          window.navigator.vibrate(10);
          break;
        case 'medium':
          window.navigator.vibrate([10, 200, 10]);
          break;
        case 'heavy':
          window.navigator.vibrate(200);
          break;
        default:
          window.navigator.vibrate(10);
      }
    }
  }, []);

  return { trigger };
};
