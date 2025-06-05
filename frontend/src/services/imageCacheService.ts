// Image browser caching service
// Uses the browser's Cache API to store and retrieve images

const CACHE_NAME = 'galleryflow-image-cache-v1';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

interface CachedImage {
  url: string;
  timestamp: number;
}

export const imageCacheService = {
  /**
   * Check if an image is in the cache
   */
  async isCached(url: string): Promise<boolean> {
    if (!('caches' in window)) {
      return false;
    }
    
    try {
      const cache = await caches.open(CACHE_NAME);
      const response = await cache.match(url);
      return !!response;
    } catch (error) {
      console.error('Error checking image cache:', error);
      return false;
    }
  },

  /**
   * Get an image from the cache
   */
  async getFromCache(url: string): Promise<Response | null> {
    if (!('caches' in window)) {
      return null;
    }
    
    try {
      const cache = await caches.open(CACHE_NAME);
      const response = await cache.match(url);
      
      if (!response) {
        return null;
      }
      
      // Check if the cached image is still valid (not expired)
      const cachedMetadata = localStorage.getItem(`image-cache-${url}`);
      if (cachedMetadata) {
        const { timestamp } = JSON.parse(cachedMetadata) as CachedImage;
        if (Date.now() - timestamp > CACHE_DURATION) {
          // Image is expired, remove it from cache
          await this.removeFromCache(url);
          return null;
        }
      }
      
      return response;
    } catch (error) {
      console.error('Error retrieving from image cache:', error);
      return null;
    }
  },

  /**
   * Add an image to the cache
   */
  async addToCache(url: string, response: Response): Promise<void> {
    if (!('caches' in window)) {
      return;
    }
    
    try {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(url, response.clone());
      
      // Store metadata for expiration
      const metadata: CachedImage = {
        url,
        timestamp: Date.now()
      };
      localStorage.setItem(`image-cache-${url}`, JSON.stringify(metadata));
    } catch (error) {
      console.error('Error adding to image cache:', error);
    }
  },

  /**
   * Remove an image from the cache
   */
  async removeFromCache(url: string): Promise<void> {
    if (!('caches' in window)) {
      return;
    }
    
    try {
      const cache = await caches.open(CACHE_NAME);
      await cache.delete(url);
      localStorage.removeItem(`image-cache-${url}`);
    } catch (error) {
      console.error('Error removing from image cache:', error);
    }
  },

  /**
   * Get an image with caching
   */
  async getImage(url: string): Promise<Response> {
    // Try to get from cache first
    const cachedResponse = await this.getFromCache(url);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If not in cache, fetch it
    const response = await fetch(url);
    
    // Cache the response for future use
    const clonedResponse = response.clone();
    this.addToCache(url, clonedResponse);
    
    return response;
  },

  /**
   * Clear all cached images
   */
  async clearCache(): Promise<void> {
    if (!('caches' in window)) {
      return;
    }
    
    try {
      await caches.delete(CACHE_NAME);
      
      // Clear metadata from localStorage
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('image-cache-')) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Error clearing image cache:', error);
    }
  }
};
