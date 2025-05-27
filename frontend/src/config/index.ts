export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    wsUrl: import.meta.env.VITE_WS_URL || 'ws://localhost:8000',
    endpoints: {
      images: '/api/images',
      folders: '/api/folders',
      scan: '/api/scan'
    }
  },
  pagination: {
    defaultPageSize: 200,
    pageSizeOptions: [50, 100, 200]
  },
  cache: {
    ttl: 5 * 60 * 1000, // 5 minutes
    maxSize: 1000 // maximum number of items to cache
  },
  thumbnails: {
    width: 150,
    height: 150,
    quality: 0.8
  },
  ui: {
    snackbarDuration: 4000,
    defaultSortField: 'filename' as const,
    defaultSortDirection: 'asc' as const
  }
} as const;