import { useMemo } from 'react';

/**
 * Extracts and formats metadata fields for an image.
 * Returns prompts, loras, and other relevant fields as strings.
 */
export function useImageMetadata(selectedImageData: Record<string, unknown> | null) {
  return useMemo(() => {
    if (!selectedImageData) return {
      model: '', seed: '', steps: '', cfg: '', sampler: '', scheduler: '', denoise: '', hiresUpscale: '', hiresUpscaler: '', positivePrompt: '', negativePrompt: '', loras: []
    };

    // Defensive: Only render Lora Models if all entries are valid
    let loras: Array<{ name: string; weight: number }> = [];
    const loraVal = selectedImageData['loras'];
    if (loraVal && Array.isArray(loraVal)) {
      loras = loraVal.map((lora) => ({
        name: lora && typeof lora === 'object' && typeof lora.name === 'string' ? lora.name : 'Unknown Lora',
        weight: lora && typeof lora === 'object' && typeof lora.weight === 'number' ? lora.weight : 1.0,
      }));
    }

    const getString = (data: Record<string, unknown>, key: string): string => {
      const value = data[key];
      if (typeof value === 'string' || typeof value === 'number') return String(value);
      return '';
    };

    return {
      model: getString(selectedImageData, 'model'),
      seed: getString(selectedImageData, 'seed'),
      steps: getString(selectedImageData, 'steps'),
      cfg: getString(selectedImageData, 'cfg'),
      sampler: getString(selectedImageData, 'sampler'),
      scheduler: getString(selectedImageData, 'scheduler'),
      denoise: getString(selectedImageData, 'denoise'),
      hiresUpscale: getString(selectedImageData, 'hiresUpscale'),
      hiresUpscaler: getString(selectedImageData, 'hiresUpscaler'),
      positivePrompt: getString(selectedImageData, 'positivePrompt'),
      negativePrompt: getString(selectedImageData, 'negativePrompt'),
      loras,
    };
  }, [selectedImageData]);
}
