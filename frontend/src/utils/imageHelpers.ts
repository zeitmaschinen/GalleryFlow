import type { Image } from '../services/api';
import { getFileExtension } from './fileUtils';

export const sortImages = (
  images: Image[],
  field: keyof Image | 'folder',
  direction: 'asc' | 'desc'
): Image[] => {
  return [...images].sort((a, b) => {
    if (field === 'folder') {
      const aDir = a.full_path.substring(0, a.full_path.lastIndexOf('/'));
      const bDir = b.full_path.substring(0, b.full_path.lastIndexOf('/'));
      
      // If both files are in the same directory, sort by filename
      if (aDir === bDir) {
        return direction === 'asc' 
          ? a.filename.localeCompare(b.filename)
          : b.filename.localeCompare(a.filename);
      }
      
      // Sort by directory path
      return direction === 'asc' 
        ? aDir.localeCompare(bDir)
        : bDir.localeCompare(aDir);
    }

    const aValue = a[field];
    const bValue = b[field];

    if (aValue === bValue) return 0;
    if (aValue === null) return 1;
    if (bValue === null) return -1;

    const result = aValue < bValue ? -1 : 1;
    return direction === 'asc' ? result : -result;
  });
};

export const filterImagesByType = (images: Image[], types: string[]): Image[] => {
  if (types.length === 0) return images;
  
  return images.filter(image => 
    types.includes(getFileExtension(image.filename).toLowerCase())
  );
};

export const extractUniqueFileTypes = (images: Image[]): string[] => {
  const types = new Set<string>();
  images.forEach(image => {
    const ext = getFileExtension(image.filename).toLowerCase();
    if (ext) types.add(ext);
  });
  return Array.from(types).sort();
};

export const calculateGridDimensions = (
  containerWidth: number,
  minItemWidth: number,
  gap: number
): { columns: number; itemWidth: number } => {
  const columns = Math.max(1, Math.floor((containerWidth + gap) / (minItemWidth + gap)));
  const itemWidth = Math.floor((containerWidth - (columns - 1) * gap) / columns);
  
  return { columns, itemWidth };
};

export const isValidImage = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
  return validTypes.includes(file.type);
};