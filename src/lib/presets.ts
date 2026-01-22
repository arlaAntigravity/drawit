import { Node, Edge, MarkerType } from 'reactflow';
import { NodeData, NodeType } from './types';
import { NODE_STYLES, EDGE_STYLE } from './constants';

// ============================================================================
// Preset Types
// ============================================================================
export type PresetCategory = 
  | 'basic' 
  | 'flowchart' 
  | 'uml' 
  | 'network' 
  | 'business';

export interface DiagramPreset {
  id: string;
  name: string;
  category: PresetCategory;
  description: string;
  nodes: Node<NodeData>[];
  edges: Edge[];
}

export const PRESET_CATEGORIES: { id: PresetCategory; name: string; icon: string }[] = [
  { id: 'basic', name: 'Базовые', icon: '📄' },
  { id: 'flowchart', name: 'Блок-схемы', icon: '🔀' },
  { id: 'uml', name: 'UML', icon: '📐' },
  { id: 'network', name: 'Сети', icon: '🌐' },
  { id: 'business', name: 'Бизнес', icon: '💼' },
];

// ============================================================================
// Helper Functions
// ============================================================================
function createNode(
  id: string,
  type: NodeType,
  position: { x: number; y: number },
  label: string,
  overrides?: Partial<NodeData>
): Node<NodeData> {
  const style = NODE_STYLES[type];
  return {
    id,
    type,
    position,
    data: {
      label,
      width: style.width,
      height: style.height,
      backgroundColor: style.backgroundColor,
      borderColor: style.borderColor,
      borderWidth: style.borderWidth,
      textColor: '#ffffff',
      fontSize: 14,
      ...overrides,
    },
  };
}

function createEdge(
  id: string,
  source: string,
  target: string,
  label?: string
): Edge {
  return {
    id,
    source,
    target,
    type: 'labeled',
    style: EDGE_STYLE,
    label,
    data: { label },
    markerEnd: { type: MarkerType.ArrowClosed, color: EDGE_STYLE.stroke as string },
  };
}

// ============================================================================
// Preset Definitions
// ============================================================================

// Basic Presets
const emptyPreset: DiagramPreset = {
  id: 'empty',
  name: 'Пустая диаграмма',
  category: 'basic',
  description: 'Начните с чистого листа',
  nodes: [],
  edges: [],
};

const simpleFlowPreset: DiagramPreset = {
  id: 'simple-flow',
  name: 'Простой поток',
  category: 'basic',
  description: '3 блока с последовательным соединением',
  nodes: [
    createNode('n1', 'roundedRect', { x: 100, y: 100 }, 'Начало'),
    createNode('n2', 'rectangle', { x: 100, y: 250 }, 'Процесс'),
    createNode('n3', 'roundedRect', { x: 100, y: 400 }, 'Конец'),
  ],
  edges: [
    createEdge('e1', 'n1', 'n2'),
    createEdge('e2', 'n2', 'n3'),
  ],
};

// Flowchart Presets
const decisionFlowPreset: DiagramPreset = {
  id: 'decision-flow',
  name: 'Блок-схема с условием',
  category: 'flowchart',
  description: 'Блок-схема с ветвлением',
  nodes: [
    createNode('start', 'ellipse', { x: 200, y: 50 }, 'Старт'),
    createNode('process1', 'rectangle', { x: 200, y: 150 }, 'Ввод данных'),
    createNode('decision', 'diamond', { x: 200, y: 280 }, 'Условие?'),
    createNode('yes-branch', 'rectangle', { x: 50, y: 420 }, 'Да: Действие A'),
    createNode('no-branch', 'rectangle', { x: 350, y: 420 }, 'Нет: Действие B'),
    createNode('end', 'ellipse', { x: 200, y: 550 }, 'Конец'),
  ],
  edges: [
    createEdge('e1', 'start', 'process1'),
    createEdge('e2', 'process1', 'decision'),
    createEdge('e3', 'decision', 'yes-branch', 'Да'),
    createEdge('e4', 'decision', 'no-branch', 'Нет'),
    createEdge('e5', 'yes-branch', 'end'),
    createEdge('e6', 'no-branch', 'end'),
  ],
};

const loopFlowPreset: DiagramPreset = {
  id: 'loop-flow',
  name: 'Цикл',
  category: 'flowchart',
  description: 'Блок-схема с циклом',
  nodes: [
    createNode('start', 'ellipse', { x: 200, y: 50 }, 'Старт'),
    createNode('init', 'rectangle', { x: 200, y: 150 }, 'i = 0'),
    createNode('check', 'diamond', { x: 200, y: 280 }, 'i < 10?'),
    createNode('body', 'rectangle', { x: 200, y: 420 }, 'Тело цикла'),
    createNode('increment', 'rectangle', { x: 400, y: 350 }, 'i++'),
    createNode('end', 'ellipse', { x: 200, y: 550 }, 'Конец'),
  ],
  edges: [
    createEdge('e1', 'start', 'init'),
    createEdge('e2', 'init', 'check'),
    createEdge('e3', 'check', 'body', 'Да'),
    createEdge('e4', 'body', 'increment'),
    createEdge('e5', 'increment', 'check'),
    createEdge('e6', 'check', 'end', 'Нет'),
  ],
};

// UML Presets
const classPreset: DiagramPreset = {
  id: 'class-diagram',
  name: 'Диаграмма классов',
  category: 'uml',
  description: 'Простая диаграмма классов',
  nodes: [
    createNode('base', 'rectangle', { x: 200, y: 50 }, 'Animal'),
    createNode('dog', 'rectangle', { x: 50, y: 200 }, 'Dog'),
    createNode('cat', 'rectangle', { x: 350, y: 200 }, 'Cat'),
  ],
  edges: [
    createEdge('e1', 'dog', 'base'),
    createEdge('e2', 'cat', 'base'),
  ],
};

// Network Presets
const starTopologyPreset: DiagramPreset = {
  id: 'star-topology',
  name: 'Звезда',
  category: 'network',
  description: 'Топология "звезда"',
  nodes: [
    createNode('hub', 'cylinder', { x: 250, y: 200 }, 'Hub'),
    createNode('pc1', 'rectangle', { x: 100, y: 50 }, 'PC 1'),
    createNode('pc2', 'rectangle', { x: 400, y: 50 }, 'PC 2'),
    createNode('pc3', 'rectangle', { x: 100, y: 350 }, 'PC 3'),
    createNode('pc4', 'rectangle', { x: 400, y: 350 }, 'PC 4'),
  ],
  edges: [
    createEdge('e1', 'pc1', 'hub'),
    createEdge('e2', 'pc2', 'hub'),
    createEdge('e3', 'pc3', 'hub'),
    createEdge('e4', 'pc4', 'hub'),
  ],
};

// Business Presets
const orgChartPreset: DiagramPreset = {
  id: 'org-chart',
  name: 'Орг. структура',
  category: 'business',
  description: 'Организационная структура',
  nodes: [
    createNode('ceo', 'roundedRect', { x: 250, y: 50 }, 'CEO'),
    createNode('cto', 'roundedRect', { x: 100, y: 180 }, 'CTO'),
    createNode('cfo', 'roundedRect', { x: 400, y: 180 }, 'CFO'),
    createNode('dev1', 'rectangle', { x: 20, y: 310 }, 'Dev Team'),
    createNode('dev2', 'rectangle', { x: 180, y: 310 }, 'QA Team'),
    createNode('fin1', 'rectangle', { x: 350, y: 310 }, 'Accounting'),
    createNode('fin2', 'rectangle', { x: 480, y: 310 }, 'HR'),
  ],
  edges: [
    createEdge('e1', 'ceo', 'cto'),
    createEdge('e2', 'ceo', 'cfo'),
    createEdge('e3', 'cto', 'dev1'),
    createEdge('e4', 'cto', 'dev2'),
    createEdge('e5', 'cfo', 'fin1'),
    createEdge('e6', 'cfo', 'fin2'),
  ],
};

// ============================================================================
// All Presets
// ============================================================================
export const DIAGRAM_PRESETS: DiagramPreset[] = [
  emptyPreset,
  simpleFlowPreset,
  decisionFlowPreset,
  loopFlowPreset,
  classPreset,
  starTopologyPreset,
  orgChartPreset,
];

export function getPresetsByCategory(category: PresetCategory): DiagramPreset[] {
  return DIAGRAM_PRESETS.filter((preset) => preset.category === category);
}

export function getPresetById(id: string): DiagramPreset | undefined {
  return DIAGRAM_PRESETS.find((preset) => preset.id === id);
}
