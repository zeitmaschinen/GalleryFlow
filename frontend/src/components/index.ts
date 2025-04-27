// Export components from their new locations
export { ThumbnailSizeSlider, ProgressBar, LoadingSpinner } from './common/UIControls';
export { StatsCards } from './common';
export { FileTypeFilter, SortButton, FileList } from './common/FilterControls';
export { ControlsCard } from './common';
export { BurgerMenu, DrawerHeaderMobile, SidebarFooter, SidebarContainer } from './layout';
export { FolderHeader } from './folders';
export { ConfirmationDialog, ImageDetailDialog } from './common/DialogComponents';
export { default as MainContent } from './layout/MainContent';
export { default as ImageGrid } from './images/ImageGrid';
export { default as FolderList } from './folders/FolderList';
export { default as AddFolderForm } from './folders/AddFolderForm';
export { default as WorkflowModal } from './workflow/WorkflowModal';
export { default as ImageModal } from './images/ImageModal';

// Export types
export type { Image, Folder } from './images/types';
