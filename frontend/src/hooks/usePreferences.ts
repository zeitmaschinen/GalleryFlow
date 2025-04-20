import { useState, useCallback } from 'react';

interface Preferences {
  gridSize: number;
  thumbnailQuality: 'low' | 'medium' | 'high';
  showMetadata: boolean;
  autoRefresh: boolean;
  defaultView: 'grid' | 'list';
  sortOrder: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

const defaultPreferences: Preferences = {
  gridSize: 200,
  thumbnailQuality: 'medium',
  showMetadata: true,
  autoRefresh: false,
  defaultView: 'grid',
  sortOrder: {
    field: 'created_at',
    direction: 'desc'
  }
};

export const usePreferences = () => {
  const [preferences, setPreferences] = useState<Preferences>(() => {
    try {
      const saved = localStorage.getItem('userPreferences');
      return saved ? { ...defaultPreferences, ...JSON.parse(saved) } : defaultPreferences;
    } catch {
      return defaultPreferences;
    }
  });

  const updatePreference = useCallback(<K extends keyof Preferences>(
    key: K,
    value: Preferences[K]
  ) => {
    setPreferences(prev => {
      const updated = { ...prev, [key]: value };
      try {
        localStorage.setItem('userPreferences', JSON.stringify(updated));
      } catch {
        // Intentionally ignore localStorage errors
      }
      return updated;
    });
  }, []);

  const resetPreferences = useCallback(() => {
    try {
      localStorage.removeItem('userPreferences');
      setPreferences(defaultPreferences);
    } catch {
      // Intentionally ignore localStorage errors
    }
  }, []);

  return {
    preferences,
    updatePreference,
    resetPreferences,
    defaultPreferences
  };
};