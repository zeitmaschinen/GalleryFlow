import React, { useState } from 'react';
import { Card, CardMedia, CardActionArea, Box, Checkbox } from '@mui/material';
import type { Image } from '../../services/api';
import { useLazyLoad } from '../../hooks/useLazyLoad';

interface ImageCardProps {
  image: Image;
  width: number;
  height: number;
  selected?: boolean;
  onSelect?: (id: number) => void;
  onClick?: (image: Image) => void;
  selectable?: boolean;
}

export const ImageCard: React.FC<ImageCardProps> = ({
  image,
  width,
  height,
  selected = false,
  onSelect,
  onClick,
  selectable = false
}) => {
  const { elementRef, isVisible } = useLazyLoad();
  const [isLoaded, setIsLoaded] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (selectable && onSelect) {
      e.preventDefault();
      e.stopPropagation();
      onSelect(image.id);
    } else if (onClick) {
      onClick(image);
    }
  };

  return (
    <Card
      ref={elementRef as React.RefObject<HTMLDivElement>}
      sx={{
        width,
        height,
        position: 'relative',
        '&:hover': {
          boxShadow: 3
        }
      }}
    >
      <CardActionArea onClick={handleClick} sx={{ height: '100%' }}>
        {isVisible && (
          <CardMedia
            component="img"
            image={image.full_path}
            alt={image.filename}
            sx={{
              height: '100%',
              objectFit: 'cover',
              opacity: isLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out'
            }}
            onLoad={() => setIsLoaded(true)}
          />
        )}
        {selectable && (
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              zIndex: 1
            }}
          >
            <Checkbox
              checked={selected}
              onChange={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                if (onSelect) onSelect(image.id);
              }}
            />
          </Box>
        )}
      </CardActionArea>
    </Card>
  );
};