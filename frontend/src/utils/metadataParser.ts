export interface ImageMetadata {
  model: string;
  modelHash: string;
  seed: string;
  steps: string;
  cfg: string;
  sampler: string;
  scheduler: string;
  denoise: string | number;
  hiresUpscale: string | number;
  hiresUpscaler: string;
  positivePrompt: string;
  negativePrompt: string;
  loras: Array<{ name: string; weight: number }>;
}

const defaultMetadata: ImageMetadata = {
  model: 'N/A',
  modelHash: 'N/A',
  seed: 'N/A',
  steps: 'N/A',
  cfg: 'N/A',
  sampler: 'N/A',
  scheduler: 'N/A',
  denoise: 'N/A',
  hiresUpscale: 'N/A',
  hiresUpscaler: 'N/A',
  positivePrompt: 'N/A',
  negativePrompt: 'N/A',
  loras: []
};

// Add type guards for safe property access
function hasClassType(node: unknown): node is { class_type?: string; inputs?: Record<string, unknown> } {
  return typeof node === 'object' && node !== null && 'class_type' in node;
}
function hasInputs(node: unknown): node is { inputs: Record<string, unknown> } {
  return (
    typeof node === 'object' &&
    node !== null &&
    'inputs' in node &&
    typeof (node as { inputs?: unknown }).inputs === 'object'
  );
}
function hasClassTypeProperty(node: unknown): node is { class_type?: string } {
  return typeof node === 'object' && node !== null && 'class_type' in node;
}

export const parseMetadata = (metadata: Record<string, unknown> | null): ImageMetadata => {
  if (!metadata) return defaultMetadata;

  // Helper to get both snake_case and camelCase
  function getField(obj: Record<string, unknown>, key: string, fallback: unknown): unknown {
    if (obj == null) return fallback;
    if (key in obj) return obj[key];
    // Try snake_case
    const snake = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    if (snake in obj) return obj[snake];
    // Try camelCase
    const camel = key.replace(/_([a-z])/g, (_, l) => l.toUpperCase());
    if (camel in obj) return obj[camel];
    return fallback;
  }

  try {
    // If this is a ComfyUI node graph, run the old extraction logic
    if (Object.values(metadata).some(v => typeof v === 'object' && v && 'class_type' in v)) {
      const nodes = metadata;
      const nodeEntries = Object.entries(nodes);
      let result = { ...defaultMetadata };

      // Find KSampler node
      const kSamplerNodeEntry = nodeEntries.find(([, data]) => 
        hasClassType(data) && data.class_type?.includes('Sampler')
      );

      if (kSamplerNodeEntry) {
        const kSamplerNode = kSamplerNodeEntry[1];
        if (hasInputs(kSamplerNode)) {
          Object.assign(result, {
            seed: kSamplerNode.inputs?.seed ?? kSamplerNode.inputs?.noise_seed ?? result.seed,
            steps: kSamplerNode.inputs?.steps ?? result.steps,
            cfg: kSamplerNode.inputs?.cfg ?? result.cfg,
            sampler: kSamplerNode.inputs?.sampler_name ?? result.sampler,
            scheduler: kSamplerNode.inputs?.scheduler ?? result.scheduler,
            denoise: kSamplerNode.inputs?.denoise ?? result.denoise
          });
        }
        // Extract prompts from connections
        result = extractPrompts(nodes, kSamplerNode, result);
      }

      // Extract model info
      const modelInfo = extractModelInfo(nodes);
      if (modelInfo) {
        Object.assign(result, modelInfo);
      }

      // Extract upscale info
      const upscaleInfo = extractUpscaleInfo(nodes);
      if (upscaleInfo) {
        Object.assign(result, upscaleInfo);
      }

      // Extract Lora information
      const loraNodes = Object.values(nodes).filter((node: unknown) => 
        hasClassType(node) && node.class_type?.includes('LoraLoader')
      );

      if (loraNodes.length > 0) {
        result.loras = loraNodes.map((node): { name: string; weight: number } => ({
          name: hasInputs(node) && typeof node.inputs?.lora_name === 'string'
            ? node.inputs.lora_name.replace(/\.safetensors$/, '')
            : 'Unknown Lora',
          weight: hasInputs(node) && typeof node.inputs?.strength_model === 'number'
            ? node.inputs.strength_model
            : 1.0
        }));
      }

      return formatNumericValues(result);
    }

    // Flat dict: try to extract fields by both styles
    const result: ImageMetadata = {
      model: String(getField(metadata, 'model', 'N/A')),
      modelHash: String(getField(metadata, 'modelHash', 'N/A')),
      seed: String(getField(metadata, 'seed', 'N/A')),
      steps: String(getField(metadata, 'steps', 'N/A')),
      cfg: String(getField(metadata, 'cfg', 'N/A')),
      sampler: String(getField(metadata, 'sampler', 'N/A')),
      scheduler: String(getField(metadata, 'scheduler', 'N/A')),
      denoise: getField(metadata, 'denoise', 'N/A') as string | number,
      hiresUpscale: getField(metadata, 'hiresUpscale', 'N/A') as string | number,
      hiresUpscaler: String(getField(metadata, 'hiresUpscaler', 'N/A')),
      positivePrompt: String(getField(metadata, 'positivePrompt', '')),
      negativePrompt: String(getField(metadata, 'negativePrompt', '')),
      loras: Array.isArray(getField(metadata, 'loras', [])) ? getField(metadata, 'loras', []) as Array<{ name: string; weight: number }> : [],
    };
    // Also check for lora_models (backend snake_case)
    if (!result.loras.length && Array.isArray(metadata['lora_models'])) {
      result.loras = metadata['lora_models'];
    }
    return formatNumericValues(result);
  } catch (e) {
    console.error("Error parsing metadata:", e);
    return defaultMetadata;
  }
};

function extractPrompts(nodes: Record<string, unknown>, kSamplerNode: unknown, result: ImageMetadata): ImageMetadata {
  let positiveInputLink: unknown = undefined;
  let negativeInputLink: unknown = undefined;
  if (hasInputs(kSamplerNode)) {
    positiveInputLink = kSamplerNode.inputs?.positive;
    negativeInputLink = kSamplerNode.inputs?.negative;
  }

  // Helper to resolve prompt from SDXL-style encode nodes
  function resolvePrompt(nodeId: string | number | undefined): string | undefined {
    if (nodeId === undefined) return undefined;
    const node = nodes[nodeId];
    if (!node || typeof node !== 'object') return undefined;
    if (hasClassType(node)) {
      // SDXL: CLIPTextEncodeSDXL with text_g/text_l
      if (node.class_type?.includes('CLIPTextEncode') && hasInputs(node)) {
        // Try direct text
        if (typeof node.inputs?.text === 'string') {
          return node.inputs.text;
        }
        // Try SDXL: text_g/text_l
        if (Array.isArray(node.inputs?.text_g) && node.inputs.text_g.length > 0) {
          const tNode = nodes[node.inputs.text_g[0]];
          if (hasClassType(tNode) && tNode.class_type === 'ttN text' && hasInputs(tNode) && typeof tNode.inputs?.text === 'string') {
            return tNode.inputs.text;
          }
        }
        if (Array.isArray(node.inputs?.text_l) && node.inputs.text_l.length > 0) {
          const tNode = nodes[node.inputs.text_l[0]];
          if (hasClassType(tNode) && tNode.class_type === 'ttN text' && hasInputs(tNode) && typeof tNode.inputs?.text === 'string') {
            return tNode.inputs.text;
          }
        }
      }
      // Legacy: direct ttN text node
      if (node.class_type === 'ttN text' && hasInputs(node) && typeof node.inputs?.text === 'string') {
        return node.inputs.text;
      }
    }
    return undefined;
  }

  // Positive prompt
  if (Array.isArray(positiveInputLink) && positiveInputLink.length > 0) {
    const pNodeId = positiveInputLink[0];
    const prompt = resolvePrompt(pNodeId);
    if (prompt !== undefined) {
      result.positivePrompt = prompt;
    }
  }

  // Negative prompt
  if (Array.isArray(negativeInputLink) && negativeInputLink.length > 0) {
    const nNodeId = negativeInputLink[0];
    const prompt = resolvePrompt(nNodeId);
    if (prompt !== undefined) {
      result.negativePrompt = prompt;
    }
  }

  // Ensure consistency: if negativePrompt is '(Not found)', set to 'N/A'
  if (result.negativePrompt === '(Not found)') {
    result.negativePrompt = 'N/A';
  }

  return result;
}

function extractModelInfo(nodes: Record<string, unknown>) {
  const loaderNode = Object.values(nodes).find((node: unknown) => 
    hasClassTypeProperty(node) && node.class_type?.includes('Loader') && hasInputs(node) && node.inputs?.ckpt_name
  );
  
  return loaderNode && hasInputs(loaderNode) ? {
    model: typeof loaderNode.inputs.ckpt_name === 'string' ? loaderNode.inputs.ckpt_name : 'Unknown Model'
  } : null;
}

function extractUpscaleInfo(nodes: Record<string, unknown>) {
  const upscaleNode = Object.values(nodes).find((node: unknown) => 
    hasClassTypeProperty(node) && (node.class_type?.includes('ImageUpscaleWithModel') || 
    node.class_type?.includes('LatentUpscale'))
  );

  if (!upscaleNode) {
    return {
      hiresUpscale: 'Disabled',
      hiresUpscaler: 'N/A'
    };
  }

  const upscaleModelLoaderNode = Object.values(nodes).find((node: unknown) => 
    hasClassTypeProperty(node) && node.class_type?.includes('UpscaleModelLoader')
  );

  let hiresUpscaler = 'Unknown Upscaler';
  let hiresUpscale: string | number = 'Unknown Scale';
  if (upscaleModelLoaderNode && hasInputs(upscaleModelLoaderNode) && typeof upscaleModelLoaderNode.inputs?.model_name === 'string') {
    hiresUpscaler = upscaleModelLoaderNode.inputs.model_name;
  } else if (hasInputs(upscaleNode)) {
    if (typeof upscaleNode.inputs?.upscaler_name === 'string') {
      hiresUpscaler = upscaleNode.inputs.upscaler_name;
    } else if (typeof upscaleNode.inputs?.upscale_model === 'string') {
      hiresUpscaler = upscaleNode.inputs.upscale_model;
    }
    if (typeof upscaleNode.inputs?.scale === 'number') {
      hiresUpscale = upscaleNode.inputs.scale;
    } else if (typeof upscaleNode.inputs?.scale_by === 'number') {
      hiresUpscale = upscaleNode.inputs.scale_by;
    } else if (typeof upscaleNode.inputs?.upscale_factor === 'number') {
      hiresUpscale = upscaleNode.inputs.upscale_factor;
    } else if (typeof upscaleNode.inputs?.multiplier === 'number') {
      hiresUpscale = upscaleNode.inputs.multiplier;
    }
  }

  return {
    hiresUpscaler,
    hiresUpscale
  };
}

function formatNumericValues(metadata: ImageMetadata): ImageMetadata {
  const result = { ...metadata };
  if (typeof result.hiresUpscale === 'number') {
    result.hiresUpscale = result.hiresUpscale.toFixed(2);
  } else if (typeof result.hiresUpscale !== 'string') {
    result.hiresUpscale = String(result.hiresUpscale);
  }
  if (typeof result.denoise === 'number') {
    result.denoise = result.denoise.toFixed(2);
  } else if (typeof result.denoise !== 'string') {
    result.denoise = String(result.denoise);
  }
  return result;
}