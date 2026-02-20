import { describe, it, expect, beforeEach } from 'vitest';
import { createTestStore } from './helpers';

describe('librarySlice', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  it('starts with an empty templates array', () => {
    expect(store.getState().templates).toEqual([]);
  });

  describe('saveTemplate', () => {
    it('does not save a template if no nodes are selected', () => {
      store.getState().addNode('rectangle', { x: 0, y: 0 });
      store.getState().saveTemplate('My Template');
      expect(store.getState().templates).toHaveLength(0);
    });

    it('saves selected nodes and edges as a new template', () => {
      // Add two nodes
      store.getState().addNode('rectangle', { x: 100, y: 100 });
      store.getState().addNode('diamond', { x: 300, y: 100 });
      
      const nodes = store.getState().nodes;
      expect(nodes).toHaveLength(2);

      // Select nodes
      store.getState().setSelectedNodes([nodes[0].id, nodes[1].id]);

      // Save template
      store.getState().saveTemplate('Two Shapes');

      const templates = store.getState().templates;
      expect(templates).toHaveLength(1);
      expect(templates[0].name).toBe('Two Shapes');
      expect(templates[0].nodes).toHaveLength(2);
      
      // Check normalization (first node should be at 0,0 since minX/minY is 100,100)
      expect(templates[0].nodes[0].position).toEqual({ x: 0, y: 0 });
      expect(templates[0].nodes[1].position).toEqual({ x: 200, y: 0 });
    });
  });

  describe('deleteTemplate', () => {
    it('deletes a template by id', () => {
      // Setup: create a template
      store.getState().addNode('rectangle', { x: 100, y: 100 });
      store.getState().setSelectedNodes([store.getState().nodes[0].id]);
      store.getState().saveTemplate('To Delete');

      const templatesBefore = store.getState().templates;
      expect(templatesBefore).toHaveLength(1);
      const templateId = templatesBefore[0].id;

      // Delete the template
      store.getState().deleteTemplate(templateId);

      expect(store.getState().templates).toHaveLength(0);
    });
  });
});
