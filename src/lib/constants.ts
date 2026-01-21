import { NodeType, NodeStyleConfig } from './types';

// Default node styles per type
export const NODE_STYLES: Record<NodeType, NodeStyleConfig> = {
  rectangle: {
    width: 120,
    height: 60,
    backgroundColor: '#1e1e2e',
    borderColor: '#6366f1',
    borderWidth: 2,
    handleColor: 'indigo',
    selectedShadowColor: 'rgba(99, 102, 241, 0.3)',
  },
  roundedRect: {
    width: 120,
    height: 60,
    backgroundColor: '#1e1e2e',
    borderColor: '#22c55e',
    borderWidth: 2,
    handleColor: 'green',
    selectedShadowColor: 'rgba(34, 197, 94, 0.3)',
  },
  diamond: {
    width: 100,
    height: 100,
    backgroundColor: '#1e1e2e',
    borderColor: '#f59e0b',
    borderWidth: 2,
    handleColor: 'amber',
    selectedShadowColor: 'rgba(245, 158, 11, 0.5)',
  },
  ellipse: {
    width: 100,
    height: 60,
    backgroundColor: '#1e1e2e',
    borderColor: '#ec4899',
    borderWidth: 2,
    handleColor: 'pink',
    selectedShadowColor: 'rgba(236, 72, 153, 0.3)',
  },
  text: {
    width: 120,
    height: 40,
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderWidth: 0,
    handleColor: 'violet',
    selectedShadowColor: 'rgba(139, 92, 246, 0.3)',
  },
  cylinder: {
    width: 80,
    height: 100,
    backgroundColor: '#1e1e2e',
    borderColor: '#06b6d4',
    borderWidth: 2,
    handleColor: 'cyan',
    selectedShadowColor: 'rgba(6, 182, 212, 0.5)',
  },
};

// Color presets for property panel
export const COLOR_PRESETS = [
  '#1e1e2e', '#2d2d3f', '#3d3d52',
  '#6366f1', '#8b5cf6', '#ec4899',
  '#22c55e', '#f59e0b', '#06b6d4',
  '#ef4444', '#f97316', '#eab308',
];

// Handle color classes
export const HANDLE_COLORS: Record<string, string> = {
  indigo: '!bg-indigo-500',
  green: '!bg-green-500',
  amber: '!bg-amber-500',
  pink: '!bg-pink-500',
  violet: '!bg-violet-500',
  cyan: '!bg-cyan-500',
};

// Edge styles
export const EDGE_STYLE = {
  stroke: '#6366f1',
  strokeWidth: 2,
};

export const SELECTED_EDGE_COLOR = '#f59e0b';

// Canvas settings
export const SNAP_GRID: [number, number] = [15, 15];
export const BACKGROUND_SETTINGS = {
  gap: 20,
  size: 1,
  color: 'rgba(255,255,255,0.1)',
};

// History settings
export const MAX_HISTORY_LENGTH = 50;
