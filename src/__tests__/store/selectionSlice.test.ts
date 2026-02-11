import { describe, it, expect, beforeEach } from 'vitest';
import { createTestStore } from './helpers';

describe('selectionSlice', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  describe('deleteSelected', () => {
    it('removes selected nodes', () => {
      store.getState().addNode('rectangle', { x: 0, y: 0 });
      store.getState().addNode('rectangle', { x: 100, y: 0 });
      const nodeId = store.getState().nodes[0].id;

      store.getState().setSelectedNodes([nodeId]);
      store.getState().deleteSelected();

      expect(store.getState().nodes).toHaveLength(1);
      expect(store.getState().nodes[0].id).not.toBe(nodeId);
    });

    it('removes edges connected to deleted nodes', () => {
      store.getState().addNode('rectangle', { x: 0, y: 0 });
      store.getState().addNode('rectangle', { x: 200, y: 0 });

      const [node1, node2] = store.getState().nodes;
      store.getState().onConnect({
        source: node1.id,
        target: node2.id,
        sourceHandle: null,
        targetHandle: null,
      });
      expect(store.getState().edges).toHaveLength(1);

      // Delete source node
      store.getState().setSelectedNodes([node1.id]);
      store.getState().deleteSelected();

      expect(store.getState().nodes).toHaveLength(1);
      expect(store.getState().edges).toHaveLength(0);
    });

    it('removes selected edges', () => {
      store.getState().addNode('rectangle', { x: 0, y: 0 });
      store.getState().addNode('rectangle', { x: 200, y: 0 });

      const [node1, node2] = store.getState().nodes;
      store.getState().onConnect({
        source: node1.id,
        target: node2.id,
        sourceHandle: null,
        targetHandle: null,
      });
      const edgeId = store.getState().edges[0].id;

      store.getState().setSelectedEdges([edgeId]);
      store.getState().deleteSelected();

      expect(store.getState().edges).toHaveLength(0);
      expect(store.getState().nodes).toHaveLength(2); // nodes remain
    });

    it('does nothing with empty selection', () => {
      store.getState().addNode('rectangle', { x: 0, y: 0 });
      const historyLenBefore = store.getState().history.length;

      store.getState().deleteSelected();

      expect(store.getState().nodes).toHaveLength(1);
      expect(store.getState().history.length).toBe(historyLenBefore);
    });

    it('clears selection after delete', () => {
      store.getState().addNode('rectangle', { x: 0, y: 0 });
      store.getState().setSelectedNodes([store.getState().nodes[0].id]);

      store.getState().deleteSelected();

      expect(store.getState().selectedNodes).toEqual([]);
      expect(store.getState().selectedEdges).toEqual([]);
    });
  });

  describe('copySelected / pasteClipboard', () => {
    it('copies selected nodes to clipboard', () => {
      store.getState().addNode('rectangle', { x: 0, y: 0 });
      const nodeId = store.getState().nodes[0].id;

      store.getState().setSelectedNodes([nodeId]);
      store.getState().copySelected();

      expect(store.getState().clipboard).toHaveLength(1);
      expect(store.getState().clipboard[0].type).toBe('rectangle');
    });

    it('does nothing when no nodes selected for copy', () => {
      store.getState().addNode('rectangle', { x: 0, y: 0 });
      store.getState().copySelected();
      expect(store.getState().clipboard).toHaveLength(0);
    });

    it('pastes nodes with new IDs and offset positions', () => {
      store.getState().addNode('rectangle', { x: 100, y: 100 });
      const originalId = store.getState().nodes[0].id;

      store.getState().setSelectedNodes([originalId]);
      store.getState().copySelected();
      store.getState().pasteClipboard();

      const nodes = store.getState().nodes;
      expect(nodes).toHaveLength(2);

      const pasted = nodes[1];
      expect(pasted.id).not.toBe(originalId);
      expect(pasted.position.x).toBe(130); // 100 + 30 offset
      expect(pasted.position.y).toBe(130);
      expect(pasted.selected).toBe(true);
    });

    it('does nothing when clipboard is empty', () => {
      store.getState().pasteClipboard();
      expect(store.getState().nodes).toHaveLength(0);
    });

    it('paste creates deep copies (no shared references)', () => {
      store.getState().addNode('rectangle', { x: 0, y: 0 });
      const nodeId = store.getState().nodes[0].id;

      store.getState().setSelectedNodes([nodeId]);
      store.getState().copySelected();
      store.getState().pasteClipboard();

      // Modify pasted node — original should be unaffected
      const pastedId = store.getState().nodes[1].id;
      store.getState().updateNodeData(pastedId, { label: 'Changed' });

      expect(store.getState().nodes[0].data.label).not.toBe('Changed');
    });
  });
});
