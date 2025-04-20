import React from 'react';
import { Button } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

interface FilterButtonProps {
  label: string;
  isActive: boolean;
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
  'aria-controls'?: string;
  'aria-expanded'?: boolean;
  'aria-haspopup'?: boolean | 'dialog' | 'grid' | 'listbox' | 'menu' | 'tree';
}

const FilterButton: React.FC<FilterButtonProps> = ({
  label,
  isActive,
  onClick,
  ...ariaProps
}) => {
  return (
    <Button
      variant="contained"
      disableElevation
      onClick={onClick}
      endIcon={<KeyboardArrowDownIcon />}
      {...ariaProps}
      sx={{
        height: 32,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'grey.300',
        color: isActive ? 'secondary.main' : 'text.primary',
        textTransform: 'none',
        boxShadow: 'none',
        transition: 'none !important',
        '&:hover': {
          bgcolor: 'background.paper',
          borderColor: 'grey.400',
          boxShadow: 'none',
          transition: 'none !important',
        },
        '&:active': {
          boxShadow: 'none',
          transition: 'none !important',
        }
      }}
    >
      {label}
    </Button>
  );
};

export default FilterButton;