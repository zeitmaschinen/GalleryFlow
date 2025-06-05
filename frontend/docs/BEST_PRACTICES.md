# GalleryFlow: Best Practices & Code Location Guide

## Purpose

This document outlines the main functionalities of the project, describes where each is implemented, and provides guidance on how and where to make changes according to industry best practices.

---

## 1. Project Structure Overview

```
frontend/
  src/
    components/
      images/          # Image grid, modal, grid items, etc.
      folders/         # Folder management components
      common/          # Shared UI components (PaginationControls, etc.)
      layout/          # Layout and navigation components
    hooks/             # Custom React hooks (useFolders, useImages, useGridResize, etc.)
    services/          # API and websocket services
    theme/             # Theme configuration and constants
    constants.ts       # App-wide constants (e.g., IMAGES_PER_PAGE)
    types.ts           # TypeScript type definitions
    App.tsx            # Main application entry point
```

---

## 2. Main Functionalities & Where to Change Them

### A. Image Grid Display

- **Component:** `ImageGrid`
- **Location:** `frontend/src/components/images/ImageGrid.tsx`
- **Purpose:** Displays images in a responsive grid, handles resizing, and integrates infinite scroll.
- **Change Here If:** You want to alter how images are displayed, grid layout, or image loading logic.
- **Related Hooks:** `useGridResize`, `useInfiniteScroll` (`frontend/src/hooks/`)

### B. Pagination

- **Component:** `PaginationControls`
- **Location:** `frontend/src/components/common/PaginationControls.tsx`
- **Purpose:** Renders and manages pagination controls (next, previous, first, last page).
- **Change Here If:** You need to adjust pagination logic, button layout, or page calculation.

### C. Folder Management

- **Components:** `FolderList`, `AddFolderForm`, `FolderHeader`
- **Location:** `frontend/src/components/folders/`
- **Purpose:** Lists folders, adds new folders, displays folder info.
- **Change Here If:** You want to update folder UI or logic.

### D. Adding a Folder Path

- **Component:** `AddFolderForm`
- **Location:** `frontend/src/components/folders/AddFolderForm.tsx`
- **Purpose:** Allows the user to input and add a new folder path to the application.
- **Change Here If:** You want to change the UI/UX for adding folders, input validation, or how folder paths are submitted.
- **Related Logic:** Folder addition logic may also be handled in the `useFolders` hook (`frontend/src/hooks/useFolders.ts`) and may involve API calls to the backend.

### E. State Management & API Communication

- **Hooks:** `useFolders`, `useImages`
- **Location:** `frontend/src/hooks/`
- **Purpose:** Fetches and manages folders/images state from backend.
- **Change Here If:** You want to change how data is fetched, filtered, or stored.
- **API Service:** `api.ts` in `frontend/src/services/api.ts`
- **Purpose:** Handles all backend communication for images, folders, and metadata.
- **Change Here If:** You want to update API endpoints, request/response logic, or add new backend interactions.

### F. Grabbing and Displaying Image Metadata

- **Component:** `ImageGrid`
- **Location:** `frontend/src/components/images/ImageGrid.tsx`
- **Purpose:** Extracts and displays metadata from images, typically using the `parseMetadata` utility and rendering details in the image modal.
- **Change Here If:** You want to change how metadata is parsed or displayed, or add new metadata fields.
- **Related Utility:** `parseMetadata` in `frontend/src/utils/metadataParser.ts`.
- **Related Logic:** Metadata is shown when an image is selected and the modal is open.

### G. Modal Component (Image Details Dialog)

- **Component:** `ImageModal`
- **Location:** `frontend/src/components/images/ImageModal.tsx`
- **Purpose:** Displays a larger view of the image along with its metadata and navigation controls.
- **Change Here If:** You want to change the modal's appearance, layout, or behavior when viewing image details.
- **Usage:** The modal is invoked from `ImageGrid.tsx`, which passes the selected image object and metadata as props.
- **Best Practice:** Always pass the raw file path (not a URL) as `full_path` between components. Only use `getImageUrl()` when rendering an `<img>` element. This prevents double-wrapping URLs and broken image displays.
- **Troubleshooting:** If modal images do not display, check the `src` for double-wrapped URLs (e.g., URLs containing `file_path=http://...`).

### H. Grid Item Component (Individual Image Cells)

- **Component:** `ImageGridItem`
- **Location:** `frontend/src/components/images/ImageGridItem.tsx`
- **Purpose:** Renders individual image thumbnails in the grid and handles click events to open the modal.
- **Change Here If:** You want to change how image thumbnails are displayed or interacted with.
- **Best Practice:** Use `getImageUrl(image.full_path)` for the thumbnail image, and always pass the original image object (with a file path) up to parent components or the modal.

### I. Statistics Display

- **Component:** `StatsCards`
- **Location:** `frontend/src/components/common/StatsCards.tsx`
- **Purpose:** Displays summary statistics about images/folders (counts, sizes, etc.).
- **Change Here If:** You want to change what statistics are shown or how they are calculated.

### J. Theming & Styling

- **Theme Provider:** `ThemeProvider` in `App.tsx`
- **Theme Config:** `frontend/src/theme/index.ts` and `frontend/src/theme/themeConstants.ts`
- **Purpose:** Manages light/dark mode, typography, and spacing.
- **Change Here If:** You want to update color schemes, fonts, or spacing.

### K. Notifications

- **Hook:** `useSnackbar`
- **Location:** `frontend/src/hooks/useSnackbar.ts`
- **Purpose:** Shows user notifications.
- **Change Here If:** You want to customize notification appearance or logic.

### L. Sidebar & Navigation

- **Components:** `SidebarFooter`, `BurgerMenu`, `DrawerHeaderMobile`, `Navigation`, `Sidebar`, `SidebarContainer`, `MobileSidebar`, `MainContent`
- **Location:** `frontend/src/components/layout/`
- **Purpose:** Sidebar navigation and footer info.
- **Change Here If:** You want to update navigation or sidebar content.

---

## 3. Best Practices

- **Componentization:** Keep components small, focused, and reusable. Extract modal dialogs and grid items into their own components for maintainability.
- **Props Discipline:** Pass raw data (e.g., file paths) between components. Only transform data (e.g., create URLs) at the point of use (such as in an `<img>` tag).
- **Hooks:** Use custom hooks for shared logic and side effects.
- **Theming:** Use Material-UI’s theme provider for consistent styling.
- **Responsiveness:** Use `useMediaQuery` and responsive MUI props for mobile/desktop support.
- **Type Safety:** Use TypeScript types for all props, state, and API responses.
- **Separation of Concerns:** Keep API/data logic in hooks, UI in components.
- **Testing:** Write tests for hooks and components (if test framework is set up).
- **Documentation:** Update this document and code comments when making structural changes.

---

## 4. How to Find and Change Functionality

- **To change how images are displayed:** Edit `ImageGrid.tsx` and related hooks in `components/images/` and `hooks/`.
- **To adjust pagination:** Edit `PaginationControls.tsx` in `components/common/` and check how `currentPage` is managed in `App.tsx`.
- **To add a new theme or adjust colors:** Edit files in `theme/`.
- **To add a new feature (e.g., drag-and-drop):** Create a new component or hook in the appropriate directory and import it in `App.tsx`.

---

## 5. Onboarding Checklist

- Read this document and browse the `components/` and `hooks/` directories.
- Run the app locally and explore the UI.
- Review the usage of Material-UI and custom hooks.
- Follow the best practices above for any contributions.

---
