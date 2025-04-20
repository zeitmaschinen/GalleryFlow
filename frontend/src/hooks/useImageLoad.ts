import { useState, useEffect } from 'react';

export const useImageLoad = (images: { full_path: string }[]) => {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    const preloadImage = (src: string) => {
      const img = new Image();
      img.onload = () => {
        setLoadedImages(prev => new Set(prev).add(src));
      };
      img.src = src;
    };

    images.forEach(image => {
      if (!loadedImages.has(image.full_path)) {
        preloadImage(image.full_path);
      }
    });
  }, [images, loadedImages]);

  return loadedImages;
};