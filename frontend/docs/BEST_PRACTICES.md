# GalleryFlow: Code Guide

Where things live in the frontend, and how to change them without breaking the design system.

## Project structure

```
frontend/src/
  App.tsx                 App shell: sidebar + main area, data loading, scan watching
  constants.ts            Page size, gallery row heights, app version
  theme/
    themeConstants.ts     Design tokens: palette (light/dark), type, radii, shadows, layout
    index.ts              MUI theme built from the tokens (component defaults live here)
    ModalNavArrow.tsx     Previous/next arrows shown over dialogs
  components/
    layout/               Sidebar (desktop + mobile drawer), header, welcome screen
    folders/              Folder list and the "Add folder" field
    common/               Toolbar (size slider, filter, sort), pagination, dialog transition
    images/               Gallery grid, grid tiles, full-screen viewer, details dialog
    workflow/             Workflow dialog and the React Flow node graph
  hooks/
    useFolders.ts         Folder list, add / remove / rescan
    useImages.ts          Images for the current page, sort and filter state
    useImageMetadata.ts   Reads model, seed, prompts, LoRAs… from ComfyUI metadata
  services/
    api.ts                All requests to the backend
    cache.ts              Short-lived cache of image pages
  utils/
    parseComfyWorkflow.ts Turns ComfyUI workflow JSON into graph nodes and edges
```

## Where to change things

| To change… | Edit |
| --- | --- |
| Colours, fonts, spacing, radii | `theme/themeConstants.ts` (tokens) — never hard-code colours in components |
| How MUI buttons, menus, dialogs look everywhere | `theme/index.ts` |
| Gallery layout (justified rows) | `components/images/ImageGrid.tsx`, `ImageGridItem.tsx` |
| Loading, empty and scanning states | `components/images/ImageGridContainer.tsx` |
| Header and toolbar | `components/layout/MainContent.tsx`, `components/common/ControlsCard.tsx`, `FilterControls.tsx` |
| Sidebar and folder list | `components/layout/SidebarContent.tsx`, `components/folders/` |
| Image details panel | `components/images/ImageModal.tsx` |
| Full-screen viewer | `components/images/ImagePreviewModal.tsx` |
| Workflow graph look | `components/workflow/WorkflowModal.css`, `ComfyNode.tsx` |
| Which metadata fields are extracted | `hooks/useImageMetadata.ts` |
| Backend requests | `services/api.ts` |

## Things to know

- **The gallery keeps each image's shape.** Tiles use the `width`/`height` the backend stores during a scan. Rows stretch to fill the width; the last row keeps its natural size.
- **Adding a folder returns before the scan finishes.** The backend scans in the background, so `App.tsx` polls the image count and refreshes the grid until the count stops changing. Empty image lists are never cached (`services/api.ts`).
- **Pass file paths, not URLs.** Components pass `image.full_path`; only call `getImageUrl()` where an `<img>` is rendered.
- **Every colour has a light and a dark value.** Read them from `palette[theme.palette.mode]` so both modes stay consistent.

## Before opening a pull request

```bash
cd frontend
npx tsc -b
npm run lint
npm run build
```

Then run the app (see the main README) and check the gallery, the details dialog and the workflow view in light mode, dark mode and at phone width.
