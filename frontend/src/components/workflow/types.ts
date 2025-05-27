export interface ComfyNodeData {
  id: string;
  class_type: string;
  inputs?: Record<string, unknown>;
  darkMode?: boolean;
}

export interface ComfyUINode {
  class_type: string;
  inputs: Record<string, unknown>;
}

export interface ComfyUIWorkflow {
  [key: string]: ComfyUINode;
}
