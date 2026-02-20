'use client';

import React, { memo, ReactNode } from 'react';
import { NodeProps, NodeResizer } from 'reactflow';
import { NodeData, NodeType } from '@/lib/types';
import { NodeHandles } from './NodeHandles';
import { EditableLabel } from './EditableLabel';
import { NODE_STYLES, HANDLE_COLORS } from '@/lib/constants';

interface GenericNodeProps extends NodeProps<NodeData> {
  nodeType: NodeType;
  /** Extra CSS class on the outer div (e.g. rounded-full, rounded-xl) */
  className?: string;
  /** Extra inline styles merged with defaults */
  extraStyle?: React.CSSProperties;
  /** If true, background/border come from CSS shape, not the wrapper div */
  svgShape?: boolean;
  /** Custom label className */
  labelClassName?: string;
  /** Custom handles extra class */
  handlesExtraClass?: string;
  /** NodeResizer min dimensions */
  minWidth?: number;
  minHeight?: number;
  /** SVG or overlay content rendered inside the wrapper */
  children?: ReactNode;
}

/**
 * Generic node wrapper that encapsulates the repeated boilerplate:
 * - NodeResizer
 * - NodeHandles
 * - EditableLabel
 * - Selection shadow
 */
export const GenericNode = memo(({
  id,
  data,
  selected,
  nodeType,
  className = '',
  extraStyle,
  svgShape = false,
  labelClassName,
  handlesExtraClass,
  minWidth = 50,
  minHeight = 30,
  children,
}: GenericNodeProps) => {
  const style = NODE_STYLES[nodeType];
  const handleColorClass = HANDLE_COLORS[style.handleColor];

  // For SVG-based shapes, the div is transparent — the SVG provides visuals
  const wrapperStyle: React.CSSProperties = svgShape
    ? { width: data.width, height: data.height, ...extraStyle }
    : {
        width: data.width,
        height: data.height,
        backgroundColor: data.backgroundColor,
        border: `${data.borderWidth}px solid ${data.borderColor}`,
        boxShadow: selected
          ? `0 0 0 2px ${style.borderColor}, 0 0 20px ${style.selectedShadowColor}`
          : 'none',
        ...extraStyle,
      };

  return (
    <div
      className={`relative flex items-center justify-center transition-shadow cursor-grab active:cursor-grabbing ${className}`}
      style={wrapperStyle}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={minWidth}
        minHeight={minHeight}
        handleClassName="!w-2.5 !h-2.5 !bg-indigo-500 !border-white !rounded-full"
        lineClassName="!border-indigo-500"
      />
      {children}
      <NodeHandles colorClass={handleColorClass} extraClass={handlesExtraClass} />
      <EditableLabel
        nodeId={id}
        label={data.label}
        textColor={data.textColor}
        fontSize={data.fontSize}
        fontWeight={data.fontWeight}
        fontStyle={data.fontStyle}
        textDecoration={data.textDecoration}
        textAlign={data.textAlign}
        className={labelClassName}
      />
    </div>
  );
});

GenericNode.displayName = 'GenericNode';
