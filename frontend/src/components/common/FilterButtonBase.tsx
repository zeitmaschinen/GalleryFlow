import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';

export const FilterButtonBase = styled(Button)(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  position: 'relative',
  boxSizing: 'border-box',
  cursor: 'pointer',
  minWidth: '120px',
  height: '40px',
  padding: '8.5px 14px',
  backgroundColor: 'transparent',
  border: `1px solid ${theme.palette.primary.light}`,
  borderRadius: theme.shape.borderRadius,
  color: theme.palette.primary.light,
  fontFamily: theme.typography.fontFamily,
  fontSize: theme.typography.pxToRem(14),
  fontWeight: theme.typography.fontWeightRegular,
  lineHeight: '1.4375em',
  letterSpacing: '0.01071em',
  textTransform: 'none',
  textAlign: 'left',
  transition: 'none !important',
  '&:hover': {
    backgroundColor: theme.palette.mode === 'dark' ? theme.palette.action.hover : theme.palette.action.selected,
    borderColor: theme.palette.primary.light,
    transition: 'none !important',
    '@media (hover: none)': {
      backgroundColor: 'transparent'
    }
  },
  '&.active': {
    color: theme.palette.primary.light
  },
  '& .MuiButton-endIcon': {
    position: 'absolute',
    right: '7px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'rgba(0, 0, 0, 0.54)',
    pointerEvents: 'none',
    marginRight: 0,
    marginLeft: 0
  },
  '&:focus': {
    borderRadius: theme.shape.borderRadius,
    borderColor: theme.palette.primary.light,
    outline: `2px solid ${theme.palette.mode === 'dark' 
      ? 'rgba(172, 165, 255, 0.2)' 
      : 'rgba(87, 65, 229, 0.2)'}`,
    outlineOffset: '2px',
    transition: 'none !important',
  }
}));