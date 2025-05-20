import React, { useState, useEffect, useMemo } from 'react';
import ReactFlow, { Background, Controls, Node, Edge, applyNodeChanges } from 'reactflow';
import type { ComfyUIWorkflow } from '../../utils/parseComfyWorkflow';
import 'reactflow/dist/style.css';
import { parseComfyWorkflow } from '../../utils/parseComfyWorkflow';
import ComfyNode from './ComfyNode';
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/material';

interface WorkflowViewerProps {
  workflowJson: Record<string, unknown> | null;
  height?: number | string;
}

const WorkflowViewer: React.FC<WorkflowViewerProps> = ({ workflowJson, height = 400 }) => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const theme = useTheme();

  // Detect theme mode for wrapper class
  const mode = theme.palette.mode === 'dark' ? 'dark' : 'light';
  const darkMode = mode === 'dark';

  // Run Dagre layout only when workflowJson changes
  useEffect(() => {
    if (!workflowJson) {
      setNodes([]);
      setEdges([]);
      return;
    }
    try {
      if (typeof workflowJson === 'object' && workflowJson !== null && Object.values(workflowJson).some((v) => v && typeof v === 'object' && 'class_type' in v)) {
        const workflowNodes = Object.entries(workflowJson)
          .filter(([k, v]) => !isNaN(Number(k)) && v && typeof v === 'object' && 'class_type' in v)
          .map(([k, v]) => [k, v]);
        const workflowObj = Object.fromEntries(workflowNodes);
        const { nodes: dagreNodes, edges: dagreEdges } = parseComfyWorkflow(workflowObj as unknown as ComfyUIWorkflow);
        dagreNodes.forEach(n => n.type = 'comfy');
        setNodes(dagreNodes);
        setEdges(dagreEdges);
      } else {
        setNodes([]);
        setEdges([]);
      }
    } catch {
      setNodes([]);
      setEdges([]);
    }
  }, [workflowJson]);

  const nodeTypes = useMemo(() => ({
    comfy: ComfyNode,
  }), []);

  return (
    <Box sx={{ width: '100%', height: height, minHeight: 300, background: 'transparent' }}>
      <ReactFlow
        nodes={nodes.map(node => ({ ...node, data: { ...node.data, darkMode } }))}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.15 }}
        minZoom={0.1}
        maxZoom={2}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        zoomOnScroll
        panOnScroll
        className={`workflow-viewer-reactflow workflow-visualization-${mode}`}
        style={{ borderRadius: 8, width: '100%', height: '100%' }}
        onNodesChange={changes => setNodes(nds => applyNodeChanges(changes, nds))}
      >
        <Controls />
        <Background gap={16} color="var(--workflow-grid, #888)" />
      </ReactFlow>
    </Box>
  );
};

export default WorkflowViewer;
