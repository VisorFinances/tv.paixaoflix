import { useState, useEffect } from 'react';

interface UseKeyboardNavigationProps {
  itemCount: number;
  gridCols?: number;
  onEnter?: (index: number) => void;
  enabled?: boolean;
}

export const useKeyboardNavigation = ({ 
  itemCount, 
  gridCols = 6, 
  onEnter,
  enabled = true 
}: UseKeyboardNavigationProps) => {
  const [focusedIndex, setFocusedIndex] = useState(0);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!enabled) return;

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        setFocusedIndex(prev => (prev + 1) % itemCount);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        setFocusedIndex(prev => (prev - 1 + itemCount) % itemCount);
        break;
      case 'ArrowDown':
        e.preventDefault();
        const nextIndex = focusedIndex + gridCols;
        if (nextIndex < itemCount) {
          setFocusedIndex(nextIndex);
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        const prevIndex = focusedIndex - gridCols;
        if (prevIndex >= 0) {
          setFocusedIndex(prevIndex);
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (onEnter) {
          onEnter(focusedIndex);
        }
        break;
    }
  };

  return {
    focusedIndex,
    setFocusedIndex,
    handleKeyDown
  };
};
