import React, { useState } from 'react';
import { Box, Button, Menu, MenuItem, ListItemText, Typography } from '@mui/material';
import type { SxProps, Theme } from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import FilterListRoundedIcon from '@mui/icons-material/FilterListRounded';
import SortRoundedIcon from '@mui/icons-material/SortRounded';
import { palette, typography } from '../../theme/themeConstants';

/** Shared look for the toolbar's dropdown triggers. */
const toolbarButtonSx = (active = false): SxProps<Theme> => (theme) => {
  const p = palette[theme.palette.mode];
  return {
    height: 34,
    px: 1.25,
    gap: 0.25,
    whiteSpace: 'nowrap',
    fontSize: typography.sizes.sm,
    fontWeight: typography.fontWeights.medium,
    color: active ? p.accentText : p.text,
    bgcolor: active ? p.accentSoft : 'transparent',
    '& .MuiButton-startIcon': { mr: 0.75, color: active ? p.accentText : p.textSecondary },
    '& .MuiButton-endIcon': { ml: 0.25, color: p.textTertiary },
    '&:hover': { bgcolor: active ? p.accentSoft : theme.palette.action.hover },
  };
};

const sortLabels: Record<string, string> = {
  folder: 'Subfolder',
  filename: 'Filename',
  date: 'Date modified',
};

// ===== SortButton Component =====
interface SortButtonProps {
  value: string;
  onChange: (value: string) => void;
}

export const SortButton: React.FC<SortButtonProps> = ({ value, onChange }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <Button
        onClick={(e) => setAnchorEl(e.currentTarget)}
        startIcon={<SortRoundedIcon sx={{ fontSize: '18px !important' }} />}
        endIcon={<KeyboardArrowDownRoundedIcon />}
        sx={toolbarButtonSx()}
        aria-controls={open ? 'sort-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`Sort by ${sortLabels[value] ?? value}`}
        id="sort-button"
      >
        {sortLabels[value] ?? value}
      </Button>
      <Menu
        id="sort-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        MenuListProps={{ 'aria-labelledby': 'sort-button', sx: { minWidth: 180 } }}
      >
        <Typography variant="overline" sx={{ display: 'block', px: 1.25, pt: 0.5, fontSize: 10.5, color: 'text.disabled' }}>
          Sort by
        </Typography>
        {Object.entries(sortLabels).map(([key, label]) => (
          <MenuItem
            key={key}
            selected={value === key}
            onClick={() => { onChange(key); setAnchorEl(null); }}
          >
            <ListItemText primary={label} primaryTypographyProps={{ fontSize: 'inherit', fontWeight: 'inherit' }} />
            {value === key && <CheckRoundedIcon sx={{ fontSize: 16, color: 'primary.main' }} />}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

// ===== FileTypeFilter Component =====
interface FileTypeFilterProps {
  selectedTypes: string[];
  onChange: (types: string[]) => void;
}

const fileTypes = ['png', 'jpg', 'jpeg', 'webp'];

export const FileTypeFilter: React.FC<FileTypeFilterProps> = ({ selectedTypes, onChange }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isActive = selectedTypes.length > 0;

  const handleSelect = (type: string) => {
    onChange(
      selectedTypes.includes(type)
        ? selectedTypes.filter(t => t !== type)
        : [...selectedTypes, type]
    );
  };

  const label = isActive ? selectedTypes.map(t => t.toUpperCase()).join(', ') : 'All types';

  return (
    <>
      <Button
        onClick={(e) => setAnchorEl(e.currentTarget)}
        startIcon={<FilterListRoundedIcon sx={{ fontSize: '18px !important' }} />}
        endIcon={<KeyboardArrowDownRoundedIcon />}
        sx={toolbarButtonSx(isActive)}
        aria-controls={anchorEl ? 'filter-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={Boolean(anchorEl)}
        aria-label={`Filter by file type: ${label}`}
        id="filter-button"
      >
        {label}
      </Button>
      <Menu
        id="filter-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        MenuListProps={{ 'aria-labelledby': 'filter-button', sx: { minWidth: 180 } }}
      >
        <Typography variant="overline" sx={{ display: 'block', px: 1.25, pt: 0.5, fontSize: 10.5, color: 'text.disabled' }}>
          File types
        </Typography>
        {fileTypes.map(type => {
          const checked = selectedTypes.includes(type);
          return (
            <MenuItem key={type} selected={checked} onClick={() => handleSelect(type)} role="menuitemcheckbox" aria-checked={checked}>
              <ListItemText primary={type.toUpperCase()} primaryTypographyProps={{ fontSize: 'inherit', fontWeight: 'inherit' }} />
              {checked && <CheckRoundedIcon sx={{ fontSize: 16, color: 'primary.main' }} />}
            </MenuItem>
          );
        })}
        {isActive && (
          <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 0.5, pt: 0.5 }}>
            <MenuItem onClick={() => { onChange([]); setAnchorEl(null); }} sx={{ color: 'text.secondary' }}>
              Show all types
            </MenuItem>
          </Box>
        )}
      </Menu>
    </>
  );
};
