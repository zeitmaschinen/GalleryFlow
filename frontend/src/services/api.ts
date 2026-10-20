// File: frontend/src/services/api.ts
import axios from 'axios';
import { imageCache } from './cache';
import type { Image, Folder, ScanProgress } from '../types/index';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

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

    // Cache the response, unless it's empty: an empty folder may still be scanning
    if (response.data.total_count > 0) {
        imageCache.set(folderId, page, sortBy, sortDir, fileTypes, response.data);
    }

    return response.data;
};

// Number of images indexed so far for a folder (never cached; used while a scan runs)
export const getImageCount = async (folderId: number): Promise<number> => {
    const params = new URLSearchParams({ folder_id: folderId.toString(), skip: '0', limit: '1' });
    const response = await apiClient.get<ImageListResponse>(`/images?${params.toString()}`);
    return response.data.total_count;
};

// Function to get the direct image URL with browser caching
export const getImageUrl = (imagePath: string): string => {
    // Enable browser caching for images
    return `${API_BASE_URL}/image?file_path=${encodeURIComponent(imagePath)}&cache=true`;
};

// Image URL used in the gallery grid. This serves the original file: the
// backend's /api/thumbnail names thumbnails by filename + modified time, so two
// same-named images in different subfolders could share a thumbnail.
export const getThumbnailUrl = (imagePath: string): string => getImageUrl(imagePath);

// Function to reveal file in system's file explorer
export const revealInExplorer = async (filePath: string): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(`/reveal-in-explorer?file_path=${encodeURIComponent(filePath)}`);
    return response.data;
};

// Add export for Image, Folder, ScanProgress from types
export type { Image, Folder, ScanProgress } from '../types/index';

export default apiClient;
