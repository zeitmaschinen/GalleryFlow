export type SortDirection = 'asc' | 'desc';
export type SortField = 'filename' | 'date' | 'folder';

export interface SelectOption {
  value: string;
  label: string;
}

export interface ScanProgress {
  current: number;
  total: number;
  added_count: number;
  updated_count: number;
  removed_count: number;
  skipped_count: number;
  processed_count: number;
  total_files: number;
}

export interface Folder {
  id: number;
  path: string;
}

export interface Image {
  id: number;
  filename: string;
  full_path: string;
  last_modified: string;
  metadata_: Record<string, unknown> | null;
  folder_id: number;
}