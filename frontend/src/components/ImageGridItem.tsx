import React from 'react';
import { Card, Tooltip, Box, CircularProgress } from '@mui/material';
import { colors } from '../theme/themeConstants';
import { getImageUrl } from '../services/api';
import type { Image } from '../types/index';

// Removed unused 'thumbnailSize' prop
interface ImageGridItemProps {
  image: Image;
  loaded: boolean;
  onClick: (image: Image) => void;
  onLoad: () => void;
}

const ImageGridItem: React.FC<ImageGridItemProps> = ({ image, loaded, onClick, onLoad }) => {
  return (
    <Card
      key={image.id}
      onClick={() => onClick(image)}
      sx={{
        position: 'relative',
        cursor: 'pointer',
        transition: 'transform 0.2s ease-in-out',
        height: '100%',
        '&:hover': {
          transform: 'scale(1.02)',
          zIndex: 1,
        },
      }}
    >
      <Tooltip title={image.filename} arrow placement="top">
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            backgroundColor: colors.common.hoverLight,
          }}
        >
          <img
            src={getImageUrl(image.full_path)}
            alt={image.filename}
            loading="lazy"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              opacity: loaded ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out',
            }}
            onLoad={onLoad}
          />
          {!loaded && (
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              <CircularProgress size={24} />
            </Box>
          )}
        </Box>
      </Tooltip>
    </Card>
  );
};

export default ImageGridItem;
