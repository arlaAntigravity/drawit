import { describe, it, expect, beforeEach } from 'vitest';
import { createTestStore } from './helpers';
import { EDGE_STYLE } from '@/lib/constants';

describe('edgeSlice', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
    // Create two nodes for edge tests
    store.getState().addNode('rectangle', { x: 0, y: 0 });
    store.getState().addNode('rectangle', { x: 200, y: 0 });
  });

  describe('onConnect', () => {
    it('creates a labeled edge with default style', () => {
      const [node1, node2] = store.getState().nodes;

      store.getState().onConnect({
        source: node1.id,
        target: node2.id,
        sourceHandle: null,
        targetHandle: null,
      });

      const edges = store.getState().edges;
      expect(edges).toHaveLength(1);
      expect(edges[0].source).toBe(node1.id);
      expect(edges[0].target).toBe(node2.id);
      expect(edges[0].type).toBe('labeled');
    });

    it('sets default edge data', () => {
      const [node1, node2] = store.getState().nodes;

      store.getState().onConnect({
        source: node1.id,
        target: node2.id,
        sourceHandle: null,
        targetHandle: null,
      });

      const edge = store.getState().edges[0];
      expect(edge.data?.label).toBe('');
      expect(edge.data?.animated).toBe(false);
      expect(edge.data?.strokeStyle).toBe('solid');
      expect(edge.data?.stroke).toBe(EDGE_STYLE.stroke);
      expect(edge.data?.strokeWidth).toBe(EDGE_STYLE.strokeWidth);
    });

    it('pushes history after connecting', () => {
      const historyBefore = store.getState().history.length;
      const [node1, node2] = store.getState().nodes;

      store.getState().onConnect({
        source: node1.id,
        target: node2.id,
        sourceHandle: null,
        targetHandle: null,
      });

      expect(store.getState().history.length).toBe(historyBefore + 1);
    });
  });

  describe('updateEdgeData', () => {
    it('merges partial data into existing edge', () => {
      const [node1, node2] = store.getState().nodes;
      store.getState().onConnect({
        source: node1.id,
        target: node2.id,
        sourceHandle: null,
        targetHandle: null,
      });
      const edgeId = store.getState().edges[0].id;

      store.getState().updateEdgeData(edgeId, { label: 'My Edge' });

      const edge = store.getState().edges[0];
      expect(edge.data?.label).toBe('My Edge');
      // Other data should remain
      expect(edge.data?.animated).toBe(false);
    });

    it('can update animated property', () => {
      const [node1, node2] = store.getState().nodes;
      store.getState().onConnect({
        source: node1.id,
        target: node2.id,
        sourceHandle: null,
        targetHandle: null,
      });
      const edgeId = store.getState().edges[0].id;

      store.getState().updateEdgeData(edgeId, { animated: true });
      expect(store.getState().edges[0].data?.animated).toBe(true);
    });
  });
});
