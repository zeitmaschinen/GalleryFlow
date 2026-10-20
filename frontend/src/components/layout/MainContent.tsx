import { useState } from 'react';
import type { FC } from 'react';
import symbolLight from '../../images/symbol.png';
import symbolDark from '../../images/symbol-darkmode.png';
import { Box, IconButton, Typography, Tooltip, Divider } from '@mui/material';
import { alpha } from '@mui/material/styles';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { ControlsCard } from '../common';
import { ImageGridContainer } from '../images';
import { BurgerMenu, Logo } from './Navigation';
import { layout, typography } from '../../theme/themeConstants';
import { folderName } from '../../utils/fileUtils';
import type { SortField } from '../../types';
import type { Image } from '../../services/api';
import { IMAGES_PER_PAGE } from '../../constants';

interface Folder {
  id: number;
  path: string;
}

interface MainContentProps {
  mode: 'light' | 'dark';
  isMobile: boolean;
  isScanning?: boolean;
  onOpenSidebar: () => void;
  toggleColorMode: () => void;
  selectedFolder: Folder | null;
  images: Image[];
  isLoadingImages: boolean;
  errorImages: string | null;
  thumbnailSize: number;
  currentPage: number;
  totalImages: number;
  sortBy: SortField;
  sortDirection: 'asc' | 'desc';
  selectedFileTypes: string[];
  onSortByChange: (field: SortField) => void;
  onSortDirectionToggle: () => void;
  onFileTypeChange: (types: string[]) => void;
  onPageChange: (event: React.ChangeEvent<unknown>, value: number) => void;
  onGoToFirstPage: () => void;
  onGoToLastPage: () => void;
  onThumbnailSizeChange: (event: Event | React.SyntheticEvent<Element, Event>, newValue: number | number[]) => void;
}

const ThemeToggle: FC<{ mode: 'light' | 'dark'; onToggle: () => void }> = ({ mode, onToggle }) => (
  <Tooltip title={mode === 'dark' ? 'Light mode' : 'Dark mode'}>
    <IconButton onClick={onToggle} aria-label={mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} sx={{ width: 34, height: 34 }}>
      {mode === 'dark' ? <LightModeRoundedIcon sx={{ fontSize: 19 }} /> : <DarkModeRoundedIcon sx={{ fontSize: 18 }} />}
    </IconButton>
  </Tooltip>
);

const CopyPathButton: FC<{ path: string }> = ({ path }) => {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(path);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard can be unavailable (e.g. insecure context); nothing to do.
    }
  };
  return (
    <Tooltip title={copied ? 'Copied' : 'Copy folder path'}>
      <IconButton className="copy-path" size="small" aria-label="Copy folder path" onClick={copy} sx={{ p: 0.5 }}>
        {copied ? <CheckRoundedIcon sx={{ fontSize: 15 }} /> : <ContentCopyRoundedIcon sx={{ fontSize: 14 }} />}
      </IconButton>
    </Tooltip>
  );
};

const MainContent: FC<MainContentProps> = ({
  mode,
  isMobile,
  isScanning = false,
  onOpenSidebar,
  toggleColorMode,
  selectedFolder,
  images,
  isLoadingImages,
  errorImages,
  thumbnailSize,
  currentPage,
  totalImages,
  sortBy,
  sortDirection,
  selectedFileTypes,
  onSortByChange,
  onSortDirectionToggle,
  onFileTypeChange,
  onPageChange,
  onGoToFirstPage,
  onGoToLastPage,
  onThumbnailSizeChange
}) => {
  const totalPages = Math.max(1, Math.ceil(totalImages / IMAGES_PER_PAGE));
  const countLabel = `${totalImages.toLocaleString()} ${totalImages === 1 ? 'image' : 'images'}`;

  const controls = (
    <ControlsCard
      sortBy={sortBy}
      sortDirection={sortDirection}
      selectedFileTypes={selectedFileTypes}
      thumbnailSize={thumbnailSize}
      onSortByChange={(val: string) => onSortByChange(val as SortField)}
      onSortDirectionToggle={onSortDirectionToggle}
      onFileTypeChange={onFileTypeChange}
      onThumbnailSizeChange={onThumbnailSizeChange}
    />
  );

  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        minWidth: 0,
        height: '100vh',
        overflowY: 'auto',
        overflowX: 'hidden',
        bgcolor: 'background.default',
      }}
    >
      {/* Header: stays in view while the gallery scrolls */}
      <Box
        component="header"
        sx={(theme) => ({
          position: 'sticky',
          top: 0,
          zIndex: 10,
          bgcolor: alpha(theme.palette.background.default, 0.82),
          backdropFilter: 'saturate(1.6) blur(14px)',
          borderBottom: 1,
          borderColor: 'divider',
        })}
      >
        <Box
          sx={{
            minHeight: layout.headerHeight,
            px: { xs: 1.5, sm: 3 },
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          {isMobile && <BurgerMenu onClick={onOpenSidebar} sx={{ ml: 0 }} />}

          {selectedFolder ? (
            <Box
              sx={{
                minWidth: 0,
                flex: 1,
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'baseline',
                gap: 1.25,
                '& .copy-path': { opacity: 0, transition: 'opacity 160ms' },
                '&:hover .copy-path, & .copy-path:focus-visible': { opacity: 1 },
                '@media (hover: none)': { '& .copy-path': { display: 'none' } },
              }}
            >
              <Tooltip title={selectedFolder.path} enterDelay={700} placement="bottom-start">
                <Typography
                  component="h1"
                  noWrap
                  sx={{ fontSize: { xs: 16, sm: 18 }, fontWeight: typography.fontWeights.semibold, letterSpacing: '-0.01em', minWidth: 56, flexShrink: 1 }}
                >
                  {folderName(selectedFolder.path)}
                </Typography>
              </Tooltip>
              <Typography
                variant="body2"
                noWrap
                sx={{ color: 'text.secondary', minWidth: 0, flexShrink: 1000, fontVariantNumeric: 'tabular-nums' }}
                aria-live="polite"
              >
                {isScanning
                  ? `Scanning… ${totalImages > 0 ? countLabel + ' found' : ''}`
                  : isLoadingImages && totalImages === 0 ? 'Loading…' : countLabel}
                {!isScanning && totalPages > 1 && ` · Page ${currentPage} of ${totalPages}`}
              </Typography>
              <Box sx={{ alignSelf: 'center' }}>
                <CopyPathButton path={selectedFolder.path} />
              </Box>
            </Box>
          ) : (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>{isMobile && <Logo />}</Box>
          )}

          {selectedFolder && !isMobile && controls}
          {selectedFolder && !isMobile && <Divider orientation="vertical" flexItem sx={{ my: 2.25 }} />}
          <ThemeToggle mode={mode} onToggle={toggleColorMode} />
        </Box>

        {/* On phones the controls get their own row */}
        {selectedFolder && isMobile && (
          <Box sx={{ px: 1.5, pb: 1, overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' } }}>
            {controls}
          </Box>
        )}
      </Box>

      {selectedFolder ? (
        <Box sx={{ px: { xs: 1, sm: 3 }, pt: { xs: 1, sm: 3 }, pb: 6 }}>
          <ImageGridContainer
            images={images}
            isLoading={isLoadingImages}
            error={errorImages}
            thumbnailSize={isMobile ? 120 : thumbnailSize}
            currentPage={currentPage}
            totalImages={totalImages}
            imagesPerPage={IMAGES_PER_PAGE}
            onPageChange={onPageChange}
            onGoToFirstPage={onGoToFirstPage}
            onGoToLastPage={onGoToLastPage}
            isMobile={isMobile}
            isScanning={isScanning}
            hasFilters={selectedFileTypes.length > 0}
            onClearFilters={() => onFileTypeChange([])}
          />
        </Box>
      ) : (
        <Box
          sx={{
            minHeight: `calc(100vh - ${layout.headerHeight + 1}px)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            px: 3,
            pb: 8,
          }}
        >
          <Box sx={{ maxWidth: 440, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box
              component="img"
              src={mode === 'dark' ? symbolDark : symbolLight}
              alt=""
              sx={{ width: 44, height: 44, mb: 3, opacity: 0.9 }}
            />
            <Typography component="h1" sx={{ fontSize: 22, fontWeight: typography.fontWeights.semibold, letterSpacing: '-0.015em', mb: 1 }}>
              Your ComfyUI images, beautifully organized
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
              {isMobile
                ? 'Open the menu to pick a folder from your library, or add your ComfyUI output folder.'
                : 'Pick a folder from your library, or add your ComfyUI output folder in the sidebar. GalleryFlow reads the prompts and workflow saved in each image.'}
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default MainContent;
