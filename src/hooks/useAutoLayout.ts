'use client';

import { useCallback } from 'react';
import Dagre from '@dagrejs/dagre';
import { Node, Edge } from 'reactflow';
import { useStore } from '@/store/useStore';
import { NodeData } from '@/lib/types';

export type LayoutDirection = 'TB' | 'BT' | 'LR' | 'RL';

interface LayoutOptions {
  direction?: LayoutDirection;
  nodeSpacing?: number;
  rankSpacing?: number;
}

/**
 * Calculate layouted positions for nodes using dagre
 */
export function getLayoutedElements(
  nodes: Node<NodeData>[],
  edges: Edge[],
  options: LayoutOptions = {}
): Node<NodeData>[] {
  const {
    direction = 'TB',
    nodeSpacing = 50,
    rankSpacing = 100,
  } = options;

  if (nodes.length === 0) return nodes;

  const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
  
  g.setGraph({
    rankdir: direction,
    nodesep: nodeSpacing,
    ranksep: rankSpacing,
    marginx: 50,
    marginy: 50,
  });

  // Add nodes to graph
  nodes.forEach((node) => {
    const width = node.data?.width || 150;
    const height = node.data?.height || 50;
    g.setNode(node.id, { width, height });
  });

  // Add edges to graph
  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  // Calculate layout
  Dagre.layout(g);

  // Apply calculated positions
  return nodes.map((node) => {
    const dagreNode = g.node(node.id);
    const width = node.data?.width || 150;
    const height = node.data?.height || 50;

    return {
      ...node,
      position: {
        x: dagreNode.x - width / 2,
        y: dagreNode.y - height / 2,
      },
    };
  });
}

/**
 * Hook for auto-layout functionality
 */
export function useAutoLayout() {
  const { nodes, edges, setNodes, pushHistory } = useStore();

  const applyLayout = useCallback(
    (options: LayoutOptions = {}) => {
      if (nodes.length === 0) return;
      
      pushHistory();
      const layoutedNodes = getLayoutedElements(nodes, edges, options);
      setNodes(layoutedNodes);
    },
    [nodes, edges, setNodes, pushHistory]
  );

  const layoutVertical = useCallback(() => {
    applyLayout({ direction: 'TB' });
  }, [applyLayout]);

  const layoutHorizontal = useCallback(() => {
    applyLayout({ direction: 'LR' });
  }, [applyLayout]);

  const layoutTree = useCallback(() => {
    applyLayout({ direction: 'TB', rankSpacing: 80, nodeSpacing: 30 });
  }, [applyLayout]);

  return {
    applyLayout,
    layoutVertical,
    layoutHorizontal,
    layoutTree,
  };
}
