"use client";

import React, { memo } from "react";
import {
  NodeProps,
  Handle,
  Position,
  NodeResizer,
} from "reactflow";
import { NodeData } from "@/lib/types";
import { NodeHandles } from "./NodeHandles";
import { EditableLabel } from "./EditableLabel";
import { GenericNode } from "./GenericNode";
import { ImageNode } from "./ImageNode";
import { NODE_STYLES, HANDLE_COLORS } from "@/lib/constants";

// ============================================================================
// Simple CSS-based Nodes (Rectangle, RoundedRect, Ellipse)
// ============================================================================

export const RectangleNode = memo((props: NodeProps<NodeData>) => (
  <GenericNode {...props} nodeType="rectangle" />
));
RectangleNode.displayName = "RectangleNode";

export const RoundedRectNode = memo((props: NodeProps<NodeData>) => (
  <GenericNode {...props} nodeType="roundedRect" className="rounded-xl" />
));
RoundedRectNode.displayName = "RoundedRectNode";

export const EllipseNode = memo((props: NodeProps<NodeData>) => (
  <GenericNode {...props} nodeType="ellipse" className="rounded-full" />
));
EllipseNode.displayName = "EllipseNode";

// ============================================================================
// Text Node
// ============================================================================

export const TextNode = memo((props: NodeProps<NodeData>) => (
  <GenericNode
    {...props}
    nodeType="text"
    minHeight={20}
    handlesExtraClass="!opacity-0 hover:!opacity-100"
    extraStyle={{
      minHeight: props.data.height,
      height: undefined,
      boxShadow: props.selected
        ? `0 0 0 2px #8b5cf6, 0 0 20px ${NODE_STYLES.text.selectedShadowColor}`
        : "none",
      borderRadius: 4,
      backgroundColor: "transparent",
      border: "none",
    }}
  />
));
TextNode.displayName = "TextNode";

// ============================================================================
// SVG Polygon Nodes (Diamond, Triangle)
// ============================================================================

function SvgPolygonShape({
  points,
  data,
  selected,
  shadowColor,
}: {
  points: string;
  data: NodeData;
  selected: boolean;
  shadowColor: string;
}) {
  return (
    <svg width="100%" height="100%" viewBox="0 0 100 100" className="absolute inset-0">
      <polygon
        points={points}
        fill={data.backgroundColor}
        stroke={data.borderColor}
        strokeWidth={data.borderWidth * 2}
        style={{ filter: selected ? `drop-shadow(0 0 8px ${shadowColor})` : "none" }}
      />
    </svg>
  );
}

/**
 * SVG-based node with custom handle positioning.
 * Used by Diamond and Triangle which need handles at shape edges.
 */
function SvgShapeNode({
  id,
  data,
  selected,
  points,
  nodeType,
}: NodeProps<NodeData> & { points: string; nodeType: "diamond" | "triangle" }) {
  const style = NODE_STYLES[nodeType];
  const handleClass = `${HANDLE_COLORS[style.handleColor]}`;

  return (
    <div
      className="relative flex items-center justify-center cursor-grab active:cursor-grabbing"
      style={{ width: data.width, height: data.height }}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={50}
        minHeight={50}
        handleClassName="!w-2.5 !h-2.5 !bg-indigo-500 !border-white !rounded-full"
        lineClassName="!border-indigo-500"
      />
      <SvgPolygonShape
        points={points}
        data={data}
        selected={!!selected}
        shadowColor={style.selectedShadowColor}
      />
      <Handle type="source" position={Position.Top} id="top"
        className={`!w-3 !h-3 ${handleClass} !border-2 !border-white !top-0`} />
      <Handle type="source" position={Position.Bottom} id="bottom"
        className={`!w-3 !h-3 ${handleClass} !border-2 !border-white !bottom-0`} />
      <Handle type="source" position={Position.Left} id="left"
        className={`!w-3 !h-3 ${handleClass} !border-2 !border-white !left-0`} />
      <Handle type="source" position={Position.Right} id="right"
        className={`!w-3 !h-3 ${handleClass} !border-2 !border-white !right-0`} />
      <EditableLabel
        nodeId={id}
        label={data.label}
        textColor={data.textColor}
        fontSize={data.fontSize}
        fontWeight={data.fontWeight}
        fontStyle={data.fontStyle}
        textDecoration={data.textDecoration}
        textAlign={data.textAlign}
        className="relative z-10 px-4"
      />
    </div>
  );
}

export const DiamondNode = memo((props: NodeProps<NodeData>) => (
  <SvgShapeNode {...props} points="50,0 100,50 50,100 0,50" nodeType="diamond" />
));
DiamondNode.displayName = "DiamondNode";

export const TriangleNode = memo((props: NodeProps<NodeData>) => (
  <SvgShapeNode {...props} points="50,0 100,100 0,100" nodeType="triangle" />
));
TriangleNode.displayName = "TriangleNode";

// ============================================================================
// Cylinder (Database) Node
// ============================================================================

export const CylinderNode = memo(({ id, data, selected }: NodeProps<NodeData>) => {
  const style = NODE_STYLES.cylinder;
  const ellipseHeight = 15;

  return (
    <div
      className="relative flex items-center justify-center cursor-grab active:cursor-grabbing"
      style={{ width: data.width, height: data.height }}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={50}
        minHeight={60}
        handleClassName="!w-2.5 !h-2.5 !bg-indigo-500 !border-white !rounded-full"
        lineClassName="!border-indigo-500"
      />
      <svg width="100%" height="100%" viewBox={`0 0 ${data.width} ${data.height}`} className="absolute inset-0">
        {/* Bottom ellipse */}
        <ellipse
          cx={data.width / 2} cy={data.height - ellipseHeight}
          rx={data.width / 2 - data.borderWidth} ry={ellipseHeight}
          fill={data.backgroundColor} stroke={data.borderColor} strokeWidth={data.borderWidth}
        />
        {/* Body rectangle */}
        <rect
          x={data.borderWidth} y={ellipseHeight}
          width={data.width - data.borderWidth * 2} height={data.height - ellipseHeight * 2}
          fill={data.backgroundColor}
        />
        {/* Side lines */}
        <line
          x1={data.borderWidth} y1={ellipseHeight}
          x2={data.borderWidth} y2={data.height - ellipseHeight}
          stroke={data.borderColor} strokeWidth={data.borderWidth}
        />
        <line
          x1={data.width - data.borderWidth} y1={ellipseHeight}
          x2={data.width - data.borderWidth} y2={data.height - ellipseHeight}
          stroke={data.borderColor} strokeWidth={data.borderWidth}
        />
        {/* Top ellipse */}
        <ellipse
          cx={data.width / 2} cy={ellipseHeight}
          rx={data.width / 2 - data.borderWidth} ry={ellipseHeight}
          fill={data.backgroundColor} stroke={data.borderColor} strokeWidth={data.borderWidth}
          style={{ filter: selected ? `drop-shadow(0 0 8px ${style.selectedShadowColor})` : "none" }}
        />
      </svg>
      <NodeHandles colorClass={HANDLE_COLORS[style.handleColor]} />
      <EditableLabel
        nodeId={id}
        label={data.label}
        textColor={data.textColor}
        fontSize={data.fontSize}
        fontWeight={data.fontWeight}
        fontStyle={data.fontStyle}
        textDecoration={data.textDecoration}
        textAlign={data.textAlign}
        className="relative z-10 mt-2"
      />
    </div>
  );
});
CylinderNode.displayName = "CylinderNode";

// ============================================================================
// Group Node (Swimlane/Container)
// ============================================================================

export const GroupNode = memo(({ id, data, selected }: NodeProps<NodeData>) => {
  const style = NODE_STYLES.group;

  return (
    <div
      className="relative rounded-lg transition-shadow cursor-grab active:cursor-grabbing"
      style={{
        width: data.width,
        height: data.height,
        backgroundColor: data.backgroundColor,
        border: `${data.borderWidth}px dashed ${data.borderColor}`,
        boxShadow: selected
          ? `0 0 0 2px ${style.borderColor}, 0 0 20px ${style.selectedShadowColor}`
          : "none",
      }}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={150}
        minHeight={100}
        handleClassName="!w-2.5 !h-2.5 !bg-white !border-gray-400 !border-2 !rounded-sm"
        lineClassName="!border-gray-400 !border-dashed"
      />
      {/* Header */}
      <div
        className="absolute top-0 left-0 right-0 px-3 py-1.5 rounded-t-lg flex items-center"
        style={{ backgroundColor: data.borderColor }}
      >
        <EditableLabel
          nodeId={id}
          label={data.label}
          textColor="#ffffff"
          fontSize={data.fontSize}
          fontWeight={data.fontWeight}
          fontStyle={data.fontStyle}
          textDecoration={data.textDecoration}
          textAlign={data.textAlign}
          className="font-medium"
        />
      </div>
      <NodeHandles colorClass={HANDLE_COLORS[style.handleColor]} />
    </div>
  );
});
GroupNode.displayName = "GroupNode";

// ============================================================================
// Node Types Registry
// ============================================================================
export const nodeTypes = {
  rectangle: RectangleNode,
  roundedRect: RoundedRectNode,
  diamond: DiamondNode,
  ellipse: EllipseNode,
  text: TextNode,
  cylinder: CylinderNode,
  triangle: TriangleNode,
  group: GroupNode,
  image: ImageNode,
};
