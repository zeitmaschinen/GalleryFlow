import { useState, useCallback, useRef } from 'react';

interface ZoomState {
  scale: number;
  x: number;
  y: number;
}

interface UseImageZoomOptions {
  minZoom?: number;
  maxZoom?: number;
  zoomStep?: number;
}

export const useImageZoom = ({
  minZoom = 0.1,
  maxZoom = 5,
  zoomStep = 0.1
}: UseImageZoomOptions = {}) => {
  const [{ scale, x, y }, setTransform] = useState<ZoomState>({ scale: 1, x: 0, y: 0 });
  const isDragging = useRef(false);
  const lastPosition = useRef({ x: 0, y: 0 });

  const handleWheel = useCallback((e: WheelEvent) => {
    e.preventDefault();
    
    setTransform(prev => {
      const delta = -Math.sign(e.deltaY) * zoomStep;
      const newScale = Math.min(maxZoom, Math.max(minZoom, prev.scale + delta));
      
      // Zoom toward cursor position
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      const scaleChange = newScale - prev.scale;
      const newX = prev.x - (mouseX - prev.x) * (scaleChange / prev.scale);
      const newY = prev.y - (mouseY - prev.y) * (scaleChange / prev.scale);
      
      return { scale: newScale, x: newX, y: newY };
    });
  }, [minZoom, maxZoom, zoomStep]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    lastPosition.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging.current) return;

    const deltaX = e.clientX - lastPosition.current.x;
    const deltaY = e.clientY - lastPosition.current.y;
    
    setTransform(prev => ({
      ...prev,
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));

    lastPosition.current = { x: e.clientX, y: e.clientY };
  }, []);

  const handleMouseUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  const resetZoom = useCallback(() => {
    setTransform({ scale: 1, x: 0, y: 0 });
  }, []);

  return {
    scale,
    x,
    y,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    resetZoom,
    transform: `translate(${x}px, ${y}px) scale(${scale})`
  };
};