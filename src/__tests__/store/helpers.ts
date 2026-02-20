/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from 'zustand';
import { createNodeSlice, NodeSlice } from '@/store/slices/nodeSlice';
import { createEdgeSlice, EdgeSlice } from '@/store/slices/edgeSlice';
import { createSelectionSlice, SelectionSlice } from '@/store/slices/selectionSlice';
import { createHistorySlice, HistorySlice } from '@/store/slices/historySlice';
import { createLibrarySlice, LibrarySlice } from '@/store/slices/librarySlice';

export interface TestDiagramState extends NodeSlice, EdgeSlice, SelectionSlice, HistorySlice, LibrarySlice {}

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
    ...createLibrarySlice(set as any, get as any),
  }));
}
