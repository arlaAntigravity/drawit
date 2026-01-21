'use client';

import React, { useCallback, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
  SelectionMode,
  BackgroundVariant,
  ConnectionMode,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useStore } from '@/store/useStore';
import { NodeType } from '@/lib/types';
import { nodeTypes } from '@/components/nodes';
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
  
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    setSelectedNodes,
    setSelectedEdges,
    deleteSelected,
    undo,
    redo,
  } = useStore();

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

  return (
    <div
      ref={reactFlowWrapper}
      className="flex-1 h-full"
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
        nodeTypes={nodeTypes}
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
