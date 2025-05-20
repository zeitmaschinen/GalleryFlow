import React, { useState, useEffect, useMemo, useCallback } from 'react';
import ReactFlow, { 
  Background, 
  Node, 
  Edge, 
  applyNodeChanges,
  applyEdgeChanges,
  ConnectionLineType,
  Panel,
  ReactFlowInstance,
  NodeChange,
  EdgeChange
} from 'reactflow';
import type { ComfyUIWorkflow } from '../../utils/parseComfyWorkflow';
import 'reactflow/dist/style.css';
import './ComfyUI.css';
import { parseComfyWorkflow } from '../../utils/parseComfyWorkflow';
import ComfyNode from './ComfyNode';
import { useTheme } from '@mui/material/styles';
import { Box, IconButton, Tooltip } from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import FitScreenIcon from '@mui/icons-material/FitScreen';

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

  // ReactFlow instance reference for controlling the view
  const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
  
  // Edge change handler
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  // Node change handler
  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  
  // Fit view handler
  const handleFitView = () => {
    if (reactFlowInstance) {
      reactFlowInstance.fitView({ padding: 0.2 });
    }
  };

  // Zoom handlers
  const handleZoomIn = () => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (reactFlowInstance) {
      reactFlowInstance.zoomOut();
    }
  };

  return (
    <Box sx={{ width: '100%', height: height, minHeight: 300, background: 'transparent', position: 'relative' }}>
      <ReactFlow
        nodes={nodes.map(node => ({ 
          ...node, 
          data: { 
            ...node.data, 
            darkMode, 
            id: node.id 
          }
        }))}
        edges={edges}
        nodeTypes={nodeTypes}
        onInit={(instance: ReactFlowInstance) => setReactFlowInstance(instance)}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={3}
        nodesDraggable={true}
        nodesConnectable={false}
        elementsSelectable={true}
        zoomOnScroll
        panOnScroll
        connectionLineType={ConnectionLineType.Bezier}
        className={`comfyui-flow ${mode}`}
        style={{ borderRadius: 8, width: '100%', height: '100%' }}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
      >
        <Background gap={25} size={1} color={darkMode ? 'rgba(70, 70, 70, 0.15)' : 'rgba(0, 0, 0, 0.06)'} />
        
        {/* Custom controls panel */}
        <Panel position="top-right" className="comfyui-controls">
          <Tooltip title="Zoom In">
            <IconButton onClick={handleZoomIn} size="small" sx={{ color: darkMode ? '#fff' : '#555' }}>
              <ZoomInIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom Out">
            <IconButton onClick={handleZoomOut} size="small" sx={{ color: darkMode ? '#fff' : '#555' }}>
              <ZoomOutIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Fit View">
            <IconButton onClick={handleFitView} size="small" sx={{ color: darkMode ? '#fff' : '#555' }}>
              <FitScreenIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Panel>
      </ReactFlow>
    </Box>
  );
};

export default WorkflowViewer;
