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

function renderDetails(classType: string, inputs: Record<string, unknown>) {
  switch (classType) {
    case 'CheckpointLoaderSimple':
      return (
        <>
          {renderInputField('ckpt_name', inputs.ckpt_name || 'None')}
        </>
      );
    case 'LoraLoader':
      return (
        <>
          {renderInputField('lora_name', inputs.lora_name || 'None')}
          {renderInputField('strength', inputs.strength || '1.0')}
        </>
      );
    case 'EmptyLatentImage':
      return (
        <>
          {renderInputField('width', inputs.width || '512')}
          {renderInputField('height', inputs.height || '512')}
          {renderInputField('batch_size', inputs.batch_size || '1')}
        </>
      );
    case 'CLIPTextEncode':
      return (
        <>
          {renderInputField('text', inputs.text || '')}
        </>
      );
    case 'KSampler':
      return (
        <>
          {renderInputField('steps', inputs.steps || '20')}
          {renderInputField('sampler', inputs.sampler_name || 'euler_a')}
          {renderInputField('cfg', inputs.cfg || '7.0')}
          {renderInputField('seed', inputs.seed || '0')}
          {inputs.denoise && renderInputField('denoise', inputs.denoise)}
        </>
      );
    case 'VAEDecode':
      return (
        <>
          {renderInputField('samples', 'VAE Input')}
        </>
      );
    case 'SaveImage':
      return (
        <>
          {renderInputField('filename_prefix', inputs.filename_prefix || 'output')}
        </>
      );
    default:
      // Show all inputs for unknown types
      return (
        <>
          {Object.entries(inputs || {}).map(([k, v]) => renderInputField(k, v))}
        </>
      );
  }
}

const classTypeLabels: Record<string, string> = {
  'CheckpointLoaderSimple': 'Load Checkpoint',
  'LoraLoader': 'Load LoRA',
  'EmptyLatentImage': 'Empty Latent Image',
  'CLIPTextEncode': 'CLIP Text Encode',
  'KSampler': 'KSampler',
  'VAEDecode': 'VAE Decode',
  'SaveImage': 'Save Image',
};

export default function ComfyNode({ data }: { data: ComfyNodeData }) {
  const label = classTypeLabels[data.class_type] || data.class_type;
  const nodeCategory = getNodeCategory(data.class_type);
  const theme = data.darkMode ? 'dark' : 'light';
  
  // Generate input and output handles based on node type
  const generateInputHandles = () => {
    // For simplicity, we'll add a single input handle for most nodes
    // In a real implementation, you would generate these based on the node's actual inputs
    if (['CheckpointLoaderSimple', 'EmptyLatentImage'].includes(data.class_type)) {
      return null; // These typically don't have inputs
    }
    
    return (
      <Handle 
        type="target" 
        position={Position.Left} 
        className="comfyui-node-handle input" 
        id="input"
      />
    );
  };
  
  const generateOutputHandles = () => {
    // For simplicity, we'll add a single output handle
    // In a real implementation, you would generate these based on the node's actual outputs
    if (data.class_type === 'SaveImage') {
      return null; // SaveImage typically doesn't have outputs
    }
    
    return (
      <Handle 
        type="source" 
        position={Position.Right} 
        className="comfyui-node-handle output" 
        id="output"
      />
    );
  };

  return (
    <div className={`comfyui-node ${nodeCategory} ${theme}`}>
      <div className="comfyui-node-header">
        {label}
        <span className="comfyui-node-id">{data.id}</span>
      </div>
      <div className="comfyui-node-content">
        {renderDetails(data.class_type, data.inputs || {})}
      </div>
      {generateInputHandles()}
      {generateOutputHandles()}
    </div>
  );
}
