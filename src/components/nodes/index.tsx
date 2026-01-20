'use client';

import React, { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { NodeData } from '@/store/useStore';

export const RectangleNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  return (
    <div
      className="relative flex items-center justify-center transition-shadow"
      style={{
        width: data.width,
        height: data.height,
        backgroundColor: data.backgroundColor,
        border: `${data.borderWidth}px solid ${data.borderColor}`,
        boxShadow: selected ? `0 0 0 2px #6366f1, 0 0 20px rgba(99, 102, 241, 0.3)` : 'none',
      }}
    >
      <Handle type="source" position={Position.Top} id="top" className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Left} id="left" className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Right} id="right" className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-white" />
      <span style={{ color: data.textColor, fontSize: data.fontSize }} className="text-center px-2">
        {data.label}
      </span>
    </div>
  );
});
RectangleNode.displayName = 'RectangleNode';

export const RoundedRectNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  return (
    <div
      className="relative flex items-center justify-center rounded-xl transition-shadow"
      style={{
        width: data.width,
        height: data.height,
        backgroundColor: data.backgroundColor,
        border: `${data.borderWidth}px solid ${data.borderColor}`,
        boxShadow: selected ? `0 0 0 2px #22c55e, 0 0 20px rgba(34, 197, 94, 0.3)` : 'none',
      }}
    >
      <Handle type="source" position={Position.Top} id="top" className="!w-3 !h-3 !bg-green-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="!w-3 !h-3 !bg-green-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Left} id="left" className="!w-3 !h-3 !bg-green-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Right} id="right" className="!w-3 !h-3 !bg-green-500 !border-2 !border-white" />
      <span style={{ color: data.textColor, fontSize: data.fontSize }} className="text-center px-2">
        {data.label}
      </span>
    </div>
  );
});
RoundedRectNode.displayName = 'RoundedRectNode';

export const DiamondNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        width: data.width,
        height: data.height,
      }}
    >
      <svg width="100%" height="100%" viewBox="0 0 100 100" className="absolute inset-0">
        <polygon
          points="50,0 100,50 50,100 0,50"
          fill={data.backgroundColor}
          stroke={data.borderColor}
          strokeWidth={data.borderWidth * 2}
          style={{
            filter: selected ? 'drop-shadow(0 0 8px rgba(245, 158, 11, 0.5))' : 'none',
          }}
        />
      </svg>
      <Handle type="source" position={Position.Top} id="top" className="!w-3 !h-3 !bg-amber-500 !border-2 !border-white !top-0" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="!w-3 !h-3 !bg-amber-500 !border-2 !border-white !bottom-0" />
      <Handle type="source" position={Position.Left} id="left" className="!w-3 !h-3 !bg-amber-500 !border-2 !border-white !left-0" />
      <Handle type="source" position={Position.Right} id="right" className="!w-3 !h-3 !bg-amber-500 !border-2 !border-white !right-0" />
      <span style={{ color: data.textColor, fontSize: data.fontSize }} className="relative z-10 text-center px-4">
        {data.label}
      </span>
    </div>
  );
});
DiamondNode.displayName = 'DiamondNode';

export const EllipseNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  return (
    <div
      className="relative flex items-center justify-center rounded-full transition-shadow"
      style={{
        width: data.width,
        height: data.height,
        backgroundColor: data.backgroundColor,
        border: `${data.borderWidth}px solid ${data.borderColor}`,
        boxShadow: selected ? `0 0 0 2px #ec4899, 0 0 20px rgba(236, 72, 153, 0.3)` : 'none',
      }}
    >
      <Handle type="source" position={Position.Top} id="top" className="!w-3 !h-3 !bg-pink-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="!w-3 !h-3 !bg-pink-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Left} id="left" className="!w-3 !h-3 !bg-pink-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Right} id="right" className="!w-3 !h-3 !bg-pink-500 !border-2 !border-white" />
      <span style={{ color: data.textColor, fontSize: data.fontSize }} className="text-center px-2">
        {data.label}
      </span>
    </div>
  );
});
EllipseNode.displayName = 'EllipseNode';

export const TextNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  return (
    <div
      className="relative flex items-center justify-center transition-shadow"
      style={{
        width: data.width,
        minHeight: data.height,
        boxShadow: selected ? `0 0 0 2px #8b5cf6, 0 0 20px rgba(139, 92, 246, 0.3)` : 'none',
        borderRadius: 4,
      }}
    >
      <Handle type="source" position={Position.Top} id="top" className="!w-3 !h-3 !bg-violet-500 !border-2 !border-white !opacity-0 hover:!opacity-100" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="!w-3 !h-3 !bg-violet-500 !border-2 !border-white !opacity-0 hover:!opacity-100" />
      <Handle type="source" position={Position.Left} id="left" className="!w-3 !h-3 !bg-violet-500 !border-2 !border-white !opacity-0 hover:!opacity-100" />
      <Handle type="source" position={Position.Right} id="right" className="!w-3 !h-3 !bg-violet-500 !border-2 !border-white !opacity-0 hover:!opacity-100" />
      <span style={{ color: data.textColor, fontSize: data.fontSize }} className="text-center">
        {data.label}
      </span>
    </div>
  );
});
TextNode.displayName = 'TextNode';

export const CylinderNode = memo(({ data, selected }: NodeProps<NodeData>) => {
  const ellipseHeight = 15;
  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        width: data.width,
        height: data.height,
      }}
    >
      <svg width="100%" height="100%" viewBox={`0 0 ${data.width} ${data.height}`} className="absolute inset-0">
        {/* Bottom ellipse */}
        <ellipse
          cx={data.width / 2}
          cy={data.height - ellipseHeight}
          rx={data.width / 2 - data.borderWidth}
          ry={ellipseHeight}
          fill={data.backgroundColor}
          stroke={data.borderColor}
          strokeWidth={data.borderWidth}
        />
        {/* Body rectangle */}
        <rect
          x={data.borderWidth}
          y={ellipseHeight}
          width={data.width - data.borderWidth * 2}
          height={data.height - ellipseHeight * 2}
          fill={data.backgroundColor}
        />
        {/* Side lines */}
        <line
          x1={data.borderWidth}
          y1={ellipseHeight}
          x2={data.borderWidth}
          y2={data.height - ellipseHeight}
          stroke={data.borderColor}
          strokeWidth={data.borderWidth}
        />
        <line
          x1={data.width - data.borderWidth}
          y1={ellipseHeight}
          x2={data.width - data.borderWidth}
          y2={data.height - ellipseHeight}
          stroke={data.borderColor}
          strokeWidth={data.borderWidth}
        />
        {/* Top ellipse */}
        <ellipse
          cx={data.width / 2}
          cy={ellipseHeight}
          rx={data.width / 2 - data.borderWidth}
          ry={ellipseHeight}
          fill={data.backgroundColor}
          stroke={data.borderColor}
          strokeWidth={data.borderWidth}
          style={{
            filter: selected ? 'drop-shadow(0 0 8px rgba(6, 182, 212, 0.5))' : 'none',
          }}
        />
      </svg>
      <Handle type="source" position={Position.Top} id="top" className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Bottom} id="bottom" className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Left} id="left" className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Right} id="right" className="!w-3 !h-3 !bg-cyan-500 !border-2 !border-white" />
      <span style={{ color: data.textColor, fontSize: data.fontSize }} className="relative z-10 text-center px-2 mt-2">
        {data.label}
      </span>
    </div>
  );
});
CylinderNode.displayName = 'CylinderNode';

export const nodeTypes = {
  rectangle: RectangleNode,
  roundedRect: RoundedRectNode,
  diamond: DiamondNode,
  ellipse: EllipseNode,
  text: TextNode,
  cylinder: CylinderNode,
};
