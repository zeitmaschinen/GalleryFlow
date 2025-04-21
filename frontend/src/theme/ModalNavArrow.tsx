import React from 'react';
import IconButton, { IconButtonProps } from '@mui/material/IconButton';
import { useTheme } from '@mui/material/styles';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface ModalNavArrowProps extends Omit<IconButtonProps, 'children'> {
  direction: 'left' | 'right';
  'aria-label': string;
}

const ModalNavArrow: React.FC<ModalNavArrowProps> = ({ direction, 'aria-label': ariaLabel, ...props }) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  return (
    <IconButton
      {...props}
      aria-label={ariaLabel}
      size="small"
      sx={{
        position: 'fixed',
        [direction === 'left' ? 'left' : 'right']: 24,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 1401,
        backgroundColor: isDark ? theme.palette.background.paper : '#fff',
        color: isDark ? theme.palette.primary.main : theme.palette.primary.dark,
        borderRadius: '50%',
        width: 40,
        height: 40,
        minWidth: 40,
        minHeight: 40,
        boxShadow: theme.shadows[3],
        transition: theme.transitions.create(['background-color', 'box-shadow'], {
          duration: theme.transitions.duration.short,
        }),
        '&:hover': {
          backgroundColor: isDark ? theme.palette.primary.dark : theme.palette.primary.light,
          color: isDark ? '#fff' : theme.palette.primary.contrastText,
          boxShadow: theme.shadows[6],
        },
        display: 'flex',
        ...props.sx,
      }}
    >
      {direction === 'left' ? (
        <ArrowForwardIcon sx={{ fontSize: 20, transform: 'scaleX(-1)' }} />
      ) : (
        <ArrowForwardIcon sx={{ fontSize: 20 }} />
      )}
    </IconButton>
  );
};

export default ModalNavArrow;
