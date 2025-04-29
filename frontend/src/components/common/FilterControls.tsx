import React, { useState, useMemo } from 'react';
import { Box, Button, Menu, MenuItem, Checkbox, ListItemText } from '@mui/material';
import { dropdownStyles } from '../../theme/dropdownStyles';

// ===== SortButton Component =====
interface SortButtonProps {
  value: string;
  onChange: (value: string) => void;
}

export const SortButton: React.FC<SortButtonProps> = ({ value, onChange }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (value: string) => {
    onChange(value);
    handleClose();
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Button
        variant="outlined"
        disableElevation
        size="large"
        onClick={handleClick}
        sx={{
          height: 40,
          minWidth: 0,
          fontSize: '1rem',
          px: 2,
          py: 1,
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 2,
          bgcolor: 'background.paper',
          borderColor: 'grey.300',
          color: 'text.primary',
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
          },
        }}
        aria-controls={open ? 'sort-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open}
        id="sort-button"
      >
        {`Sort: ${value === 'filename' ? 'Filename' : value === 'date' ? 'Date Modified' : value === 'folder' ? 'Subfolder' : value}`}
      </Button>
      <Menu
        id="sort-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        elevation={1}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        sx={{
          ...dropdownStyles.menu,
          '& .MuiBackdrop-root': {
            backgroundColor: 'transparent'
          }
        }}
        disableAutoFocusItem
        MenuListProps={{
          autoFocusItem: false,
          'aria-labelledby': 'sort-button'
        }}
        BackdropProps={{ invisible: true }}
      >
        <Box>
          <MenuItem 
            onClick={() => handleMenuItemClick('filename')} 
            selected={value === 'filename'} 
            sx={dropdownStyles.menuItem(value === 'filename')}
          >
            Filename
          </MenuItem>
          <MenuItem 
            onClick={() => handleMenuItemClick('date')} 
            selected={value === 'date'} 
            sx={dropdownStyles.menuItem(value === 'date')}
          >
            Date Modified
          </MenuItem>
          <MenuItem 
            onClick={() => handleMenuItemClick('folder')} 
            selected={value === 'folder'} 
            sx={dropdownStyles.menuItem(value === 'folder')}
          >
            Subfolder
          </MenuItem>
        </Box>
      </Menu>
    </Box>
  );
};

// ===== FileTypeFilter Component =====
interface FileTypeFilterProps {
  selectedTypes: string[];
  onChange: (types: string[]) => void;
}

const fileTypes = ['png', 'jpg', 'jpeg', 'webp'];

export const FileTypeFilter: React.FC<FileTypeFilterProps> = ({ selectedTypes, onChange }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => setAnchorEl(null);
  
  const handleSelect = (type: string) => {
    let newTypes: string[];
    if (selectedTypes.includes(type)) {
      newTypes = selectedTypes.filter(t => t !== type);
    } else {
      newTypes = [...selectedTypes, type];
    }
    onChange(newTypes);
  };

  const label = useMemo(() => {
    return `Filter${selectedTypes.length ? ': ' + selectedTypes.join(', ') : ''}`;
  }, [selectedTypes]);

  return (
    <Box>
      <Button
        variant="outlined"
        disableElevation
        size="large"
        onClick={handleClick}
        sx={{
          height: 40,
          minWidth: 0,
          fontSize: '1rem',
          px: 2,
          py: 1,
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 2,
          bgcolor: 'background.paper',
          borderColor: 'grey.300',
          color: 'text.primary',
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
          },
        }}
        aria-controls={anchorEl ? 'filter-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={Boolean(anchorEl)}
        id="filter-button"
      >
        {label}
      </Button>
      <Menu
        id="filter-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        elevation={1}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        MenuListProps={{ 
          sx: { minWidth: 140 },
          autoFocusItem: false,
          'aria-labelledby': 'filter-button'
        }}
        sx={{
          ...dropdownStyles.menu,
          '& .MuiBackdrop-root': {
            backgroundColor: 'transparent'
          }
        }}
        disableAutoFocusItem
        BackdropProps={{ invisible: true }}
      >
        <Box>
          {fileTypes.map(type => (
            <MenuItem
              key={type}
              selected={selectedTypes.includes(type)}
              onClick={() => handleSelect(type)}
              sx={dropdownStyles.menuItem(selectedTypes.includes(type))}
            >
              <Checkbox
                checked={selectedTypes.includes(type)}
                size="small"
                sx={{ p: 0.5, mr: 1 }}
              />
              <ListItemText primary={type} />
            </MenuItem>
          ))}
        </Box>
      </Menu>
    </Box>
  );
};

// ===== FileList Component =====
interface FileListProps {
  sortBy: string;
  selectedTypes: string[];
  onSortChange: (value: string) => void;
  onTypeChange: (types: string[]) => void;
}

export const FileList: React.FC<FileListProps> = ({
  sortBy,
  selectedTypes,
  onSortChange,
  onTypeChange
}) => {
  return (
    <Box sx={{ display: 'flex', mb: 2 }}>
      <Box sx={{ mr: '2px', display: 'flex' }}>
        <FileTypeFilter
          selectedTypes={selectedTypes}
          onChange={onTypeChange}
        />
      </Box>
      <SortButton
        value={sortBy}
        onChange={onSortChange}
      />
    </Box>
  );
};

// Default export for backward compatibility
export default FileList;
