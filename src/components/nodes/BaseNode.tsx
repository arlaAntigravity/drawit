'use client';

import React, { memo, ReactNode } from 'react';
import { NodeProps } from 'reactflow';
import { NodeData } from '@/lib/types';
import { NodeHandles } from './NodeHandles';
import { HANDLE_COLORS } from '@/lib/constants';

interface BaseNodeProps extends NodeProps<NodeData> {
  handleColor: keyof typeof HANDLE_COLORS;
  selectedColor: string;
  className?: string;
  children?: ReactNode;
}

/**
 * Base component for simple nodes (rectangle, rounded, ellipse)
 */
export const BaseNode = memo(({ 
  data, 
  selected, 
  handleColor,
  selectedColor,
  className = '',
  children
}: BaseNodeProps) => {
  const handleColorClass = HANDLE_COLORS[handleColor] || HANDLE_COLORS.indigo;
  
  return (
    <div
      className={`relative flex items-center justify-center transition-shadow ${className}`}
      style={{
        width: data.width,
        height: data.height,
        backgroundColor: data.backgroundColor,
        border: `${data.borderWidth}px solid ${data.borderColor}`,
        boxShadow: selected ? `0 0 0 2px ${data.borderColor}, 0 0 20px ${selectedColor}` : 'none',
      }}
    >
      <NodeHandles colorClass={handleColorClass} />
      {children || (
        <span style={{ color: data.textColor, fontSize: data.fontSize }} className="text-center px-2">
          {data.label}
        </span>
      )}
    </div>
  );
});

BaseNode.displayName = 'BaseNode';
