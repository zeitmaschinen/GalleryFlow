import type { Image } from '../services/api';

export interface AppContextState {
  selectedFolderId: number | null;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  selectedTypes: string[];
  images: Image[];
  isLoading: boolean;
}

export interface AppContextValue extends AppContextState {
  setSelectedFolder: (id: number | null) => void;
  setSortBy: (sort: string) => void;
  setSortDirection: (direction: 'asc' | 'desc') => void;
  setSelectedTypes: (types: string[]) => void;
  setImages: (images: Image[]) => void;
  setIsLoading: (loading: boolean) => void;
  showMessage: (message: string, severity?: 'success' | 'error' | 'info' | 'warning') => void;
}
