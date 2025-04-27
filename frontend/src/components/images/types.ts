// Define the types directly to avoid import issues
export interface Image {
  id: number;
  filename: string;
  full_path: string;
  last_modified: string;
  metadata_: Record<string, unknown> | null;
  folder_id: number;
}

export interface Folder {
  id: number;
  path: string;
}
