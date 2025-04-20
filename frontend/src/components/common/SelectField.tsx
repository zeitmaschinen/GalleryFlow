import React, { useState } from 'react';
import { Box, Menu, MenuItem, FormGroup, FormControlLabel, Checkbox, Paper, styled } from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const StyledButton = styled('button')(({ theme }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  position: 'relative',
  boxSizing: 'border-box',
  cursor: 'pointer',
  minWidth: '120px',
  height: '32px',
  padding: '6px 14px',
  backgroundColor: 'transparent',
  border: '1px solid rgba(0, 0, 0, 0.23)',
  borderRadius: theme.shape.borderRadius,
  color: 'rgba(0, 0, 0, 0.87)',
  fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
  fontSize: '0.875rem',
  fontWeight: 400,
  lineHeight: '1.4375em',
  letterSpacing: '0.01071em',
  textTransform: 'none',
  textAlign: 'left',
  transition: 'none !important',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
    borderColor: 'rgba(0, 0, 0, 0.23)',
  },
  '&.active': {
    color: theme.palette.secondary.main
  },
  '&:focus': {
    borderRadius: theme.shape.borderRadius,
    borderColor: '#1976d2',
    outline: '2px solid rgba(25, 118, 210, 0.2)',
    outlineOffset: '2px'
  }
}));

const StyledIcon = styled(KeyboardArrowDownIcon)({
  position: 'absolute',
  right: '7px',
  top: '50%',
  transform: 'translateY(-50%)',
  color: 'rgba(0, 0, 0, 0.54)',
  pointerEvents: 'none',
  fontSize: '20px'
});

interface SelectFieldProps {
  label: string;
  type: 'sort' | 'filter';
  value: string | string[];
  onChange: (value: unknown) => void;
  options?: { value: string; label: string }[];
}

export const SelectField: React.FC<SelectFieldProps> = ({ 
  label, 
  type, 
  value, 
  onChange, 
  options = [] 
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSortChange = (newValue: string) => {
    onChange(newValue);
    handleClose();
  };

  const handleFilterChange = (type: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const currentValue = value as string[];
    if (event.target.checked) {
      onChange([...currentValue, type]);
    } else {
      onChange(currentValue.filter(t => t !== type));
    }
  };

  const isActive = type === 'sort' ? value !== '' : (value as string[]).length > 0;

  const renderContent = () => {
    if (type === 'sort') {
      return (
        <div>
          {options.map((option) => (
            <MenuItem 
              key={option.value} 
              onClick={() => handleSortChange(option.value)}
            >
              {option.label}
            </MenuItem>
          ))}
        </div>
      );
    }

    return (
      <Paper sx={{ px: 2, py: 1, minWidth: 120 }}>
        <FormGroup>
          {options.map((option) => (
            <FormControlLabel
              key={option.value}
              control={
                <Checkbox
                  size="small"
                  checked={(value as string[]).includes(option.value)}
                  onChange={handleFilterChange(option.value)}
                />
              }
              label={option.label}
              sx={{ 
                '& .MuiFormControlLabel-label': {
                  fontSize: '0.875rem'
                }
              }}
            />
          ))}
        </FormGroup>
      </Paper>
    );
  };

  return (
    <Box sx={{ mr: 1 }}>
      <StyledButton
        className={isActive ? 'active' : ''}
        onClick={handleClick}
      >
        {label}
        <StyledIcon />
      </StyledButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        elevation={1}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        {renderContent()}
      </Menu>
    </Box>
  );
};