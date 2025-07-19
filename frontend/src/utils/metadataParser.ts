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

function hasStringProp(obj: unknown, prop: string): obj is Record<string, unknown> {
  return typeof obj === 'object' && obj !== null && typeof (obj as Record<string, unknown>)[prop] === 'string';
}
function hasRecordProp(obj: unknown, prop: string): obj is Record<string, unknown> {
  return typeof obj === 'object' && obj !== null && typeof (obj as Record<string, unknown>)[prop] === 'object' && (obj as Record<string, unknown>)[prop] !== null;
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
        hasClassType(data) && ('class_type' in data && data.class_type?.includes('Sampler'))
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
      const modelInfo = extractModelInfoRobust(nodes);
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
        hasClassType(node) && ('class_type' in node && node.class_type?.includes('LoraLoader'))
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
      positivePrompt: '',
      negativePrompt: '',
      loras: Array.isArray(getField(metadata, 'loras', [])) ? getField(metadata, 'loras', []) as Array<{ name: string; weight: number }> : [],
    };
    // Also check for lora_models (backend snake_case)
    if (!result.loras.length && Array.isArray(metadata['lora_models'])) {
      result.loras = metadata['lora_models'];
    }

    // --- PATCH: Robust positive/negative prompt fallback ---
    let positivePrompt = String(getField(metadata, 'positivePrompt', ''));
    let negativePrompt = String(getField(metadata, 'negativePrompt', ''));

    // Helper to robustly extract nodeId from a ComfyUI-style input (array or direct ref)
    function extractNodeId(ref: unknown): string | undefined {
      if (Array.isArray(ref) && ref.length > 0) {
        // ComfyUI style: ["5", 0] or [5, 0]
        return String(ref[0]);
      } else if (typeof ref === 'string' || typeof ref === 'number') {
        return String(ref);
      }
      return undefined;
    }

    // Helper to recursively resolve prompt by following graph links (robust for all input keys)
    function resolvePromptFromGraph(nodes: Record<string, unknown>, startRef: unknown, path: string[] = []): string | undefined {
      const visited = new Set<string>();
      function helper(ref: unknown, trace: string[]): string | undefined {
        const nodeId = extractNodeId(ref);
        if (!nodeId || visited.has(nodeId)) return undefined;
        visited.add(nodeId);
        const node = nodes[nodeId];
        if (typeof node !== 'object' || node === null) return undefined;
        trace = [...trace, nodeId];
        const class_type = hasStringProp(node, 'class_type') ? node['class_type'] as string : '';
        const inputs = hasRecordProp(node, 'inputs') ? node['inputs'] as Record<string, unknown> : {};
        if (class_type.startsWith('CLIPTextEncode') && typeof inputs.text === 'string') {
          return inputs.text;
        }
        const possibleKeys = ['conditioning', 'positive', 'input', 'prompt', 'text', 'inputs'];
        for (const key of possibleKeys) {
          if (key in inputs && inputs[key] !== undefined) {
            const val = inputs[key];
            if (Array.isArray(val) && val.length > 0 && (Array.isArray(val[0]) || typeof val[0] === 'string' || typeof val[0] === 'number')) {
              for (const v of val) {
                const result = helper(v, trace);
                if (result) return result;
              }
            } else {
              const result = helper(val, trace);
              if (result) return result;
            }
          }
        }
        return undefined;
      }
      return helper(startRef, path);
    }

    // If not found, attempt to extract from node graph (ComfyUI format)
    if ((!positivePrompt || positivePrompt === 'N/A' || positivePrompt === '') && metadata && typeof metadata === 'object') {
      let nodes: Record<string, unknown> | undefined = undefined;
      if ('prompt' in metadata && typeof metadata['prompt'] === 'string') {
        try {
          const promptObj = JSON.parse(metadata['prompt']);
          if (promptObj && typeof promptObj === 'object' && promptObj !== null) {
            nodes = promptObj as Record<string, unknown>;
          }
        } catch {
          // Could not parse prompt JSON
        }
      }
      if (!nodes && 'workflow' in metadata && typeof metadata['workflow'] === 'string') {
        try {
          const workflowObj = JSON.parse(metadata['workflow']);
          if (workflowObj && typeof workflowObj === 'object' && workflowObj !== null) {
            nodes = workflowObj as Record<string, unknown>;
          }
        } catch {
          // Could not parse workflow JSON
        }
      }
      if (!nodes && 'nodes' in metadata && typeof metadata['nodes'] === 'object' && metadata['nodes'] !== null) {
        nodes = metadata['nodes'] as Record<string, unknown>;
      }
      if (nodes && typeof nodes === 'object') {
        // Try to find the sampler node
        let samplerNodeId: string | undefined = undefined;
        for (const nodeId in nodes) {
          const node = nodes[nodeId];
          if (typeof node === 'object' && node !== null && hasStringProp(node, 'class_type')) {
            const classType = node['class_type'] as string;
            if (classType.includes('Sampler') || classType.includes('KSampler')) {
              samplerNodeId = nodeId;
              break;
            }
          }
        }
        // If found, follow its 'positive' input recursively (robust)
        if (samplerNodeId) {
          const samplerNode = nodes[samplerNodeId] as Record<string, unknown>;
          let positiveInput: unknown = undefined;
          if (hasRecordProp(samplerNode, 'inputs') && hasStringProp(samplerNode['inputs'], 'positive')) {
            positiveInput = samplerNode['inputs']['positive'];
            const resolved = resolvePromptFromGraph(nodes, positiveInput);
            if (resolved) positivePrompt = resolved;
          }
        }
        // Fallback: if not found, search for any CLIPTextEncode node with positive in title (legacy fallback)
        if (!positivePrompt || positivePrompt === 'N/A' || positivePrompt === '') {
          for (const nodeId in nodes) {
            const node = nodes[nodeId];
            if (typeof node === 'object' && node !== null && hasStringProp(node, 'class_type')) {
              const classType = node['class_type'] as string;
              if (classType.startsWith('CLIPTextEncode') && hasRecordProp(node, 'inputs') && hasStringProp(node['inputs'], 'text')) {
                const title = hasRecordProp(node, '_meta') && hasStringProp(node['_meta'], 'title') ? node['_meta']['title'] as string : '';
                if (title.includes('positive') || title.includes('prompt') || title.includes('encode')) {
                  positivePrompt = node['inputs']['text'] as string;
                  break;
                }
              }
            }
          }
        }
        // --- PATCH: Robust model extraction ---
        const modelInfo = extractModelInfoRobust(nodes);
        if (modelInfo && modelInfo.model && result.model === 'N/A') {
          result.model = modelInfo.model;
        }
      }
    }
    // Negative prompt: similar recursive traversal
    if ((!negativePrompt || negativePrompt === 'N/A' || negativePrompt === '') && metadata && typeof metadata === 'object') {
      let nodes: Record<string, unknown> | undefined = undefined;
      if ('prompt' in metadata && typeof metadata['prompt'] === 'string') {
        try {
          const promptObj = JSON.parse(metadata['prompt']);
          if (promptObj && typeof promptObj === 'object' && promptObj !== null) {
            nodes = promptObj as Record<string, unknown>;
          }
        } catch {
          // Could not parse prompt JSON
        }
      }
      if (!nodes && 'workflow' in metadata && typeof metadata['workflow'] === 'string') {
        try {
          const workflowObj = JSON.parse(metadata['workflow']);
          if (workflowObj && typeof workflowObj === 'object' && workflowObj !== null) {
            nodes = workflowObj as Record<string, unknown>;
          }
        } catch {
          // Could not parse workflow JSON
        }
      }
      if (!nodes && 'nodes' in metadata && typeof metadata['nodes'] === 'object' && metadata['nodes'] !== null) {
        nodes = metadata['nodes'] as Record<string, unknown>;
      }
      if (nodes && typeof nodes === 'object') {
        let samplerNodeId: string | undefined = undefined;
        for (const nodeId in nodes) {
          const node = nodes[nodeId];
          if (typeof node === 'object' && node !== null && hasStringProp(node, 'class_type')) {
            const classType = node['class_type'] as string;
            if (classType.includes('Sampler') || classType.includes('KSampler')) {
              samplerNodeId = nodeId;
              break;
            }
          }
        }
        if (samplerNodeId) {
          const samplerNode = nodes[samplerNodeId] as Record<string, unknown>;
          let negativeInput: unknown = undefined;
          if (hasRecordProp(samplerNode, 'inputs') && hasStringProp(samplerNode['inputs'], 'negative')) {
            negativeInput = samplerNode['inputs']['negative'];
            const resolved = resolvePromptFromGraph(nodes, negativeInput);
            if (resolved) negativePrompt = resolved;
          }
        }
        // Fallback: if not found, search for any CLIPTextEncode node with negative in title
        if (!negativePrompt || negativePrompt === 'N/A' || negativePrompt === '') {
          for (const nodeId in nodes) {
            const node = nodes[nodeId];
            if (typeof node === 'object' && node !== null && hasStringProp(node, 'class_type')) {
              const classType = node['class_type'] as string;
              if (classType.startsWith('CLIPTextEncode') && hasRecordProp(node, 'inputs') && hasStringProp(node['inputs'], 'text')) {
                const title = hasRecordProp(node, '_meta') && hasStringProp(node['_meta'], 'title') ? node['_meta']['title'] as string : '';
                if (title.includes('negative')) {
                  negativePrompt = node['inputs']['text'] as string;
                  break;
                }
              }
            }
          }
        }
      }
    }
    result.positivePrompt = positivePrompt;
    result.negativePrompt = negativePrompt;

    return formatNumericValues(result);
  } catch {
    console.error("Error parsing metadata:");
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
      if ('class_type' in node && node.class_type?.includes('CLIPTextEncode') && hasInputs(node)) {
        // Try direct text
        if (hasRecordProp(node, 'inputs') && hasStringProp(node['inputs'], 'text')) {
          return node['inputs']['text'] as string;
        }
        // Try SDXL: text_g/text_l
        if (hasRecordProp(node, 'inputs') && Array.isArray(node['inputs']['text_g']) && node['inputs']['text_g'].length > 0) {
          const tNode = nodes[node['inputs']['text_g'][0]];
          if (hasClassType(tNode) && 'class_type' in tNode && tNode.class_type === 'ttN text' && hasInputs(tNode) && hasStringProp(tNode['inputs'], 'text')) {
            return tNode['inputs']['text'] as string;
          }
        }
        if (hasRecordProp(node, 'inputs') && Array.isArray(node['inputs']['text_l']) && node['inputs']['text_l'].length > 0) {
          const tNode = nodes[node['inputs']['text_l'][0]];
          if (hasClassType(tNode) && 'class_type' in tNode && tNode.class_type === 'ttN text' && hasInputs(tNode) && hasStringProp(tNode['inputs'], 'text')) {
            return tNode['inputs']['text'] as string;
          }
        }
      }
      // Legacy: direct ttN text node
      if ('class_type' in node && node.class_type === 'ttN text' && hasInputs(node) && hasStringProp(node['inputs'], 'text')) {
        return node['inputs']['text'] as string;
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

function extractModelInfoRobust(nodes: Record<string, unknown>): { model: string } | null {
  // Try Loader nodes with ckpt_name
  const loaderNode = Object.values(nodes).find((node) =>
    hasRecordProp(node, 'inputs') && hasStringProp((node as Record<string, unknown>)['inputs'], 'ckpt_name') &&
    typeof node === 'object' && node !== null &&
    'class_type' in node && typeof (node as Record<string, unknown>)['class_type'] === 'string' &&
    ((node as Record<string, unknown>)['class_type'] as string).includes('Loader')
  ) as Record<string, unknown> | undefined;
  if (loaderNode && hasRecordProp(loaderNode, 'inputs') && hasStringProp((loaderNode as Record<string, unknown>)['inputs'], 'ckpt_name')) {
    const inputs = (loaderNode as Record<string, unknown>)['inputs'];
    return { model: (inputs as Record<string, unknown>)['ckpt_name'] as string };
  }
  // Try UNETLoader with unet_name
  const unetNode = Object.values(nodes).find((node) =>
    hasRecordProp(node, 'inputs') && hasStringProp((node as Record<string, unknown>)['inputs'], 'unet_name') &&
    typeof node === 'object' && node !== null &&
    'class_type' in node && (node as Record<string, unknown>)['class_type'] === 'UNETLoader'
  ) as Record<string, unknown> | undefined;
  if (unetNode && hasRecordProp(unetNode, 'inputs') && hasStringProp((unetNode as Record<string, unknown>)['inputs'], 'unet_name')) {
    const inputs = (unetNode as Record<string, unknown>)['inputs'];
    return { model: (inputs as Record<string, unknown>)['unet_name'] as string };
  }
  return null;
}

function extractUpscaleInfo(nodes: Record<string, unknown>) {
  const upscaleNode = Object.values(nodes).find((node: unknown) => 
    hasClassType(node) && ('class_type' in node && (node.class_type?.includes('ImageUpscaleWithModel') || 
    node.class_type?.includes('LatentUpscale')))
  );

  if (!upscaleNode) {
    return {
      hiresUpscale: 'Disabled',
      hiresUpscaler: 'N/A'
    };
  }

  const upscaleModelLoaderNode = Object.values(nodes).find((node: unknown) => 
    hasClassType(node) && ('class_type' in node && node.class_type?.includes('UpscaleModelLoader'))
  );

  let hiresUpscaler = 'Unknown Upscaler';
  let hiresUpscale: string | number = 'Unknown Scale';
  if (upscaleModelLoaderNode && hasRecordProp(upscaleModelLoaderNode, 'inputs') && hasStringProp(upscaleModelLoaderNode['inputs'], 'model_name')) {
    hiresUpscaler = upscaleModelLoaderNode['inputs']['model_name'] as string;
  } else if (hasRecordProp(upscaleNode, 'inputs')) {
    if (hasStringProp(upscaleNode['inputs'], 'upscaler_name')) {
      hiresUpscaler = upscaleNode['inputs']['upscaler_name'] as string;
    } else if (hasStringProp(upscaleNode['inputs'], 'upscale_model')) {
      hiresUpscaler = upscaleNode['inputs']['upscale_model'] as string;
    }
    const inputs = (upscaleNode as { inputs?: unknown }).inputs;
    if (inputs && typeof inputs === 'object') {
      const rec = inputs as Record<string, unknown>;
      if (typeof rec['scale'] === 'number') {
        hiresUpscale = rec['scale'];
      } else if (typeof rec['scale_by'] === 'number') {
        hiresUpscale = rec['scale_by'];
      } else if (typeof rec['upscale_factor'] === 'number') {
        hiresUpscale = rec['upscale_factor'];
      } else if (typeof rec['multiplier'] === 'number') {
        hiresUpscale = rec['multiplier'];
      }
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