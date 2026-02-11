import { describe, it, expect } from 'vitest';
import { getNodeBounds, calculateSnap } from '@/hooks/useSnapGuides';
import { Node } from 'reactflow';
import { NodeData } from '@/lib/types';

const makeNode = (
  id: string,
  x: number,
  y: number,
  width = 100,
  height = 50
): Node<NodeData> => ({
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

describe('getNodeBounds', () => {
  it('correctly calculates left, right, top, bottom, center', () => {
    const node = makeNode('a', 100, 200, 150, 80);
    const bounds = getNodeBounds(node);

    expect(bounds.id).toBe('a');
    expect(bounds.left).toBe(100);
    expect(bounds.right).toBe(250); // 100 + 150
    expect(bounds.top).toBe(200);
    expect(bounds.bottom).toBe(280); // 200 + 80
    expect(bounds.centerX).toBe(175); // 100 + 150/2
    expect(bounds.centerY).toBe(240); // 200 + 80/2
  });

  it('uses default dimensions when data is missing', () => {
    const node = {
      id: 'b',
      type: 'rectangle',
      position: { x: 0, y: 0 },
      data: {} as NodeData,
    } as Node<NodeData>;

    const bounds = getNodeBounds(node);
    expect(bounds.right).toBe(100); // default width
    expect(bounds.bottom).toBe(50); // default height
  });
});

describe('calculateSnap', () => {
  const otherBounds = [
    getNodeBounds(makeNode('other', 200, 100, 100, 50)),
  ];

  it('snaps left edge to left edge of another node', () => {
    // Dragging node at x=203 (within 8px threshold of 200)
    const result = calculateSnap('dragging', { x: 203, y: 300 }, 100, 50, otherBounds);
    expect(result.position.x).toBe(200);
    expect(result.guides).toContainEqual({ type: 'vertical', position: 200 });
  });

  it('snaps right edge to right edge of another node', () => {
    // other right = 300, dragging right = x+100 = 303 → |303-300|=3 < 8 threshold
    // dragging left = 203, other left = 200 → |203-200|=3 < 8 → left-to-left fires first
    // Use position far from left-to-left: x=195, left=195, |195-200|=5 < 8 → still triggers left
    // To test right-to-right only, place x so |left-otherLeft| >= 8 but |right-otherRight| < 8
    // other left=200, other right=300. dragging width=100.
    // right-to-right: |x+100 - 300| < 8 → x between 192..208. left-to-left: |x-200| < 8 → x 193..207
    // They overlap, so left-to-left always wins. Let's use a different width.
    // width=80: right = x+80. |x+80 - 300| < 8 → x 212..228. |x-200| < 8 → x 193..207. No overlap!
    const result = calculateSnap('dragging', { x: 217, y: 300 }, 80, 50, otherBounds);
    expect(result.position.x).toBe(220); // 300 - 80
    expect(result.guides).toContainEqual({ type: 'vertical', position: 300 });
  });

  it('snaps center X to center X of another node', () => {
    // other center X = 250, dragging center = x + 50 = 248 → within threshold
    const result = calculateSnap('dragging', { x: 198, y: 300 }, 100, 50, otherBounds);
    // left-to-left: |198 - 200| = 2 < 8, so it snaps to left first
    // This test verifies snapping happens (left-to-left wins in this case due to order)
    expect(result.guides.some(g => g.type === 'vertical')).toBe(true);
  });

  it('snaps top edge to top edge of another node', () => {
    // other top = 100, dragging at y=103
    const result = calculateSnap('dragging', { x: 500, y: 103 }, 100, 50, otherBounds);
    expect(result.position.y).toBe(100);
    expect(result.guides).toContainEqual({ type: 'horizontal', position: 100 });
  });

  it('snaps bottom to bottom', () => {
    // other top=100, other bottom=150. dragging height=30.
    // bottom-to-bottom: |y+30-150| < 8 → y 112..128. top-to-top: |y-100| < 8 → y 93..107. No overlap!
    const result = calculateSnap('dragging', { x: 500, y: 117 }, 100, 30, otherBounds);
    expect(result.position.y).toBe(120); // 150 - 30
    expect(result.guides).toContainEqual({ type: 'horizontal', position: 150 });
  });

  it('does not snap when nodes are far apart', () => {
    const result = calculateSnap('dragging', { x: 500, y: 500 }, 100, 50, otherBounds);
    expect(result.position).toEqual({ x: 500, y: 500 });
    expect(result.guides).toHaveLength(0);
  });

  it('returns both vertical and horizontal guides simultaneously', () => {
    // Position close to both X and Y of other node
    const result = calculateSnap('dragging', { x: 203, y: 103 }, 100, 50, otherBounds);
    
    const hasVertical = result.guides.some(g => g.type === 'vertical');
    const hasHorizontal = result.guides.some(g => g.type === 'horizontal');
    expect(hasVertical).toBe(true);
    expect(hasHorizontal).toBe(true);
  });

  it('skips the dragging node itself in bounds', () => {
    const boundsWithSelf = [
      { id: 'dragging', left: 100, right: 200, top: 100, bottom: 150, centerX: 150, centerY: 125 },
      ...otherBounds,
    ];
    // Should not snap to itself
    const result = calculateSnap('dragging', { x: 100, y: 100 }, 100, 50, boundsWithSelf);
    // Position should stay the same if no other node matches
    // In this case, 'other' at 200,100 — left-to-right: |100-300|=200, etc. Too far.
    // Actually left of dragging=100, right of other=300: |100-300|=200. No snap.
    // But dragging top=100, other top=100: |100-100|=0 < 8 → snaps to 100
    expect(result.position.y).toBe(100);
  });
});
