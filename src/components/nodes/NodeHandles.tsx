'use client';

import React from 'react';
import { Handle, Position } from 'reactflow';

interface NodeHandlesProps {
  colorClass: string;
  extraClass?: string;
}

/**
 * Renders handles on all 4 sides of a node
 */
export function NodeHandles({ colorClass, extraClass = '' }: NodeHandlesProps) {
  const baseClass = `!w-3 !h-3 ${colorClass} !border-2 !border-white ${extraClass}`;
  
  return (
    <>
      <Handle type="source" position={Position.Top} id="top" className={baseClass} />
      <Handle type="source" position={Position.Bottom} id="bottom" className={baseClass} />
      <Handle type="source" position={Position.Left} id="left" className={baseClass} />
      <Handle type="source" position={Position.Right} id="right" className={baseClass} />
    </>
  );
}
