import { useState, useCallback } from 'react';

interface UseSelectionOptions<T> {
  items: T[];
  getKey: (item: T) => string | number;
  allowMultiple?: boolean;
}

export const useSelection = <T>({
  items,
  getKey,
  allowMultiple = false
}: UseSelectionOptions<T>) => {
  const [selectedKeys, setSelectedKeys] = useState<Set<string | number>>(new Set());

  const isSelected = useCallback((item: T) => {
    return selectedKeys.has(getKey(item));
  }, [selectedKeys, getKey]);

  const select = useCallback((item: T) => {
    const key = getKey(item);
    setSelectedKeys(prev => {
      const next = new Set(allowMultiple ? prev : []);
      next.add(key);
      return next;
    });
  }, [getKey, allowMultiple]);

  const deselect = useCallback((item: T) => {
    const key = getKey(item);
    setSelectedKeys(prev => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }, [getKey]);

  const toggle = useCallback((item: T) => {
    if (isSelected(item)) {
      deselect(item);
    } else {
      select(item);
    }
  }, [isSelected, select, deselect]);

  const selectAll = useCallback(() => {
    if (!allowMultiple) return;
    setSelectedKeys(new Set(items.map(getKey)));
  }, [items, getKey, allowMultiple]);

  const clearSelection = useCallback(() => {
    setSelectedKeys(new Set());
  }, []);

  const selectedItems = items.filter(item => isSelected(item));

  return {
    selectedKeys,
    selectedItems,
    isSelected,
    select,
    deselect,
    toggle,
    selectAll,
    clearSelection,
    hasSelection: selectedKeys.size > 0
  };
};