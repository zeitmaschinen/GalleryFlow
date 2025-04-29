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

    // Helper function to get a value from nested objects with case-insensitive key matching
    const getNestedValue = (data: Record<string, unknown>, keys: string[]): unknown => {
      for (const key of keys) {
        const foundKey = Object.keys(data).find(k => k.toLowerCase() === key.toLowerCase());
        if (foundKey) return data[foundKey];
      }
      return undefined;
    };

    // Helper function to get string values with multiple possible key names
    const getString = (data: Record<string, unknown>, keyOptions: string[]): string => {
      for (const key of keyOptions) {
        const value = getNestedValue(data, [key]);
        if (typeof value === 'string' || typeof value === 'number') {
          // Format numeric values to have at most 2 decimal places
          if (typeof value === 'number') {
            return formatNumberValue(value);
          }
          return String(value);
        }
      }
      return '';
    };

    // Helper function to format numeric values
    const formatNumberValue = (value: number): string => {
      // For integers, return as is
      if (Number.isInteger(value)) {
        return value.toString();
      }
      
      // For floating point numbers, limit to 2 decimal places
      return value.toFixed(2);
    };

    // Extract workflow data if it exists
    const workflow = selectedImageData.workflow || selectedImageData.Workflow || selectedImageData.prompt || selectedImageData.Prompt || selectedImageData;
    
    // Extract ComfyUI or other metadata formats
    let metadataSource = selectedImageData;
    let comfyWorkflow: Record<string, unknown> = {};
    
    // Try to parse workflow JSON if it's a string
    if (typeof workflow === 'string') {
      try {
        // Attempt to parse as JSON
        const parsedWorkflow = JSON.parse(workflow) as Record<string, unknown>;
        
        // Check if this is a ComfyUI workflow (has numbered nodes)
        const hasNumberedNodes = Object.keys(parsedWorkflow).some(key => !isNaN(Number(key)));
        
        if (hasNumberedNodes) {
          comfyWorkflow = parsedWorkflow;
          
          // Extract metadata from ComfyUI workflow
          const extractedData = extractComfyUIMetadata(comfyWorkflow);
          metadataSource = { ...metadataSource, ...extractedData };
        } else {
          // Regular JSON metadata
          metadataSource = { ...metadataSource, ...parsedWorkflow };
        }
      } catch (e) {
        console.warn('Failed to parse workflow JSON:', e);
      }
    } else if (workflow && typeof workflow === 'object') {
      // Check if this is a ComfyUI workflow (has numbered nodes)
      const workflowObj = workflow as Record<string, unknown>;
      const hasNumberedNodes = Object.keys(workflowObj).some(key => !isNaN(Number(key)));
      
      if (hasNumberedNodes) {
        comfyWorkflow = workflowObj;
        
        // Extract metadata from ComfyUI workflow
        const extractedData = extractComfyUIMetadata(comfyWorkflow);
        metadataSource = { ...metadataSource, ...extractedData };
      } else {
        // Regular object metadata
        metadataSource = { ...metadataSource, ...workflowObj };
      }
    }

    // Function to extract metadata from ComfyUI workflow format
    function extractComfyUIMetadata(workflow: Record<string, unknown>): Record<string, unknown> {
      const result: Record<string, unknown> = {};
      const nodes = Object.values(workflow);

      // Helper to safely get class_type
      const getClassType = (node: unknown): string | undefined =>
        typeof node === 'object' && node !== null && 'class_type' in node && typeof (node as { class_type?: unknown }).class_type === 'string'
          ? (node as { class_type: string }).class_type
          : undefined;
      // Helper to safely get inputs
      const getInputs = (node: unknown): Record<string, unknown> =>
        typeof node === 'object' && node !== null && 'inputs' in node && typeof (node as { inputs?: unknown }).inputs === 'object' && (node as { inputs?: unknown }).inputs !== null
          ? (node as { inputs: Record<string, unknown> }).inputs
          : {};

      // Find text encode nodes
      const textNodes = nodes.filter(node => {
        const ct = getClassType(node);
        return ct === 'ttN text' || ct === 'CLIPTextEncode' || ct === 'CLIPTextEncodeSDXL';
      });

      // Find positive and negative prompts
      const positivePromptNodes = textNodes.filter(node => {
        const nodeId = node as { id?: unknown };
        if (!nodeId || !('id' in nodeId)) return false;
        return Object.values(workflow).some(n => {
          const inputs = getInputs(n);
          return Array.isArray(inputs.positive) && inputs.positive[0] === nodeId.id ||
            Array.isArray(inputs.text_g) && inputs.text_g[0] === nodeId.id;
        });
      });

      const negativePromptNodes = textNodes.filter(node => {
        const nodeId = node as { id?: unknown };
        if (!nodeId || !('id' in nodeId)) return false;
        return Object.values(workflow).some(n => {
          const inputs = getInputs(n);
          return Array.isArray(inputs.negative) && inputs.negative[0] === nodeId.id ||
            Array.isArray(inputs.text_l) && inputs.text_l[0] === nodeId.id;
        });
      });

      // Find checkpoint loader nodes
      const checkpointNodes = nodes.filter(node => {
        const ct = getClassType(node);
        return ct?.includes('CheckpointLoader') || ct?.includes('Load Checkpoint');
      });

      // Find LoRA loader nodes
      const loraNodes = nodes.filter(node => {
        const ct = getClassType(node);
        return ct?.includes('LoraLoader') || ct?.includes('Load LoRA');
      });

      // Find KSampler nodes
      const kSamplerNodes = nodes.filter(node => {
        const ct = getClassType(node);
        return ct?.includes('KSampler');
      });

      // Find other sampler types
      const samplerNodes = nodes.filter(node => {
        const ct = getClassType(node);
        return !ct?.includes('KSampler') && (ct?.includes('Sampler') || ct?.includes('Unsampler'));
      });

      // Find upscaler nodes
      const upscalerNodes = nodes.filter(node => {
        const ct = getClassType(node);
        return ct?.includes('Upscale') || ct?.includes('ImageScale');
      });

      // Extract prompt text
      if (positivePromptNodes.length > 0) {
        result.positivePrompt = getInputs(positivePromptNodes[0]).text;
      }
      
      if (negativePromptNodes.length > 0) {
        result.negativePrompt = getInputs(negativePromptNodes[0]).text;
      }
      
      // Find checkpoint loader nodes
      if (checkpointNodes.length > 0 && getInputs(checkpointNodes[0]).ckpt_name) {
        result.model = getInputs(checkpointNodes[0]).ckpt_name;
      }
      
      // Find LoRA loader nodes
      if (loraNodes.length > 0) {
        result.loras = loraNodes.map(node => ({
          name: getInputs(node).lora_name || 'Unknown LoRA',
          weight: getInputs(node).strength_model || 1.0
        }));
      }
      
      // Find KSampler nodes first (prioritize these)
      const primarySampler = kSamplerNodes.length > 0 ? kSamplerNodes[0] : samplerNodes.length > 0 ? samplerNodes[0] : null;
      
      if (primarySampler) {
        // Seed
        const inputs = getInputs(primarySampler);
        if (typeof inputs.seed === 'number' || typeof inputs.noise_seed === 'number') {
          result.seed = typeof inputs.seed === 'number' ? inputs.seed : inputs.noise_seed;
        }
        
        // Steps
        if (typeof inputs.steps === 'number') {
          result.steps = inputs.steps;
        }
        
        // CFG Scale
        if (typeof inputs.cfg === 'number') {
          result.cfg = formatNumberValue(inputs.cfg);
        }
        
        // Sampler name
        if (typeof inputs.sampler_name === 'string') {
          result.sampler = inputs.sampler_name;
        }
        
        // Scheduler
        if (typeof inputs.scheduler === 'string') {
          result.scheduler = inputs.scheduler;
        }
        
        // Denoise
        let denoiseValue: number | null = null;
        if (typeof inputs.denoise === 'number') {
          denoiseValue = inputs.denoise;
        } else if (typeof inputs.denoise_strength === 'number') {
          denoiseValue = inputs.denoise_strength;
        } else if (typeof inputs.denoising_strength === 'number') {
          denoiseValue = inputs.denoising_strength;
        } else if (inputs.add_noise === 'enable') {
          denoiseValue = 1.0;
        } else if (inputs.start_at_step === 0) {
          denoiseValue = 1.0;
        } else if (typeof inputs.start_at_step === 'number' && typeof inputs.steps === 'number') {
          denoiseValue = 1 - inputs.start_at_step / inputs.steps;
        }
        if (denoiseValue !== null) {
          result.denoise = formatNumberValue(denoiseValue);
        }
      }
      
      // Find upscaler nodes
      if (upscalerNodes.length > 0) {
        const upscaler = upscalerNodes[0];
        const upInputs = getInputs(upscaler);
        if (typeof upInputs.upscale_method === 'string' || typeof upInputs.upscaler === 'string') {
          result.hiresUpscaler = upInputs.upscale_method || upInputs.upscaler;
        }
        let scaleValue: number | undefined;
        if (typeof upInputs.scale_by === 'number') {
          scaleValue = upInputs.scale_by;
        } else if (typeof upInputs.scale === 'number') {
          scaleValue = upInputs.scale;
        } else if (typeof upInputs.upscale === 'number') {
          scaleValue = upInputs.upscale;
        }
        if (scaleValue !== undefined) {
          result.hiresUpscale = formatNumberValue(scaleValue);
        }
      }
      
      return result;
    }

    // Extract prompt data
    const promptData = metadataSource.prompt || metadataSource.Prompt || '';
    let positivePrompt = '';
    let negativePrompt = '';

    if (typeof promptData === 'string' && !metadataSource.positivePrompt && !metadataSource.negativePrompt) {
      // Try to extract positive and negative prompts from a combined string
      const parts = promptData.split('Negative prompt:');
      positivePrompt = parts[0].trim();
      negativePrompt = parts.length > 1 ? parts[1].trim() : '';
    } else if (promptData && typeof promptData === 'object') {
      // Handle structured prompt data
      const promptObj = promptData as Record<string, unknown>;
      positivePrompt = typeof promptObj.positive === 'string' ? promptObj.positive : '';
      negativePrompt = typeof promptObj.negative === 'string' ? promptObj.negative : '';
    }

    // If we still don't have prompts, try other common fields
    if (!positivePrompt) {
      positivePrompt = 
        getString(metadataSource, ['positivePrompt', 'positive_prompt', 'prompt']) || 
        getString(metadataSource, ['prompt_text', 'text', 'description']) || '';
    }
    
    if (!negativePrompt) {
      negativePrompt = 
        getString(metadataSource, ['negativePrompt', 'negative_prompt', 'neg_prompt']) || 
        getString(metadataSource, ['negative', 'negative_text']) || '';
    }

    // Defensive: Only render Lora Models if all entries are valid
    let loras: Array<{ name: string; weight: number }> = [];
    const loraVal = metadataSource['loras'] || metadataSource['Loras'] || metadataSource['LoRAs'];
    if (loraVal && Array.isArray(loraVal)) {
      loras = loraVal.map((lora) => ({
        name: lora && typeof lora === 'object' && typeof lora.name === 'string' ? lora.name : 'Unknown Lora',
        weight: lora && typeof lora === 'object' && typeof lora.weight === 'number' ? 
          parseFloat(formatNumberValue(lora.weight)) : 1.0,
      }));
    }

    // Format any numeric values in the metadata
    const formatMetadataValue = (value: string): string => {
      if (!value) return '';
      
      // Try to parse as number and format if successful
      const num = parseFloat(value);
      if (!isNaN(num) && String(num) === value) {
        return formatNumberValue(num);
      }
      
      return value;
    };

    // Extract metadata with multiple possible key names
    return {
      model: getString(metadataSource, ['model', 'Model', 'checkpoint', 'Checkpoint', 'ckpt_name']),
      seed: getString(metadataSource, ['seed', 'Seed', 'noise_seed']),
      steps: getString(metadataSource, ['steps', 'Steps', 'max_steps', 'step_count']),
      cfg: formatMetadataValue(getString(metadataSource, ['cfg', 'CFG', 'cfg_scale', 'guidance_scale'])),
      sampler: getString(metadataSource, ['sampler', 'Sampler', 'sampler_name', 'sample_method']),
      scheduler: getString(metadataSource, ['scheduler', 'Scheduler', 'scheduler_name']),
      denoise: formatMetadataValue(getString(metadataSource, ['denoise', 'Denoise', 'denoise_strength', 'denoising_strength'])),
      hiresUpscale: formatMetadataValue(getString(metadataSource, ['hiresUpscale', 'hires_scale', 'hr_scale', 'upscale', 'scale'])),
      hiresUpscaler: getString(metadataSource, ['hiresUpscaler', 'upscaler', 'hr_upscaler', 'upscale_method']),
      positivePrompt,
      negativePrompt,
      loras,
    };
  }, [selectedImageData]);
}
