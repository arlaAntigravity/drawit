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
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useStore, NodeType } from '@/store/useStore';
import { nodeTypes } from '@/components/nodes';

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
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        defaultEdgeOptions={{
          type: 'smoothstep',
          style: { stroke: '#6366f1', strokeWidth: 2 },
        }}
        className="bg-background"
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1} 
          color="rgba(255,255,255,0.1)" 
        />
        <Controls 
          className="!bg-card !border-border !shadow-lg"
          showInteractive={false}
        />
        <MiniMap 
          nodeColor={(node) => {
            switch (node.type) {
              case 'rectangle': return '#6366f1';
              case 'roundedRect': return '#22c55e';
              case 'diamond': return '#f59e0b';
              case 'ellipse': return '#ec4899';
              case 'text': return '#8b5cf6';
              case 'cylinder': return '#06b6d4';
              default: return '#6366f1';
            }
          }}
          maskColor="rgba(0, 0, 0, 0.8)"
          className="!bg-card !border-border"
        />
      </ReactFlow>
    </div>
  );
}

export function Canvas() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
}
