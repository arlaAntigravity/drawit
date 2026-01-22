'use client';

import React, { useCallback, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
  SelectionMode,
  BackgroundVariant,
  ConnectionMode,
  Node,
  NodeDragHandler,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useStore } from '@/store/useStore';
import { NodeType, NodeData } from '@/lib/types';
import { nodeTypes } from '@/components/nodes';
import { edgeTypes } from '@/components/edges';
import { SnapGuides } from '@/components/SnapGuides';
import { useSnapGuides, SnapGuide } from '@/hooks/useSnapGuides';
import { 
  EDGE_STYLE, 
  SELECTED_EDGE_COLOR, 
  SNAP_GRID, 
  BACKGROUND_SETTINGS,
  NODE_STYLES 
} from '@/lib/constants';

// ============================================================================
// MiniMap Color Function
// ============================================================================
const getNodeColor = (node: { type?: string }): string => {
  const type = node.type as NodeType | undefined;
  if (type && NODE_STYLES[type]) {
    return NODE_STYLES[type].borderColor;
  }
  return NODE_STYLES.rectangle.borderColor;
};

// ============================================================================
// Canvas Inner Component
// ============================================================================
function CanvasInner() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();
  const [guides, setGuides] = useState<SnapGuide[]>([]);
  
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    setNodeParent,
    setSelectedNodes,
    setSelectedEdges,
    deleteSelected,
    undo,
    redo,
  } = useStore();

  const { updateGuides, endDrag } = useSnapGuides(nodes);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow') as NodeType;
      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(type, position);
    },
    [screenToFlowPosition, addNode]
  );

  const onSelectionChange = useCallback(
    ({ nodes, edges }: { nodes: { id: string }[]; edges: { id: string }[] }) => {
      setSelectedNodes(nodes.map((n) => n.id));
      setSelectedEdges(edges.map((e) => e.id));
    },
    [setSelectedNodes, setSelectedEdges]
  );

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === 'Delete' || event.key === 'Backspace') {
        deleteSelected();
      }
      if (event.ctrlKey || event.metaKey) {
        if (event.key === 'z') {
          event.preventDefault();
          undo();
        }
        if (event.key === 'y') {
          event.preventDefault();
          redo();
        }
      }
    },
    [deleteSelected, undo, redo]
  );

  // Snap guides handlers
  const onNodeDrag: NodeDragHandler = useCallback(
    (_event, node) => {
      const width = (node as Node<NodeData>).data?.width || 100;
      const height = (node as Node<NodeData>).data?.height || 50;
      updateGuides(node.id, node.position, width, height);
      
      // Calculate snap guides
      const allNodes = nodes.filter(n => n.id !== node.id);
      const newGuides: SnapGuide[] = [];
      const THRESHOLD = 8;
      
      const dragLeft = node.position.x;
      const dragRight = node.position.x + width;
      const dragCenterX = node.position.x + width / 2;
      const dragTop = node.position.y;
      const dragBottom = node.position.y + height;
      const dragCenterY = node.position.y + height / 2;
      
      allNodes.forEach(other => {
        const otherWidth = other.data?.width || 100;
        const otherHeight = other.data?.height || 50;
        const otherLeft = other.position.x;
        const otherRight = other.position.x + otherWidth;
        const otherCenterX = other.position.x + otherWidth / 2;
        const otherTop = other.position.y;
        const otherBottom = other.position.y + otherHeight;
        const otherCenterY = other.position.y + otherHeight / 2;
        
        // Vertical guides
        if (Math.abs(dragLeft - otherLeft) < THRESHOLD) {
          newGuides.push({ type: 'vertical', position: otherLeft });
        }
        if (Math.abs(dragRight - otherRight) < THRESHOLD) {
          newGuides.push({ type: 'vertical', position: otherRight });
        }
        if (Math.abs(dragCenterX - otherCenterX) < THRESHOLD) {
          newGuides.push({ type: 'vertical', position: otherCenterX });
        }
        
        // Horizontal guides
        if (Math.abs(dragTop - otherTop) < THRESHOLD) {
          newGuides.push({ type: 'horizontal', position: otherTop });
        }
        if (Math.abs(dragBottom - otherBottom) < THRESHOLD) {
          newGuides.push({ type: 'horizontal', position: otherBottom });
        }
        if (Math.abs(dragCenterY - otherCenterY) < THRESHOLD) {
          newGuides.push({ type: 'horizontal', position: otherCenterY });
        }
      });
      
      setGuides(newGuides);
    },
    [nodes, updateGuides]
  );

  const onNodeDragStop: NodeDragHandler = useCallback(
    (_event, draggedNode) => {
      setGuides([]);
      endDrag();
      
      // Skip if the dragged node is a group itself
      if (draggedNode.type === 'group') return;
      
      // Skip if already has a parent (moving within parent)
      if ((draggedNode as any).parentNode) return;
      
      // Find if node was dropped inside a group
      const nodeWidth = (draggedNode as Node<NodeData>).data?.width || 100;
      const nodeHeight = (draggedNode as Node<NodeData>).data?.height || 50;
      const nodeCenterX = draggedNode.position.x + nodeWidth / 2;
      const nodeCenterY = draggedNode.position.y + nodeHeight / 2;
      
      const groupNode = nodes.find(n => {
        if (n.type !== 'group' || n.id === draggedNode.id) return false;
        const groupWidth = n.data?.width || 300;
        const groupHeight = n.data?.height || 200;
        
        return (
          nodeCenterX > n.position.x &&
          nodeCenterX < n.position.x + groupWidth &&
          nodeCenterY > n.position.y &&
          nodeCenterY < n.position.y + groupHeight
        );
      });
      
      if (groupNode) {
        setNodeParent(draggedNode.id, groupNode.id);
      }
    },
    [nodes, endDrag, setNodeParent]
  );

  return (
    <div
      ref={reactFlowWrapper}
      className="flex-1 h-full relative"
      onKeyDown={onKeyDown}
      tabIndex={0}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onSelectionChange={onSelectionChange}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        selectionMode={SelectionMode.Partial}
        connectionMode={ConnectionMode.Loose}
        fitView
        snapToGrid
        snapGrid={SNAP_GRID}
        defaultEdgeOptions={{
          type: 'smoothstep',
          style: EDGE_STYLE,
        }}
        className="bg-background"
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={BACKGROUND_SETTINGS.gap} 
          size={BACKGROUND_SETTINGS.size} 
          color={BACKGROUND_SETTINGS.color} 
        />
        <Controls 
          className="!bg-card !border-border !shadow-lg"
          showInteractive={false}
        />
        <MiniMap 
          nodeColor={getNodeColor}
          maskColor="rgba(0, 0, 0, 0.8)"
          className="!bg-card !border-border"
        />
        {/* Snap Guides */}
        <SnapGuides guides={guides} />
        {/* Custom marker for selected edges */}
        <SelectedEdgeMarker color={SELECTED_EDGE_COLOR} />
      </ReactFlow>
    </div>
  );
}

// ============================================================================
// Selected Edge Marker Component
// ============================================================================
function SelectedEdgeMarker({ color }: { color: string }) {
  return (
    <svg style={{ position: 'absolute', width: 0, height: 0 }}>
      <defs>
        <marker
          id="react-flow__arrowclosed-selected"
          viewBox="0 0 20 20"
          markerWidth="12"
          markerHeight="12"
          refX="10"
          refY="10"
          orient="auto"
          markerUnits="strokeWidth"
        >
          <polyline
            stroke={color}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            fill={color}
            points="0,0 20,10 0,20 5,10"
          />
        </marker>
      </defs>
    </svg>
  );
}

// ============================================================================
// Canvas Export
// ============================================================================
export function Canvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
