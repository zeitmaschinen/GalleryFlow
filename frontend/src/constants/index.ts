export const SUPPORTED_FILE_TYPES = ['.png', '.jpg', '.jpeg', '.webp'];

export const SORT_OPTIONS = [
  { value: 'filename', label: 'Filename' },
  { value: 'date', label: 'Date Modified' }
] as const;

export const FILE_TYPE_OPTIONS = SUPPORTED_FILE_TYPES.map(type => ({
  value: type,
  label: type
}));

export const IMAGES_PER_PAGE = 100;

export const DEFAULT_THUMBNAIL_SIZE = 150;