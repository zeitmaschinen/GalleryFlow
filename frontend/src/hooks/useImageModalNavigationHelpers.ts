import { useMemo, useCallback, useEffect } from 'react';
import type { Image } from '../components/images/types';

/**
 * Combines indexing and keyboard navigation logic for the image modal.
 * Returns currentIdx, hasPrev, hasNext, goPrev, goNext.
 * Sets up keyboard navigation for left/right arrows.
 */
export function useImageModalNavigationHelpers(
  open: boolean,
  images: Image[] | undefined,
  selectedImage: Image | null,
  setSelectedImage?: (img: Image) => void
) {
  const currentIdx = useMemo(() => {
    if (!images || !selectedImage) return -1;
    return images.findIndex(img => img.id === selectedImage.id);
  }, [images, selectedImage]);

  const hasPrev = useMemo(() => images && currentIdx > 0, [images, currentIdx]);
  const hasNext = useMemo(() => images && images.length > 0 && currentIdx < images.length - 1 && currentIdx !== -1, [images, currentIdx]);

  const goPrev = useCallback(() => {
    if (hasPrev && setSelectedImage && images && currentIdx > 0) {
      setSelectedImage(images[currentIdx - 1]);
    }
  }, [hasPrev, setSelectedImage, images, currentIdx]);

  const goNext = useCallback(() => {
    if (hasNext && setSelectedImage && images && currentIdx < images.length - 1) {
      setSelectedImage(images[currentIdx + 1]);
    }
  }, [hasNext, setSelectedImage, images, currentIdx]);

  // Keyboard navigation effect
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        goPrev();
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        goNext();
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, goPrev, goNext]);

  return { currentIdx, hasPrev, hasNext, goPrev, goNext };
}
