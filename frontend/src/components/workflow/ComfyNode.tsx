import React from 'react';
import { Handle, Position } from 'reactflow';
import { ComfyNodeData } from './types';

function renderDetails(classType: string, inputs: Record<string, unknown>) {
  switch (classType) {
    case 'CheckpointLoaderSimple':
      return <div><b>Model:</b> {String(inputs.ckpt_name)}</div>;
    case 'LoraLoader':
      return <div><b>LoRA:</b> {String(inputs.lora_name)}</div>;
    case 'EmptyLatentImage':
      return <div><b>Size:</b> {String(inputs.width)}x{String(inputs.height)}</div>;
    case 'CLIPTextEncode':
      return <div><b>Text:</b> {String(inputs.text)}</div>;
    case 'KSampler':
      return (
        <div>
          <div><b>Steps:</b> {String(inputs.steps)}</div>
          <div><b>Sampler:</b> {String(inputs.sampler_name)}</div>
          <div><b>CFG:</b> {String(inputs.cfg)}</div>
          <div><b>Seed:</b> {String(inputs.seed)}</div>
          <div><b>Noise:</b> {String(inputs.noise_seed)}</div>
        </div>
      );
    case 'VAEDecode':
      return <div><b>VAE Decode</b></div>;
    case 'SaveImage':
      return <div><b>Save Image</b></div>;
    default:
      // Show all inputs for unknown types
      return (
        <div style={{ fontSize: 12 }}>
          {Object.entries(inputs || {}).map(([k, v]) => (
            <div key={k}><b>{k}:</b> {String(v)}</div>
          ))}
        </div>
      );
  }
}

const classTypeLabels: Record<string, string> = {
  'CheckpointLoaderSimple': 'Load Diffusion Model',
  'LoraLoader': 'Load LoRA',
  'EmptyLatentImage': 'Empty Latent Image',
  'CLIPTextEncode': 'CLIP Text Encode',
  'KSampler': 'KSampler',
  'VAEDecode': 'VAE Decode',
  'SaveImage': 'Save Image',
};

export default function ComfyNode({ data }: { data: ComfyNodeData }) {
  const label = classTypeLabels[data.class_type] || data.class_type;
  return (
    <div className={`comfy-node${data.darkMode ? ' comfy-node-dark' : ' comfy-node-light'}`}>
      <div className="comfy-node-label">{label}</div>
      {renderDetails(data.class_type, data.inputs || {})}
      {/* Handles for React Flow connections */}
      <Handle type="target" position={Position.Left} className="comfy-node-handle" />
      <Handle type="source" position={Position.Right} className="comfy-node-handle" />
    </div>
  );
}
