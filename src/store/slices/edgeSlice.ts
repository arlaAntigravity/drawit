import {
  Edge,
  Connection,
  addEdge,
  applyEdgeChanges,
  EdgeChange,
  MarkerType,
} from 'reactflow';

import { EDGE_STYLE } from '@/lib/constants';
import { EdgeData } from '@/lib/types';
import type { DiagramState } from '../useStore';

// ============================================================================
// Edge Slice
// ============================================================================

export interface EdgeSlice {
  edges: Edge<EdgeData>[];
  setEdges: (edges: Edge<EdgeData>[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  updateEdgeData: (id: string, data: Partial<EdgeData>) => void;
  commitEdgeData: () => void;
}

export const createEdgeSlice = (
  set: (partial: Partial<DiagramState> | ((state: DiagramState) => Partial<DiagramState>)) => void,
  get: () => DiagramState,
): EdgeSlice => ({
  edges: [],

  setEdges: (edges) => set({ edges }),

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges) as Edge<EdgeData>[],
    });
  },

  onConnect: (connection) => {
    set({
      edges: addEdge(
        {
          ...connection,
          type: 'labeled',
          style: EDGE_STYLE,
          data: { 
            label: '',
            animated: false,
            strokeStyle: 'solid',
            stroke: EDGE_STYLE.stroke,
            strokeWidth: EDGE_STYLE.strokeWidth,
          },
          markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_STYLE.stroke },
        } as Edge<EdgeData>,
        get().edges
      ),
    });
    get().pushHistory();
  },

  updateEdgeData: (id, data) => {
    set({
      edges: get().edges.map((edge) =>
        edge.id === id ? { ...edge, data: { ...edge.data, ...data } as EdgeData } : edge
      ),
    });
  },

  commitEdgeData: () => {
    get().pushHistory();
  },
});
