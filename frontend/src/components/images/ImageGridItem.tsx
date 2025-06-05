import React from 'react';
import { Box, CircularProgress, IconButton, Tooltip } from '@mui/material';
import { getImageUrl } from '../../services/api';
import type { Image } from './types';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import WorkflowIcon from '@mui/icons-material/AccountTree';

interface ImageGridItemProps {
  image: Image;
  thumbnailSize: number; // Kept for future use even if not currently used
  loadedImages: Set<string>;
  handleImageClick: (image: Image) => void;
  handleOpenWorkflowModal?: (image: Image) => void;
}

const ImageGridItem: React.FC<ImageGridItemProps> = ({
  image,
  loadedImages,
  handleImageClick,
  handleOpenWorkflowModal,
}) => {
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
          src={`${getImageUrl(image.full_path)}&t=${image.last_modified || Date.now()}`}
          alt={image.filename}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            opacity: loadedImages.has(getImageUrl(image.full_path)) ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out',
            borderRadius: 'inherit',
            display: 'block',
          }}
          onLoad={() => {
            if (!loadedImages.has(getImageUrl(image.full_path))) {
              loadedImages.add(getImageUrl(image.full_path));
            }
          }}
        />
        {!loadedImages.has(getImageUrl(image.full_path)) && (
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
          <Tooltip title="Metadata preview" arrow placement="top" enterDelay={300}>
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
                handleImageClick(image);
              }}
            >
              <InfoIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
          
          {handleOpenWorkflowModal && (
            <Tooltip title="Workflow preview" arrow placement="top" enterDelay={300}>
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
            </Tooltip>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ImageGridItem;