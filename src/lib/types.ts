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
  | "triangle";

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
}

// History State
export interface HistoryEntry {
  nodes: Node<NodeData>[];
  edges: Edge[];
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
