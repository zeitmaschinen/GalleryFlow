import { useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';
import { useSnackbar } from './useSnackbar';

// No dead code detected in this file. All code is active and in use.

interface AppShortcutsOptions {
  onDelete?: () => void;
  onRefresh?: () => void;
  onEscape?: () => void;
  onSearch?: () => void;
}

export const useAppShortcuts = ({
  onDelete,
  onRefresh,
  onEscape,
  onSearch
}: AppShortcutsOptions = {}) => {
  const { showSnackbar } = useSnackbar();
  const { selectedFolderId } = useApp();

  const shortcuts = [
    {
      key: 'Delete',
      handler: () => {
        if (onDelete) {
          onDelete();
        }
      }
    },
    {
      key: 'r',
      ctrl: true,
      handler: () => {
        if (onRefresh && selectedFolderId) {
          onRefresh();
        }
      }
    },
    {
      key: 'Escape',
      handler: () => {
        if (onEscape) {
          onEscape();
        }
      }
    },
    {
      key: 'f',
      ctrl: true,
      handler: (e: KeyboardEvent) => {
        e.preventDefault();
        if (onSearch) {
          onSearch();
        }
      }
    }
  ];

  useKeyboardShortcuts(shortcuts);

  useEffect(() => {
    showSnackbar('Keyboard shortcuts enabled', 'info');
  }, [showSnackbar]);

  return null;
};