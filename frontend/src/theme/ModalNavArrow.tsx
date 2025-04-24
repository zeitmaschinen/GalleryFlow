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
  // Reference light mode hover colors
  const hoverBg = theme.palette.primary.light;
  const hoverIcon = theme.palette.primary.contrastText;
  // Normal state
  const arrowColor = isDark ? '#ACA5FF' : theme.palette.primary.dark;
  const arrowBg = isDark ? theme.palette.background.paper : '#fff';
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
        backgroundColor: arrowBg,
        color: arrowColor,
        borderRadius: '50%',
        width: 40,
        height: 40,
        minWidth: 40,
        minHeight: 40,
        boxShadow: theme.shadows[3],
        transition: theme.transitions.create(['background-color', 'box-shadow', 'color'], {
          duration: theme.transitions.duration.short,
        }),
        '&:hover': {
          backgroundColor: hoverBg,
          color: hoverIcon,
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
