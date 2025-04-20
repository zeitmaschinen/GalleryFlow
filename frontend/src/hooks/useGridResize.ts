import { useState, useEffect, useCallback } from 'react';
import { config } from '../config';

interface GridDimensions {
  columns: number;
  itemWidth: number;
  itemHeight: number;
  gap: number;
}

export const useGridResize = (containerRef: React.RefObject<HTMLElement>, defaultGap = 8) => {
  const [dimensions, setDimensions] = useState<GridDimensions>({
    columns: 1,
    itemWidth: config.thumbnails.width,
    itemHeight: config.thumbnails.height,
    gap: defaultGap
  });

  const calculateGrid = useCallback(() => {
    if (!containerRef.current) return;

    const containerWidth = containerRef.current.clientWidth;
    const minItemWidth = config.thumbnails.width;
    const gap = defaultGap;
    
    const columns = Math.max(1, Math.floor((containerWidth + gap) / (minItemWidth + gap)));
    const itemWidth = Math.floor((containerWidth - (columns - 1) * gap) / columns);
    const itemHeight = Math.floor(itemWidth * (config.thumbnails.height / config.thumbnails.width));

    setDimensions({ columns, itemWidth, itemHeight, gap });
  }, [containerRef, defaultGap]);

  useEffect(() => {
    calculateGrid();
    
    const resizeObserver = new ResizeObserver(calculateGrid);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [calculateGrid, containerRef]);

  return dimensions;
};