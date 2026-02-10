import type { HistoryEntry } from '@/lib/types';
import type { DiagramState } from '../useStore';
import { MAX_HISTORY_LENGTH } from '@/lib/constants';

// ============================================================================
// History Slice
// ============================================================================

const deepClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

export interface HistorySlice {
  history: HistoryEntry[];
  historyIndex: number;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
}

export const createHistorySlice = (
  set: (partial: Partial<DiagramState> | ((state: DiagramState) => Partial<DiagramState>)) => void,
  get: () => DiagramState,
): HistorySlice => ({
  history: [{ nodes: [], edges: [] }],
  historyIndex: 0,

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
});
