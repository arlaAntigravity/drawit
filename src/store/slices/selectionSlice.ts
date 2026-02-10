import { Node } from 'reactflow';
import { NodeData } from '@/lib/types';
import { generateNodeId } from './nodeSlice';
import type { DiagramState } from '../useStore';

// ============================================================================
// Selection Slice
// ============================================================================

export interface SelectionSlice {
  selectedNodes: string[];
  selectedEdges: string[];
  clipboard: Node<NodeData>[];
  setSelectedNodes: (ids: string[]) => void;
  setSelectedEdges: (ids: string[]) => void;
  clearSelection: () => void;
  deleteSelected: () => void;
  copySelected: () => void;
  pasteClipboard: () => void;
}

export const createSelectionSlice = (
  set: (partial: Partial<DiagramState> | ((state: DiagramState) => Partial<DiagramState>)) => void,
  get: () => DiagramState,
): SelectionSlice => ({
  selectedNodes: [],
  selectedEdges: [],
  clipboard: [],

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

  copySelected: () => {
    const { selectedNodes, nodes } = get();
    if (selectedNodes.length === 0) return;
    
    const copied = nodes
      .filter((n) => selectedNodes.includes(n.id))
      .map((n) => JSON.parse(JSON.stringify(n)));
    
    set({ clipboard: copied });
  },

  pasteClipboard: () => {
    const { clipboard, nodes } = get();
    if (clipboard.length === 0) return;

    const OFFSET = 30;
    const idMap = new Map<string, string>();

    // Create new nodes with new IDs and offset positions
    const newNodes = clipboard.map((n) => {
      const newId = generateNodeId();
      idMap.set(n.id, newId);
      return {
        ...JSON.parse(JSON.stringify(n)),
        id: newId,
        position: { x: n.position.x + OFFSET, y: n.position.y + OFFSET },
        selected: true,
      };
    });

    // Deselect existing, add pasted
    set({
      nodes: [...nodes.map((n) => ({ ...n, selected: false })), ...newNodes],
      selectedNodes: newNodes.map((n) => n.id),
    });
    get().pushHistory();
  },
});
