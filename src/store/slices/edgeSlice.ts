import {
  Edge,
  Connection,
  addEdge,
  applyEdgeChanges,
  EdgeChange,
  MarkerType,
} from 'reactflow';

import { EDGE_STYLE } from '@/lib/constants';
import type { DiagramState } from '../useStore';

// ============================================================================
// Edge Slice
// ============================================================================

export interface EdgeSlice {
  edges: Edge[];
  setEdges: (edges: Edge[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
}

export const createEdgeSlice = (
  set: (partial: Partial<DiagramState> | ((state: DiagramState) => Partial<DiagramState>)) => void,
  get: () => DiagramState,
): EdgeSlice => ({
  edges: [],

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
});
