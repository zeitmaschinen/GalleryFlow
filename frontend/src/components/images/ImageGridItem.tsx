import React from 'react';
import { Box, CircularProgress, IconButton } from '@mui/material';
import { getThumbnailUrl } from '../../services/api';
import type { Image } from './types';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import WorkflowIcon from '@mui/icons-material/AccountTree';

interface ImageGridItemProps {
  image: Image;
  thumbnailSize: number; // Kept for future use even if not currently used
  loadedImages: Set<string>;
  handleImageClick: (image: Image) => void;
  handleOpenWorkflowModal?: (image: Image) => void;
  handleOpenMetadata?: (image: Image) => void;
}

const ImageGridItem: React.FC<ImageGridItemProps> = ({
  image,
  loadedImages,
  handleImageClick,
  handleOpenWorkflowModal,
  handleOpenMetadata = handleImageClick, // Default to handleImageClick for backward compatibility
}) => {
  // Use thumbnail for grid display, full image for preview
  const thumbnailUrl = getThumbnailUrl(image.full_path, 'medium');
  
  return (
    <Box
      sx={{
        position: 'relative',
        aspectRatio: '1 / 1',
        width: '100%',
        height: '0',
        paddingBottom: '100%', // This creates a square box
        borderRadius: 1,
        overflow: 'hidden',
        boxShadow: 1,
        bgcolor: 'background.paper',
        cursor: 'pointer',
        display: 'block', // Changed to block for padding-bottom to work
        transition: 'box-shadow 0.2s, transform 0.18s cubic-bezier(0.4,0,0.2,1)',
        '&:hover': {
          boxShadow: 4,
          transform: 'translateY(-6px)',
        },
        '&:hover .image-action-icons': {
          opacity: 1,
          pointerEvents: 'auto',
        },
      }}
      onClick={() => handleImageClick(image)}
    >
      <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img
          src={thumbnailUrl}
          alt={image.filename}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            opacity: loadedImages.has(thumbnailUrl) ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
            borderRadius: 'inherit',
            display: 'block',
          }}
          onLoad={() => {
            // The parent's preload effect handles updating loadedImages Set
            // Direct mutation here won't trigger parent re-renders anyway
          }}
          // Fixed: Handle image load failures (e.g., deleted files, 404 errors)
          // Mark as loaded even on error to prevent infinite loading spinner
          onError={() => {
            // The parent's preload effect handles updating loadedImages Set
          }}
        />
        {!loadedImages.has(thumbnailUrl) && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <CircularProgress size={18} sx={{ color: '#ccc' }} />
          </Box>
        )}
        <Box
          className="image-action-icons"
          sx={{
            position: 'absolute',
            bottom: 8,
            right: 4, // Decreased right value to move icons more to the right side
            display: 'flex',
            gap: 0.5, // Keeping icons close together
            zIndex: 2,
            opacity: 0,
            pointerEvents: 'none',
            transition: 'opacity 0.2s',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <IconButton
            size="medium" 
            sx={{ 
              bgcolor: '#23272E', 
              color: '#fff', 
              '&:hover': { bgcolor: '#444' }, 
              p: 1 
            }} 
            onClick={(e) => {
              e.stopPropagation();
              handleOpenMetadata(image);
            }}
          >
            <InfoIcon sx={{ fontSize: 20 }} />
          </IconButton>
          
          {handleOpenWorkflowModal && (
            <IconButton
              size="medium" 
              sx={{ 
                bgcolor: '#23272E', 
                color: '#fff', 
                '&:hover': { bgcolor: '#444' }, 
                p: 1 
              }} 
              onClick={(e) => {
                e.stopPropagation();
                handleOpenWorkflowModal(image);
              }}
            >
              <WorkflowIcon sx={{ fontSize: 20 }} />
            </IconButton>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ImageGridItem;
