import {
  Node,
  Edge,
} from "reactflow";

// Node Types
export type NodeType =
  | "rectangle"
  | "roundedRect"
  | "diamond"
  | "ellipse"
  | "text"
  | "cylinder"
  | "triangle"
  | "group"
  | "image";

// Node Data
export interface NodeData {
  label: string;
  width: number;
  height: number;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  textColor: string;
  fontSize: number;
  fontWeight?: "normal" | "bold";
  fontStyle?: "normal" | "italic";
  textDecoration?: "none" | "underline" | "line-through";
  textAlign?: "left" | "center" | "right" | "justify";
  imageUrl?: string;
}

// Edge Data
export interface EdgeData {
  label: string;
  animated: boolean;
  strokeStyle: 'solid' | 'dashed' | 'dotted';
  stroke?: string;
  strokeWidth?: number;
}

// History State
export interface HistoryEntry {
  nodes: Node<NodeData>[];
  edges: Edge<EdgeData>[];
}

// Node Style Configuration
export interface NodeStyleConfig {
  width: number;
  height: number;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  handleColor: string;
  selectedShadowColor: string;
}

// Custom Template
export interface Template {
  id: string;
  name: string;
  nodes: Node<NodeData>[];
  edges: Edge<EdgeData>[];
}
