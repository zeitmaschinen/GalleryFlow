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

export const parseMetadata = (metadata: Record<string, unknown> | null): ImageMetadata => {
    if (!metadata) return defaultMetadata;

    try {
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
                    seed: kSamplerNode.inputs?.seed ?? result.seed,
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

    if (Array.isArray(positiveInputLink) && positiveInputLink.length > 0) {
        const pNodeData = nodes[positiveInputLink[0]];
        if (hasClassType(pNodeData) && pNodeData.class_type?.includes('CLIPTextEncode') && hasInputs(pNodeData)) {
            result.positivePrompt = typeof pNodeData.inputs?.text === 'string' ? pNodeData.inputs.text : result.positivePrompt;
        }
    }

    if (Array.isArray(negativeInputLink) && negativeInputLink.length > 0) {
        const nNodeData = nodes[negativeInputLink[0]];
        if (hasClassType(nNodeData) && nNodeData.class_type?.includes('CLIPTextEncode') && hasInputs(nNodeData)) {
            result.negativePrompt = typeof nNodeData.inputs?.text === 'string' ? nNodeData.inputs.text : result.negativePrompt;
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
        hasClassType(node) && node.class_type?.includes('Loader') && hasInputs(node) && node.inputs?.ckpt_name
    );
    
    return loaderNode && hasInputs(loaderNode) ? {
        model: typeof loaderNode.inputs.ckpt_name === 'string' ? loaderNode.inputs.ckpt_name : 'Unknown Model'
    } : null;
}

function extractUpscaleInfo(nodes: Record<string, unknown>) {
    const upscaleNode = Object.values(nodes).find((node: unknown) => 
        hasClassType(node) && (node.class_type?.includes('ImageUpscaleWithModel') || 
        node.class_type?.includes('LatentUpscale'))
    );

    if (!upscaleNode) {
        return {
            hiresUpscale: 'Disabled',
            hiresUpscaler: 'N/A'
        };
    }

    const upscaleModelLoaderNode = Object.values(nodes).find((node: unknown) => 
        hasClassType(node) && node.class_type?.includes('UpscaleModelLoader')
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