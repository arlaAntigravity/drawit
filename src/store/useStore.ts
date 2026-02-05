'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Node,
  Edge,
  Connection,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  NodeChange,
  EdgeChange,
  XYPosition,
  MarkerType,
} from 'reactflow';

import { NodeType, NodeData, HistoryEntry } from '@/lib/types';
import { NODE_STYLES, EDGE_STYLE, MAX_HISTORY_LENGTH } from '@/lib/constants';

// ============================================================================
// Store Interface
// ============================================================================
export interface DiagramState {
  // State
  nodes: Node<NodeData>[];
  edges: Edge[];
  selectedNodes: string[];
  selectedEdges: string[];
  history: HistoryEntry[];
  historyIndex: number;
  
  // Node Actions
  setNodes: (nodes: Node<NodeData>[]) => void;
  addNode: (type: NodeType, position: XYPosition) => void;
  updateNodeData: (id: string, data: Partial<NodeData>) => void;
  duplicateNode: (id: string) => void;
  alignNodes: (direction: 'left' | 'right' | 'top' | 'bottom' | 'v-center' | 'h-center') => void;
  setNodeParent: (nodeId: string, parentId: string | null) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  
  // Edge Actions
  setEdges: (edges: Edge[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  
  // Selection Actions
  setSelectedNodes: (ids: string[]) => void;
  setSelectedEdges: (ids: string[]) => void;
  clearSelection: () => void;
  deleteSelected: () => void;
  
  // History Actions
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
}

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

const generateNodeId = (): string => `node-${Date.now()}`;

const getNextNodeNumber = (nodes: Node<NodeData>[]): number => {
  const nodeNumbers = nodes
    .map((n) => {
      const match = n.data.label.match(/Node (\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => n > 0);
  
  return nodeNumbers.length > 0 ? Math.max(...nodeNumbers) + 1 : nodes.length + 1;
};

const deepClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

// ============================================================================
// Store
// ============================================================================
export const useStore = create<DiagramState>()(
  persist(
    (set, get) => ({
      // Initial State
      nodes: [],
      edges: [],
      selectedNodes: [],
      selectedEdges: [],
      history: [{ nodes: [], edges: [] }],
      historyIndex: 0,

      // Node Actions
      setNodes: (nodes) => set({ nodes }),
      
      addNode: (type, position) => {
        const nodes = get().nodes;
        const id = generateNodeId();
        const nextNumber = getNextNodeNumber(nodes);

        const newNode: Node<NodeData> = {
          id,
          type,
          position,
          data: {
            label: type === 'text' ? 'Text' : `Node ${nextNumber}`,
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
                const { parentNode, extent, ...rest } = n as any;
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

      onNodesChange: (changes) => {
        const currentNodes = get().nodes;
        const newNodes = applyNodeChanges(changes, currentNodes) as Node<NodeData>[];
        
        // Sync dimensions to data if they changed
        const syncedNodes = newNodes.map(node => {
          const dimensionChange = changes.find(c => c.type === 'dimensions' && (c as any).id === node.id) as any;
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

      // Edge Actions
      setEdges: (edges) => set({ edges }),

      onEdgesChange: (changes) => {
        set({
          edges: applyEdgeChanges(changes, get().edges),
        });
      },

      onConnect: (connection) => {
        set({
          edges: addEdge(
            {
              ...connection,
              type: 'labeled',
              style: EDGE_STYLE,
              data: { label: '' },
              markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_STYLE.stroke },
            },
            get().edges
          ),
        });
        get().pushHistory();
      },

      // Selection Actions
      setSelectedNodes: (ids) => set({ selectedNodes: ids }),
      setSelectedEdges: (ids) => set({ selectedEdges: ids }),
      clearSelection: () => set({ selectedNodes: [], selectedEdges: [] }),

      deleteSelected: () => {
        const { selectedNodes, selectedEdges, nodes, edges } = get();
        if (selectedNodes.length === 0 && selectedEdges.length === 0) return;
        
        // Find if any selected nodes are parents of other nodes
        const nodesToDelete = new Set(selectedNodes);
        
        // Update remaining nodes: if their parent is being deleted, detach them
        const newNodes = nodes
          .filter((n) => !nodesToDelete.has(n.id))
          .map((n) => {
            if (n.parentNode && nodesToDelete.has(n.parentNode)) {
              // Detach child from deleted parent
              const { parentNode, extent, ...rest } = n as any;
              return {
                 ...rest, 
                 extent: undefined,
              };
            }
            return n;
          });

        set({
          nodes: newNodes,
          edges: edges.filter(
            (e) =>
              !selectedEdges.includes(e.id) &&
              !selectedNodes.includes(e.source) &&
              !selectedNodes.includes(e.target)
          ),
          selectedNodes: [],
          selectedEdges: [],
        });
        get().pushHistory();
      },

      // History Actions
      pushHistory: () => {
        const { nodes, edges, history, historyIndex } = get();
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({ nodes: deepClone(nodes), edges: deepClone(edges) });
        
        if (newHistory.length > MAX_HISTORY_LENGTH) {
          newHistory.shift();
        }
        
        set({ history: newHistory, historyIndex: newHistory.length - 1 });
      },

      undo: () => {
        const { historyIndex, history } = get();
        if (historyIndex > 0) {
          const prev = history[historyIndex - 1];
          set({ nodes: prev.nodes, edges: prev.edges, historyIndex: historyIndex - 1 });
        }
      },

      redo: () => {
        const { historyIndex, history } = get();
        if (historyIndex < history.length - 1) {
          const next = history[historyIndex + 1];
          set({ nodes: next.nodes, edges: next.edges, historyIndex: historyIndex + 1 });
        }
      },
    }),
    {
      name: 'drawit-storage',
      partialize: (state) => ({ nodes: state.nodes, edges: state.edges }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Initialize history with rehydrated state to prevent undo-to-empty bug
          state.history = [{ 
            nodes: JSON.parse(JSON.stringify(state.nodes)), 
            edges: JSON.parse(JSON.stringify(state.edges)) 
          }];
          state.historyIndex = 0;
        }
      },
    }
  )
);

// Re-export types for backward compatibility
export type { NodeType, NodeData } from '@/lib/types';
