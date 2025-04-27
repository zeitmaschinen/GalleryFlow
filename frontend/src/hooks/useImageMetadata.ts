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
    let comfyWorkflow: Record<string, any> = {};
    
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
    function extractComfyUIMetadata(workflow: Record<string, any>): Record<string, unknown> {
      const result: Record<string, unknown> = {};
      const nodes = Object.values(workflow);
      
      // Extract text prompts
      const textNodes = nodes.filter(node => 
        node?.class_type === 'ttN text' || 
        node?.class_type === 'CLIPTextEncode' || 
        node?.class_type === 'CLIPTextEncodeSDXL'
      );
      
      // Find positive and negative prompts
      let positivePromptNode = textNodes.find(node => {
        // Check if this node is connected to a positive input in a sampler
        const nodeId = Object.keys(workflow).find(key => workflow[key] === node);
        if (!nodeId) return false;
        
        return Object.values(workflow).some(n => 
          n?.inputs?.positive?.[0] === nodeId || 
          n?.inputs?.text_g?.[0] === nodeId
        );
      });
      
      let negativePromptNode = textNodes.find(node => {
        // Check if this node is connected to a negative input in a sampler
        const nodeId = Object.keys(workflow).find(key => workflow[key] === node);
        if (!nodeId) return false;
        
        return Object.values(workflow).some(n => 
          n?.inputs?.negative?.[0] === nodeId || 
          n?.inputs?.text_l?.[0] === nodeId
        );
      });
      
      // Extract prompt text
      if (positivePromptNode?.inputs?.text) {
        result.positivePrompt = positivePromptNode.inputs.text;
      }
      
      if (negativePromptNode?.inputs?.text) {
        result.negativePrompt = negativePromptNode.inputs.text;
      }
      
      // Find checkpoint loader nodes
      const checkpointNodes = nodes.filter(node => 
        node?.class_type?.includes('CheckpointLoader') || 
        node?.class_type?.includes('Load Checkpoint')
      );
      
      if (checkpointNodes.length > 0 && checkpointNodes[0]?.inputs?.ckpt_name) {
        result.model = checkpointNodes[0].inputs.ckpt_name;
      }
      
      // Find LoRA loader nodes
      const loraNodes = nodes.filter(node => 
        node?.class_type?.includes('LoraLoader') || 
        node?.class_type?.includes('Load LoRA')
      );
      
      if (loraNodes.length > 0) {
        result.loras = loraNodes.map(node => ({
          name: node.inputs?.lora_name || 'Unknown LoRA',
          weight: node.inputs?.strength_model || 1.0
        }));
      }
      
      // Find KSampler nodes first (prioritize these)
      const kSamplerNodes = nodes.filter(node => 
        node?.class_type?.includes('KSampler')
      );
      
      // If no KSampler nodes, look for other sampler types
      const otherSamplerNodes = nodes.filter(node => 
        !node?.class_type?.includes('KSampler') && 
        (node?.class_type?.includes('Sampler') || node?.class_type?.includes('Unsampler'))
      );
      
      // Prioritize KSampler nodes, then fall back to other sampler types
      const samplerNodes = kSamplerNodes.length > 0 ? kSamplerNodes : otherSamplerNodes;
      
      if (samplerNodes.length > 0) {
        // Use the first KSampler node as the primary source of metadata
        const primarySampler = samplerNodes[0];
        
        // Seed
        if (primarySampler.inputs?.seed || primarySampler.inputs?.noise_seed) {
          result.seed = primarySampler.inputs?.seed || primarySampler.inputs?.noise_seed;
        }
        
        // Steps
        if (primarySampler.inputs?.steps) {
          result.steps = primarySampler.inputs.steps;
        }
        
        // CFG Scale
        if (primarySampler.inputs?.cfg) {
          result.cfg = formatNumberValue(primarySampler.inputs.cfg);
        }
        
        // Sampler name
        if (primarySampler.inputs?.sampler_name) {
          result.sampler = primarySampler.inputs.sampler_name;
        }
        
        // Scheduler
        if (primarySampler.inputs?.scheduler) {
          result.scheduler = primarySampler.inputs.scheduler;
        }
        
        // Denoise - check various possible field names
        const denoiseValue = 
          primarySampler.inputs?.denoise || 
          primarySampler.inputs?.denoise_strength || 
          primarySampler.inputs?.denoising_strength ||
          (primarySampler.inputs?.add_noise === 'enable' ? 1.0 : null) || 
          (primarySampler.inputs?.start_at_step === 0 ? 1.0 : null) || 
          (primarySampler.inputs?.start_at_step && primarySampler.inputs?.steps ? 
            (1 - primarySampler.inputs.start_at_step / primarySampler.inputs.steps) : null);
            
        if (denoiseValue !== null) {
          result.denoise = formatNumberValue(denoiseValue);
        }
      }
      
      // Find upscaler nodes
      const upscalerNodes = nodes.filter(node => 
        node?.class_type?.includes('Upscale') || 
        node?.class_type?.includes('ImageScale')
      );
      
      if (upscalerNodes.length > 0) {
        const upscaler = upscalerNodes[0];
        if (upscaler.inputs?.upscale_method || upscaler.inputs?.upscaler) {
          result.hiresUpscaler = upscaler.inputs?.upscale_method || upscaler.inputs?.upscaler;
        }
        if (upscaler.inputs?.scale_by || upscaler.inputs?.scale || upscaler.inputs?.upscale) {
          const scaleValue = upscaler.inputs?.scale_by || upscaler.inputs?.scale || upscaler.inputs?.upscale;
          if (typeof scaleValue === 'number') {
            result.hiresUpscale = formatNumberValue(scaleValue);
          } else {
            result.hiresUpscale = scaleValue;
          }
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
