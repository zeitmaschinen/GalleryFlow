import { useMemo } from 'react';
import type { Image } from '../services/api';

interface ParsedMetadata {
  prompt?: string;
  negativePrompt?: string;
  parameters?: Record<string, unknown>;
  workflow?: unknown;
}

export const useMetadata = (image: Image | null) => {
  const parsedMetadata = useMemo((): ParsedMetadata => {
    if (!image?.metadata_) return {};

    try {
      // Fix JSON.parse argument type for metadata
      const metadata = typeof image.metadata_ === 'string' ? JSON.parse(image.metadata_) : image.metadata_;
      return {
        prompt: metadata.prompt || '',
        negativePrompt: metadata.negative_prompt || '',
        parameters: metadata.parameters || {},
        workflow: metadata.workflow || null
      };
    } catch {
      return {};
    }
  }, [image]);

  const hasMetadata = useMemo(() => {
    return Object.keys(parsedMetadata).length > 0;
  }, [parsedMetadata]);

  const extractTags = useMemo(() => {
    const tags = new Set<string>();
    if (parsedMetadata.prompt) {
      const words = parsedMetadata.prompt.split(',').map(w => w.trim());
      words.forEach(word => tags.add(word));
    }
    return Array.from(tags);
  }, [parsedMetadata.prompt]);

  return {
    ...parsedMetadata,
    hasMetadata,
    tags: extractTags
  };
};