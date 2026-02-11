import { describe, it, expect, beforeEach } from 'vitest';
import { createTestStore, TestDiagramState } from './helpers';
import { MAX_HISTORY_LENGTH } from '@/lib/constants';

describe('historySlice', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  describe('pushHistory', () => {
    it('records current state snapshot', () => {
      // Initial history has one entry (empty state)
      expect(store.getState().history).toHaveLength(1);
      expect(store.getState().historyIndex).toBe(0);

      // Add a node, which internally calls pushHistory
      store.getState().addNode('rectangle', { x: 100, y: 200 });

      expect(store.getState().history).toHaveLength(2);
      expect(store.getState().historyIndex).toBe(1);
    });

    it('truncates future history on new push (fork behavior)', () => {
      store.getState().addNode('rectangle', { x: 0, y: 0 });
      store.getState().addNode('rectangle', { x: 100, y: 100 });
      // history: [empty, 1node, 2nodes], index=2
      expect(store.getState().history).toHaveLength(3);

      // Undo twice
      store.getState().undo();
      store.getState().undo();
      expect(store.getState().historyIndex).toBe(0);

      // Add new node — should fork: truncate future
      store.getState().addNode('ellipse', { x: 50, y: 50 });
      expect(store.getState().history).toHaveLength(2); // [empty, 1ellipse]
      expect(store.getState().historyIndex).toBe(1);
    });

    it('respects MAX_HISTORY_LENGTH', () => {
      for (let i = 0; i < MAX_HISTORY_LENGTH + 10; i++) {
        store.getState().addNode('rectangle', { x: i * 10, y: 0 });
      }

      expect(store.getState().history.length).toBeLessThanOrEqual(MAX_HISTORY_LENGTH);
    });
  });

  describe('undo', () => {
    it('restores previous state', () => {
      store.getState().addNode('rectangle', { x: 100, y: 200 });
      expect(store.getState().nodes).toHaveLength(1);

      store.getState().undo();
      expect(store.getState().nodes).toHaveLength(0);
      expect(store.getState().historyIndex).toBe(0);
    });

    it('does nothing at index 0', () => {
      store.getState().undo();
      expect(store.getState().historyIndex).toBe(0);
      expect(store.getState().nodes).toHaveLength(0);
    });
  });

  describe('redo', () => {
    it('restores next state after undo', () => {
      store.getState().addNode('rectangle', { x: 100, y: 200 });
      store.getState().undo();
      expect(store.getState().nodes).toHaveLength(0);

      store.getState().redo();
      expect(store.getState().nodes).toHaveLength(1);
      expect(store.getState().historyIndex).toBe(1);
    });

    it('does nothing at tail (latest state)', () => {
      store.getState().addNode('rectangle', { x: 100, y: 200 });
      const indexBefore = store.getState().historyIndex;

      store.getState().redo();
      expect(store.getState().historyIndex).toBe(indexBefore);
    });
  });
});
