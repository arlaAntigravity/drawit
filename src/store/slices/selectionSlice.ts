import type { DiagramState } from '../useStore';

// ============================================================================
// Selection Slice
// ============================================================================

export interface SelectionSlice {
  selectedNodes: string[];
  selectedEdges: string[];
  setSelectedNodes: (ids: string[]) => void;
  setSelectedEdges: (ids: string[]) => void;
  clearSelection: () => void;
  deleteSelected: () => void;
}

export const createSelectionSlice = (
  set: (partial: Partial<DiagramState> | ((state: DiagramState) => Partial<DiagramState>)) => void,
  get: () => DiagramState,
): SelectionSlice => ({
  selectedNodes: [],
  selectedEdges: [],

  setSelectedNodes: (ids) => set({ selectedNodes: ids }),
  setSelectedEdges: (ids) => set({ selectedEdges: ids }),
  clearSelection: () => set({ selectedNodes: [], selectedEdges: [] }),

  deleteSelected: () => {
    const { selectedNodes, selectedEdges, nodes, edges } = get();
    if (selectedNodes.length === 0 && selectedEdges.length === 0) return;
    
    const nodesToDelete = new Set(selectedNodes);
    
    // Detach children of deleted parents
    const newNodes = nodes
      .filter((n) => !nodesToDelete.has(n.id))
      .map((n) => {
        if (n.parentNode && nodesToDelete.has(n.parentNode)) {
          const { parentNode: _, extent: __, ...rest } = n;
          return { ...rest, extent: undefined };
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
});
