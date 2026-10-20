import React from 'react';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';

interface ModalNavArrowProps extends Omit<IconButtonProps, 'children'> {
  direction: 'left' | 'right';
  'aria-label': string;
}

/**
 * Previous / next control pinned to the viewport edge while a dialog is open.
 * Frosted and neutral so it works over any image or backdrop.
 */
const ModalNavArrow: React.FC<ModalNavArrowProps> = ({ direction, 'aria-label': ariaLabel, sx, ...props }) => (
  <IconButton
    {...props}
    aria-label={ariaLabel}
    sx={[
      {
        position: 'fixed',
        [direction]: { xs: 8, md: 20 },
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 1401,
        width: 44,
        height: 44,
        borderRadius: '50%',
        color: '#fff',
        bgcolor: 'rgba(20, 20, 18, 0.5)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        transition: 'background-color 160ms, transform 160ms',
        '&:hover': { bgcolor: 'rgba(20, 20, 18, 0.75)', color: '#fff' },
        '&:active': { transform: 'translateY(-50%) scale(0.94)' },
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
  >
    {direction === 'left'
      ? <ChevronLeftRoundedIcon sx={{ fontSize: 26 }} />
      : <ChevronRightRoundedIcon sx={{ fontSize: 26 }} />}
  </IconButton>
);

export default ModalNavArrow;
