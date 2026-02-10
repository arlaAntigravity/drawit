'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { createNodeSlice, NodeSlice } from './slices/nodeSlice';
import { createEdgeSlice, EdgeSlice } from './slices/edgeSlice';
import { createSelectionSlice, SelectionSlice } from './slices/selectionSlice';
import { createHistorySlice, HistorySlice } from './slices/historySlice';

// ============================================================================
// Combined Store Interface
// ============================================================================
export interface DiagramState extends NodeSlice, EdgeSlice, SelectionSlice, HistorySlice {}

// ============================================================================
// Store
// ============================================================================
export const useStore = create<DiagramState>()(
  persist(
    (set, get) => ({
      ...createNodeSlice(set, get),
      ...createEdgeSlice(set, get),
      ...createSelectionSlice(set, get),
      ...createHistorySlice(set, get),
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
