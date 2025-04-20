export const getFileExtension = (filename: string): string => {
  const ext = filename.toLowerCase().split('.').pop();
  return ext ? `.${ext}` : '';
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const isImageFile = (filename: string): boolean => {
  const supportedFormats = ['.png', '.jpg', '.jpeg', '.webp'];
  const ext = getFileExtension(filename);
  return supportedFormats.includes(ext);
};

export const generateThumbnailUrl = (path: string, width: number): string => {
  const encodedPath = encodeURIComponent(path);
  return `/api/thumbnail?path=${encodedPath}&width=${width}`;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};