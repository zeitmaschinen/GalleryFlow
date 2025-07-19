// File: frontend/src/services/api.ts
import axios from 'axios';
import { imageCache } from './cache';
import type { Image, Folder, ScanProgress } from '../types/index';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
const WS_BASE_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Interfaces for expected API data shapes ---
// NEW: Interface for the paginated image list response
export interface ImageListResponse {
    images: Image[];
    total_count: number;
}

// --- API Functions ---

// Folders (Keep existing)
export const getFolders = async (): Promise<Folder[]> => {
  const response = await apiClient.get<Folder[]>('/folders');
  return response.data;
};

export const addFolder = async (path: string): Promise<Folder> => {
  const response = await apiClient.post<Folder>('/folders', { path });
  return response.data;
};

export const deleteFolder = async (folderId: number): Promise<void> => {
  await apiClient.delete(`/folders/${folderId}`);
};

export const refreshFolder = async (folderId: number): Promise<ScanProgress> => {
    // Invalidate cache before refresh
    imageCache.invalidate(folderId);
    const response = await apiClient.post<ScanProgress>(`/folders/${folderId}/scan`);
    return response.data;
};

// Images (UPDATE getImages)
export const getImages = async (
    folderId: number,
    page: number = 1,
    limit: number = 100,
    sortBy: string = "filename",
    sortDir: 'asc' | 'desc' = "asc",
    fileTypes?: string[]
): Promise<ImageListResponse> => {
    // Check cache first
    const cached = imageCache.get(folderId, page, sortBy, sortDir, fileTypes);
    if (cached) {
        return cached;
    }

    const skip = (page - 1) * limit;
    const params = new URLSearchParams({
        folder_id: folderId.toString(),
        skip: skip.toString(),
        limit: limit.toString(),
        sort_by: sortBy,
        sort_dir: sortDir,
    });
    
    if (fileTypes && fileTypes.length > 0) {
        fileTypes.forEach(type => params.append('file_types', type));
    }
    
    const requestUrl = `/images?${params.toString()}`;
    const response = await apiClient.get<ImageListResponse>(requestUrl);
    
    // Cache the response
    imageCache.set(folderId, page, sortBy, sortDir, fileTypes, response.data);
    
    return response.data;
};

// Function to get the direct image URL with browser caching
export const getImageUrl = (imagePath: string): string => {
    // Enable browser caching for images
    return `${API_BASE_URL}/image?file_path=${encodeURIComponent(imagePath)}&cache=true`;
};

// Function to get optimized thumbnail URL for faster grid loading
export const getThumbnailUrl = (imagePath: string, size: 'small' | 'medium' = 'medium'): string => {
    // For now, fallback to regular image URL until thumbnails are generated
    // TODO: Switch back to thumbnail endpoint once database is migrated
    return getImageUrl(imagePath);
    // return `${API_BASE_URL}/thumbnail?file_path=${encodeURIComponent(imagePath)}&size=${size}`;
};

// Function to reveal file in system's file explorer
export const revealInExplorer = async (filePath: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(`/reveal-in-explorer?file_path=${encodeURIComponent(filePath)}`);
    return response.data;
};

// WebSocket connection for scan progress
export const connectToScanProgress = (
    folderId: number,
    onProgress: (data: ScanProgress) => void
): WebSocket => {
    const ws = new WebSocket(`${WS_BASE_URL}/ws/scan-progress/${folderId}`);
    
    ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        onProgress(data);
    };
    
    return ws;
};

// Add export for Image, Folder, ScanProgress from types
export type { Image, Folder, ScanProgress } from '../types/index';

export default apiClient;