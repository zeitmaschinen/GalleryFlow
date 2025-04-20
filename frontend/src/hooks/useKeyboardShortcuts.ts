import { useEffect, useCallback } from 'react';

interface Shortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  handler: (e: KeyboardEvent) => void;
}

export const useKeyboardShortcuts = (shortcuts: Shortcut[]) => {
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    const matchingShortcut = shortcuts.find(shortcut => {
      const keyMatch = shortcut.key.toLowerCase() === event.key.toLowerCase();
      const ctrlMatch = !!shortcut.ctrl === (event.ctrlKey || event.metaKey);
      const altMatch = !!shortcut.alt === event.altKey;
      const shiftMatch = !!shortcut.shift === event.shiftKey;
      
      return keyMatch && ctrlMatch && altMatch && shiftMatch;
    });

    if (matchingShortcut) {
      matchingShortcut.handler(event);
    }
  }, [shortcuts]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);
};

// Predefined common shortcuts
export const commonShortcuts = {
  delete: { key: 'Delete', handler: () => {} },
  selectAll: { key: 'a', ctrl: true, handler: () => {} },
  copy: { key: 'c', ctrl: true, handler: () => {} },
  paste: { key: 'v', ctrl: true, handler: () => {} },
  undo: { key: 'z', ctrl: true, handler: () => {} },
  redo: { key: 'y', ctrl: true, handler: () => {} },
};