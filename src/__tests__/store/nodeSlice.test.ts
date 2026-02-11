import { describe, it, expect, beforeEach } from 'vitest';
import { createTestStore } from './helpers';

describe('nodeSlice', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  describe('addNode', () => {
    it('creates a node with correct type and position', () => {
      store.getState().addNode('rectangle', { x: 100, y: 200 });

      const nodes = store.getState().nodes;
      expect(nodes).toHaveLength(1);
      expect(nodes[0].type).toBe('rectangle');
      expect(nodes[0].position).toEqual({ x: 100, y: 200 });
    });

    it('assigns default data based on node type', () => {
      store.getState().addNode('rectangle', { x: 0, y: 0 });

      const node = store.getState().nodes[0];
      expect(node.data.width).toBe(120);
      expect(node.data.height).toBe(60);
      expect(node.data.backgroundColor).toBe('#1e1e2e');
      expect(node.data.borderColor).toBe('#6366f1');
    });

    it('generates sequential labels like "Node 1", "Node 2"', () => {
      store.getState().addNode('rectangle', { x: 0, y: 0 });
      store.getState().addNode('rectangle', { x: 100, y: 0 });

      const nodes = store.getState().nodes;
      expect(nodes[0].data.label).toBe('Node 1');
      expect(nodes[1].data.label).toBe('Node 2');
    });

    it('labels text nodes as "Text"', () => {
      store.getState().addNode('text', { x: 0, y: 0 });
      expect(store.getState().nodes[0].data.label).toBe('Text');
    });

    it('labels group nodes as "Группа"', () => {
      store.getState().addNode('group', { x: 0, y: 0 });
      expect(store.getState().nodes[0].data.label).toBe('Группа');
    });

    it('sets zIndex to -1 for group nodes', () => {
      store.getState().addNode('group', { x: 0, y: 0 });
      expect(store.getState().nodes[0].zIndex).toBe(-1);
    });

    it('pushes history after adding a node', () => {
      expect(store.getState().history).toHaveLength(1);
      store.getState().addNode('rectangle', { x: 0, y: 0 });
      expect(store.getState().history).toHaveLength(2);
    });
  });

  describe('updateNodeData', () => {
    it('merges partial data into existing node', () => {
      store.getState().addNode('rectangle', { x: 0, y: 0 });
      const nodeId = store.getState().nodes[0].id;

      store.getState().updateNodeData(nodeId, { label: 'Updated' });

      const node = store.getState().nodes[0];
      expect(node.data.label).toBe('Updated');
      // Other data should remain unchanged
      expect(node.data.width).toBe(120);
    });
  });

  describe('duplicateNode', () => {
    it('creates a copy with new ID at offset position', () => {
      store.getState().addNode('rectangle', { x: 100, y: 100 });
      const originalId = store.getState().nodes[0].id;

      store.getState().duplicateNode(originalId);

      const nodes = store.getState().nodes;
      expect(nodes).toHaveLength(2);
      expect(nodes[1].id).not.toBe(originalId);
      expect(nodes[1].position).toEqual({ x: 120, y: 120 });
      expect(nodes[1].type).toBe('rectangle');
    });

    it('selects duplicated node and deselects original', () => {
      store.getState().addNode('rectangle', { x: 0, y: 0 });
      const originalId = store.getState().nodes[0].id;

      store.getState().duplicateNode(originalId);

      const nodes = store.getState().nodes;
      expect(nodes[0].selected).toBe(false);
      expect(nodes[1].selected).toBe(true);
    });

    it('does nothing for non-existent node', () => {
      store.getState().duplicateNode('non-existent');
      expect(store.getState().nodes).toHaveLength(0);
    });
  });

  describe('alignNodes', () => {
    beforeEach(() => {
      // Create 3 nodes at different positions
      store.getState().addNode('rectangle', { x: 0, y: 0 });
      store.getState().addNode('rectangle', { x: 200, y: 100 });
      store.getState().addNode('rectangle', { x: 100, y: 200 });

      const nodeIds = store.getState().nodes.map((n) => n.id);
      store.getState().setSelectedNodes(nodeIds);
    });

    it('aligns nodes to the left', () => {
      store.getState().alignNodes('left');

      const nodes = store.getState().nodes;
      expect(nodes.every((n) => n.position.x === 0)).toBe(true);
    });

    it('aligns nodes to the top', () => {
      store.getState().alignNodes('top');

      const nodes = store.getState().nodes;
      expect(nodes.every((n) => n.position.y === 0)).toBe(true);
    });

    it('does nothing when fewer than 2 nodes are selected', () => {
      store.getState().setSelectedNodes([store.getState().nodes[0].id]);
      const positionsBefore = store.getState().nodes.map((n) => ({ ...n.position }));

      store.getState().alignNodes('left');

      const positionsAfter = store.getState().nodes.map((n) => ({ ...n.position }));
      expect(positionsAfter).toEqual(positionsBefore);
    });
  });
});
