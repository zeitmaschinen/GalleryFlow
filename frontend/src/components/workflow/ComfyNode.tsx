import { Handle, Position } from 'reactflow';
import './ComfyUI.css';

export interface ComfyNodeData {
  class_type: string;
  inputs: Record<string, unknown>;
  darkMode?: boolean;
  id?: string;
}

// Get node category for styling
function getNodeCategory(classType: string): string {
  if (classType.includes('Loader') || classType.includes('Checkpoint')) {
    return 'loader';
  } else if (classType.includes('Sampler') || classType.includes('KSampler')) {
    return 'sampler';
  } else if (classType.includes('Latent') || classType.includes('Empty')) {
    return 'latent';
  } else if (classType.includes('CLIP') || classType.includes('Text')) {
    return 'clip';
  } else if (classType.includes('VAE')) {
    return 'vae';
  } else if (classType.includes('Save')) {
    return 'save';
  }
  return '';
}

// Render input fields in ComfyUI style
function renderInputField(key: string, value: unknown) {
  return (
    <div className="comfyui-node-input" key={key}>
      <div className="comfyui-node-input-label">{key}</div>
      <div className="comfyui-node-input-value">{String(value)}</div>
    </div>
  );
}

// Get node type class based on the class_type
function getNodeTypeClass(classType: string): string {
  // Check for exact matches first
  switch (classType) {
    case 'CheckpointLoaderSimple':
    case 'CheckpointLoader':
    case 'LoadCheckpoint':
      return 'comfy-node-checkpoint';
      
    case 'LoraLoader':
    case 'LoadLora':
      return 'comfy-node-lora';
      
    case 'EmptyLatentImage':
      return 'comfy-node-latent';
      
    case 'CLIPTextEncode':
    case 'CLIPTextEncodeBiasedSDXL':
    case 'CLIPTextEncodeSDXL':
      return 'comfy-node-clip';
      
    case 'KSampler':
    case 'KSamplerAdvanced':
    case 'BNK_Upsampler':
      return 'comfy-node-sampler';
      
    case 'VAEDecode':
    case 'VAEEncode':
    case 'VAEEncodeForInpaint':
      return 'comfy-node-vae';
      
    case 'SaveImage':
    case 'PreviewImage':
      return 'comfy-node-save';
      
    case 'LoadImage':
    case 'ImageScale':
    case 'ImageScaleBy':
    case 'ImageUpscaleWithModel':
    case 'ImageInvert':
    case 'ImageBlur':
    case 'ImageComposite':
      return 'comfy-node-image';
  }
  
  // If no exact match, check if the class name contains certain keywords
  if (classType.toLowerCase().includes('checkpoint') || classType.toLowerCase().includes('model')) {
    return 'comfy-node-checkpoint';
  } else if (classType.toLowerCase().includes('lora')) {
    return 'comfy-node-lora';
  } else if (classType.toLowerCase().includes('latent')) {
    return 'comfy-node-latent';
  } else if (classType.toLowerCase().includes('clip') || classType.toLowerCase().includes('text')) {
    return 'comfy-node-clip';
  } else if (classType.toLowerCase().includes('sampler') || classType.toLowerCase().includes('sample')) {
    return 'comfy-node-sampler';
  } else if (classType.toLowerCase().includes('vae')) {
    return 'comfy-node-vae';
  } else if (classType.toLowerCase().includes('save') || classType.toLowerCase().includes('output') || classType.toLowerCase().includes('preview')) {
    return 'comfy-node-save';
  } else if (classType.toLowerCase().includes('image') || classType.toLowerCase().includes('img')) {
    return 'comfy-node-image';
  }
  
  // Default fallback
  return 'comfy-node-default';
}

// Render node properties based on class type
function renderProperties(classType: string, inputs: Record<string, unknown>) {
  const properties: Array<{ label: string; value: string | JSX.Element }> = [];

  switch (classType) {
    case 'CheckpointLoaderSimple':
      properties.push({ label: 'Model', value: String(inputs.ckpt_name) });
      break;
    case 'LoraLoader':
      properties.push({ label: 'LoRA', value: String(inputs.lora_name) });
      if (inputs.strength) {
        properties.push({ label: 'Strength', value: String(inputs.strength) });
      }
      break;
    case 'EmptyLatentImage':
      properties.push({ 
        label: 'Size', 
        value: `${String(inputs.width)}×${String(inputs.height)}` 
      });
      properties.push({ label: 'Batch Size', value: String(inputs.batch_size || 1) });
      break;
    case 'CLIPTextEncode':
      properties.push({ label: 'Text', value: String(inputs.text) });
      break;
    case 'KSampler':
      properties.push({ label: 'Steps', value: String(inputs.steps) });
      properties.push({ label: 'Sampler', value: String(inputs.sampler_name) });
      properties.push({ label: 'CFG', value: String(inputs.cfg) });
      properties.push({ label: 'Seed', value: String(inputs.seed) });
      if (inputs.denoise) {
        properties.push({ label: 'Denoise', value: String(inputs.denoise) });
      }
      break;
    case 'VAEDecode':
      properties.push({ label: 'Type', value: 'VAE Decode' });
      break;
    case 'SaveImage':
      properties.push({ label: 'Type', value: 'Save Image' });
      if (inputs.filename_prefix) {
        properties.push({ label: 'Prefix', value: String(inputs.filename_prefix) });
      }
      break;
    default:
      // Show all inputs for unknown types
      Object.entries(inputs || {}).forEach(([key, value]) => {
        properties.push({ label: key, value: String(value) });
      });
      break;
  }

  return properties.map((prop, index) => (
    <div className="comfy-node-property" key={index}>
      <div className="comfy-node-property-label">{prop.label}</div>
      <div className="comfy-node-property-value">{prop.value}</div>
    </div>
  ));
}

const classTypeLabels: Record<string, string> = {
  'CheckpointLoaderSimple': 'Load Checkpoint',
  'LoraLoader': 'Load LoRA',
  'EmptyLatentImage': 'Empty Latent',
  'CLIPTextEncode': 'CLIP Text',
  'KSampler': 'KSampler',
  'VAEDecode': 'VAE Decode',
  'SaveImage': 'Save Image',
  'LoadImage': 'Load Image',
};

export default function ComfyNode({ data }: { data: ComfyNodeData }) {
  const label = classTypeLabels[data.class_type] || data.class_type;
  const nodeTypeClass = getNodeTypeClass(data.class_type);
  
  return (
    <div className={`comfy-node ${nodeTypeClass} ${data.darkMode ? 'comfy-node-dark' : 'comfy-node-light'}`}>
      <div className="comfy-node-header">{label}</div>
      <div className="comfy-node-content">
        {renderProperties(data.class_type, data.inputs || {})}
      </div>
      {/* Handles for React Flow connections */}
      <Handle 
        type="target" 
        position={Position.Left} 
        className="comfy-node-handle comfy-node-handle-input" 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        className="comfy-node-handle comfy-node-handle-output" 
      />
    </div>
  );
}
