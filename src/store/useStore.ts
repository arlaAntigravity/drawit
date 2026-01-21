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
      history: [],
      historyIndex: -1,

      // Node Actions
      setNodes: (nodes) => set({ nodes }),
      
      addNode: (type, position) => {
        get().pushHistory();
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
      },

      updateNodeData: (id, data) => {
        get().pushHistory();
        set({
          nodes: get().nodes.map((node) =>
            node.id === id ? { ...node, data: { ...node.data, ...data } } : node
          ),
        });
      },

      onNodesChange: (changes) => {
        set({
          nodes: applyNodeChanges(changes, get().nodes) as Node<NodeData>[],
        });
      },

      // Edge Actions
      setEdges: (edges) => set({ edges }),

      onEdgesChange: (changes) => {
        set({
          edges: applyEdgeChanges(changes, get().edges),
        });
      },

      onConnect: (connection) => {
        get().pushHistory();
        set({
          edges: addEdge(
            {
              ...connection,
              type: 'smoothstep',
              style: EDGE_STYLE,
              markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_STYLE.stroke },
            },
            get().edges
          ),
        });
      },

      // Selection Actions
      setSelectedNodes: (ids) => set({ selectedNodes: ids }),
      setSelectedEdges: (ids) => set({ selectedEdges: ids }),
      clearSelection: () => set({ selectedNodes: [], selectedEdges: [] }),

      deleteSelected: () => {
        const { selectedNodes, selectedEdges, nodes, edges } = get();
        if (selectedNodes.length === 0 && selectedEdges.length === 0) return;
        
        get().pushHistory();
        set({
          nodes: nodes.filter((n) => !selectedNodes.includes(n.id)),
          edges: edges.filter(
            (e) =>
              !selectedEdges.includes(e.id) &&
              !selectedNodes.includes(e.source) &&
              !selectedNodes.includes(e.target)
          ),
          selectedNodes: [],
          selectedEdges: [],
        });
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
    }
  )
);

// Re-export types for backward compatibility
export type { NodeType, NodeData } from '@/lib/types';
