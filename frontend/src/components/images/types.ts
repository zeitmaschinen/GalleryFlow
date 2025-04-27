// Define the standardized Image interface
export interface Image {
  id: string | number;
  filename: string;
  full_path: string;
  created_at?: string;
  updated_at?: string;
  last_modified?: string;
  width?: number;
  height?: number;
  folder_id: string | number;
  metadata_: Record<string, unknown>;
  file_size?: number;
  file_type?: string;
  thumbnail_path?: string;
  is_favorite?: boolean;
  Workflow?: string;
  Prompt?: string;
}

// Define the Folder interface
export interface Folder {
  id: string | number;
  path: string;
}
