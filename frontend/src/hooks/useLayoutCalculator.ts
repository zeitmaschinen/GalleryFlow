import { useState, useEffect } from 'react';

interface LayoutCalculatorOptions {
  thumbnailSize: number;
}

export const useLayoutCalculator = ({ thumbnailSize }: LayoutCalculatorOptions) => {
  const [columnsCount, setColumnsCount] = useState(4);

  // Update column count when window is resized or thumbnail size changes
  useEffect(() => {
    const calculateColumns = () => {
      // Calculate available width (excluding padding)
      const containerWidth = window.innerWidth - 16 * 2;
      // Calculate columns with gap consideration
      const columnWidth = thumbnailSize + 8; // thumbnail size + gap
      const columns = Math.floor(containerWidth / columnWidth);
      setColumnsCount(Math.max(1, columns));
    };
    
    // Delay the initial calculation to ensure stylesheets are loaded
    const initialCalculationTimer = setTimeout(calculateColumns, 100);
    
    const handleResize = () => {
      calculateColumns();
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(initialCalculationTimer);
    };
  }, [thumbnailSize]);

  return { columnsCount };
};
