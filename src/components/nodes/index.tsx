"use client";

import React, {
  memo,
} from "react";
import {
  NodeProps,
  Handle,
  Position,
} from "reactflow";
import { NodeData } from "@/lib/types";
import { NodeHandles } from "./NodeHandles";
import {
  NODE_STYLES,
  HANDLE_COLORS,
} from "@/lib/constants";

// ============================================================================
// Rectangle Node
// ============================================================================
export const RectangleNode =
  memo(
    ({
      data,
      selected,
    }: NodeProps<NodeData>) => {
      const style =
        NODE_STYLES.rectangle;

      return (
        <div
          className="relative flex items-center justify-center transition-shadow"
          style={{
            width: data.width,
            height:
              data.height,
            backgroundColor:
              data.backgroundColor,
            border: `${data.borderWidth}px solid ${data.borderColor}`,
            boxShadow:
              selected
                ? `0 0 0 2px ${style.borderColor}, 0 0 20px ${style.selectedShadowColor}`
                : "none",
          }}
        >
          <NodeHandles
            colorClass={
              HANDLE_COLORS[
                style
                  .handleColor
              ]
            }
          />
          <span
            style={{
              color:
                data.textColor,
              fontSize:
                data.fontSize,
            }}
            className="text-center px-2"
          >
            {data.label}
          </span>
        </div>
      );
    },
  );
RectangleNode.displayName =
  "RectangleNode";

// ============================================================================
// Rounded Rectangle Node
// ============================================================================
export const RoundedRectNode =
  memo(
    ({
      data,
      selected,
    }: NodeProps<NodeData>) => {
      const style =
        NODE_STYLES.roundedRect;

      return (
        <div
          className="relative flex items-center justify-center rounded-xl transition-shadow"
          style={{
            width: data.width,
            height:
              data.height,
            backgroundColor:
              data.backgroundColor,
            border: `${data.borderWidth}px solid ${data.borderColor}`,
            boxShadow:
              selected
                ? `0 0 0 2px ${style.borderColor}, 0 0 20px ${style.selectedShadowColor}`
                : "none",
          }}
        >
          <NodeHandles
            colorClass={
              HANDLE_COLORS[
                style
                  .handleColor
              ]
            }
          />
          <span
            style={{
              color:
                data.textColor,
              fontSize:
                data.fontSize,
            }}
            className="text-center px-2"
          >
            {data.label}
          </span>
        </div>
      );
    },
  );
RoundedRectNode.displayName =
  "RoundedRectNode";

// ============================================================================
// Diamond Node
// ============================================================================
export const DiamondNode =
  memo(
    ({
      data,
      selected,
    }: NodeProps<NodeData>) => {
      const style =
        NODE_STYLES.diamond;
      const handleClass = `${HANDLE_COLORS[style.handleColor]}`;

      return (
        <div
          className="relative flex items-center justify-center"
          style={{
            width: data.width,
            height:
              data.height,
          }}
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            className="absolute inset-0"
          >
            <polygon
              points="50,0 100,50 50,100 0,50"
              fill={
                data.backgroundColor
              }
              stroke={
                data.borderColor
              }
              strokeWidth={
                data.borderWidth *
                2
              }
              style={{
                filter:
                  selected
                    ? `drop-shadow(0 0 8px ${style.selectedShadowColor})`
                    : "none",
              }}
            />
          </svg>
          <Handle
            type="source"
            position={
              Position.Top
            }
            id="top"
            className={`!w-3 !h-3 ${handleClass} !border-2 !border-white !top-0`}
          />
          <Handle
            type="source"
            position={
              Position.Bottom
            }
            id="bottom"
            className={`!w-3 !h-3 ${handleClass} !border-2 !border-white !bottom-0`}
          />
          <Handle
            type="source"
            position={
              Position.Left
            }
            id="left"
            className={`!w-3 !h-3 ${handleClass} !border-2 !border-white !left-0`}
          />
          <Handle
            type="source"
            position={
              Position.Right
            }
            id="right"
            className={`!w-3 !h-3 ${handleClass} !border-2 !border-white !right-0`}
          />
          <span
            style={{
              color:
                data.textColor,
              fontSize:
                data.fontSize,
            }}
            className="relative z-10 text-center px-4"
          >
            {data.label}
          </span>
        </div>
      );
    },
  );
DiamondNode.displayName =
  "DiamondNode";

// ============================================================================
// Ellipse Node
// ============================================================================
export const EllipseNode =
  memo(
    ({
      data,
      selected,
    }: NodeProps<NodeData>) => {
      const style =
        NODE_STYLES.ellipse;

      return (
        <div
          className="relative flex items-center justify-center rounded-full transition-shadow"
          style={{
            width: data.width,
            height:
              data.height,
            backgroundColor:
              data.backgroundColor,
            border: `${data.borderWidth}px solid ${data.borderColor}`,
            boxShadow:
              selected
                ? `0 0 0 2px ${style.borderColor}, 0 0 20px ${style.selectedShadowColor}`
                : "none",
          }}
        >
          <NodeHandles
            colorClass={
              HANDLE_COLORS[
                style
                  .handleColor
              ]
            }
          />
          <span
            style={{
              color:
                data.textColor,
              fontSize:
                data.fontSize,
            }}
            className="text-center px-2"
          >
            {data.label}
          </span>
        </div>
      );
    },
  );
EllipseNode.displayName =
  "EllipseNode";

// ============================================================================
// Text Node
// ============================================================================
export const TextNode = memo(
  ({
    data,
    selected,
  }: NodeProps<NodeData>) => {
    const style =
      NODE_STYLES.text;

    return (
      <div
        className="relative flex items-center justify-center transition-shadow"
        style={{
          width: data.width,
          minHeight:
            data.height,
          boxShadow: selected
            ? `0 0 0 2px #8b5cf6, 0 0 20px ${style.selectedShadowColor}`
            : "none",
          borderRadius: 4,
        }}
      >
        <NodeHandles
          colorClass={
            HANDLE_COLORS[
              style
                .handleColor
            ]
          }
          extraClass="!opacity-0 hover:!opacity-100"
        />
        <span
          style={{
            color:
              data.textColor,
            fontSize:
              data.fontSize,
          }}
          className="text-center"
        >
          {data.label}
        </span>
      </div>
    );
  },
);
TextNode.displayName =
  "TextNode";

// ============================================================================
// Cylinder (Database) Node
// ============================================================================
export const CylinderNode =
  memo(
    ({
      data,
      selected,
    }: NodeProps<NodeData>) => {
      const style =
        NODE_STYLES.cylinder;
      const ellipseHeight = 15;

      return (
        <div
          className="relative flex items-center justify-center"
          style={{
            width: data.width,
            height:
              data.height,
          }}
        >
          <svg
            width="100%"
            height="100%"
            viewBox={`0 0 ${data.width} ${data.height}`}
            className="absolute inset-0"
          >
            {/* Bottom ellipse */}
            <ellipse
              cx={
                data.width / 2
              }
              cy={
                data.height -
                ellipseHeight
              }
              rx={
                data.width /
                  2 -
                data.borderWidth
              }
              ry={
                ellipseHeight
              }
              fill={
                data.backgroundColor
              }
              stroke={
                data.borderColor
              }
              strokeWidth={
                data.borderWidth
              }
            />
            {/* Body rectangle */}
            <rect
              x={
                data.borderWidth
              }
              y={
                ellipseHeight
              }
              width={
                data.width -
                data.borderWidth *
                  2
              }
              height={
                data.height -
                ellipseHeight *
                  2
              }
              fill={
                data.backgroundColor
              }
            />
            {/* Side lines */}
            <line
              x1={
                data.borderWidth
              }
              y1={
                ellipseHeight
              }
              x2={
                data.borderWidth
              }
              y2={
                data.height -
                ellipseHeight
              }
              stroke={
                data.borderColor
              }
              strokeWidth={
                data.borderWidth
              }
            />
            <line
              x1={
                data.width -
                data.borderWidth
              }
              y1={
                ellipseHeight
              }
              x2={
                data.width -
                data.borderWidth
              }
              y2={
                data.height -
                ellipseHeight
              }
              stroke={
                data.borderColor
              }
              strokeWidth={
                data.borderWidth
              }
            />
            {/* Top ellipse */}
            <ellipse
              cx={
                data.width / 2
              }
              cy={
                ellipseHeight
              }
              rx={
                data.width /
                  2 -
                data.borderWidth
              }
              ry={
                ellipseHeight
              }
              fill={
                data.backgroundColor
              }
              stroke={
                data.borderColor
              }
              strokeWidth={
                data.borderWidth
              }
              style={{
                filter:
                  selected
                    ? `drop-shadow(0 0 8px ${style.selectedShadowColor})`
                    : "none",
              }}
            />
          </svg>
          <NodeHandles
            colorClass={
              HANDLE_COLORS[
                style
                  .handleColor
              ]
            }
          />
          <span
            style={{
              color:
                data.textColor,
              fontSize:
                data.fontSize,
            }}
            className="relative z-10 text-center px-2 mt-2"
          >
            {data.label}
          </span>
        </div>
      );
    },
  );
CylinderNode.displayName =
  "CylinderNode";

// ============================================================================
// Triangle Node
// ============================================================================
export const TriangleNode =
  memo(
    ({
      data,
      selected,
    }: NodeProps<NodeData>) => {
      const style =
        NODE_STYLES.triangle;
      const handleClass = `${HANDLE_COLORS[style.handleColor]}`;

      return (
        <div
          className="relative flex items-center justify-center"
          style={{
            width: data.width,
            height:
              data.height,
          }}
        >
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            className="absolute inset-0"
          >
            <polygon
              points="50,0 100,100 0,100"
              fill={
                data.backgroundColor
              }
              stroke={
                data.borderColor
              }
              strokeWidth={
                data.borderWidth *
                2
              }
              style={{
                filter:
                  selected
                    ? `drop-shadow(0 0 8px ${style.selectedShadowColor})`
                    : "none",
              }}
            />
          </svg>
          <Handle
            type="source"
            position={
              Position.Top
            }
            id="top"
            className={`!w-3 !h-3 ${handleClass} !border-2 !border-white !top-0`}
          />
          <Handle
            type="source"
            position={
              Position.Bottom
            }
            id="bottom"
            className={`!w-3 !h-3 ${handleClass} !border-2 !border-white !bottom-0`}
          />
          <Handle
            type="source"
            position={
              Position.Left
            }
            id="left"
            className={`!w-3 !h-3 ${handleClass} !border-2 !border-white !left-0`}
          />
          <Handle
            type="source"
            position={
              Position.Right
            }
            id="right"
            className={`!w-3 !h-3 ${handleClass} !border-2 !border-white !right-0`}
          />
          <span
            style={{
              color:
                data.textColor,
              fontSize:
                data.fontSize,
            }}
            className="relative z-10 text-center px-4"
          >
            {data.label}
          </span>
        </div>
      );
    },
  );
TriangleNode.displayName =
  "TriangleNode";

// ============================================================================
// Group Node (Swimlane/Container)
// ============================================================================
export const GroupNode = memo(
  ({ data, selected }: NodeProps<NodeData>) => {
    const style = NODE_STYLES.group;

    return (
      <div
        className="relative rounded-lg transition-shadow"
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
        {/* Header */}
        <div
          className="absolute top-0 left-0 right-0 px-3 py-1.5 rounded-t-lg flex items-center"
          style={{
            backgroundColor: data.borderColor,
          }}
        >
          <span
            style={{
              color: "#ffffff",
              fontSize: data.fontSize,
              fontWeight: 500,
            }}
          >
            {data.label}
          </span>
        </div>
        {/* Handles */}
        <NodeHandles colorClass={HANDLE_COLORS[style.handleColor]} />
      </div>
    );
  }
);
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
};
