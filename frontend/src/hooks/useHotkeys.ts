import { useEffect, useCallback, useRef } from 'react';

type KeyHandler = (e: KeyboardEvent) => void;
type KeyMap = Record<string, KeyHandler>;

interface HotkeyOptions {
  enabled?: boolean;
  preventDefault?: boolean;
  capture?: boolean;
}

export const useHotkeys = (
  keyMap: KeyMap,
  { enabled = true, preventDefault = true, capture = false }: HotkeyOptions = {}
) => {
  const handlers = useRef<KeyMap>(keyMap);
  const isEnabled = useRef(enabled);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (!isEnabled.current) return;

    const key = event.key.toLowerCase();
    const modifiers = [
      event.ctrlKey && 'ctrl',
      event.shiftKey && 'shift',
      event.altKey && 'alt',
      event.metaKey && 'meta'
    ].filter(Boolean);

    const keyCombo = [...modifiers, key].join('+');
    const handler = handlers.current[keyCombo];

    if (handler) {
      if (preventDefault) {
        event.preventDefault();
      }
      try {
        handler(event);
      } catch {
        // logger.error('Error in hotkey handler:');
      }
    }
  }, [preventDefault]);

  const updateKeyMap = useCallback((newKeyMap: KeyMap) => {
    handlers.current = newKeyMap;
  }, []);

  const setEnabled = useCallback((value: boolean) => {
    isEnabled.current = value;
  }, []);

  useEffect(() => {
    updateKeyMap(keyMap);
  }, [keyMap, updateKeyMap]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyPress, capture);
    return () => {
      document.removeEventListener('keydown', handleKeyPress, capture);
    };
  }, [handleKeyPress, capture]);

  return {
    setEnabled,
    updateKeyMap
  };
};