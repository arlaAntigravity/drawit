'use client';

import React, { useCallback, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useReactFlow,
  SelectionMode,
  BackgroundVariant,
  ConnectionMode,
  Node,
  NodeDragHandler,
  Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useStore } from '@/store/useStore';
import { useShallow } from 'zustand/react/shallow';
import { NodeType, NodeData } from '@/lib/types';
import { nodeTypes } from '@/components/nodes';
import { edgeTypes } from '@/components/edges';
import { SnapGuides } from '@/components/SnapGuides';
import { useSnapGuides, SnapGuide } from '@/hooks/useSnapGuides';
import { useShortcuts } from '@/hooks/useShortcuts';
import { CanvasContextMenu } from '@/components/CanvasContextMenu';
import { 
  EDGE_STYLE, 
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
    setSelectedNodes,
    setSelectedEdges,
    deleteSelected,
    undo,
    redo,
    setNodes,
    duplicateNode,
    handleNodeDrop,
  } = useStore(useShallow((state) => ({
    nodes: state.nodes,
    edges: state.edges,
    onNodesChange: state.onNodesChange,
    onEdgesChange: state.onEdgesChange,
    onConnect: state.onConnect,
    addNode: state.addNode,
    setSelectedNodes: state.setSelectedNodes,
    setSelectedEdges: state.setSelectedEdges,
    deleteSelected: state.deleteSelected,
    undo: state.undo,
    redo: state.redo,
    setNodes: state.setNodes,
    duplicateNode: state.duplicateNode,
    handleNodeDrop: state.handleNodeDrop,
  })));

  const [menuType, setMenuType] = React.useState<'pane' | 'node' | 'edge'>('pane');
  const [menuTargetId, setMenuTargetId] = React.useState<string | null>(null);
  const migrationDone = React.useRef(false);
  
  // Migration to fix stuck nodes and orphans (runs once)
  React.useEffect(() => {
    if (migrationDone.current) return;
    migrationDone.current = true;
    let hasChanges = false;
    const existingNodeIds = new Set(nodes.map(n => n.id));
    
    const newNodes = nodes.map((n: Node) => {
      let changed = false;
      const newNode = { ...n };

      // Fix 1: Remove extent restriction
      if (newNode.extent === 'parent') {
        newNode.extent = undefined;
        changed = true;
      }
      
      // Fix 2: Remove invalid parent references (Orphans)
      if (newNode.parentNode && !existingNodeIds.has(newNode.parentNode)) {
        newNode.parentNode = undefined;
        newNode.position = newNode.positionAbsolute || newNode.position; // Fallback to absolute if available
        changed = true;
      }
      
      // Fix 3: Set zIndex for groups to be behind edges
      if (newNode.type === 'group' && newNode.zIndex !== -1) {
        newNode.zIndex = -1;
        changed = true;
      }
      
      if (changed) hasChanges = true;
      return newNode;
    });

    if (hasChanges) {
      setNodes(newNodes);
    }
  }, [nodes, setNodes]); // Migration to fix stuck nodes and orphans

  // Safe nodes for rendering (prevents crash even before effect runs)
  const safeNodes = React.useMemo(() => {
    const existingNodeIds = new Set(nodes.map(n => n.id));
    return nodes.map(n => {
      if (n.parentNode && !existingNodeIds.has(n.parentNode)) {
        // Return a copy without the invalid parentNode to prevent ReactFlow crash
        const { parentNode: _, ...rest } = n;
        return rest;
      }
      return n;
    });
  }, [nodes]);

  const { updateGuides, endDrag } = useSnapGuides(safeNodes);

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

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      setMenuType('node');
      setMenuTargetId(node.id);
    },
    []
  );

  const onEdgeContextMenu = useCallback(
    (_event: React.MouseEvent, edge: Edge) => {
      setMenuType('edge');
      setMenuTargetId(edge.id);
    },
    []
  );

  const onPaneContextMenu = useCallback(
    (_event: React.MouseEvent) => {
      setMenuType('pane');
      setMenuTargetId(null);
    },
    []
  );

  const handleMenuAction = useCallback((action: string) => {
    if (action === 'delete') {
      if (menuTargetId) {
        if (menuType === 'node') {
          setNodes(nodes.filter(n => n.id !== menuTargetId));
        } else {
          // ReactFlow handles edge deletion if we update edges state
          // but we use useStore actions
          useStore.getState().setEdges(edges.filter(e => e.id !== menuTargetId));
        }
      } else {
        deleteSelected();
      }
    } else if (action === 'duplicate' && menuTargetId && menuType === 'node') {
      duplicateNode(menuTargetId);
    }
  }, [menuType, menuTargetId, nodes, edges, setNodes, deleteSelected, duplicateNode]);

  const onSelectionChange = useCallback(
    ({ nodes, edges }: { nodes: { id: string }[]; edges: { id: string }[] }) => {
      setSelectedNodes(nodes.map((n) => n.id));
      setSelectedEdges(edges.map((e) => e.id));
    },
    [setSelectedNodes, setSelectedEdges]
  );

  useShortcuts();

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
      handleNodeDrop(draggedNode as Node<NodeData>);
    },
    [setGuides, endDrag, handleNodeDrop]
  );

  return (
    <div className="flex-1 overflow-hidden relative" ref={reactFlowWrapper}>
      <CanvasContextMenu
        menuType={menuType}
        handleMenuAction={handleMenuAction}
        undo={undo}
        redo={redo}
        onAddNode={addNode}
        screenToFlowPosition={screenToFlowPosition}
      >
        <ReactFlow
          nodes={safeNodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onSelectionChange={onSelectionChange}
          onNodeDrag={onNodeDrag}
          onNodeDragStop={onNodeDragStop}
          onNodeContextMenu={onNodeContextMenu}
          onEdgeContextMenu={onEdgeContextMenu}
          onPaneContextMenu={onPaneContextMenu}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          selectionMode={SelectionMode.Partial}
          connectionMode={ConnectionMode.Loose}
          fitView
          snapToGrid
          snapGrid={SNAP_GRID}
          defaultEdgeOptions={{
            type: 'labeled',
            style: EDGE_STYLE,
          }}
          className="bg-background"
          deleteKeyCode={null}
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
            maskColor="rgba(0, 0, 0, 0.2)"
            className="!bg-card !border-border"
          />
          <SnapGuides guides={guides} />
        </ReactFlow>
      </CanvasContextMenu>
    </div>
  );
}


// ============================================================================
// Canvas Export
// ============================================================================
export { CanvasInner as Canvas };
