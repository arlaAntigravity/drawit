'use client';

import { useMemo, useState, useCallback } from 'react';
import { Node, XYPosition } from 'reactflow';
import { NodeData } from '@/lib/types';

const SNAP_THRESHOLD = 8; // pixels

export interface SnapGuide {
  type: 'vertical' | 'horizontal';
  position: number;
}

interface SnapResult {
  position: XYPosition;
  guides: SnapGuide[];
}

interface NodeBounds {
  id: string;
  left: number;
  right: number;
  top: number;
  bottom: number;
  centerX: number;
  centerY: number;
}

export function getNodeBounds(node: Node<NodeData>): NodeBounds {
  const width = node.data?.width || 100;
  const height = node.data?.height || 50;
  
  return {
    id: node.id,
    left: node.position.x,
    right: node.position.x + width,
    top: node.position.y,
    bottom: node.position.y + height,
    centerX: node.position.x + width / 2,
    centerY: node.position.y + height / 2,
  };
}

/**
 * Pure function for snap calculation. Extracted from the hook for testability.
 */
export function calculateSnap(
  draggingNodeId: string,
  currentPosition: XYPosition,
  nodeWidth: number,
  nodeHeight: number,
  otherNodesBounds: NodeBounds[]
): SnapResult {
  const draggingBounds: NodeBounds = {
    id: draggingNodeId,
    left: currentPosition.x,
    right: currentPosition.x + nodeWidth,
    top: currentPosition.y,
    bottom: currentPosition.y + nodeHeight,
    centerX: currentPosition.x + nodeWidth / 2,
    centerY: currentPosition.y + nodeHeight / 2,
  };

  const newGuides: SnapGuide[] = [];
  let snappedX = currentPosition.x;
  let snappedY = currentPosition.y;

  // Check against all other nodes
  for (const other of otherNodesBounds) {
    if (other.id === draggingNodeId) continue;

    // Vertical alignment (X axis)
    // Left to Left
    if (Math.abs(draggingBounds.left - other.left) < SNAP_THRESHOLD) {
      snappedX = other.left;
      newGuides.push({ type: 'vertical', position: other.left });
    }
    // Right to Right
    else if (Math.abs(draggingBounds.right - other.right) < SNAP_THRESHOLD) {
      snappedX = other.right - nodeWidth;
      newGuides.push({ type: 'vertical', position: other.right });
    }
    // Center X
    else if (Math.abs(draggingBounds.centerX - other.centerX) < SNAP_THRESHOLD) {
      snappedX = other.centerX - nodeWidth / 2;
      newGuides.push({ type: 'vertical', position: other.centerX });
    }
    // Left to Right
    else if (Math.abs(draggingBounds.left - other.right) < SNAP_THRESHOLD) {
      snappedX = other.right;
      newGuides.push({ type: 'vertical', position: other.right });
    }
    // Right to Left
    else if (Math.abs(draggingBounds.right - other.left) < SNAP_THRESHOLD) {
      snappedX = other.left - nodeWidth;
      newGuides.push({ type: 'vertical', position: other.left });
    }

    // Horizontal alignment (Y axis)
    // Top to Top
    if (Math.abs(draggingBounds.top - other.top) < SNAP_THRESHOLD) {
      snappedY = other.top;
      newGuides.push({ type: 'horizontal', position: other.top });
    }
    // Bottom to Bottom
    else if (Math.abs(draggingBounds.bottom - other.bottom) < SNAP_THRESHOLD) {
      snappedY = other.bottom - nodeHeight;
      newGuides.push({ type: 'horizontal', position: other.bottom });
    }
    // Center Y
    else if (Math.abs(draggingBounds.centerY - other.centerY) < SNAP_THRESHOLD) {
      snappedY = other.centerY - nodeHeight / 2;
      newGuides.push({ type: 'horizontal', position: other.centerY });
    }
    // Top to Bottom
    else if (Math.abs(draggingBounds.top - other.bottom) < SNAP_THRESHOLD) {
      snappedY = other.bottom;
      newGuides.push({ type: 'horizontal', position: other.bottom });
    }
    // Bottom to Top
    else if (Math.abs(draggingBounds.bottom - other.top) < SNAP_THRESHOLD) {
      snappedY = other.top - nodeHeight;
      newGuides.push({ type: 'horizontal', position: other.top });
    }
  }

  return {
    position: { x: snappedX, y: snappedY },
    guides: newGuides,
  };
}

export function useSnapGuides(nodes: Node<NodeData>[]) {
  const [guides, setGuides] = useState<SnapGuide[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Calculate other nodes' bounds (cached)
  const otherNodesBounds = useMemo(() => {
    return nodes.map(getNodeBounds);
  }, [nodes]);

  const calculateSnapCallback = useCallback(
    (
      draggingNodeId: string,
      currentPosition: XYPosition,
      nodeWidth: number,
      nodeHeight: number
    ): SnapResult => {
      return calculateSnap(draggingNodeId, currentPosition, nodeWidth, nodeHeight, otherNodesBounds);
    },
    [otherNodesBounds]
  );

  const startDrag = useCallback(() => {
    setIsDragging(true);
  }, []);

  const updateGuides = useCallback(
    (nodeId: string, position: XYPosition, width: number, height: number) => {
      const result = calculateSnapCallback(nodeId, position, width, height);
      setGuides(result.guides);
      return result.position;
    },
    [calculateSnapCallback]
  );

  const endDrag = useCallback(() => {
    setIsDragging(false);
    setGuides([]);
  }, []);

  return {
    guides,
    isDragging,
    startDrag,
    updateGuides,
    endDrag,
  };
}
