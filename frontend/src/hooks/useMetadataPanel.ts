import { useState, useCallback } from 'react';
import type { Image } from '../services/api';
import { parseMetadata } from '../utils/metadataParser';

interface MetadataPanelState {
  isOpen: boolean;
  position: { x: number; y: number };
  activeImage: Image | null;
}

export const useMetadataPanel = (initialPosition = { x: 0, y: 0 }) => {
  const [state, setState] = useState<MetadataPanelState>({
    isOpen: false,
    position: initialPosition,
    activeImage: null
  });

  const openPanel = useCallback((image: Image, position: { x: number; y: number }) => {
    setState({
      isOpen: true,
      position,
      activeImage: image
    });
  }, []);

  const closePanel = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: false,
      activeImage: null
    }));
  }, []);

  const updatePosition = useCallback((position: { x: number; y: number }) => {
    setState(prev => ({
      ...prev,
      position
    }));
  }, []);

  const metadata = state.activeImage ? parseMetadata(state.activeImage.metadata_) : null;

  return {
    isOpen: state.isOpen,
    position: state.position,
    activeImage: state.activeImage,
    metadata,
    openPanel,
    closePanel,
    updatePosition
  };
};