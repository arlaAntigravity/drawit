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
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
  ContextMenuLabel,
  ContextMenuShortcut,
} from '@/components/ui/context-menu';
import { 
  EDGE_STYLE, 
  SELECTED_EDGE_COLOR, 
  SNAP_GRID, 
  BACKGROUND_SETTINGS,
  NODE_STYLES 
} from '@/lib/constants';
import { 
  TrashIcon, 
  CopyIcon, 
  PlusIcon,
  LayersIcon,
  UndoIcon,
  RedoIcon
} from '@/components/icons';

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
    setNodes,
    duplicateNode,
  } = useStore();

  const [menuType, setMenuType] = React.useState<'pane' | 'node' | 'edge'>('pane');
  const [menuTargetId, setMenuTargetId] = React.useState<string | null>(null);
  
  // Migration to fix stuck nodes and orphans
  React.useEffect(() => {
    let hasChanges = false;
    const existingNodeIds = new Set(nodes.map(n => n.id));
    
    const newNodes = nodes.map((n: any) => {
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
  }, []); // Run once on mount

  // Safe nodes for rendering (prevents crash even before effect runs)
  const safeNodes = React.useMemo(() => {
    const existingNodeIds = new Set(nodes.map(n => n.id));
    return nodes.map(n => {
      if (n.parentNode && !existingNodeIds.has(n.parentNode)) {
        // Return a copy without the invalid parentNode to prevent ReactFlow crash
        const { parentNode, ...rest } = n;
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
    (event: React.MouseEvent, edge: any) => {
      setMenuType('edge');
      setMenuTargetId(edge.id);
    },
    []
  );

  const onPaneContextMenu = useCallback(
    (event: React.MouseEvent) => {
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

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input or textarea
      const target = event.target as HTMLElement;
      const isInput = 
        target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.isContentEditable;

      if (isInput) return;

      // Use event.code for layout-independent shortcuts
      if (event.code === 'Delete' || event.code === 'Backspace') {
        deleteSelected();
      }
      
      if (event.ctrlKey || event.metaKey) {
        if (event.code === 'KeyZ') {
          event.preventDefault();
          if (event.shiftKey) {
            redo();
          } else {
            undo();
          }
        }
        if (event.code === 'KeyY') {
          event.preventDefault();
          redo();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleteSelected, undo, redo]);

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

      const nodeWidth = (draggedNode as Node<NodeData>).data?.width || 100;
      const nodeHeight = (draggedNode as Node<NodeData>).data?.height || 50;
      const nodeCenterX = draggedNode.positionAbsolute?.x! + nodeWidth / 2;
      const nodeCenterY = draggedNode.positionAbsolute?.y! + nodeHeight / 2;

      // Find if node was dropped inside a group
      const targetGroup = nodes.find(n => {
        if (n.type !== 'group' || n.id === draggedNode.id) return false;
        const groupWidth = n.data?.width || 300;
        const groupHeight = n.data?.height || 200;
        
        // Check if center of dragged node is inside the group
        return (
          nodeCenterX > n.position.x &&
          nodeCenterX < n.position.x + groupWidth &&
          nodeCenterY > n.position.y &&
          nodeCenterY < n.position.y + groupHeight
        );
      });

      if (targetGroup) {
        // If dropped inside a group (new or same), set parent
        if (draggedNode.parentNode !== targetGroup.id) {
           setNodeParent(draggedNode.id, targetGroup.id);
        }
      } else {
        // If dropped outside any group, but currently has a parent, detach it
        if (draggedNode.parentNode) {
          setNodeParent(draggedNode.id, null);
        }
      }
    },
    [nodes, endDrag, setNodeParent]
  );

  return (
    <div className="flex-1 overflow-hidden relative" ref={reactFlowWrapper}>
      <ContextMenu>
        <ContextMenuTrigger className="h-full w-full">
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
        </ContextMenuTrigger>

        <ContextMenuContent className="w-56">
          {menuType === 'node' && (
            <>
              <ContextMenuLabel>Узел</ContextMenuLabel>
              <ContextMenuSeparator />
              <ContextMenuItem onClick={() => handleMenuAction('duplicate')}>
                <CopyIcon className="mr-2" />
                Дублировать
                <ContextMenuShortcut>Ctrl+D</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem variant="destructive" onClick={() => handleMenuAction('delete')}>
                <TrashIcon className="mr-2" />
                Удалить
                <ContextMenuShortcut>Del</ContextMenuShortcut>
              </ContextMenuItem>
            </>
          )}

          {menuType === 'edge' && (
            <>
              <ContextMenuLabel>Связь</ContextMenuLabel>
              <ContextMenuSeparator />
              <ContextMenuItem variant="destructive" onClick={() => handleMenuAction('delete')}>
                <TrashIcon className="mr-2" />
                Удалить
              </ContextMenuItem>
            </>
          )}

          {menuType === 'pane' && (
            <>
              <ContextMenuLabel>Полотно</ContextMenuLabel>
              <ContextMenuSeparator />
              <ContextMenuItem onClick={() => undo()}>
                <UndoIcon className="mr-2" />
                Отменить
                <ContextMenuShortcut>Ctrl+Z</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem onClick={() => redo()}>
                <RedoIcon className="mr-2" />
                Повторить
                <ContextMenuShortcut>Ctrl+Y</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuLabel>Добавить быстрые фигуры</ContextMenuLabel>
              <ContextMenuItem onClick={() => addNode('rectangle', screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 }))}>
                <PlusIcon className="mr-2" />
                Прямоугольник
              </ContextMenuItem>
              <ContextMenuItem onClick={() => addNode('roundedRect', screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 }))}>
                <PlusIcon className="mr-2" />
                Закругленный блок
              </ContextMenuItem>
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>
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
