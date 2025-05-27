import { ImageListResponse } from './api';

class ImageCache {
  private cache: Map<string, { data: ImageListResponse; timestamp: number }>;
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.cache = new Map();
    // Clear cache on initialization to ensure fresh data with new page size
    this.clear();
  }

  private getCacheKey(
    folderId: number,
    page: number,
    sortBy: string,
    sortDir: string,
    fileTypes?: string[]
  ): string {
    return `${folderId}-${page}-${sortBy}-${sortDir}-${fileTypes?.join(',')}`;
  }

  get(
    folderId: number,
    page: number,
    sortBy: string,
    sortDir: string,
    fileTypes?: string[]
  ): ImageListResponse | null {
    const key = this.getCacheKey(folderId, page, sortBy, sortDir, fileTypes);
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }
    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  set(
    folderId: number,
    page: number,
    sortBy: string,
    sortDir: string,
    fileTypes: string[] | undefined,
    data: ImageListResponse
  ): void {
    const key = this.getCacheKey(folderId, page, sortBy, sortDir, fileTypes);
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  invalidate(folderId: number): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(`${folderId}-`)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

export const imageCache = new ImageCache();