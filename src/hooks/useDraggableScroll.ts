import { useRef, useEffect } from 'react';

export const useDraggableScroll = () => {
  const ref = useRef<HTMLDivElement>(null);
  
  // Use a ref for state to avoid re-renders and stale closures
  const state = useRef({
    isDown: false,
    startX: 0,
    scrollLeft: 0,
    hasDragged: false,
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!state.current.isDown) return;

      const currentX = 'touches' in e ? e.touches[0].pageX : e.pageX;
      const walk = currentX - state.current.startX;
      
      // We only set the hasDragged flag if the user has moved a meaningful amount
      if (Math.abs(walk) > 5) {
        state.current.hasDragged = true;
        // Only prevent default if we're actually dragging
        if (e.type === 'touchmove') {
          e.preventDefault();
        }
      }

      el.scrollLeft = state.current.scrollLeft - walk;
    };

    const onEnd = () => {
      if (!state.current.isDown) return;
      
      state.current.isDown = false;
      el.style.scrollBehavior = 'smooth'; // Restore smooth scroll after dragging
      
      // Clean up global event listeners
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);

      // We reset the hasDragged flag in a timeout to allow the click capture
      // event to fire first and check the flag's value.
      setTimeout(() => {
        state.current.hasDragged = false;
      }, 0);
    };

    const onStart = (e: MouseEvent | TouchEvent) => {
      // Prevents the event from interfering with other elements
      e.stopPropagation(); 
      
      // This is a critical fix. It prevents the browser's default drag actions,
      // such as selecting text or dragging an image, which would otherwise
      // interrupt our custom scrolling logic.
      if (e.type === 'mousedown') {
        e.preventDefault();
      }

      state.current.isDown = true;
      state.current.hasDragged = false;
      el.style.scrollBehavior = 'auto'; // Use instant scrolling during a drag

      const pageX = 'touches' in e ? e.touches[0].pageX : e.pageX;
      state.current.startX = pageX;
      state.current.scrollLeft = el.scrollLeft;
      
      // Attach listeners to the document so dragging continues
      // even if the cursor leaves the element.
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onEnd);
      document.addEventListener('touchmove', onMove, { passive: false });
      document.addEventListener('touchend', onEnd);
    };

    // This capture-phase listener prevents click events on child elements
    // (like the cards) from firing if the user just finished a drag action.
    const onClickCapture = (e: MouseEvent) => {
      if (state.current.hasDragged) {
        e.stopPropagation();
      }
    };
    
    // This options object is needed for adding the touchstart listener
    const touchStartOptions = { passive: false };

    // Attach starting event listeners
    el.addEventListener('mousedown', onStart);
    el.addEventListener('touchstart', onStart, touchStartOptions);
    el.addEventListener('click', onClickCapture, true); 

    // Return a cleanup function to remove listeners when the component unmounts
    return () => {
      el.removeEventListener('mousedown', onStart);
      // **THE FIX**: The 'touchstart' listener must be removed with the correct
      // 'useCapture' flag (a boolean), not the full options object.
      // Since the listener was added with default capture settings, `false` is the
      // correct value to ensure it's properly removed.
      el.removeEventListener('touchstart', onStart, false);
      el.removeEventListener('click', onClickCapture, true);
      
      // Clean up any lingering document listeners, e.g., if unmounted mid-drag
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchmove', onMove);
      document.removeEventListener('touchend', onEnd);
    };
  }, []); // Empty dependency array ensures this effect runs only once

  return ref;
};