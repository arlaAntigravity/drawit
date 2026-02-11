import { describe, it, expect } from 'vitest';
import { getLayoutedElements } from '@/hooks/useAutoLayout';
import { Node, Edge } from 'reactflow';
import { NodeData } from '@/lib/types';

const makeNode = (id: string, x = 0, y = 0, width = 150, height = 50): Node<NodeData> => ({
  id,
  type: 'rectangle',
  position: { x, y },
  data: {
    label: `Node ${id}`,
    width,
    height,
    backgroundColor: '#1e1e2e',
    borderColor: '#6366f1',
    borderWidth: 2,
    textColor: '#ffffff',
    fontSize: 14,
  },
});

const makeEdge = (source: string, target: string): Edge => ({
  id: `e-${source}-${target}`,
  source,
  target,
});

describe('getLayoutedElements', () => {
  it('returns empty array for empty input', () => {
    const result = getLayoutedElements([], []);
    expect(result).toEqual([]);
  });

  it('assigns positions to all nodes', () => {
    const nodes = [makeNode('a'), makeNode('b'), makeNode('c')];
    const edges = [makeEdge('a', 'b'), makeEdge('b', 'c')];

    const result = getLayoutedElements(nodes, edges);

    expect(result).toHaveLength(3);
    result.forEach((node) => {
      expect(node.position).toBeDefined();
      expect(typeof node.position.x).toBe('number');
      expect(typeof node.position.y).toBe('number');
    });
  });

  it('positions are different for connected nodes (TB layout)', () => {
    const nodes = [makeNode('a'), makeNode('b')];
    const edges = [makeEdge('a', 'b')];

    const result = getLayoutedElements(nodes, edges, { direction: 'TB' });

    // In top-bottom layout, node 'a' should be above node 'b'
    const nodeA = result.find((n) => n.id === 'a')!;
    const nodeB = result.find((n) => n.id === 'b')!;
    expect(nodeA.position.y).toBeLessThan(nodeB.position.y);
  });

  it('respects LR direction', () => {
    const nodes = [makeNode('a'), makeNode('b')];
    const edges = [makeEdge('a', 'b')];

    const result = getLayoutedElements(nodes, edges, { direction: 'LR' });

    const nodeA = result.find((n) => n.id === 'a')!;
    const nodeB = result.find((n) => n.id === 'b')!;
    // In left-right layout, node 'a' should be to the left of node 'b'
    expect(nodeA.position.x).toBeLessThan(nodeB.position.x);
  });

  it('works with a single node and no edges', () => {
    const nodes = [makeNode('solo')];
    const result = getLayoutedElements(nodes, []);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('solo');
    expect(typeof result[0].position.x).toBe('number');
    expect(typeof result[0].position.y).toBe('number');
  });

  it('preserves node data after layout', () => {
    const nodes = [makeNode('a'), makeNode('b')];
    const edges = [makeEdge('a', 'b')];

    const result = getLayoutedElements(nodes, edges);

    result.forEach((node) => {
      expect(node.data.label).toBeDefined();
      expect(node.data.backgroundColor).toBe('#1e1e2e');
      expect(node.type).toBe('rectangle');
    });
  });

  it('nodes do not overlap for simple linear graph', () => {
    const nodes = [makeNode('a', 0, 0, 150, 50), makeNode('b', 0, 0, 150, 50)];
    const edges = [makeEdge('a', 'b')];

    const result = getLayoutedElements(nodes, edges);

    const nodeA = result.find((n) => n.id === 'a')!;
    const nodeB = result.find((n) => n.id === 'b')!;

    // Bounding boxes should not overlap
    const aRight = nodeA.position.x + 150;
    const aBottom = nodeA.position.y + 50;
    const bRight = nodeB.position.x + 150;
    const bBottom = nodeB.position.y + 50;

    const overlapsX = nodeA.position.x < bRight && aRight > nodeB.position.x;
    const overlapsY = nodeA.position.y < bBottom && aBottom > nodeB.position.y;
    const overlaps = overlapsX && overlapsY;

    expect(overlaps).toBe(false);
  });
});
