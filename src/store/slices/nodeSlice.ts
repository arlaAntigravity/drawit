import {
  Node,
  applyNodeChanges,
  NodeChange,
  XYPosition,
} from 'reactflow';

import { NodeType, NodeData } from '@/lib/types';
import { NODE_STYLES } from '@/lib/constants';
import type { DiagramState } from '../useStore';

// ============================================================================
// Helper Functions
// ============================================================================

const getDefaultNodeData = (type: NodeType): Partial<NodeData> => {
  const style = NODE_STYLES[type];
  return {
    width: style.width,
    height: style.height,
    backgroundColor: style.backgroundColor,
    borderColor: style.borderColor,
    borderWidth: style.borderWidth,
  };
};

let _nodeIdCounter = 0;
export const generateNodeId = (): string => `node-${Date.now()}-${_nodeIdCounter++}`;

const getNextNodeNumber = (nodes: Node<NodeData>[]): number => {
  const nodeNumbers = nodes
    .map((n) => {
      const match = n.data.label.match(/Node (\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => n > 0);
  
  return nodeNumbers.length > 0 ? Math.max(...nodeNumbers) + 1 : nodes.length + 1;
};

// ============================================================================
// Node Slice
// ============================================================================

export interface NodeSlice {
  nodes: Node<NodeData>[];
  setNodes: (nodes: Node<NodeData>[]) => void;
  addNode: (type: NodeType, position: XYPosition) => void;
  updateNodeData: (id: string, data: Partial<NodeData>) => void;
  commitNodeData: () => void;
  duplicateNode: (id: string) => void;
  alignNodes: (direction: 'left' | 'right' | 'top' | 'bottom' | 'v-center' | 'h-center') => void;
  setNodeParent: (nodeId: string, parentId: string | null) => void;
  handleNodeDrop: (draggedNode: Node<NodeData>) => void;
  onNodesChange: (changes: NodeChange[]) => void;
}

export const createNodeSlice = (
  set: (partial: Partial<DiagramState> | ((state: DiagramState) => Partial<DiagramState>)) => void,
  get: () => DiagramState,
): NodeSlice => ({
  nodes: [],

  setNodes: (nodes) => set({ nodes }),

  addNode: (type, position) => {
    const nodes = get().nodes;
    const id = generateNodeId();
    const nextNumber = getNextNodeNumber(nodes);

    const newNode: Node<NodeData> = {
      id,
      type,
      position,
      zIndex: type === 'group' ? -1 : undefined,
      data: {
        label: type === 'text' ? 'Text' : type === 'group' ? 'Группа' : `Node ${nextNumber}`,
        textColor: '#ffffff',
        fontSize: 14,
        ...getDefaultNodeData(type),
      } as NodeData,
    };
    
    set({ nodes: [...nodes, newNode] });
    get().pushHistory();
  },

  updateNodeData: (id, data) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === id ? { ...node, data: { ...node.data, ...data } } : node
      ),
    });
  },

  commitNodeData: () => {
    get().pushHistory();
  },

  duplicateNode: (id) => {
    const nodes = get().nodes;
    const node = nodes.find((n) => n.id === id);
    if (!node) return;

    const newId = generateNodeId();
    const newNode: Node<NodeData> = {
      ...JSON.parse(JSON.stringify(node)),
      id: newId,
      position: {
        x: node.position.x + 20,
        y: node.position.y + 20,
      },
      selected: true,
    };

    set({
      nodes: [...nodes.map(n => ({ ...n, selected: false })), newNode],
      selectedNodes: [newId],
    });
    get().pushHistory();
  },

  alignNodes: (direction) => {
    const { nodes, selectedNodes } = get();
    if (selectedNodes.length < 2) return;

    const nodesToAlign = nodes.filter((n) => selectedNodes.includes(n.id));
    const bounds = {
      minX: Math.min(...nodesToAlign.map((n) => n.position.x)),
      maxX: Math.max(...nodesToAlign.map((n) => n.position.x + (n.data?.width || 100))),
      minY: Math.min(...nodesToAlign.map((n) => n.position.y)),
      maxY: Math.max(...nodesToAlign.map((n) => n.position.y + (n.data?.height || 50))),
    };

    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;

    const newNodes = nodes.map((n) => {
      if (!selectedNodes.includes(n.id)) return n;

      const width = n.data?.width || 100;
      const height = n.data?.height || 50;
      let { x, y } = n.position;

      switch (direction) {
        case 'left': x = bounds.minX; break;
        case 'right': x = bounds.maxX - width; break;
        case 'top': y = bounds.minY; break;
        case 'bottom': y = bounds.maxY - height; break;
        case 'v-center': x = centerX - width / 2; break;
        case 'h-center': y = centerY - height / 2; break;
      }

      return { ...n, position: { x, y } };
    });

    set({ nodes: newNodes });
    get().pushHistory();
  },

  setNodeParent: (nodeId, parentId) => {
    const nodes = get().nodes;
    const node = nodes.find(n => n.id === nodeId);
    const parent = parentId ? nodes.find(n => n.id === parentId) : null;
    
    if (!node) return;
    
    set({
      nodes: nodes.map(n => {
        if (n.id === nodeId) {
          if (parentId && parent) {
            const relativeX = node.position.x - parent.position.x;
            const relativeY = node.position.y - parent.position.y;
            return {
              ...n,
              parentNode: parentId,
              extent: undefined,
              position: { x: relativeX, y: Math.max(30, relativeY) },
            };
          } else {
            const { parentNode: _, extent: __, ...rest } = n;
            return {
              ...rest,
              extent: undefined
            };
          }
        }
        return n;
      }),
    });
    get().pushHistory();
  },

  handleNodeDrop: (draggedNode) => {
    if (draggedNode.type === 'group') return;

    const nodes = get().nodes;
    const nodeWidth = draggedNode.data?.width || 100;
    const nodeHeight = draggedNode.data?.height || 50;
    const nodeCenterX = (draggedNode.positionAbsolute?.x ?? 0) + nodeWidth / 2;
    const nodeCenterY = (draggedNode.positionAbsolute?.y ?? 0) + nodeHeight / 2;

    const targetGroup = nodes.find(n => {
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

    if (targetGroup) {
      if (draggedNode.parentNode !== targetGroup.id) {
         get().setNodeParent(draggedNode.id, targetGroup.id);
      }
    } else {
      if (draggedNode.parentNode) {
        get().setNodeParent(draggedNode.id, null);
      }
    }
  },

  onNodesChange: (changes) => {
    const currentNodes = get().nodes;
    const newNodes = applyNodeChanges(changes, currentNodes) as Node<NodeData>[];
    
    // Sync dimensions to data if they changed
    const syncedNodes = newNodes.map(node => {
      const dimensionChange = changes.find(
        (c): c is { type: 'dimensions'; id: string; dimensions: { width: number; height: number } } => 
          c.type === 'dimensions' && c.id === node.id
      );
      if (dimensionChange && dimensionChange.dimensions) {
        return {
          ...node,
          data: {
            ...node.data,
            width: dimensionChange.dimensions.width,
            height: dimensionChange.dimensions.height,
          }
        };
      }
      return node;
    });

    set({ nodes: syncedNodes });
  },
});
