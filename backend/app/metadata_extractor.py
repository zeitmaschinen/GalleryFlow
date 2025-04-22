import json
from PIL import Image as PILImage  # Use alias to avoid conflict with model name
from PIL import PngImagePlugin
import logging
from typing import Optional, Dict, Any

# logger = logging.getLogger(__name__)

def extract_comfyui_metadata(image_path: str) -> Optional[Dict[str, Any]]:
    """Extracts ComfyUI metadata (often stored in 'prompt' or 'workflow' PNG chunks).
    Also attempts to parse and flatten generation parameters from ComfyUI's node graph JSON structure.
    """
    def extract_generation_params(metadata_dict):
        """
        Traverse ComfyUI node graph to extract seed, prompts, denoise, steps, sampler, scheduler, model, LoRA, hires fix, etc.
        Returns a flat dict with these fields if found, using fallbacks and heuristics.
        """
        result = {
            'seed': None,
            'steps': None,
            'sampler': None,
            'scheduler': None,
            'cfg': None,
            'denoise': None,
            'model': None,
            'hires_fix': None,
            'hires_upscaler': None,
            'lora_models': [],
            'positive_prompt': None,
            'negative_prompt': None,
        }
        if not isinstance(metadata_dict, dict):
            return result
        # ComfyUI prompt graph is usually a dict of node_id -> node
        # Sometimes it's wrapped in a dict with 'nodes' key (for workflow). Try both.
        nodes = metadata_dict
        if 'nodes' in metadata_dict and isinstance(metadata_dict['nodes'], list):
            # Workflow format: nodes is a list of dicts
            nodes = {str(node['id']): node for node in metadata_dict['nodes'] if isinstance(node, dict) and 'id' in node}
        # Track if we've found positive/negative prompt
        prompts_found = []
        for node_id, node in nodes.items():
            class_type = node.get('class_type') or node.get('type')
            inputs = node.get('inputs', {})
            meta = node.get('_meta', {}) or {}
            # Seed (KSampler, KSamplerAdvanced, etc.)
            if class_type and ('KSampler' in class_type or class_type == 'BNK_Unsampler'):
                seed = inputs.get('seed') or inputs.get('noise_seed')
                if seed is not None:
                    result['seed'] = seed
                cfg = inputs.get('cfg')
                if cfg is not None:
                    result['cfg'] = cfg
                denoise = inputs.get('denoise')
                if denoise is not None:
                    result['denoise'] = denoise
                steps = inputs.get('steps')
                if steps is not None:
                    result['steps'] = steps
                sampler = inputs.get('sampler_name')
                if sampler is not None:
                    result['sampler'] = sampler
                scheduler = inputs.get('scheduler')
                if scheduler is not None:
                    result['scheduler'] = scheduler
            # Model (CheckpointLoaderSimple)
            if class_type == 'CheckpointLoaderSimple':
                model_name = inputs.get('ckpt_name')
                if model_name:
                    result['model'] = model_name
            # LoRA Models
            if class_type == 'LoraLoader':
                lora_name = inputs.get('lora_name')
                lora_weight = inputs.get('strength_model')
                if lora_name:
                    result['lora_models'].append({
                        'name': lora_name,
                        'weight': lora_weight
                    })
            # Hires Fix (look for upscalers or related nodes)
            if class_type and ('Upscale' in class_type or 'Scale' in class_type):
                scale = inputs.get('scale_by') or inputs.get('scale')
                upscaler = inputs.get('upscale_method') or inputs.get('upscaler')
                if scale is not None:
                    result['hires_fix'] = scale
                if upscaler is not None:
                    result['hires_upscaler'] = upscaler
            # Prompts (positive/negative/general)
            if class_type and (class_type.startswith('CLIPTextEncode') or class_type == 'ttN text'):
                text = inputs.get('text')
                title = meta.get('title', '').lower()
                if text:
                    prompts_found.append((title, text))
        # Assign prompts to positive/negative fields
        if prompts_found:
            # Try to assign based on title
            for title, text in prompts_found:
                if 'negative' in title and not result['negative_prompt']:
                    result['negative_prompt'] = text
                elif ('positive' in title or 'prompt' in title or 'encode' in title) and not result['positive_prompt']:
                    result['positive_prompt'] = text
            # Fallback: assign first to positive, second to negative if not set
            if not result['positive_prompt'] and prompts_found:
                result['positive_prompt'] = prompts_found[0][1]
            if not result['negative_prompt'] and len(prompts_found) > 1:
                result['negative_prompt'] = prompts_found[1][1]
        # Clean up: remove empty lora_models if none found
        if not result['lora_models']:
            result.pop('lora_models')
        return result

    try:
        img = PILImage.open(image_path)
        if img.format == "PNG":
            prompt_data = img.info.get('prompt')
            workflow_data = img.info.get('workflow')
            raw_metadata = None
            if prompt_data:
                raw_metadata = prompt_data
            elif workflow_data:
                raw_metadata = workflow_data
            if raw_metadata:
                try:
                    metadata = json.loads(raw_metadata)
                    # Extract flattened generation params
                    gen_params = extract_generation_params(metadata)
                    # Merge extracted fields into metadata dict for frontend
                    if isinstance(metadata, dict):
                        metadata.update(gen_params)
                    pass
                    return metadata  # Return the node graph as top-level dict, as frontend expects
                except json.JSONDecodeError as json_err:
                    pass
                except Exception as e:
                    pass
        else:
            pass  # Only handle PNG for now
    except FileNotFoundError:
        pass
    except Exception as e:
        pass
    return None  # Return None if no metadata found or error occurs