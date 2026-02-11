import { create } from 'zustand';
import { createNodeSlice, NodeSlice } from '@/store/slices/nodeSlice';
import { createEdgeSlice, EdgeSlice } from '@/store/slices/edgeSlice';
import { createSelectionSlice, SelectionSlice } from '@/store/slices/selectionSlice';
import { createHistorySlice, HistorySlice } from '@/store/slices/historySlice';

export interface TestDiagramState extends NodeSlice, EdgeSlice, SelectionSlice, HistorySlice {}

/**
 * Creates a fresh Zustand store for testing (no persist middleware).
 * Each call returns a new isolated store instance.
 */
export function createTestStore() {
  return create<TestDiagramState>()((set, get) => ({
    ...createNodeSlice(set as any, get as any),
    ...createEdgeSlice(set as any, get as any),
    ...createSelectionSlice(set as any, get as any),
    ...createHistorySlice(set as any, get as any),
  }));
}
