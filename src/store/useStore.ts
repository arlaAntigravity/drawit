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

export type NodeType = 'rectangle' | 'roundedRect' | 'diamond' | 'ellipse' | 'text' | 'cylinder';

export interface NodeData {
  label: string;
  width: number;
  height: number;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  textColor: string;
  fontSize: number;
}

export interface DiagramState {
  nodes: Node<NodeData>[];
  edges: Edge[];
  selectedNodes: string[];
  selectedEdges: string[];
  
  // Actions
  setNodes: (nodes: Node<NodeData>[]) => void;
  setEdges: (edges: Edge[]) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  addNode: (type: NodeType, position: XYPosition) => void;
  updateNodeData: (id: string, data: Partial<NodeData>) => void;
  deleteSelected: () => void;
  setSelectedNodes: (ids: string[]) => void;
  setSelectedEdges: (ids: string[]) => void;
  clearSelection: () => void;
  
  // History
  history: { nodes: Node<NodeData>[]; edges: Edge[] }[];
  historyIndex: number;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
}

const defaultNodeData: Record<NodeType, Partial<NodeData>> = {
  rectangle: { width: 120, height: 60, backgroundColor: '#1e1e2e', borderColor: '#6366f1', borderWidth: 2 },
  roundedRect: { width: 120, height: 60, backgroundColor: '#1e1e2e', borderColor: '#22c55e', borderWidth: 2 },
  diamond: { width: 100, height: 100, backgroundColor: '#1e1e2e', borderColor: '#f59e0b', borderWidth: 2 },
  ellipse: { width: 100, height: 60, backgroundColor: '#1e1e2e', borderColor: '#ec4899', borderWidth: 2 },
  text: { width: 120, height: 40, backgroundColor: 'transparent', borderColor: 'transparent', borderWidth: 0 },
  cylinder: { width: 80, height: 100, backgroundColor: '#1e1e2e', borderColor: '#06b6d4', borderWidth: 2 },
};

// Node ID counter removed to prevent reset on page reload.
// IDs are now generated using timestamps and labels based on node count.


export const useStore = create<DiagramState>()(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      selectedNodes: [],
      selectedEdges: [],
      history: [],
      historyIndex: -1,

      setNodes: (nodes) => set({ nodes }),
      setEdges: (edges) => set({ edges }),

      onNodesChange: (changes) => {
        set({
          nodes: applyNodeChanges(changes, get().nodes) as Node<NodeData>[],
        });
      },

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
              style: { stroke: '#6366f1', strokeWidth: 2 },
              markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
            },
            get().edges
          ),
        });
      },

      addNode: (type, position) => {
        get().pushHistory();
        const nodes = get().nodes;
        // Generate a unique ID that won't collide even after page reload
        const id = `node-${Date.now()}`;
        
        // Calculate the next number for the label based on existing nodes
        const nodeNumbers = nodes
          .map((n) => {
            const match = n.data.label.match(/Node (\d+)/);
            return match ? parseInt(match[1], 10) : 0;
          })
          .filter((n) => n > 0);
        const nextNumber = nodeNumbers.length > 0 ? Math.max(...nodeNumbers) + 1 : nodes.length + 1;

        const newNode: Node<NodeData> = {
          id,
          type,
          position,
          data: {
            label: type === 'text' ? 'Text' : `Node ${nextNumber}`,
            textColor: '#ffffff',
            fontSize: 14,
            ...defaultNodeData[type],
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

      setSelectedNodes: (ids) => set({ selectedNodes: ids }),
      setSelectedEdges: (ids) => set({ selectedEdges: ids }),
      clearSelection: () => set({ selectedNodes: [], selectedEdges: [] }),

      pushHistory: () => {
        const { nodes, edges, history, historyIndex } = get();
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({ nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) });
        if (newHistory.length > 50) newHistory.shift();
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
